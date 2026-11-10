export const EARTH_MILES = 3958.7613
export const SEARCH_RADII = [25, 50, 100, 200]
export const FEATURED_CODES = ['ONT8', 'LAX9', 'FTW1', 'MDW2', 'ABE8', 'TEB9']

export function hasMapPoint(row) {
  return typeof row?.lat === 'number' && typeof row?.lng === 'number' &&
    Number.isFinite(row.lat) && Number.isFinite(row.lng) &&
    row.lat >= 18.9 && row.lat <= 72 && row.lng >= -180 && row.lng <= 180
}

export function straightLineMiles(a, b) {
  if (!hasMapPoint(a) || !hasMapPoint(b)) return NaN
  const radians = value => value * Math.PI / 180
  const latitude = radians(b.lat - a.lat), longitude = radians(b.lng - a.lng)
  const h = Math.sin(latitude / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(longitude / 2) ** 2
  return 2 * EARTH_MILES * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))))
}

export function nearbyWarehouses(rows, location, { radius = 50, type = 'all', service = 'all', examples = false } = {}) {
  if (!hasMapPoint(location) || !SEARCH_RADII.includes(Number(radius))) return []
  return rows.filter(row => hasMapPoint(row) && (!row.example || examples) && (type === 'all' || row.type === type) &&
    (service === 'all' || (row.type === '3pl' && row.services?.includes(service))))
    .map(row => ({ ...row, miles: straightLineMiles(location, row) }))
    .filter(row => row.miles <= Number(radius))
    .sort((a, b) => a.miles - b.miles || a.code.localeCompare(b.code))
}

export function precisionLabel(precision) {
  return ({ 'address-range': 'Street range estimate', 'osm-reference': 'Approx. OpenStreetMap reference point', 'zip-centroid': 'Approx. ZIP area center', 'city-centroid': 'Approx. city center', example: 'Illustrative point' })[precision] || 'Location not verified'
}

export function readMapOptions(params) {
  const radius = Number(params.get('radius') || 50)
  return {
    mode: params.get('mode') === 'nearby' ? 'nearby' : 'state',
    type: ['all', 'fba', '3pl'].includes(params.get('type')) ? params.get('type') : 'all',
    service: ['Storage', 'FBA prep', 'Relabeling', 'Fulfillment', 'Returns'].includes(params.get('service')) ? params.get('service') : 'all',
    radius: SEARCH_RADII.includes(radius) ? radius : 50,
    query: params.get('q') ?? (params.get('mode') === 'nearby' ? '' : 'California'),
  }
}
