import { normalizeQuery, searchWarehouses, formatWarehouseAddress } from './fba-warehouses-model.mjs?v=20261104.1'
import { EARTH_MILES, FEATURED_CODES, hasMapPoint, nearbyWarehouses, precisionLabel, readMapOptions } from './warehouse-map-model.mjs?v=20261104.5'

const root = document.querySelector('[data-warehouse-map]')
if (root) initialize(root)

function initialize(root) {
  const $ = selector => root.querySelector(selector)
  const $$ = selector => [...root.querySelectorAll(selector)]
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6m0-6L10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg>'
  const input = $('#query'), list = $('#results'), error = $('#query-error'), candidates = $('#location-candidates')
  let directory
  try { directory = JSON.parse($('[data-fba-directory]').textContent); if (!Array.isArray(directory.warehouses) || directory.country !== 'US') throw Error() }
  catch { error.hidden = false; error.textContent = 'Warehouse data could not be loaded. Reload the page to try again.'; return }
  const fba = directory.warehouses.map(w => ({ ...w, type: 'fba', name: w.code }))
  const stateByCode = new Map(directory.states.map(s => [s.code, s]))
  let examples = [], options = readMapOptions(new URLSearchParams(location.search)), region = 'all', chosen = '', confirmed = null
  let notifyTimer, inputTimer, geocodeController, requestVersion = 0, mapData, projection, zoom, svg, layer
  let matches = [], mapFailed = false, activeCandidates = []
  input.value = options.query
  $('#radius').value = String(options.radius)
  $('#warehouse-type').value = options.type

  function notify(message) {
    clearTimeout(notifyTimer); $('#toast').textContent = message
    notifyTimer = setTimeout(() => { $('#toast').textContent = '' }, 4500)
  }
  function setError(message = '') { error.textContent = message; error.hidden = !message }
  function invalidateLocation() {
    requestVersion++; geocodeController?.abort(); geocodeController = null
    confirmed = null; activeCandidates = []; candidates.replaceChildren(); candidates.hidden = true
    $('#search-button').disabled = false; $('#search-form').removeAttribute('aria-busy')
    $('#search-button').firstChild.textContent = options.mode === 'nearby' ? 'Find nearby ' : 'Search warehouses '
  }
  function syncURL(method = 'replaceState') {
    const url = new URL(location.href)
    for (const name of ['q', 'mode', 'radius', 'type', 'service']) url.searchParams.delete(name)
    if (!(options.mode === 'state' && options.query === 'California' && options.type === 'all' && options.service === 'all')) url.searchParams.set('q', options.query)
    if (options.mode === 'nearby') { url.searchParams.set('mode', 'nearby'); if (options.radius !== 50) url.searchParams.set('radius', String(options.radius)) }
    if (options.type !== 'all') url.searchParams.set('type', options.type)
    if (options.mode === 'nearby' && options.service !== 'all') url.searchParams.set('service', options.service)
    if (url.href !== location.href || history.state?.warehouseLocation !== confirmed) history[method]({ warehouseLocation: confirmed }, '', url)
    if (root.dataset.indexable === 'true') {
      const robots = document.querySelector('meta[name=robots]')
      if (robots) robots.content = url.search ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    }
  }
  function stateForQuery() {
    const q = normalizeQuery(options.query)
    return directory.states.find(s => q === s.code.toLowerCase() || q === s.name.toLowerCase())?.code || ''
  }
  function currentRows() {
    const all = [...fba, ...examples.filter(() => $('#include-examples').checked)]
    if (options.mode === 'nearby') return nearbyWarehouses(all, confirmed, { ...options, examples: $('#include-examples').checked })
    const rows = searchWarehouses({ ...directory, warehouses: all }, options.query).filter(w => options.type === 'all' || w.type === options.type)
    if (stateForQuery()) {
      const priority = ['ONT8', 'LAX9', 'LGB8', 'SBD1']
      const rank = w => priority.includes(w.code) ? priority.indexOf(w.code) : w.type === 'fba' ? 10 : 20
      rows.sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code))
    }
    return rows
  }
  function selectedState() { return stateForQuery() || matches.find(w => w.code === chosen)?.state || (new Set(matches.map(w => w.state)).size === 1 ? matches[0]?.state : '') }
  function renderCard(w) {
    const approximate = w.coordinatePrecision === 'zip-centroid'
    return `<article class="result-item${chosen === w.code ? ' selected' : ''}" data-code="${escape(w.code)}" data-type="${w.type}" data-fba-card>
      <div class="result-heading"><h3>${escape(w.name)}</h3><span class="type-label ${w.type === '3pl' ? 'pl' : ''}"><i class="${w.type === '3pl' ? 'pl-dot' : 'fba-dot'}"></i>${w.type === '3pl' ? '3PL' : 'FBA'}</span></div>
      <p>${escape(w.type === '3pl' ? w.services.join(' · ') : w.address)}<br>${escape(w.city)}, ${escape(w.state)} ${escape(w.zip)}<br>US ${escape(w.region)} · ${escape(w.stateName)}</p>
      ${options.mode === 'nearby' ? `<div class="distance-detail"><span class="miles">${approximate ? '≈ ' : ''}${w.miles.toFixed(1)} mi</span><span>Straight-line</span></div>` : ''}
      <p class="point-precision">${escape(precisionLabel(w.coordinatePrecision))}</p>${w.example ? '<span class="demo-tag">Example only · no verified operator</span>' : ''}
      <div class="result-actions"><button type="button" data-locate="${escape(w.code)}">Show on map ${icon}</button>${w.type === 'fba' ? `<button type="button" data-copy="${escape(w.code)}" aria-label="Copy full address for ${escape(w.code)}">Copy address</button><a href="${escape(w.sourceURL)}" target="_blank" rel="noopener noreferrer">Source</a>` : `<button type="button" data-services="${escape(w.code)}">View services</button>`}</div>
      ${w.type === 'fba' ? `<div class="manual-copy" hidden><label>Full address<textarea readonly rows="4" aria-label="Full address for ${escape(w.code)}">${escape(formatWarehouseAddress(w))}</textarea></label></div><a class="navigation-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(`${w.address}, ${w.city}, ${w.state} ${w.zip}`)}" target="_blank" rel="noopener noreferrer">Open directions ${icon}</a>` : `<div class="example-services" hidden><p>${escape(w.services.join(', '))}. This is an interface example with no verified operator, contact or available facility.</p></div>`}
    </article>`
  }
  function render() {
    options.query = input.value.trim().replace(/\s+/gu, ' ')
    options.radius = Number($('#radius').value); options.type = $('#warehouse-type').value
    if (options.mode === 'state' && Array.from(options.query).length > 120) setError('Use 120 characters or fewer, then search again.')
    matches = currentRows()
    const stateCode = selectedState(), state = stateByCode.get(stateCode)
    $('#browse-tab').setAttribute('aria-selected', String(options.mode === 'state'))
    $('#nearby-tab').setAttribute('aria-selected', String(options.mode === 'nearby'))
    $('#radius-field').hidden = options.mode !== 'nearby'; $('#service-filters').hidden = options.mode !== 'nearby'
    $('#state-select').value = options.mode === 'state' ? stateCode : ''
    input.maxLength = options.mode === 'nearby' ? 200 : 120
    $('#query-label').textContent = options.mode === 'nearby' ? 'US address, city or ZIP code' : 'Warehouse code, state, city or ZIP code'
    input.placeholder = options.mode === 'nearby' ? 'Try 91761, Ontario, CA or a full US street address' : 'Try ONT8, CA or California'
    $('#clear-query').hidden = !input.value
    if (!geocodeController) $('#search-button').firstChild.textContent = options.mode === 'nearby' ? 'Find nearby ' : 'Search warehouses '
    $('#search-hint').textContent = options.mode === 'nearby'
      ? 'Enter a US address, city or ZIP. One match shows nearby warehouses automatically; choose a location if several match. Distances are straight-line estimates.'
      : 'Click a state on the map, or search a warehouse code. Confirm the destination against your Amazon shipment plan.'
    $('#location-selection').hidden = !confirmed
    if (confirmed) $('#location-selection').textContent = `${confirmed.label} · ${precisionLabel(confirmed.precision)} · ${matches.length} nearby listings within ${options.radius} miles`
    $('#result-title').textContent = options.mode === 'nearby' ? confirmed ? 'Nearby warehouses' : 'Find nearby warehouses' : state ? `${state.name} (${state.code})` : options.query ? 'Search results' : 'Warehouse results'
    const exampleCount = matches.filter(w => w.example).length
    $('#result-description').textContent = `${matches.length} ${matches.length === 1 ? 'listing' : 'listings'}${options.mode === 'nearby' && confirmed ? ` · within ${options.radius} miles` : state ? ` · US ${state.region}` : ''}${exampleCount ? ` · ${exampleCount} illustrative` : ''}`
    if (options.mode === 'nearby' && !confirmed) $('#result-description').textContent = options.query ? 'Choose a matching location to see nearby warehouses.' : 'Search a US address to get started.'
    $('#state-tag').textContent = options.mode === 'nearby' ? `${options.radius} mi` : stateCode || 'US'
    for (const b of $$('[data-result-type]')) b.classList.toggle('active', b.dataset.resultType === options.type)
    for (const b of $$('[data-service]')) b.setAttribute('aria-pressed', String(b.dataset.service === options.service))
    let empty = 'No reference listings in this view. Try another state or warehouse type. Our directory does not cover every warehouse.'
    if (options.mode === 'nearby' && !confirmed) empty = 'Search a US address, city and state, or five-digit ZIP above. If several locations match, choose the intended location to see nearby warehouses.'
    else if (options.mode === 'nearby') empty = 'No indexed warehouses match these filters. Try a larger radius or another type or service. This does not mean there are no warehouses nearby.'
    else if (!options.query) empty = 'Enter a warehouse code or state, or click a state on the map to start.'
    if (options.type === '3pl' && !matches.length) empty += ' No verified third-party operators have been added yet. Labeled California examples are available using the example checkbox.'
    list.innerHTML = matches.length ? matches.map(renderCard).join('') : `<p class="empty-panel">${escape(empty)}</p>`
    $('#panel-foot').textContent = options.mode === 'nearby' ? 'Straight-line estimates. ZIP points are approximate; these are not driving distances or delivery times.' : 'Select a warehouse to highlight its reference point. ZIP area markers are approximate.'
    if (mapData) drawMap()
    else if (mapFailed) $('#map-message').textContent = 'The map could not load. Search and address results still work. Reload the page to try the map again.'
    $('#data-note').textContent = `${fba.length} FBA reference addresses · ${new Set(fba.map(w => w.state)).size} states · ${examples.length ? '3PL examples are labeled.' : 'No verified 3PL listings yet.'}`
    root.dataset.ready = 'true'
  }
  function chooseState(code, method = 'pushState') {
    invalidateLocation(); setError(); options.mode = 'state'; options.service = 'all'; chosen = ''
    input.value = stateByCode.get(code)?.name || ''; options.query = input.value
    render(); syncURL(method)
  }
  function chooseWarehouse(code) {
    const w = [...fba, ...examples].find(w => w.code === code)
    if (!w) return
    const outsideView = !matches.some(row => row.code === code)
    if (outsideView) {
      invalidateLocation(); setError(); options.mode = 'state'; options.service = 'all'
      input.value = stateByCode.get(w.state)?.name || w.state
    }
    chosen = code; render()
    if (outsideView) syncURL('pushState')
    const card = [...list.children].find(el => el.dataset.code === code)
    if (card) list.scrollTo({ top: card.offsetTop - list.offsetTop, behavior: 'auto' })
    if (!hasMapPoint(w)) notify('This address does not yet have a map reference point.')
    else if (w.coordinatePrecision === 'zip-centroid') notify('Showing the ZIP area center. The warehouse street location still needs verification.')
  }
  function drawMap() {
    const d3 = window.d3
    svg = d3.select($('#map')); svg.selectAll('*').remove()
    const nearby = options.mode === 'nearby' && confirmed
    const width = 970, height = 550
    svg.attr('viewBox', nearby && matchMedia('(max-width:760px)').matches ? '200 65 570 420' : `0 0 ${width} ${height}`)
    svg.append('defs').append('clipPath').attr('id', 'warehouse-canvas-clip').append('rect').attr('width', width).attr('height', height)
    layer = svg.append('g').attr('clip-path', 'url(#warehouse-canvas-clip)').append('g')
    zoom = d3.zoom().scaleExtent([1, 6]).on('zoom', event => layer.attr('transform', event.transform))
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity).on('dblclick.zoom', null)
    if (nearby) drawNearby(layer)
    else drawNational(layer)
    $('#map-message').hidden = true
    root.dataset.mapReady = 'true'
  }
  function drawNational(group) {
    const d3 = window.d3
    projection = d3.geoAlbersUsa().fitExtent([[27, 26], [943, 520]], { type: 'FeatureCollection', features: mapData.states })
    const path = d3.geoPath(projection), selected = selectedState()
    const all = [...fba, ...examples.filter(() => $('#include-examples').checked)].filter(w => options.type === 'all' || w.type === options.type)
    const counts = new Map(directory.states.map(s => [s.code, all.filter(w => w.state === s.code).length]))
    group.selectAll('path.state').data(mapData.states).join('path').attr('class', 'state').attr('d', path)
      .attr('fill', f => f.code === selected ? '#bed4f5' : counts.get(f.code) ? '#dce8f7' : '#f8fbff')
      .attr('role', 'button').attr('tabindex', 0).attr('aria-label', f => `${f.properties.name}: ${counts.get(f.code) || 0} directory listings`)
      .attr('aria-pressed', f => String(f.code === selected))
      .on('click', (_, f) => chooseState(f.code)).on('keydown', (event, f) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); chooseState(f.code) } })
      .append('title').text(f => `${f.properties.name}: ${counts.get(f.code) || 0} directory listings`)
    const feature = mapData.states.find(f => f.code === selected)
    if (feature) group.append('path').datum(feature).attr('d', path).attr('fill', 'none').attr('stroke', '#2862ae').attr('stroke-width', 2.5).attr('pointer-events', 'none')
    for (const f of mapData.states) {
      const total = counts.get(f.code) || 0, point = path.centroid(f)
      if (!Number.isFinite(point[0])) continue
      if (total) {
        let [x, y] = point
        if (f.code === 'NJ') { x += 20; y += 6 }
        if (f.code === 'MD') { x += 38; y += 18 }
        if (f.code === 'PA') { x -= 10; y -= 3 }
        const bubble = group.append('g').attr('transform', `translate(${x},${y})`).attr('aria-hidden', 'true').on('click', () => chooseState(f.code))
        bubble.append('circle').attr('r', total >= 10 ? 19 : 15).attr('class', 'count-bubble')
        bubble.append('text').attr('class', 'count-text').attr('dy', '.35em').text(total)
        if (!['NJ', 'MD'].includes(f.code)) bubble.append('text').attr('class', 'state-label').attr('y', total >= 10 ? 33 : 28).text(f.code)
        bubble.append('title').text(`${f.properties.name}: ${total} directory listings`)
      } else if (path.area(f) > 550) group.append('text').attr('class', 'state-label').attr('x', point[0]).attr('y', point[1] + 3).text(f.code)
    }
    for (const [point, label] of [[[-157, 20.7], 'HI · inset'], [[-151, 55], 'AK · inset']]) {
      const p = projection(point); if (p) group.append('text').attr('x', p[0]).attr('y', p[1] + 30).attr('class', 'state-label').text(label)
    }
    if (options.type !== 'fba') for (const w of examples.filter(() => $('#include-examples').checked)) addPoint(group, w, false)
    const row = matches.find(w => w.code === chosen)
    if (row) addPoint(group, row)
    $('#map-title').textContent = 'United States'
    $('#map-caption').textContent = 'Click a state to explore our reference directory'
    $('#map-summary span:last-child').textContent = selected ? `${stateByCode.get(selected).name} selected` : 'Choose a state or search above'
    $('#legend-other').textContent = 'Numbers show directory listings for this warehouse type'
  }
  function addPoint(group, row, label = true) {
    if (!hasMapPoint(row)) return
    const point = projection([row.lng, row.lat]); if (!point) return
    const pin = group.append('g').attr('transform', `translate(${point})`).attr('role', 'button').attr('tabindex', 0).attr('aria-label', `${row.name}${row.example ? ', illustrative 3PL example' : ''}, ${precisionLabel(row.coordinatePrecision)}`)
      .on('click', () => chooseWarehouse(row.code)).on('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); chooseWarehouse(row.code) } })
    if (row.code === chosen) pin.append('circle').attr('r', 18).attr('fill', '#fff').attr('stroke', '#325d91').attr('stroke-width', 1.8)
    if (row.type === 'fba') pin.append('circle').attr('r', row.coordinatePrecision === 'zip-centroid' ? 7 : 8).attr('fill', '#155bc7').attr('stroke', '#fff').attr('stroke-width', 2.5).attr('class', 'map-point')
    else pin.append('rect').attr('x', -8).attr('y', -8).attr('width', 16).attr('height', 16).attr('rx', 3).attr('fill', '#116a5b').attr('stroke', '#fff').attr('stroke-width', 2.5).attr('class', 'map-point')
    // Labels are reserved for the selected point when there are many nearby
    // markers. Every point remains named through keyboard focus / its title.
    if (label && row.type === 'fba' && (row.code === chosen || matches.length <= 6)) pin.append('text').attr('x', 13).attr('y', row.code === 'ONT8' ? 23 : -13).attr('class', 'warehouse-label').text(row.code)
    pin.append('title').text(`${row.name} · ${row.city}, ${row.state} · ${precisionLabel(row.coordinatePrecision)}`)
  }
  function drawNearby(group) {
    const d3 = window.d3, center = [confirmed.lng, confirmed.lat], radius = options.radius
    projection = d3.geoMercator().center(center).scale(738400 * Math.cos(confirmed.lat * Math.PI / 180) / Math.cos(34.036 * Math.PI / 180) / radius).translate([485, 275])
    const path = d3.geoPath(projection)
    group.selectAll('path.land').data(mapData.states).join('path').attr('d', path).attr('fill', '#fafcfe').attr('stroke', '#b8cddd').attr('stroke-width', 1.4)
    const latSpan = radius / 69 * 1.7, lonSpan = latSpan / Math.max(.25, Math.cos(confirmed.lat * Math.PI / 180)) * 1.8
    const visibleCounties = mapData.counties.filter(f => {
      const [[x0, y0], [x1, y1]] = f.bounds
      return y0 <= confirmed.lat + latSpan && y1 >= confirmed.lat - latSpan && x0 <= confirmed.lng + lonSpan && x1 >= confirmed.lng - lonSpan
    })
    group.selectAll('path.county').data(visibleCounties).join('path').attr('d', path).attr('fill', 'none').attr('stroke', '#dde6ed').attr('stroke-width', 1)
    const circle = d3.geoCircle().center(center).radius(radius / EARTH_MILES * 180 / Math.PI)()
    group.append('path').datum(circle).attr('d', path).attr('fill', '#deebff').attr('fill-opacity', .56).attr('stroke', '#6392d0').attr('stroke-width', 1.5).attr('stroke-dasharray', '6 5')
    const cityPoints = new Map(matches.map(w => [`${w.city}, ${w.state}`, w])), placedLabels = []
    for (const [city, w] of [...cityPoints].slice(0, 10)) {
      const p = projection([w.lng, w.lat])
      if (Math.hypot(p[0] - 485, p[1] - 275) < 70 || placedLabels.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 110)) continue
      placedLabels.push(p)
      group.append('text').attr('x', p[0] + 12).attr('y', p[1] + 30).attr('class', 'city-label').text(city)
    }
    for (const row of matches) addPoint(group, row)
    group.append('circle').attr('cx', 485).attr('cy', 275).attr('r', 7).attr('fill', '#10213f').attr('stroke', '#fff').attr('stroke-width', 2.5)
    group.append('circle').attr('cx', 485).attr('cy', 275).attr('r', 13).attr('fill', 'none').attr('stroke', '#10213f').attr('stroke-width', 1).attr('opacity', .4)
    group.append('text').attr('x', 430).attr('y', 236).attr('class', 'location-label').text('Your search location')
    $('#map-title').textContent = 'Nearby warehouse search'
    $('#map-caption').textContent = `${radius}-mile straight-line radius`
    $('#map-summary span:last-child').textContent = confirmed.label
    $('#legend-other').textContent = 'Dark point: confirmed search location · ZIP markers are approximate'
  }
  function useLocation(location) {
    confirmed = location; chosen = ''; activeCandidates = []
    candidates.hidden = true; candidates.replaceChildren(); setError()
    render(); syncURL('replaceState')
  }
  async function findLocation({ historyMethod = 'pushState' } = {}) {
    invalidateLocation(); setError(); render(); syncURL(historyMethod)
    const query = input.value.trim()
    if (Array.from(query).length < 2 || Array.from(query).length > 200) { setError('Enter a US address, city and state, or five-digit ZIP (2–200 characters).'); return }
    const version = requestVersion
    const controller = new AbortController()
    geocodeController = controller
    const timer = setTimeout(() => controller.abort(), 20000)
    $('#search-form').setAttribute('aria-busy', 'true'); $('#search-button').disabled = true; $('#search-button').firstChild.textContent = 'Finding location… '
    $('#result-description').textContent = 'Finding your location…'
    try {
      const response = await fetch(`/api/public/us-warehouse-location?q=${encodeURIComponent(query)}`, { signal: geocodeController.signal, cache: 'no-store', headers: { Accept: 'application/json' } })
      const data = await response.json()
      if (version !== requestVersion) return
      if (!response.ok) throw new Error(data.error || 'Location search failed. Try a city and state or a ZIP code.')
      activeCandidates = Array.isArray(data.candidates) ? data.candidates.filter(hasMapPoint) : []
      if (!activeCandidates.length) { setError('No matching US location found. Check the full street address, add a state to the city, or try a five-digit ZIP.'); return }
      if (activeCandidates.length === 1) { useLocation(activeCandidates[0]); return }
      $('#result-description').textContent = 'Choose a matching location to see nearby warehouses.'
      candidates.innerHTML = '<p>Several locations match. Choose where to search.</p>' + activeCandidates.map((c, i) => `<button type="button" data-candidate="${i}"><strong>${escape(c.label)}</strong><span>${escape(precisionLabel(c.precision))} · ${escape(c.source)}</span><span class="candidate-action">Show nearby warehouses</span></button>`).join('')
      candidates.hidden = false
      candidates.querySelector('button')?.focus({ preventScroll: true })
    } catch (err) {
      if (version === requestVersion) setError(err.name === 'AbortError' ? 'Address lookup timed out. Try again, or search a city and state or ZIP code.' : err.message)
    } finally {
      clearTimeout(timer)
      if (version === requestVersion) {
        geocodeController = null; $('#search-form').removeAttribute('aria-busy'); $('#search-button').disabled = false; $('#search-button').firstChild.textContent = 'Find nearby '
        if (!error.hidden) $('#result-description').textContent = 'Location search could not be completed. Check the message above.'
      }
    }
  }
  function renderFeatured() {
    $('#featured-grid').innerHTML = FEATURED_CODES.map(code => fba.find(w => w.code === code)).filter(w => w && (region === 'all' || region === w.region)).map(w => `<article class="feature-card"><div class="feature-top"><h3>${escape(w.code)}</h3><span data-region="${w.region}">US ${w.region}</span></div><p>${escape(w.city)}, ${w.state} ${escape(w.zip)}<br>${escape(w.address)}</p><a href="${escape($('#search-form').action)}?q=${w.code}" data-feature="${w.code}">Locate on map ${icon}</a></article>`).join('')
    for (const b of $$('button[data-region]')) b.classList.toggle('active', b.dataset.region === region)
  }
  async function copyAddress(button) {
    const warehouse = fba.find(w => w.code === button.dataset.copy); if (!warehouse || button.disabled) return
    const manual = button.closest('.result-item').querySelector('.manual-copy'), textarea = manual.querySelector('textarea')
    let copied = false; button.disabled = true
    try {
      try { await navigator.clipboard.writeText(formatWarehouseAddress(warehouse)); copied = true } catch { /* Manual selection remains available. */ }
      if (!copied) { manual.hidden = false; textarea.focus({ preventScroll: true }); textarea.select(); try { copied = document.execCommand('copy') } catch {} }
      manual.hidden = copied
      if (copied) { button.focus({ preventScroll: true }); notify(`${warehouse.code} address copied`) }
      else notify('Automatic copy is unavailable. Select and copy the full address below.')
    } finally { button.disabled = false }
  }
  root.addEventListener('click', event => {
    const mode = event.target.closest('[data-mode]')
    if (mode && mode.dataset.mode !== options.mode) {
      invalidateLocation(); setError(); options.mode = mode.dataset.mode; options.service = 'all'; chosen = ''; input.value = options.mode === 'state' ? 'California' : ''; render(); syncURL('pushState')
    }
    const candidate = event.target.closest('[data-candidate]')
    if (candidate) {
      const location = activeCandidates[Number(candidate.dataset.candidate)]
      if (location) useLocation(location)
    }
    const type = event.target.closest('[data-result-type]')
    if (type) { options.type = type.dataset.resultType; $('#warehouse-type').value = options.type; options.service = 'all'; chosen = ''; render(); syncURL() }
    const service = event.target.closest('[data-service]')
    if (service) { options.service = service.dataset.service; if (options.service !== 'all') $('#warehouse-type').value = '3pl'; chosen = ''; render(); syncURL() }
    const locate = event.target.closest('[data-locate]')
    if (locate) chooseWarehouse(locate.dataset.locate)
    const feature = event.target.closest('[data-feature]')
    if (feature) { event.preventDefault(); invalidateLocation(); setError(); options.mode = 'state'; options.service = 'all'; $('#warehouse-type').value = 'fba'; input.value = feature.dataset.feature; chosen = feature.dataset.feature; render(); syncURL('pushState'); $('.workspace').scrollIntoView({ block: 'start' }) }
    const copy = event.target.closest('[data-copy]'); if (copy) void copyAddress(copy)
    const services = event.target.closest('[data-services]')
    if (services) { const panel = services.closest('.result-item').querySelector('.example-services'); panel.hidden = !panel.hidden; services.setAttribute('aria-expanded', String(!panel.hidden)) }
    const regionButton = event.target.closest('button[data-region]'); if (regionButton) { region = regionButton.dataset.region; renderFeatured() }
    const hub = event.target.closest('[data-hub]')
    if (hub) { $('#warehouse-type').value = '3pl'; chooseState(hub.dataset.hub); $('.workspace').scrollIntoView({ block: 'start' }) }
  })
  input.addEventListener('input', () => {
    clearTimeout(inputTimer); chosen = ''; setError()
    if (options.mode === 'nearby') { invalidateLocation(); render(); syncURL() }
    else if (!normalizeQuery(input.value)) { render(); syncURL() }
    else inputTimer = setTimeout(() => { render(); syncURL() }, 120)
  })
  $('#search-form').addEventListener('submit', event => { event.preventDefault(); clearTimeout(inputTimer); if (options.mode === 'nearby') void findLocation(); else { chosen = ''; render(); syncURL('pushState') } })
  $('#clear-query').addEventListener('click', () => { clearTimeout(inputTimer); invalidateLocation(); setError(); input.value = ''; chosen = ''; render(); syncURL(); input.focus() })
  $('#warehouse-type').addEventListener('change', () => { options.service = 'all'; chosen = ''; render(); syncURL() })
  $('#radius').addEventListener('change', () => { chosen = ''; render(); syncURL() })
  $('#include-examples').addEventListener('change', () => { chosen = ''; render() })
  $('#state-select').addEventListener('change', event => { if (event.target.value) chooseState(event.target.value) })
  $('#national').addEventListener('click', () => chooseState(confirmed?.state || selectedState() || 'CA'))
  $('#zoom-in').addEventListener('click', () => { if (zoom && svg) svg.call(zoom.scaleBy, 1.6) })
  $('#zoom-out').addEventListener('click', () => { if (zoom && svg) svg.call(zoom.scaleBy, 1 / 1.6) })
  $('#reset').addEventListener('click', () => { $('#warehouse-type').value = 'all'; $('#radius').value = '50'; region = 'all'; renderFeatured(); chooseState('CA') })
  window.addEventListener('popstate', event => {
    invalidateLocation(); setError(); options = readMapOptions(new URLSearchParams(location.search)); input.value = options.query; $('#radius').value = String(options.radius); $('#warehouse-type').value = options.type; chosen = ''
    if (hasMapPoint(event.state?.warehouseLocation)) confirmed = event.state.warehouseLocation
    render(); if (options.mode === 'nearby' && options.query && !confirmed) void findLocation({ historyMethod: 'replaceState' })
  })
  let resizeTimer
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (mapData) drawMap() }, 150) })
  for (const state of directory.states) { const option = document.createElement('option'); option.value = state.code; option.textContent = `${state.name} (${state.code})`; $('#state-select').append(option) }
  $('#state-select').disabled = false
  renderFeatured(); render()
  if (options.mode === 'nearby' && options.query) void findLocation({ historyMethod: 'replaceState' })
  void (async () => {
    try {
      const [states, counties, demo] = await Promise.all([
        fetch('/assets/data/us-states-10m.json?v=3').then(r => { if (!r.ok) throw Error(); return r.json() }),
        fetch('/assets/data/us-counties-10m.json?v=3').then(r => { if (!r.ok) throw Error(); return r.json() }),
        fetch('/assets/data/us-3pl-examples.json?v=20261104.2').then(r => { if (!r.ok) throw Error(); return r.json() }).catch(() => ({ status: 'illustrative-only', warehouses: [] })),
        import('/assets/vendor/d3.v7.min.js'), import('/assets/vendor/topojson-client.v3.min.js'),
      ])
      const names = new Map(directory.states.map(s => [s.name, s.code]))
      mapData = { states: window.topojson.feature(states, states.objects.states).features.map(f => ({ ...f, code: names.get(f.properties.name) })).filter(f => f.code), counties: window.topojson.feature(counties, counties.objects.counties).features.map(f => ({ ...f, bounds: window.d3.geoBounds(f) })) }
      examples = demo.status === 'illustrative-only' ? demo.warehouses : []
      render()
    } catch { mapFailed = true; render() }
  })()
}
