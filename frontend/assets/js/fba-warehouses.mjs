import { normalizeQuery, searchWarehouses, formatWarehouseAddress } from './fba-warehouses-model.mjs?v=20261104.1'

function initializeLookup(root) {
  if (root.dataset.fbaInitialized) return
  const form = root.querySelector('[data-fba-form]')
  const input = root.querySelector('[data-fba-input]')
  const results = root.querySelector('[data-fba-results]')
  const count = root.querySelector('[data-fba-count]')
  const empty = root.querySelector('[data-fba-empty]')
  const error = root.querySelector('[data-fba-error]')
  const clear = root.querySelector('[data-fba-clear]')
  const template = root.querySelector('[data-fba-card-template]')
  const toast = root.querySelector('[data-fba-toast]')
  let directory
  try {
    directory = JSON.parse(root.querySelector('[data-fba-directory]').textContent)
    if (directory.country !== 'US' || !Array.isArray(directory.warehouses) || !Array.isArray(directory.states)) throw new Error('Invalid directory')
  } catch {
    error.hidden = false
    error.textContent = 'Warehouse data could not be loaded. Reload this page or use Search warehouses to try again.'
    return
  }
  root.dataset.fbaInitialized = 'true'
  root.querySelector('[data-fba-enhanced]').hidden = false
  let pendingSearch, toastTimer
  const locations = new Map(directory.warehouses.map(item => [item.code, item]))

  function updateURL(query, method = 'replaceState') {
    const url = new URL(window.location.href)
    if (query) url.searchParams.set('q', query)
    else url.searchParams.delete('q')
    if (url.href !== window.location.href) window.history[method]({}, '', url)
    if (root.dataset.fbaIndexable === 'true') {
      const robots = document.querySelector('meta[name=robots]')
      if (robots) robots.content = query ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    }
  }

  function makeCard(warehouse) {
    const card = template.content.firstElementChild.cloneNode(true)
    card.querySelector('[data-fba-code]').textContent = warehouse.code
    const region = card.querySelector('[data-fba-region]')
    region.textContent = `US ${warehouse.region}`
    region.dataset.region = warehouse.region
    const state = card.querySelector('[data-fba-state]')
    state.textContent = `${warehouse.stateName} (${warehouse.state})`
    state.dataset.fbaQuery = warehouse.state
    for (const [field, value] of [['city', warehouse.city], ['zip', warehouse.zip], ['address', warehouse.address]]) {
      card.querySelector(`[data-fba-${field}]`).textContent = value
    }
    const copy = card.querySelector('[data-fba-copy]')
    copy.disabled = false
    copy.dataset.fbaCopy = warehouse.code
    copy.setAttribute('aria-label', `Copy full address for ${warehouse.code}`)
    const fullAddress = card.querySelector('[data-fba-full-address]')
    fullAddress.value = formatWarehouseAddress(warehouse)
    fullAddress.setAttribute('aria-label', `Full address for ${warehouse.code}`)
    const source = card.querySelector('[data-fba-source]')
    try {
      const url = new URL(warehouse.sourceURL)
      if (url.protocol !== 'https:' || !['www.fbanearme.com', 'warehouse.ninja'].includes(url.hostname)) throw new Error('Invalid source')
      source.href = url.href
      source.setAttribute('aria-label', `View address source for ${warehouse.code}`)
    } catch { source.remove() }
    return card
  }

  function render({ sync = true, method = 'replaceState' } = {}) {
    clearTimeout(pendingSearch)
    const query = input.value.trim().replace(/\s+/gu, ' ')
    const invalid = Array.from(query).length > 120
    const matches = invalid ? [] : searchWarehouses(directory, query)
    clear.hidden = !input.value
    error.hidden = !invalid
    error.textContent = invalid ? 'Use 120 characters or fewer, then search again.' : ''
    const fragment = document.createDocumentFragment()
    for (const warehouse of matches) fragment.append(makeCard(warehouse))
    results.replaceChildren(fragment)
    empty.hidden = matches.length > 0 || invalid
    const active = !!normalizeQuery(query)
    root.querySelector('[data-fba-empty-title]').textContent = active ? 'No reference warehouses found' : 'A code is all you need'
    root.querySelector('[data-fba-empty-text]').textContent = active
      ? 'Check the spelling, try a warehouse code or search another state. Coverage varies; no results does not mean a state has no Amazon facilities.'
      : 'Enter a warehouse code like ONT8 to find its address, or a state like CA to see the locations in our directory.'
    count.textContent = invalid ? 'Search is too long.' : active ? `${matches.length} ${matches.length === 1 ? 'warehouse' : 'warehouses'} found for “${query}”` : 'Enter a warehouse code or state to start.'
    if (sync) updateURL(query, method)
  }

  function notify(message) {
    clearTimeout(toastTimer)
    toast.textContent = message
    toastTimer = setTimeout(() => { toast.textContent = '' }, 4000)
  }

  async function copyAddress(button) {
    const warehouse = locations.get(button.dataset.fbaCopy)
    if (!warehouse || button.disabled) return
    const card = button.closest('[data-fba-card]')
    const manual = card.querySelector('[data-fba-manual]')
    const textarea = manual.querySelector('textarea')
    const text = formatWarehouseAddress(warehouse)
    let copied = false
    button.disabled = true
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(text); copied = true } catch { /* Offer the browser's legacy copy action next. */ }
      }
      if (!copied) {
        manual.hidden = false
        textarea.focus({ preventScroll: true })
        textarea.select()
        try { copied = document.execCommand('copy') } catch { copied = false }
      }
      manual.hidden = copied
      if (copied) {
        button.focus({ preventScroll: true })
        notify(`${warehouse.code} address copied`)
      } else {
        notify('Automatic copy is unavailable. Select and copy the address below.')
      }
    } finally { button.disabled = false }
  }

  input.addEventListener('input', () => {
    // A cleared native search field must remove stale cards immediately.
    if (!normalizeQuery(input.value)) render()
    else { clearTimeout(pendingSearch); pendingSearch = setTimeout(render, 100) }
  })
  input.addEventListener('search', () => render())
  form.addEventListener('submit', event => { event.preventDefault(); render() })
  clear.addEventListener('click', () => { input.value = ''; render(); input.focus() })
  root.addEventListener('click', event => {
    const sample = event.target.closest('[data-fba-query]')
    if (sample) {
      event.preventDefault()
      input.value = sample.dataset.fbaQuery
      render({ method: 'pushState' })
      input.focus({ preventScroll: true })
    }
    const copy = event.target.closest('[data-fba-copy]')
    if (copy) void copyAddress(copy)
  })
  window.addEventListener('popstate', () => {
    input.value = new URL(window.location.href).searchParams.get('q') || ''
    render()
  })
  // Keep server validation visible until an overlong URL query is edited.
  const initial = new URL(window.location.href).searchParams.get('q') || ''
  if (Array.from(initial.trim().replace(/\s+/gu, ' ')).length > 120) {
    for (const button of root.querySelectorAll('[data-fba-copy]')) button.disabled = false
    return
  }
  render({ sync: false })
}

document.querySelectorAll('[data-fba-lookup]').forEach(initializeLookup)
