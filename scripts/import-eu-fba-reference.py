"""Import selected, attributed FBA reference addresses for manual country review.

This is an offline preparation tool. It never runs from the website or assumes
that every Amazon delivery/sortation facility accepts seller inbound shipments.
"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.tmp/eu-warehouses'
SELECTED = {
    'france': 'BVA1 ORY1 ORY4 LIL1 LYS1 ETZ2 CDG7 MRS1'.split(),
    'spain': 'BCN1 BCN2 BCN3 MAD4 MAD6 MAD7 MAD9 SVQ1 RMU1 ZAZ1 VLC1'.split(),
    'italy': 'MXP3 MXP5 MXP6 BGY1 BLQ1 FCO1 FCO2 PSR2 TRN1 TRN3'.split(),
}


def address(item):
    country, path = item
    try:
        cache = CACHE / ('fba-' + hashlib.sha256(path.encode()).hexdigest()[:20] + '.html')
        if not cache.exists():
            req = urllib.request.Request('https://www.fbanearme.com' + path, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                cache.write_bytes(response.read())
        for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', cache.read_text(encoding='utf-8'), re.S):
            node = json.loads(raw)
            if isinstance(node.get('address'), dict):
                return {'countryName': country, 'code': path.rsplit('/', 1)[1].split('-')[0].upper(), 'sourceURL': 'https://www.fbanearme.com' + path, **node['address']}
        return {'error': 'No structured address', 'path': path}
    except Exception as error:
        return {'error': str(error), 'path': path}


if __name__ == '__main__':
    items = []
    for country, codes in SELECTED.items():
        country_file = CACHE / (country + '.txt')
        if not country_file.exists():
            request = urllib.request.Request('https://www.fbanearme.com/locations/' + country, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=25) as response:
                country_file.write_bytes(response.read())
        text = country_file.read_text(encoding='utf-8')
        paths = sorted(set(re.findall(r'href="(/locations/' + country + r'/[^"?#]+/[^"?#]+/[^"?#]+)"', text)))
        for code in codes:
            paths_for_code = [p for p in paths if p.rsplit('/', 1)[1].startswith(code.lower() + '-')]
            # Avoid CEDEX mailing references when a physical-address page exists.
            paths_for_code.sort(key=lambda p: ('cedex' in p, len(p)))
            if paths_for_code:
                items.append((country, paths_for_code[0]))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(address, items))
    (CACHE / 'fba-parsed.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(rows, ensure_ascii=True, indent=2))
