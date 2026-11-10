export const HTS_DEBOUNCE = 300
export const PAGE_SIZE = 25
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
export function searchURL(base, query, page = 1) {
  const params = new URLSearchParams({ q: query })
  if (page > 1) params.set('page', String(page))
  return `${base}?${params}`
}
export function renderRows(items, base = '/tools/hts-code-lookup') {
  const esc = escapeHTML
  return items.map(item => {
    const hierarchy = item.hierarchy || [], notes = item.footnotes || []
    return `<tr><td data-label="HTS Code"><a class="hts-code" href="${esc(base)}/${encodeURIComponent(item.code)}">${esc(item.formattedCode)}</a><div class="hts-code-actions"><a class="hts-detail-link" href="${esc(base)}/${encodeURIComponent(item.code)}">View details</a><button type="button" data-hts-copy="${esc(item.code)}">Copy code</button><a href="https://hts.usitc.gov/search?query=${encodeURIComponent(item.formattedCode)}" target="_blank" rel="noopener noreferrer" aria-label="View ${esc(item.formattedCode)} on USITC">USITC <span aria-hidden="true">↗</span></a></div></td><td data-label="Description"><p class="hts-description">${esc(item.description)}</p>${hierarchy.length || notes.length ? `<details class="hts-legal"><summary>Full legal context${notes.length ? ' &amp; notes' : ''}</summary><ol>${[...hierarchy, { code: item.formattedCode, description: item.description }].map(part => `<li>${part.code ? `<strong>${esc(part.code)}</strong> ` : ''}${esc(part.description)}</li>`).join('')}</ol>${notes.length ? `<ul class="hts-footnotes">${notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul>` : ''}</details>` : ''}</td><td data-label="Unit">${item.units ? esc(item.units) : '<span class="hts-muted">Not specified</span>'}</td><td data-label="General Rate"><strong class="hts-rate">${esc(item.generalRate || 'See schedule')}</strong>${item.rateSource && item.rateSource !== item.formattedCode ? `<small class="hts-rate-source">From ${esc(item.rateSource)}</small>` : ''}</td></tr>`
  }).join('')
}
export function renderResults(data, base) {
  if (!data.items.length) return '<div class="hts-empty"><h2>No matching codes found</h2><p>Try different English keywords or enter the first 4–6 digits of a product group.</p></div>'
  const first = (data.page - 1) * data.pageSize + 1, last = first + data.items.length - 1
  return `<div class="hts-results-heading"><h2>Matching customs codes</h2><p data-hts-count role="status" aria-live="polite">${first}–${last} of ${data.total.toLocaleString('en-US')} matching codes</p></div><div class="hts-table-wrap"><table class="hts-table"><caption class="hts-sr-only">US HTS codes, legal descriptions, reporting units and General rates</caption><thead><tr><th scope="col">HTS Code <small>10 digits</small></th><th scope="col">Description</th><th scope="col">Unit</th><th scope="col">General Rate</th></tr></thead><tbody>${renderRows(data.items, base)}</tbody></table></div><nav class="hts-pagination" aria-label="Search result pages">${data.page > 1 ? `<a href="${escapeHTML(searchURL(base, data.query, data.page - 1))}" data-hts-page="${data.page - 1}">Previous</a>` : '<span></span>'}<span>Page ${data.page}</span>${data.page * data.pageSize < data.total ? `<a href="${escapeHTML(searchURL(base, data.query, data.page + 1))}" data-hts-page="${data.page + 1}">Next</a>` : '<span></span>'}</nav>`
}
