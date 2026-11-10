/* Independent design prototype. Nearby mode has one sample search location;
   it does not call a geocoder and must not be used as a warehouse locator. */
const $ = selector => document.querySelector(selector)
const { directory, statesTopology, countiesTopology } = window.previewData
const stateFeatures = topojson.feature(statesTopology, statesTopology.objects.states).features
const counties = topojson.feature(countiesTopology, countiesTopology.objects.counties).features.filter(f => String(f.id).padStart(5, '0').startsWith('06'))
const stateByName = new Map(directory.states.map(s => [s.name, s]))
const codeFor = feature => stateByName.get(feature.properties.name)?.code
const usableStates = stateFeatures.filter(codeFor)
const counts = new Map(directory.states.map(s => [s.code, directory.warehouses.filter(w => w.state === s.code).length]))
const fbaRows = directory.warehouses.map(w => ({ ...w, type: 'fba', name: w.code }))
const center = [-117.590, 34.036]
const examples = [
  { code: 'example-ontario', name: 'Ontario 3PL warehouse', type: '3pl', state: 'CA', stateName: 'California', region: 'West', city: 'Ontario', zip: '91761', address: 'Illustrative listing · no operator assigned', lng: -117.610, lat: 34.044, services: ['Storage', 'FBA prep', 'Relabeling'] },
  { code: 'example-chino', name: 'Chino fulfillment warehouse', type: '3pl', state: 'CA', stateName: 'California', region: 'West', city: 'Chino', zip: '91710', address: 'Illustrative listing · no operator assigned', lng: -117.687, lat: 34.012, services: ['Storage', 'Fulfillment', 'Returns'] },
  { code: 'example-fontana', name: 'Fontana prep warehouse', type: '3pl', state: 'CA', stateName: 'California', region: 'West', city: 'Fontana', zip: '92337', address: 'Illustrative listing · no operator assigned', lng: -117.462, lat: 34.080, services: ['Storage', 'FBA prep', 'Relabeling'] },
]
const hubs = [
  { name: 'Ontario', point: center }, { name: 'Dallas', point: [-96.7970, 32.7767] },
  { name: 'Chicago', point: [-87.6298, 41.8781] }, { name: 'New Jersey', point: [-74.1724, 40.7357] },
  { name: 'Atlanta', point: [-84.3880, 33.7490] }, { name: 'Miami', point: [-80.1918, 25.7617] },
]
const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const distance = w => d3.geoDistance(center, [+w.lng, +w.lat]) * 3958.7613
const hasCoordinates = w => Number.isFinite(+w.lng) && Number.isFinite(+w.lat) && +w.lat > 18 && +w.lat < 72 && +w.lng < -66 && +w.lng > -180
let mode = new URLSearchParams(location.search).get('mode') === 'nearby' ? 'nearby' : 'state'
let selectedState = 'CA', selectedCode = '', selectedService = 'all', region = 'all', notifyTimer
let mapProjection

function notify(message) {
  clearTimeout(notifyTimer)
  $('#toast').textContent = message
  notifyTimer = setTimeout(() => { $('#toast').textContent = '' }, 4500)
}

function setMode(next) {
  mode = next
  selectedCode = ''
  $('#browse-tab').setAttribute('aria-selected', String(mode === 'state'))
  $('#nearby-tab').setAttribute('aria-selected', String(mode === 'nearby'))
  $('#radius-field').hidden = mode !== 'nearby'
  $('#service-filters').hidden = mode !== 'nearby'
  $('#query-label').textContent = mode === 'nearby' ? 'US address, city or ZIP code' : 'Warehouse code, state, city or ZIP code'
  $('#query').value = mode === 'nearby' ? 'Ontario, CA 91761' : (directory.states.find(s => s.code === selectedState)?.name || 'California')
  $('#query').placeholder = mode === 'nearby' ? 'Enter a US address, city or ZIP code' : 'Try ONT8, CA or California'
  $('#search-button').firstChild.textContent = mode === 'nearby' ? 'Find nearby ' : 'Search warehouses '
  $('#search-hint').textContent = mode === 'nearby'
    ? 'Nearby concept preview: Ontario is the sample location. FBA coordinates are source references; 3PL listings are illustrative.'
    : 'Click a state on the map, or search a warehouse code. Reference addresses; confirm your Amazon shipment plan before dispatch.'
  render()
}

