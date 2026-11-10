"""Prepare attributed Census place/ZIP indexes and warehouse reference points.

Run explicitly; the website never batch-geocodes warehouses during a user query.
Raw downloads and address match results remain in .tmp/fba-geo for review.
"""
import csv
import io
import json
import re
import urllib.request
import uuid
import zipfile
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.tmp/fba-geo'
DATA = ROOT / 'frontend/assets/data'
CACHE.mkdir(parents=True, exist_ok=True)
BASE = 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/'
SOURCE = 'https://geocoding.geo.census.gov/geocoder/'
directory_path = DATA / 'fba-warehouses.us.json'
directory = json.loads(directory_path.read_text(encoding='utf-8'))
states = {s['code'] for s in directory['states']}


def gazetteer(name):
    archive = CACHE / f'{name}.zip'
    if not archive.exists():
        archive.write_bytes(urllib.request.urlopen(BASE + f'2025_Gaz_{name}_national.zip', timeout=45).read())
    with zipfile.ZipFile(archive) as z:
        return list(csv.DictReader(io.StringIO(z.read(z.namelist()[0]).decode('utf-8-sig')), delimiter='|'))


places = []
for row in gazetteer('place'):
    if row['USPS'] not in states:
        continue
    name = re.sub(r' (?:city|town|village|borough|municipality|CDP|unified government|consolidated government|metropolitan government|metro government)(?: \(balance\))?$', '', row['NAME'])
    places.append({'name': name, 'state': row['USPS'], 'lat': float(row['INTPTLAT']), 'lng': float(row['INTPTLONG'])})

postcodes = []
for row in gazetteer('zcta'):
    lat, lng = float(row['INTPTLAT']), float(row['INTPTLONG'])
    if 18.9 <= lat <= 72 and (-180 <= lng <= -66 or (lat > 50 and lng > 170)):
        postcodes.append({'zip': row['GEOID'], 'lat': lat, 'lng': lng})
index = {'sourceURL': BASE, 'version': '2025', 'places': places, 'postcodes': postcodes}
(DATA / 'us-location-index.json').write_text(json.dumps(index, ensure_ascii=True, separators=(',', ':')) + '\n', encoding='utf-8')

batch = CACHE / 'census-addresses.csv'
if not batch.exists():
    output = io.StringIO()
    writer = csv.writer(output)
    for w in directory['warehouses']:
        writer.writerow([w['code'], w['address'], w['city'], w['state'], w['zip'][:5]])
    boundary = '----FVCensus' + uuid.uuid4().hex
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="benchmark"\r\n\r\n4\r\n'
            f'--{boundary}\r\nContent-Disposition: form-data; name="addressFile"; filename="addresses.csv"\r\nContent-Type: text/csv\r\n\r\n'
            + output.getvalue() + f'\r\n--{boundary}--\r\n')
    request = urllib.request.Request(SOURCE + 'locations/addressbatch', data=body.encode(), headers={
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'User-Agent': 'FreightVanta warehouse reference directory',
    })
    batch.write_bytes(urllib.request.urlopen(request, timeout=120).read())

matches = {row[0]: row for row in csv.reader(io.StringIO(batch.read_text(encoding='utf-8')))}
zips = {row['zip']: row for row in postcodes}
for w in directory['warehouses']:
    row = matches.get(w['code'], [])
    point = None
    # Require a state match in the normalized street address; never silently use
    # a similarly named road in another state. Census points are address-range
    # interpolations, not warehouse entrances or delivery gate coordinates.
    if len(row) >= 6 and row[2] == 'Match' and f", {w['state']}, " in row[4]:
        lng, lat = map(float, row[5].split(','))
        if 18.9 <= lat <= 72 and -180 <= lng <= -66:
            point = (lat, lng, 'address-range', SOURCE, row[4])
    if point is None and w['zip'][:5] in zips:
        z = zips[w['zip'][:5]]
        point = (z['lat'], z['lng'], 'zip-centroid', BASE + '2025_Gaz_zcta_national.zip', 'ZIP area ' + z['zip'])
    if point:
        lat, lng, precision, source, matched = point
        w.update(lat=round(lat, 6), lng=round(lng, 6), coordinatePrecision=precision,
                 coordinateSourceURL=source, coordinateMatchedAddress=matched, coordinateCheckedAt='2026-11-04')
directory_path.write_text(json.dumps(directory, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'places': len(places), 'zipAreas': len(postcodes), 'warehousePoints': dict(Counter(w.get('coordinatePrecision', 'missing') for w in directory['warehouses']))}))
