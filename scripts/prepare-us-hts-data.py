"""Download a consistent, official USITC HTS snapshot for initial offline use."""
import datetime
import gzip
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://hts.usitc.gov/reststop/'
EXPORT = BASE + 'exportList?from=0101&to=9999&format=JSON&styles=false'

def fetch(url, limit):
    req = urllib.request.Request(url, headers={'User-Agent': 'FreightVanta HTS Lookup/1.0 (https://freightvanta.com)', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as response:
        assert response.status == 200
        body = response.read(limit + 1)
        assert len(body) <= limit, 'Official response exceeds size limit'
        return body

def release():
    releases = json.loads(fetch(BASE + 'releaseList', 2 << 20))
    current = [row for row in releases if row.get('status') == 'current']
    assert len(current) == 1, 'Expected exactly one current official release'
    return current[0]

before = release()
raw = fetch(EXPORT, 40 << 20)
after = release()
assert before['name'] == after['name'], 'Release changed during download; retry'
rows = json.loads(raw)
leaves = [row for row in rows if len(row['htsno'].replace('.', '')) == 10]
assert len(leaves) >= 10000 and len({row['htsno'] for row in leaves}) == len(leaves)
metadata = {
    'release': before['name'], 'label': before['description'],
    'effectiveDate': datetime.datetime.strptime(before['releaseStartDate'], '%m/%d/%Y').date().isoformat(),
    'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
    'sourceURL': EXPORT, 'releaseURL': BASE + 'releaseList',
    'sha256': hashlib.sha256(raw).hexdigest(), 'officialRows': len(rows), 'entries': len(leaves),
}
target = ROOT / 'internal/hts/data'
target.mkdir(parents=True, exist_ok=True)
(target / 'current.json.gz').write_bytes(gzip.compress(raw, compresslevel=9, mtime=0))
(target / 'current.meta.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
print(json.dumps(metadata))