function rowsForView() {
  const type = $('#warehouse-type').value
  let rows = [...fbaRows, ...examples]
  if (mode === 'state') rows = rows.filter(w => w.state === selectedState)
  else rows = rows.filter(hasCoordinates).map(w => ({ ...w, miles: distance(w) })).filter(w => w.miles <= +$('#radius').value).sort((a, b) => a.miles - b.miles)
  if (type !== 'all') rows = rows.filter(w => w.type === type)
  if (mode === 'nearby' && selectedService !== 'all') rows = rows.filter(w => w.type === '3pl' && w.services.includes(selectedService))
  if (mode === 'state') {
    const priority = ['ONT8', 'LAX9', 'LGB8', 'SBD1']
    rows.sort((a, b) => {
      const score = w => priority.includes(w.code) ? priority.indexOf(w.code) : 10
      return score(a) - score(b) || a.code.localeCompare(b.code)
    })
  }
  return rows
}

function renderList() {
  const rows = rowsForView()
  const state = directory.states.find(s => s.code === selectedState)
  $('#result-title').innerHTML = mode === 'nearby' ? 'Near Ontario, CA' : `${escapeText(state?.name || selectedState)} <span>(${escapeText(selectedState)})</span>`
  $('#result-description').textContent = mode === 'nearby'
    ? `${rows.length} preview locations · within ${$('#radius').value} miles`
    : `US ${state?.region || 'West'} · ${counts.get(selectedState) || 0} FBA reference locations`
  $('#state-tag').textContent = mode === 'nearby' ? '50 mi' : selectedState
  if (mode === 'nearby') $('#state-tag').textContent = `${$('#radius').value} mi`
  $('#results').innerHTML = rows.length ? rows.map(w => `
    <article class="result-item" data-type="${w.type}" data-code="${escapeText(w.code)}">
      <div class="result-heading"><h3>${escapeText(w.name)}</h3><span class="type-label ${w.type === '3pl' ? 'pl' : ''}"><i class="${w.type === '3pl' ? 'pl-dot' : 'fba-dot'}"></i>${w.type === '3pl' ? '3PL' : 'FBA'}</span></div>
      <p>${w.type === '3pl' ? escapeText(w.services.join(' · ')) : escapeText(w.address)}<br>${escapeText(w.city)}, ${w.state} ${escapeText(w.zip)}</p>
      ${mode === 'nearby' ? `<div class="distance-detail"><span class="miles">${w.miles.toFixed(1)} mi</span><span>Straight-line</span>${w.type === '3pl' ? '<span class="demo-tag">Example listing</span>' : ''}</div>` : w.type === '3pl' ? '<span class="demo-tag">Example listing</span>' : ''}
      <div class="result-actions"><button data-locate="${escapeText(w.code)}">Show on map ↗</button>${w.type === 'fba' ? `<button data-copy="${escapeText(w.code)}">Copy address</button>` : `<button data-example="${escapeText(w.code)}">View services</button>`}</div>
    </article>`).join('') : '<p class="empty-panel">No reference listings in this view. Try another state, warehouse type or service. This does not mean no warehouses exist here.</p>'
  $('#panel-foot').textContent = mode === 'nearby' ? 'Straight-line distance, not driving distance. 3PL records are concept examples.' : 'Choose a result to highlight its state or sourced map point.'
  for (const button of document.querySelectorAll('[data-result-type]')) button.classList.toggle('active', button.dataset.resultType === $('#warehouse-type').value)
}

function clearMap() {
  const svg = d3.select('#map')
  svg.attr('viewBox', mode === 'nearby' && matchMedia('(max-width:760px)').matches ? '225 80 520 390' : '0 0 970 550')
  svg.selectAll('*').remove()
  svg.append('defs').append('clipPath').attr('id', 'canvas-clip').append('rect').attr('width', 970).attr('height', 550)
  return svg.append('g').attr('clip-path', 'url(#canvas-clip)')
}

function chooseState(code) {
  selectedState = code
  selectedCode = ''
  if (mode !== 'state') setMode('state')
  else {
    $('#query').value = directory.states.find(s => s.code === code)?.name || code
    render()
  }
}

