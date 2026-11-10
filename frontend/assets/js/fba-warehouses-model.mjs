export const normalizeQuery = value => String(value ?? '').trim().replace(/\s+/gu, ' ').toLowerCase()

export function searchWarehouses(directory, value) {
  const query = normalizeQuery(value)
  if (!query || Array.from(query).length > 120) return []
  const state = directory.states.find(item => query === item.code.toLowerCase() || query === item.name.toLowerCase())
  const tokens = query.split(' ')
  const score = warehouse => warehouse.code.toLowerCase() === query ? 0 : warehouse.code.toLowerCase().startsWith(query) ? 1 : 2
  return directory.warehouses.filter(warehouse => {
    if (state) return warehouse.state === state.code
    const text = [warehouse.code, warehouse.state, warehouse.stateName, warehouse.city, warehouse.zip, warehouse.address, warehouse.region].join(' ').toLowerCase()
    return tokens.every(token => text.includes(token))
  }).sort((a, b) => score(a) - score(b) || a.code.localeCompare(b.code, 'en'))
}

export function formatWarehouseAddress(warehouse) {
  return `${warehouse.code}\n${warehouse.address}\n${warehouse.city}, ${warehouse.state} ${warehouse.zip}\nUnited States`
}
