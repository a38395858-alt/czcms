import { HTS_DEBOUNCE, renderResults } from './hts-model.mjs?v=20261105.3'
const root = document.querySelector('[data-hts-lookup]')
if (root) initialize(root)
function initialize(root) {
  const input = root.querySelector('#hts-query'), form = root.querySelector('[data-hts-form]'), output = root.querySelector('[data-hts-output]'), error = root.querySelector('[data-hts-error]'), clear = root.querySelector('[data-hts-clear]'), toast = root.querySelector('[data-hts-toast]')
  const initial = '<div class="hts-empty"><h2>Find a customs code for your product</h2><p>Enter a product name or code prefix to search the US import tariff schedule. Results are 10-digit HTS classification codes used for customs declarations.</p></div>'
  let timer, controller, sequence = 0, composing = false, toastTimer
  root.querySelectorAll('[data-hts-copy]').forEach(button => { button.disabled = false })
  clear.hidden = !input.value
  function cancel() { sequence++; controller?.abort(); controller = null; clearTimeout(timer); output.setAttribute('aria-busy', 'false') }
  function syncURL(query, page, method) {
    const url = new URL(location.href)
    url.searchParams.delete('q'); url.searchParams.delete('page')
    if (query) url.searchParams.set('q', query)
    if (query && page > 1) url.searchParams.set('page', String(page))
    if (url.href !== location.href) history[method](null, '', url)
    if (root.dataset.indexable === 'true') document.querySelector('meta[name=robots]')?.setAttribute('content', url.search ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')
  }
  function edited() {
    cancel(); error.hidden = true; clear.hidden = !input.value
    if (!input.value.trim()) { output.innerHTML = initial; syncURL('', 1, 'replaceState'); return }
    output.innerHTML = '<div class="hts-pending" role="status"><p>Preparing your search…</p><div class="hts-skeleton"></div><div class="hts-skeleton"></div><div class="hts-skeleton"></div></div>'
    if (!composing) timer = setTimeout(() => search(1, 'replaceState'), HTS_DEBOUNCE)
  }
  async function search(page = 1, method = 'pushState', updateURL = true) {
    cancel(); const version = sequence, query = input.value.trim().replace(/\s+/g, ' ')
    clear.hidden = !query; error.hidden = true
    if (!query) { output.innerHTML = initial; if (updateURL) syncURL('', 1, method); return }
    if (updateURL) syncURL(query, page, method)
    const active = new AbortController(); controller = active
    const timeout = setTimeout(() => active.abort(), 8000)
    output.setAttribute('aria-busy', 'true')
    output.innerHTML = '<div class="hts-pending" role="status"><p>Searching the tariff schedule…</p><div class="hts-skeleton"></div><div class="hts-skeleton"></div><div class="hts-skeleton"></div></div>'
    try {
      const response = await fetch(`/api/public/hts-search?${new URLSearchParams({ q: query, page })}`, { signal: active.signal, cache: 'no-store', headers: { Accept: 'application/json' } })
      const data = await response.json()
      if (sequence !== version) return
      if (!response.ok) throw Error(typeof data.error === 'string' ? data.error : data.error?.message || 'Tariff data is temporarily unavailable. Try again shortly.')
      if (!Array.isArray(data.items) || !data.metadata || !Number.isInteger(data.total)) throw Error('Tariff data could not be read. Try again shortly.')
      output.innerHTML = renderResults(data, form.getAttribute('action'))
      root.querySelector('[data-hts-version]').textContent = data.metadata.label
      root.querySelector('[data-hts-effective]').textContent = data.metadata.effectiveDate
      const date = new Date(data.metadata.retrievedAt)
      if (!Number.isNaN(date.getTime())) root.querySelector('[data-hts-checked]').textContent = date.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
    } catch (err) {
      if (version !== sequence) return
      output.innerHTML = '<div class="hts-empty"><h2>Search is temporarily unavailable</h2><p>Check your search and try again. You can also use the official USITC schedule linked above.</p></div>'
      error.textContent = active.signal.aborted ? 'The search took too long. Try again.' : err.message
      error.hidden = false
    } finally { clearTimeout(timeout); if (sequence === version) { output.setAttribute('aria-busy', 'false'); controller = null } }
  }
  input.addEventListener('compositionstart', () => { composing = true; cancel() })
  input.addEventListener('compositionend', () => { composing = false; edited() })
  input.addEventListener('input', edited)
  form.addEventListener('submit', event => { event.preventDefault(); void search() })
  clear.addEventListener('click', () => { input.value = ''; edited(); input.focus() })
  window.addEventListener('popstate', () => { const p = new URLSearchParams(location.search); input.value = p.get('q') || ''; void search(Number(p.get('page') || 1), 'replaceState', false) })
  root.addEventListener('click', async event => {
    const example = event.target.closest('[data-hts-example]'), page = event.target.closest('[data-hts-page]'), copy = event.target.closest('[data-hts-copy]')
    if (example) { event.preventDefault(); input.value = example.dataset.htsExample; void search(); return }
    if (page) { event.preventDefault(); await search(Number(page.dataset.htsPage)); output.scrollIntoView({ block: 'start' }); return }
    if (!copy || !/^\d{10}$/.test(copy.dataset.htsCopy)) return
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable')
      await navigator.clipboard.writeText(copy.dataset.htsCopy)
      toast.textContent = `Copied ${copy.dataset.htsCopy}`; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.textContent = '' }, 3500)
    } catch {
      let manual = copy.closest('td').querySelector('.hts-copy-manual')
      if (!manual) { manual = document.createElement('label'); manual.className = 'hts-copy-manual'; manual.textContent = 'Select and copy this 10-digit code:'; const field = document.createElement('input'); field.readOnly = true; field.value = copy.dataset.htsCopy; manual.append(field); copy.closest('td').append(manual) }
      manual.querySelector('input').focus(); manual.querySelector('input').select()
      toast.textContent = 'Automatic copy is unavailable. The code is selected for manual copying.'
    }
  })
}