function drawNational() {
  const group = clearMap()
  mapProjection = d3.geoAlbersUsa().fitExtent([[27, 26], [943, 520]], { type: 'FeatureCollection', features: usableStates })
  const path = d3.geoPath(mapProjection)
  group.selectAll('path.state').data(usableStates).join('path').attr('class', 'state').attr('d', path)
    .attr('fill', f => codeFor(f) === selectedState ? '#bed4f5' : counts.get(codeFor(f)) ? '#dce8f7' : '#f8fbff')
    .attr('role', 'button').attr('tabindex', 0).attr('aria-label', f => `${f.properties.name}: ${counts.get(codeFor(f)) || 0} FBA reference records`)
    .on('click', (_, f) => chooseState(codeFor(f))).on('keydown', (event, f) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); chooseState(codeFor(f)) } })
    .append('title').text(f => `${f.properties.name} · ${counts.get(codeFor(f)) || 0} FBA reference locations`)
  const selected = usableStates.find(f => codeFor(f) === selectedState)
  if (selected) group.append('path').datum(selected).attr('d', path).attr('fill', 'none').attr('stroke', '#2862ae').attr('stroke-width', 2.5).attr('pointer-events', 'none')
  for (const f of usableStates) {
    const code = codeFor(f), point = path.centroid(f), total = counts.get(code) || 0
    if (!Number.isFinite(point[0])) continue
    if (total > 0) {
      let [x, y] = point
      if (code === 'NJ') { x += 20; y += 6 }
      if (code === 'MD') { x += 38; y += 18 }
      if (code === 'PA') { x -= 10; y -= 3 }
      const bubble = group.append('g').attr('transform', `translate(${x},${y})`).attr('role', 'button').attr('tabindex', 0).attr('aria-label', `${f.properties.name}: ${total} FBA reference locations`).on('click', () => chooseState(code)).on('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); chooseState(code) } })
      bubble.append('circle').attr('r', total >= 10 ? 19 : 15).attr('class', 'count-bubble')
      bubble.append('text').attr('class', 'count-text').attr('dy', '.35em').text(total)
      bubble.append('title').text(`${f.properties.name}: ${total} FBA reference locations`)
      if (!['NJ', 'MD'].includes(code)) bubble.append('text').attr('class', 'state-label').attr('y', total >= 10 ? 33 : 28).text(code)
    } else if (path.area(f) > 550) group.append('text').attr('class', 'state-label').attr('x', point[0]).attr('y', point[1] + 3).text(code)
  }
  const hawaii = mapProjection([-157.0, 20.7])
  if (hawaii) group.append('text').attr('class', 'state-label').attr('x', hawaii[0]).attr('y', hawaii[1] + 30).text('HI · inset')
  if ($('#warehouse-type').value !== 'fba') for (const hub of hubs) {
    const p = mapProjection(hub.point)
    if (p) group.append('rect').attr('x', p[0] - 5).attr('y', p[1] - 5).attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', '#116a5b').attr('stroke', '#fff').attr('stroke-width', 1.8).append('title').text(`${hub.name} · illustrative 3PL hub`)
  }
  const chosen = fbaRows.find(w => w.code === selectedCode)
  if (chosen && hasCoordinates(chosen)) addPoint(group, chosen)
  $('#map-title').textContent = 'United States'
  $('#map-caption').textContent = 'Click a state to explore our reference directory'
  $('#map-summary span:last-child').textContent = `${directory.states.find(s => s.code === selectedState)?.name} selected`
  $('#legend-other').textContent = 'Numbers show FBA locations in our directory'
}

function addPoint(group, row) {
  const p = mapProjection([+row.lng, +row.lat])
  if (!p) return
  const point = group.append('g').attr('transform', `translate(${p})`).on('click', () => {
    selectedCode = row.code
    render()
    document.querySelector(`[data-code="${row.code}"]`)?.scrollIntoView({ block: 'nearest' })
  })
  if (row.code === selectedCode) point.append('circle').attr('r', 18).attr('fill', '#fff').attr('stroke', '#325d91').attr('stroke-width', 1.8)
  if (row.type === 'fba') point.append('circle').attr('r', 8).attr('fill', '#155bc7').attr('stroke', '#fff').attr('stroke-width', 2.5).attr('class', 'map-point')
  else point.append('rect').attr('x', -8).attr('y', -8).attr('width', 16).attr('height', 16).attr('rx', 3).attr('fill', '#116a5b').attr('stroke', '#fff').attr('stroke-width', 2.5).attr('class', 'map-point')
  if (row.type === 'fba') point.append('text').attr('x', 13).attr('y', row.code === 'ONT8' && mode === 'nearby' ? 23 : -13).attr('class', 'warehouse-label').text(row.code)
  point.append('title').text(`${row.name}${row.type === '3pl' ? ' · illustrative listing' : ''}`)
}

