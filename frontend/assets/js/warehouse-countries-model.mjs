import { straightLineMiles } from './warehouse-map-model.mjs?v=20261104.2'

export const normalizeCountryQuery = value => String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/gu, 'ss').trim().replace(/\s+/gu, ' ')
export const countryAddress = (row, country) => `${row.name || row.code}\n${row.address}\n${row.zip} ${row.city}\n${row.stateName}, ${country.Name}`
export function searchCountryWarehouses(country, value) {
  const query = normalizeCountryQuery(value)
  if (!query || [...query].length > 120) return []
  const state = country.States.find(s => [s.code, s.name].some(v => normalizeCountryQuery(v) === query))
  return country.Warehouses.filter(row => {
    if (state) return row.state === state.code
    if (country.Country === 'NL' && query.replaceAll(' ', '') === row.zip.toLowerCase().replaceAll(' ', '')) return true
    const text = normalizeCountryQuery([row.code, row.name, row.address, row.city, row.zip, row.state, row.stateName].join(' '))
    return query.split(' ').every(word => text.includes(word))
  }).sort((a, b) => Number(b.code.toLowerCase() === query) - Number(a.code.toLowerCase() === query) || a.code.localeCompare(b.code))
}
export function nearbyCountryWarehouses(country, point, { radius = 50, type = 'all' } = {}) {
  if (!point || point.country !== country.Country || ![25, 50, 100, 200].includes(radius)) return []
  return country.Warehouses.filter(row => row.country === country.Country && (type === 'all' || row.type === type))
    .map(row => ({ ...row, km: straightLineMiles(point, row) * 1.609344 }))
    .filter(row => Number.isFinite(row.km) && row.km <= radius)
    .sort((a, b) => a.km - b.km || a.code.localeCompare(b.code))
}
export function countryMapOptions(params, country) {
  return {
    mode: params.get('mode') === 'nearby' ? 'nearby' : 'state',
    query: params.get('q') ?? (params.get('mode') === 'nearby' ? '' : country.DefaultState),
    radius: [25, 50, 100, 200].includes(Number(params.get('radius'))) ? Number(params.get('radius')) : 50,
    type: ['fba', '3pl'].includes(params.get('type')) ? params.get('type') : 'all',
  }
}

// RFC 7946 boundaries use counterclockwise exterior rings. D3's spherical
// projection expects the opposite winding, including each island polygon.
export function countryProjectionGeometry(data) {
  const ring = (points, exterior) => {
    let area = 0
    for (let i = 0; i < points.length - 1; i++) area += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1]
    return (exterior ? area > 0 : area < 0) ? [...points].reverse() : points
  }
  const polygon = rings => rings.map((points, i) => ring(points, i === 0))
  return { ...data, features: data.features.map(f => ({ ...f, geometry: { ...f.geometry, coordinates: f.geometry.type === 'Polygon' ? polygon(f.geometry.coordinates) : f.geometry.coordinates.map(polygon) } })) }
}
