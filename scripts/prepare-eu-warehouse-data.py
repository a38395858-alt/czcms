"""Refresh attributed European boundaries and postal centroids (no live scraping).

geoBoundaries gbOpen retains its original source/license metadata beside the map.
GeoNames postal coordinates are area reference points, never warehouse entrances.
Reviewed warehouse addresses are maintained separately in warehouse-country-*.json.
"""
import concurrent.futures
import io
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'frontend/assets/data'
CACHE = ROOT / '.tmp/eu-warehouses'
CACHE.mkdir(parents=True, exist_ok=True)
COUNTRIES = {'de': 'DEU', 'fr': 'FRA', 'es': 'ESP', 'it': 'ITA', 'nl': 'NLD'}


def fetch(url, name):
    path = CACHE / name
    if not path.exists():
        request = urllib.request.Request(url, headers={'User-Agent': 'FreightVanta warehouse directory preparation (https://freightvanta.com)'})
        with urllib.request.urlopen(request, timeout=45) as response:
            path.write_bytes(response.read())
    return path.read_bytes()


def prepare(item):
    language, iso = item
    level = 'ADM2' if language == 'it' else 'ADM1'
    metadata = json.loads(fetch(f'https://www.geoboundaries.org/api/current/gbOpen/{iso}/{level}/', f'{language}-{level}-map-meta.json'))
    url = metadata.get('simplifiedGeometryGeoJSON') or metadata['gjDownloadURL']
    url = url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/raw/', '/')
    raw_map = fetch(url, f'{language}-{level}-boundaries.json')
    if raw_map.startswith(b'version https://git-lfs'):
        raw_map = fetch(url.replace('raw.githubusercontent.com/', 'media.githubusercontent.com/media/'), f'{language}-{level}-boundaries-lfs.json')
    boundaries = json.loads(raw_map)
    # Metropolitan France plus Corsica; overseas regions are not in this directory.
    if language == 'fr':
        boundaries['features'] = [f for f in boundaries['features'] if f['properties']['shapeName'] not in ['Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte', 'French Guiana', 'Réunion', 'Reunion']]
    (OUT / f'warehouse-regions.{language}.geojson').write_text(json.dumps(boundaries, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    (OUT / f'warehouse-regions.{language}.source.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    raw = fetch(f'https://download.geonames.org/export/zip/{language.upper()}.zip', f'geo-{language}.zip')
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        lines = archive.read(language.upper() + '.txt').decode('utf-8').splitlines()
    places = []
    for line in lines:
        row = line.split('\t')
        if len(row) < 12 or not row[9] or not row[10]:
            continue
        places.append({'zip': row[1], 'city': row[2], 'region': row[3], 'lat': float(row[9]), 'lng': float(row[10])})
    data = {'country': language.upper(), 'sourceURL': 'https://download.geonames.org/export/zip/', 'license': 'CC BY 4.0; GeoNames', 'places': places}
    (OUT / f'warehouse-locations.{language}.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    return {'country': language, 'regions': [f['properties']['shapeName'] for f in boundaries['features']], 'places': len(places)}


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(prepare, COUNTRIES.items()):
            print(json.dumps(result, ensure_ascii=True), flush=True)