function drawNearby() {
  const group = clearMap(), radius = +$('#radius').value
  mapProjection = d3.geoMercator().center(center).scale(738400 / radius).translate([485, 275])
  const path = d3.geoPath(mapProjection)
  group.selectAll('path.land').data(usableStates).join('path').attr('d', path).attr('fill', '#fafcfe').attr('stroke', '#b8cddd').attr('stroke-width', 1.4)
  group.selectAll('path.county').data(counties).join('path').attr('d', path).attr('fill', 'none').attr('stroke', '#dde6ed').attr('stroke-width', 1)
  const circle = d3.geoCircle().center(center).radius(radius / 3958.7613 * 180 / Math.PI)()
  group.append('path').datum(circle).attr('d', path).attr('fill', '#deebff').attr('fill-opacity', .56).attr('stroke', '#6392d0').attr('stroke-width', 1.5).attr('stroke-dasharray', '6 5')
  const cities = [
    ['Los Angeles', -118.2437, 34.0522, -45, 24], ['San Bernardino', -117.2898, 34.1083, 4, -12],
    ['Riverside', -117.3962, 33.9533, 10, 16], ['Pomona', -117.7500, 34.0551, -35, -14],
    ['Santa Ana', -117.8678, 33.7455, -38, 20], ['San Clemente', -117.6120, 33.4269, -34, 20],
  ]
  for (const [name, lng, lat, dx, dy] of cities) {
    const p = mapProjection([lng, lat])
    group.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 2).attr('fill', '#8b9fae')
    group.append('text').attr('x', p[0] + dx).attr('y', p[1] + dy).attr('class', 'city-label').text(name)
  }
  for (const row of rowsForView()) addPoint(group, row)
  group.append('circle').attr('cx', 485).attr('cy', 275).attr('r', 7).attr('fill', '#10213f').attr('stroke', '#fff').attr('stroke-width', 2.5)
  group.append('circle').attr('cx', 485).attr('cy', 275).attr('r', 13).attr('fill', 'none').attr('stroke', '#10213f').attr('stroke-width', 1).attr('opacity', .4)
  group.append('text').attr('x', 415).attr('y', 237).attr('class', 'location-label').text('Ontario · your search location')
  const coast = mapProjection([-118.30, 33.47])
  group.append('text').attr('x', coast[0]).attr('y', coast[1]).attr('class', 'nearby-note').text('Pacific Ocean')
  $('#map-title').textContent = 'Ontario, California'
  $('#map-caption').textContent = `${radius}-mile radius · city / ZIP area preview`
  $('#map-summary span:last-child').textContent = 'Ontario, CA 91761 · sample search'
  $('#legend-other').textContent = 'Search location and straight-line radius'
}

function render() {
  renderList()
  if (mode === 'state') drawNational()
  else drawNearby()
}

function renderFeatured() {
  const codes = ['ONT8', 'LAX9', 'FTW1', 'MDW2', 'ABE8', 'TEB9']
  $('#featured-grid').innerHTML = codes.map(code => fbaRows.find(w => w.code === code)).filter(w => w && (region === 'all' || w.region === region)).map(w => `
    <article class="feature-card"><div class="feature-top"><h3>${w.code}</h3><span data-region="${w.region}">US ${w.region}</span></div><p>${escapeText(w.city)}, ${w.state} ${escapeText(w.zip)}<br>${escapeText(w.address)}</p><button data-feature="${w.code}">Locate on map <span aria-hidden="true">↗</span></button></article>`).join('')
}

