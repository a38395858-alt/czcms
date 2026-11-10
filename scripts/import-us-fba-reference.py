"""Build a curated US address snapshot from public, attributed directory pages.

Run explicitly to review a new snapshot; the website never scrapes at query time.
Raw source pages and the review report stay in .tmp/fba-sources/.
"""
import concurrent.futures
import datetime
import hashlib
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.tmp/fba-sources'
CACHE.mkdir(parents=True, exist_ok=True)
BASE = 'https://www.fbanearme.com'
STATES = dict(pair.split(':', 1) for pair in (
    'AL:Alabama|AK:Alaska|AZ:Arizona|AR:Arkansas|CA:California|CO:Colorado|CT:Connecticut|'
    'DE:Delaware|DC:District of Columbia|FL:Florida|GA:Georgia|HI:Hawaii|ID:Idaho|IL:Illinois|'
    'IN:Indiana|IA:Iowa|KS:Kansas|KY:Kentucky|LA:Louisiana|ME:Maine|MD:Maryland|MA:Massachusetts|'
    'MI:Michigan|MN:Minnesota|MS:Mississippi|MO:Missouri|MT:Montana|NE:Nebraska|NV:Nevada|'
    'NH:New Hampshire|NJ:New Jersey|NM:New Mexico|NY:New York|NC:North Carolina|ND:North Dakota|'
    'OH:Ohio|OK:Oklahoma|OR:Oregon|PA:Pennsylvania|RI:Rhode Island|SC:South Carolina|'
    'SD:South Dakota|TN:Tennessee|TX:Texas|UT:Utah|VT:Vermont|VA:Virginia|WA:Washington|'
    'WV:West Virginia|WI:Wisconsin|WY:Wyoming'
).split('|'))
WEST = set('AK AZ CA CO HI ID MT NV NM OR UT WA WY'.split())
CENTRAL = set('AL AR IA IL IN KS KY LA MI MN MO MS ND NE OH OK SD TN TX WI'.split())
SELECTED = set('''
ONT8 ONT6 ONT2 ONT7 ONT9 LAX9 LGB8 LGB4 LGB3 LGB6 LGB9 SBD1 SBD2 SBD3 SMF3 SMF6
SMF1 SJC7 OAK4 FAT1 SCK4 SCK3 GYR1 GYR2 GYR3 PHX3 PHX6 LAS1 LAS6 LAS7 RNO4
FTW1 FTW6 FTW9 DFW6 DFW7 IAH3 HOU2 SAT1 AUS2 MDW2 MDW4 MDW6 ORD2 IND9 IND4 IND8
DTW1 CLE2 CMH1 MEM1 MEM4 BNA3 SDF8 LEX1 ABE8 ABE4 AVP1 AVP3 AVP8 PHL7 PHL4
TEB9 TEB6 EWR4 EWR9 ACY1 BWI2 BWI4 RIC2 CLT2 CLT4 GSP1 ATL2 ATL6 SAV3 TPA1
TPA2 MCO1 JAX2 MIA1 MIA2 MKE1 MSP1 DEN2 SLC1 PDX9 BFI4 GEG1 BOI2 FAR1 LFT1
'''.split())
# Conflicting entries were reviewed against the corresponding Warehouse Ninja
# facility page. Keep the attributed record, never pick a duplicate by row order.
REVIEWED = {
    'ABE8': '/locations/usa/nj/florence/abe8-florence-nj-08518',
    'CMH1': '/locations/usa/oh/etna/cmh1-etna-oh-43062',
    'MDW2': '/locations/usa/il/joliet/mdw2-joliet-il-60433',
    'MDW4': '/locations/usa/il/joliet/mdw4-joliet-il-60433-3281',
    'MIA1': '/locations/usa/fl/opa-locka/mia1-33054-opa-locka-fl-33054',
}


def fetch(path):
    cached = CACHE / (hashlib.sha256(path.encode()).hexdigest()[:20] + '.html')
    if not cached.exists():
        request = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=25) as response:
            cached.write_bytes(response.read())
    return cached.read_text(encoding='utf-8')


