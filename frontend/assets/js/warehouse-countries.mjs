import { normalizeCountryQuery, countryAddress, searchCountryWarehouses, nearbyCountryWarehouses, countryMapOptions, countryProjectionGeometry } from './warehouse-countries-model.mjs?v=20261104.4'

const root = document.querySelector('[data-country-warehouse-map]')
if (root) initialize(root)

function initialize(root) {
  const $ = selector => root.querySelector(selector), $$ = selector => [...root.querySelectorAll(selector)]
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const country = JSON.parse($('[data-fba-directory]').textContent), c = country.Copy
  const input = $('#query'), list = $('#results'), error = $('#query-error'), candidates = $('#location-candidates')
  const states = new Map(country.States.map(s => [s.code, s]))
  const rows = country.Warehouses
  const number = value => new Intl.NumberFormat(country.Language, { maximumFractionDigits: 1 }).format(value)
  let options = countryMapOptions(new URLSearchParams(location.search), country), chosen = '', selectedRegion = 'all'
  let confirmed = null, matches = [], activeCandidates = [], controller, requestVersion = 0, inputTimer, toastTimer
  let boundaries, svg, group, zoom, projection, mapFailed = false
  const precision = key => c[key === 'zip-centroid' ? 'postalPrecision' : key === 'city-centroid' ? 'cityPrecision' : key === 'osm-reference' ? 'osmPrecision' : 'unknownPrecision']
  const validPoint = point => point?.country === country.Country && Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.lat >= 18.9 && point.lat <= 72 && Math.abs(point.lng) <= 180
  function setError(message = '') { error.textContent = message; error.hidden = !message }
  function notify(message) { clearTimeout(toastTimer); $('#toast').textContent = message; toastTimer = setTimeout(() => { $('#toast').textContent = '' }, 4500) }
  function invalidate() {
    requestVersion++; controller?.abort(); controller = null; confirmed = null; activeCandidates = []
    candidates.replaceChildren(); candidates.hidden = true; $('#location-selection').hidden = true
    $('#search-button').disabled = false; $('#search-form').removeAttribute('aria-busy')
  }
  function syncURL(method = 'replaceState') {
    options.query = input.value.trim().replace(/\s+/gu, ' ')
    const params = new URLSearchParams()
    params.set('q', options.query)
    if (options.mode === 'nearby') { params.set('mode', 'nearby'); params.set('radius', options.radius) }
    if (options.type !== 'all') params.set('type', options.type)
    history[method]({ warehouseCountryLocation: confirmed }, '', `${location.pathname}?${params}`)
    if (root.dataset.indexable === 'true') {
      let meta = document.querySelector('meta[name="robots"]')
      if (meta) meta.content = 'noindex,follow'
    }
  }
  function stateCode() {
    if (options.mode !== 'state') return ''
    const query = normalizeCountryQuery(input.value)
    return country.States.find(s => [s.name, s.code].some(v => normalizeCountryQuery(v) === query))?.code || ''
  }
  function renderCard(w) {
    return `<article class="result-item${w.code === chosen ? ' selected' : ''}" data-code="${escape(w.code)}" data-type="${w.type}" data-fba-card>
      <div class="result-heading"><h3>${escape(w.name)}</h3><span class="type-label ${w.type === '3pl' ? 'pl' : ''}"><i class="${w.type === '3pl' ? 'pl-dot' : 'fba-dot'}"></i>${w.type === '3pl' ? '3PL' : 'FBA'}</span></div>
      <p>${escape(w.address)}<br>${escape(w.zip)} ${escape(w.city)}<br>${escape(w.stateName)}, ${escape(country.Name)}</p>
      ${options.mode === 'nearby' ? `<div class="distance-detail"><span class="miles">≈ ${number(w.km)} km</span><span>${c.straightLine}</span></div>` : ''}
      <p class="point-precision">${precision(w.coordinatePrecision)}</p>
      <div class="result-actions"><button type="button" data-locate="${escape(w.code)}">${c.locate}</button><button type="button" data-copy="${escape(w.code)}">${c.copy}</button><a href="${escape(w.sourceURL)}" target="_blank" rel="noopener noreferrer">${c.source}</a></div>
      <div class="manual-copy" hidden><label>${c.fullAddress}<textarea readonly rows="4">${escape(countryAddress(w, country))}</textarea></label></div>
      <a class="navigation-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(`${w.address}, ${w.zip} ${w.city}, ${country.Name}`)}" target="_blank" rel="noopener noreferrer">${c.directions}</a></article>`
  }
  function render() {
    options.query = input.value.trim().replace(/\s+/gu, ' ')
    matches = options.mode === 'nearby' ? nearbyCountryWarehouses(country, confirmed, options) : searchCountryWarehouses(country, options.query).filter(w => options.type === 'all' || w.type === options.type)
    const state = states.get(stateCode())
    $('#browse-tab').setAttribute('aria-selected', String(options.mode === 'state'))
    $('#nearby-tab').setAttribute('aria-selected', String(options.mode === 'nearby'))
    $('#radius-field').hidden = options.mode !== 'nearby'; $('#radius').value = String(options.radius); $('#warehouse-type').value = options.type
    $('#query-label').textContent = options.mode === 'nearby' ? c.nearbyLabel : c.searchLabel
    input.placeholder = options.mode === 'nearby' ? c.nearbyPlaceholder : c.placeholder; input.maxLength = options.mode === 'nearby' ? 200 : 120
    $('#clear-query').hidden = !input.value; $('#state-select').value = state?.code || ''
    $('#search-hint').textContent = options.mode === 'nearby' ? `${c.nearbyHint} ${c.providerNote}` : c.browseHint
    if (!controller) $('#search-button').firstChild.textContent = `${options.mode === 'nearby' ? c.nearby : c.search} `
    $('#result-title').textContent = options.mode === 'nearby' ? c.nearbyResults : state?.name || c.results
    $('#result-description').textContent = options.mode === 'nearby' && !confirmed ? activeCandidates.length ? c.pendingChoice : c.nearbyPrompt : `${matches.length} ${c.directoryCount}${options.mode === 'nearby' ? ` · ${options.radius} km` : ''}`
    $('#state-tag').textContent = options.mode === 'nearby' ? `${options.radius} km` : state?.code || country.Country
    $('#location-selection').hidden = !confirmed
    if (confirmed) $('#location-selection').textContent = `${confirmed.label} · ${precision(confirmed.precision)} · ${matches.length} ${c.directoryCount} · ${options.radius} km`
    $$('[data-result-type]').forEach(b => b.classList.toggle('active', b.dataset.resultType === options.type))
    list.innerHTML = matches.length ? matches.map(renderCard).join('') : `<p class="empty-panel">${escape(options.mode === 'nearby' ? confirmed ? c.emptyNearby : c.nearbyPrompt : c.emptyBrowse)}</p>`
    $('#panel-foot').textContent = options.mode === 'nearby' ? c.nearbyFoot : c.resultFoot
    if (boundaries) drawMap()
    else if (mapFailed) { $('#map-message').textContent = c.mapError; $('#map-message').hidden = false }
    root.dataset.ready = 'true'
  }
  function chooseState(code, method = 'pushState') {
    invalidate(); setError(); chosen = ''; options.mode = 'state'
    input.value = states.get(code)?.name || ''; render(); syncURL(method)
  }
  function chooseWarehouse(code) {
    const w = rows.find(w => w.code === code); if (!w) return
    if (!matches.some(w => w.code === code)) { invalidate(); setError(); options.mode = 'state'; options.type = 'all'; input.value = w.code }
    chosen = code; render(); syncURL('pushState')
    const card = [...list.children].find(el => el.dataset.code === code)
    if (card) list.scrollTo({ top: card.offsetTop - list.offsetTop, behavior: 'auto' })
  }
  function renderFeatured() {
    const featured = country.FeaturedCodes.map(code => rows.find(w => w.code === code)).filter(Boolean)
    $('#featured-grid').innerHTML = featured.filter(w => selectedRegion === 'all' || w.state === selectedRegion).map(w => `<article class="feature-card"><div class="feature-top"><h3>${escape(w.name)}</h3><span>${w.type === '3pl' ? '3PL' : 'FBA'}</span></div><p>${escape(w.city)} · ${escape(w.stateName)}<br>${escape(w.zip)} · ${escape(w.address)}</p><a href="${escape($('#search-form').action)}?q=${encodeURIComponent(w.code)}" data-feature="${escape(w.code)}">${c.locate}</a></article>`).join('')
    for (const b of $$('button[data-region]')) { b.hidden = b.dataset.region !== 'all' && !featured.some(w => w.state === b.dataset.region); b.classList.toggle('active', b.dataset.region === selectedRegion) }
    $('#hub-grid').innerHTML = country.States.filter(s => rows.some(w => w.state === s.code)).map(s => `<button data-hub="${s.code}"><strong>${escape(s.name)}</strong><span>${rows.filter(w => w.state === s.code).length} ${c.directoryCount}</span></button>`).join('')
  }
  function addPoint(w) {
    if (!Number.isFinite(w.lat) || !Number.isFinite(w.lng)) return
    const p = projection([w.lng, w.lat]); if (!p) return
    const marker = group.append('g').attr('transform', `translate(${p})`).attr('role', 'button').attr('tabindex', 0).attr('aria-label', `${w.name}, ${precision(w.coordinatePrecision)}`)
      .on('click', () => chooseWarehouse(w.code)).on('keydown', e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); chooseWarehouse(w.code) } })
    if (w.code === chosen) marker.append('circle').attr('r', 17).attr('fill', 'white').attr('stroke', '#325d91').attr('stroke-width', 2)
    marker.append('circle').attr('r', 8).attr('fill', w.type === '3pl' ? '#116a5b' : '#155bc7').attr('stroke', 'white').attr('stroke-width', 2.5)
    marker.append('title').text(`${w.name}, ${w.zip} ${w.city}`)
    if (w.code === chosen || matches.length <= 4) marker.append('text').attr('class', 'warehouse-label').attr('x', 13).attr('y', -13).text(w.name)
  }
  function drawMap() {
    const d3 = window.d3, nearby = options.mode === 'nearby' && confirmed
    svg = d3.select($('#map')); svg.selectAll('*').remove()
    svg.append('defs').append('clipPath').attr('id', 'eu-map-clip').append('rect').attr('width', 970).attr('height', 550)
    group = svg.append('g').attr('clip-path', 'url(#eu-map-clip)').append('g')
    zoom = d3.zoom().scaleExtent([1, 7]).filter(e => e.type === 'wheel' ? e.ctrlKey : !e.button && (!e.touches || e.touches.length > 1)).on('zoom', e => group.attr('transform', e.transform)); svg.call(zoom).on('dblclick.zoom', null)
    let radiusShape
    if (nearby) {
      radiusShape = d3.geoCircle().center([confirmed.lng, confirmed.lat]).radius(options.radius / 6371.0088 * 180 / Math.PI)()
      projection = d3.geoMercator().fitExtent([[130, 55], [840, 495]], radiusShape)
    } else projection = d3.geoMercator().fitExtent([[95, 24], [875, 515]], boundaries)
    const path = d3.geoPath(projection), selected = stateCode()
    const bounds = path.bounds(nearby ? radiusShape : boundaries)
    const left = Math.max(0, bounds[0][0] - 40), right = Math.min(970, bounds[1][0] + 40)
    svg.attr('viewBox', matchMedia('(max-width:760px)').matches ? `${left} 0 ${right - left} 550` : '0 0 970 550')
    const counts = new Map(country.States.map(s => [s.code, rows.filter(w => w.state === s.code && (options.type === 'all' || options.type === w.type)).length]))
    group.selectAll('path.state').data(boundaries.features).join('path').attr('class', 'state').attr('d', path)
      .attr('fill', f => f.code === selected ? '#bed4f5' : counts.get(f.code) ? '#dce8f7' : '#f8fbff')
      .attr('role', 'button').attr('tabindex', 0).attr('aria-label', f => `${f.properties.shapeName}: ${counts.get(f.code) || 0} ${c.directoryCount}`).attr('aria-pressed', f => String(f.code === selected))
      .on('click', (_, f) => chooseState(f.code)).on('keydown', (e, f) => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); chooseState(f.code) } })
      .append('title').text(f => `${f.properties.shapeName}: ${counts.get(f.code) || 0} ${c.directoryCount}`)
    if (nearby) {
      group.append('path').datum(radiusShape).attr('d', path).attr('fill', '#deebff').attr('fill-opacity', .5).attr('stroke', '#6392d0').attr('stroke-dasharray', '6 5').attr('pointer-events', 'none')
      group.append('circle').attr('cx', projection([confirmed.lng, confirmed.lat])[0]).attr('cy', projection([confirmed.lng, confirmed.lat])[1]).attr('r', 7).attr('fill', '#17273e').attr('stroke', 'white').attr('stroke-width', 2).append('title').text(confirmed.label)
      matches.forEach(addPoint)
    } else {
      for (const feature of boundaries.features) {
        const total = counts.get(feature.code), point = path.centroid(feature)
        if (!Number.isFinite(point[0])) continue
        if (total) {
          const bubble = group.append('g').attr('transform', `translate(${point})`).attr('aria-hidden', 'true').on('click', () => chooseState(feature.code))
          bubble.append('circle').attr('r', 17).attr('class', 'count-bubble'); bubble.append('text').attr('class', 'count-text').attr('dy', '.35em').text(total)
          bubble.append('text').attr('class', 'state-label').attr('y', 32).text(feature.code)
        } else if (path.area(feature) > 1200) group.append('text').attr('class', 'state-label').attr('x', point[0]).attr('y', point[1]).text(feature.code)
      }
      const row = matches.find(w => w.code === chosen); if (row) addPoint(row)
    }
    $('#map-title').textContent = nearby ? `${country.Name} · ${options.radius} km` : country.Name
    $('#map-caption').textContent = nearby ? c.straightLine : c.mapCaption
    $('#map-summary span:last-child').textContent = nearby ? `${number(confirmed.lat)}, ${number(confirmed.lng)}` : states.get(selected)?.name || c.chooseState
    $('#map-message').hidden = true; root.dataset.mapReady = 'true'
  }
  function useLocation(point) {
    if (!validPoint(point)) return
    confirmed = point; activeCandidates = []; candidates.hidden = true; candidates.replaceChildren(); chosen = ''; setError(); render(); syncURL()
  }
  async function findLocation(method = 'pushState') {
    invalidate(); setError(); render(); syncURL(method)
    const query = input.value.trim()
    if ([...query].length < 2 || [...query].length > 200) { setError(c.invalidQuery); return }
    const version = requestVersion, request = new AbortController(); controller = request
    const timer = setTimeout(() => request.abort(), 16000)
    $('#search-button').disabled = true; $('#search-button').firstChild.textContent = c.finding; $('#result-description').textContent = c.finding; $('#search-form').setAttribute('aria-busy', 'true')
    try {
      const response = await fetch(`/api/public/eu-warehouse-location?country=${country.Language}&q=${encodeURIComponent(query)}`, { signal: request.signal, cache: 'no-store' })
      const data = await response.json(); if (version !== requestVersion) return
      if (!response.ok) throw Error(data.error || c.locationError)
      activeCandidates = Array.isArray(data.candidates) ? data.candidates.filter(validPoint) : []
      if (!activeCandidates.length) { setError(c.locationNoMatch); return }
      if (activeCandidates.length === 1) { useLocation(activeCandidates[0]); return }
      candidates.innerHTML = `<p>${c.pendingChoice}</p>` + activeCandidates.map((point, i) => `<button type="button" data-candidate="${i}"><strong>${escape(point.label)}</strong><span>${precision(point.precision)} · ${escape(point.source)}</span><span class="candidate-action">${c.nearby}</span></button>`).join('')
      candidates.hidden = false; render(); candidates.querySelector('button')?.focus({ preventScroll: true })
    } catch (err) { if (version === requestVersion) setError(err.name === 'AbortError' ? c.locationError : err.message) }
    finally { clearTimeout(timer); if (version === requestVersion) { controller = null; $('#search-button').disabled = false; $('#search-form').removeAttribute('aria-busy'); $('#search-button').firstChild.textContent = `${c.nearby} ` } }
  }
  async function copyAddress(button) {
    const row = rows.find(w => w.code === button.dataset.copy); if (!row) return
    const manual = button.closest('.result-item').querySelector('.manual-copy'), text = manual.querySelector('textarea')
    let copied = false; button.disabled = true
    try { await navigator.clipboard.writeText(countryAddress(row, country)); copied = true } catch {
      manual.hidden = false; text.focus({ preventScroll: true }); text.select(); try { copied = document.execCommand('copy') } catch {}
    }
    manual.hidden = copied; button.disabled = false; notify(copied ? c.copied : c.copyManual)
  }
  root.addEventListener('click', event => {
    const mode = event.target.closest('[data-mode]')
    if (mode) { invalidate(); setError(); options.mode = mode.dataset.mode; input.value = options.mode === 'nearby' ? '' : country.DefaultState; chosen = ''; render(); syncURL('pushState') }
    const candidate = event.target.closest('[data-candidate]'); if (candidate) useLocation(activeCandidates[Number(candidate.dataset.candidate)])
    const type = event.target.closest('[data-result-type]'); if (type) { options.type = type.dataset.resultType; chosen = ''; render(); syncURL() }
    const locate = event.target.closest('[data-locate]'); if (locate) chooseWarehouse(locate.dataset.locate)
    const feature = event.target.closest('[data-feature]'); if (feature) { event.preventDefault(); chooseWarehouse(feature.dataset.feature); $('.workspace').scrollIntoView({ block: 'start' }) }
    const copy = event.target.closest('[data-copy]'); if (copy) void copyAddress(copy)
    const region = event.target.closest('[data-region]'); if (region) { selectedRegion = region.dataset.region; renderFeatured() }
    const hub = event.target.closest('[data-hub]'); if (hub) { options.type = 'all'; chooseState(hub.dataset.hub); $('.workspace').scrollIntoView({ block: 'start' }) }
  })
  input.addEventListener('input', () => { clearTimeout(inputTimer); chosen = ''; setError(); if (options.mode === 'nearby') { invalidate(); render(); syncURL() } else if (!normalizeCountryQuery(input.value)) { render(); syncURL() } else { inputTimer = setTimeout(() => { render(); syncURL() }, 120) } })
  $('#search-form').addEventListener('submit', e => { e.preventDefault(); clearTimeout(inputTimer); if (options.mode === 'nearby') void findLocation(); else { if ([...input.value].length > 120) setError(c.invalidQuery); render(); syncURL('pushState') } })
  $('#clear-query').addEventListener('click', () => { clearTimeout(inputTimer); invalidate(); setError(); input.value = ''; chosen = ''; render(); syncURL(); input.focus() })
  $('#warehouse-type').addEventListener('change', e => { options.type = e.target.value; chosen = ''; render(); syncURL() })
  $('#radius').addEventListener('change', e => { options.radius = Number(e.target.value); chosen = ''; render(); syncURL() })
  $('#state-select').addEventListener('change', e => chooseState(e.target.value))
  $('#national').addEventListener('click', () => { options.type = 'all'; chooseState('') })
  $('#zoom-in').addEventListener('click', () => { if (zoom) svg.call(zoom.scaleBy, 1.6) })
  $('#zoom-out').addEventListener('click', () => { if (zoom) svg.call(zoom.scaleBy, 1 / 1.6) })
  $('#reset').addEventListener('click', () => { options = countryMapOptions(new URLSearchParams(), country); selectedRegion = 'all'; renderFeatured(); chooseState(country.States.find(s => s.name === country.DefaultState)?.code) })
  for (const tab of $$('[role="tab"]')) tab.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? $('#browse-tab') : e.key === 'End' ? $('#nearby-tab') : tab.id === 'browse-tab' ? $('#nearby-tab') : $('#browse-tab'); next.click(); next.focus() } })
  window.addEventListener('popstate', e => { invalidate(); setError(); options = countryMapOptions(new URLSearchParams(location.search), country); input.value = options.query; chosen = ''; if (validPoint(e.state?.warehouseCountryLocation)) confirmed = e.state.warehouseCountryLocation; render(); if (options.mode === 'nearby' && options.query && !confirmed) void findLocation('replaceState') })
  let resizeTimer
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (boundaries) drawMap() }, 150) })
  input.value = options.query; renderFeatured(); render()
  if (options.mode === 'nearby' && options.query) void findLocation('replaceState')
  void (async () => {
    try {
      const [data] = await Promise.all([fetch(`${country.MapURL}?v=20261104.4`).then(r => { if (!r.ok) throw Error(); return r.json() }), import('/assets/vendor/d3.v7.min.js')])
      const names = new Map(country.States.map(s => [s.name, s.code]))
      if (data.features.length !== country.States.length || data.features.some(f => !names.has(f.properties.shapeName))) throw Error()
      const geometry = countryProjectionGeometry(data)
      boundaries = { ...geometry, features: geometry.features.map(f => ({ ...f, code: names.get(f.properties.shapeName) })) }; render()
    } catch { mapFailed = true; render() }
  })()
}