document.addEventListener('click', async event => {
  const modeButton = event.target.closest('[data-mode]')
  if (modeButton) setMode(modeButton.dataset.mode)
  const tab = event.target.closest('[data-result-type]')
  if (tab) { $('#warehouse-type').value = tab.dataset.resultType; resetServices(); render() }
  const service = event.target.closest('[data-service]')
  if (service) {
    selectedService = service.dataset.service
    for (const button of document.querySelectorAll('[data-service]')) button.setAttribute('aria-pressed', String(button === service))
    if (selectedService !== 'all') $('#warehouse-type').value = '3pl'
    render()
  }
  const feature = event.target.closest('[data-feature]')
  const locate = event.target.closest('[data-locate]')
  if (feature || locate) {
    const code = feature?.dataset.feature || locate.dataset.locate
    const warehouse = [...fbaRows, ...examples].find(w => w.code === code)
    if (warehouse) {
      selectedState = warehouse.state
      selectedCode = warehouse.code
      if (feature) { setMode('state'); selectedCode = warehouse.code }
      render()
      $('.workspace').scrollIntoView({ block: 'start' })
      if (!hasCoordinates(warehouse)) notify('Showing its state. This reference address still needs a checked map coordinate.')
    }
  }
  const copy = event.target.closest('[data-copy]')
  if (copy) {
    const warehouse = fbaRows.find(w => w.code === copy.dataset.copy)
    const text = `${warehouse.code}\n${warehouse.address}\n${warehouse.city}, ${warehouse.state} ${warehouse.zip}\nUnited States`
    try { await navigator.clipboard.writeText(text); notify(`${warehouse.code} address copied`) } catch { notify('Clipboard unavailable in this file preview. The existing local query tool supports full address copy.') }
  }
  const example = event.target.closest('[data-example]')
  if (example) notify('Illustrative 3PL listing. Real operators, addresses and services must be verified before publication.')
  const hub = event.target.closest('[data-hub]')
  if (hub) {
    if (hub.dataset.hub === 'Ontario') { $('#warehouse-type').value = '3pl'; setMode('nearby'); $('.workspace').scrollIntoView() }
    else notify(`${hub.dataset.hub}: proposed 3PL hub. Verified operator listings will be added here.`)
  }
  const regionButton = event.target.closest('[data-region]')
  if (regionButton?.tagName === 'BUTTON') {
    region = regionButton.dataset.region
    for (const button of document.querySelectorAll('button[data-region]')) button.classList.toggle('active', button === regionButton)
    renderFeatured()
  }
})

$('#search-form').addEventListener('submit', event => {
  event.preventDefault()
  if (mode === 'nearby') { notify('Nearby interaction preview: Ontario, CA is the sample location. Live address lookup will be connected in the next phase.'); return }
  const query = $('#query').value.trim().toLowerCase()
  const state = directory.states.find(s => s.code.toLowerCase() === query || s.name.toLowerCase() === query)
  if (state) { chooseState(state.code); return }
  const warehouse = fbaRows.find(w => [w.code, w.city, w.zip].some(value => value.toLowerCase().includes(query)))
  if (query && warehouse) { selectedState = warehouse.state; selectedCode = warehouse.code; render() }
  else notify('No matching reference. Try ONT8, California, CA or 08518.')
})
function resetServices() {
  selectedService = 'all'
  for (const b of document.querySelectorAll('[data-service]')) b.setAttribute('aria-pressed', String(b.dataset.service === 'all'))
}
$('#warehouse-type').addEventListener('change', () => { resetServices(); render() })
$('#radius').addEventListener('change', render)
$('#national').addEventListener('click', () => setMode('state'))
$('#reset').addEventListener('click', () => { selectedState = 'CA'; resetServices(); $('#warehouse-type').value = 'all'; $('#radius').value = '50'; setMode(mode) })
$('#zoom-in').addEventListener('click', () => {
  if (mode === 'state') { setMode('nearby'); return }
  $('#radius').value = String(Math.max(25, +$('#radius').value / 2)); render()
})
$('#zoom-out').addEventListener('click', () => {
  if (mode === 'state') return
  if (+$('#radius').value === 200) { setMode('state'); return }
  $('#radius').value = String(Math.min(200, +$('#radius').value * 2)); render()
})
renderFeatured()
setMode(mode)
window.addEventListener('resize', () => { if (mode === 'nearby') drawNearby() })
document.body.dataset.ready = 'true'