def state_links(state):
    try:
        body = fetch('/locations/usa/' + state.lower())
        links = re.findall(r'href="(/locations/usa/' + state.lower() + r'/[^"?#]+/[^"?#]+)"', body)
        return sorted(set(path for path in links if path.rsplit('/', 1)[1].split('-', 1)[0].upper() in SELECTED))
    except Exception as error:
        return {'state': state, 'error': str(error)}


def address(path):
    try:
        body = fetch(path)
        code = path.rsplit('/', 1)[1].split('-', 1)[0].upper()
        for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', body, re.S):
            node = json.loads(raw)
            if 'address' not in node or not isinstance(node['address'], dict):
                continue
            source = node['address']
            state = source['addressRegion'].upper()
            street, city, zip_code = (source[k].strip() for k in ['streetAddress', 'addressLocality', 'postalCode'])
            assert state == path.split('/')[3].upper() and state in STATES
            assert re.fullmatch(r'\d{5}(?:-\d{4})?', zip_code)
            assert street and city and code in SELECTED and source['addressCountry'] == 'US'
            return {
                'code': code, 'state': state, 'stateName': STATES[state],
                'region': 'West' if state in WEST else 'Central' if state in CENTRAL else 'East',
                'city': city, 'zip': zip_code, 'address': street, 'country': 'US',
                'sourceURL': BASE + path,
            }
        raise ValueError('No structured postal address found')
    except Exception as error:
        return {'path': path, 'error': str(error)}


if __name__ == '__main__':
    states = 'CA AZ NV TX IL IN MI OH TN KY PA NJ MD VA NC SC GA FL WI MN CO UT OR WA ID ND LA'.split()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        batches = list(pool.map(state_links, states))
    errors = [item for item in batches if isinstance(item, dict)]
    paths = sorted({path for batch in batches if isinstance(batch, list) for path in batch})
    print(json.dumps({'stage': 'source_pages', 'selected_paths': len(paths), 'errors': errors}), flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(address, paths))
    errors.extend(row for row in results if 'error' in row)
    rows = sorted((row for row in results if 'code' in row), key=lambda row: row['code'])
    (CACHE / 'parsed-records.json').write_text(json.dumps({'warehouses': rows, 'errors': errors}, indent=2), encoding='utf-8')
    rows = [row for row in rows if row['code'] not in REVIEWED or row['sourceURL'] == BASE + REVIEWED[row['code']]]
    for row in rows:
        if row['code'] in REVIEWED:
            row['corroboratingSourceURL'] = 'https://warehouse.ninja/locations/amazon/' + row['code'].lower() + '/'
    assert len(rows) >= 50, 'Not enough sourced records; review the import errors'
    assert len({row['code'] for row in rows}) == len(rows), 'Duplicate code; review conflicting addresses'
    today = datetime.date.today().isoformat()
    document = {
        'country': 'US', 'language': 'en', 'sourceCheckedAt': today,
        'coverage': 'Curated reference directory; not a complete or live Amazon facility register.',
        'regionNote': 'West, Central and East are FreightVanta planning groups, not official Amazon regions.',
        'sources': [{'name': 'FBA Near Me public facility directory', 'url': BASE + '/locations/usa'}, {'name': 'Warehouse Ninja facility directory (conflict checks)', 'url': 'https://warehouse.ninja/locations/amazon/'}],
        'states': [{'code': code, 'name': name, 'region': 'West' if code in WEST else 'Central' if code in CENTRAL else 'East'} for code, name in sorted(STATES.items())],
        'warehouses': rows,
    }
    target = ROOT / 'frontend/assets/data/fba-warehouses.us.json'
    target.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    report = {'records': len(rows), 'states': len({row['state'] for row in rows}), 'missing': sorted(SELECTED - {row['code'] for row in rows}), 'errors': errors}
    (CACHE / 'import-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report), flush=True)
