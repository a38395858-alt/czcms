export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function routeFromHash(hash = '') {
  const route = hash.replace(/^#/, '').split('?')[0].replace(/\/$/, '')
  if (!route || route === '/admin') return 'dashboard'
  const match = route.match(/^\/admin\/([a-z-]+)$/)
  return match?.[1] ?? 'dashboard'
}

export function statusClass(value = '') {
  const text = String(value)
  if (/失败|严重|冲突|停用/.test(text)) return 'badge-red'
  if (/待|警告|维护|需要|处理中|运行中/.test(text)) return 'badge-amber'
  if (/已|正常|生效|活跃|完成|通过|成功|启用/.test(text)) return 'badge-green'
  if (/英语/.test(text)) return 'badge-blue'
  if (/德语/.test(text)) return 'badge-cyan'
  if (/法语/.test(text)) return 'badge-purple'
  if (/西班牙/.test(text)) return 'badge-orange'
  if (/意大利/.test(text)) return 'badge-lime'
  return 'badge-gray'
}

export function filterRows(rows, query = '', filter = '') {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  return rows.filter((row) => {
    const matchesQuery = !normalizedQuery || Object.values(row).some((value) => String(value).toLocaleLowerCase('zh-CN').includes(normalizedQuery))
    const isAll = !filter || filter.startsWith('全部') || filter === '基础设置'
    const matchesFilter = isAll || Object.values(row).some((value) => String(value).includes(filter.replace('中', '')) || String(value).includes(filter))
    return matchesQuery && matchesFilter
  })
}

export function formatNow(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

export function normalizeTags(value, limit = 30) {
  const seen = new Set()
  return String(value ?? '').split(/[,，\n]+/).map((item) => item.trim()).filter((item) => {
    const key = item.toLocaleLowerCase('zh-CN')
    if (!item || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, limit)
}

export function contentEditorSlug(value, fallbackDate = new Date()) {
  const normalized = String(value ?? '').normalize('NFKD').toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9\s/_-]/g, ' ').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/-?\/-?/g, '/').replace(/\/{2,}/g, '/').replace(/(^[-/]+|[-/]+$)/g, '')
  return normalized || `article-${fallbackDate.toISOString().slice(0, 10).replaceAll('-', '')}`
}

export function contentWordCount(value) {
  const text = String(value ?? '').trim()
  if (!text) return 0
  const cjkPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu
  const cjkCount = [...text.matchAll(cjkPattern)].length
  const nonCJKWords = text.replace(cjkPattern, ' ').match(/[\p{L}\p{N}]+(?:['’.\-][\p{L}\p{N}]+)*/gu) ?? []
  return cjkCount + nonCJKWords.length
}

export function sitePublicPath(site, locale = '', slug = '') {
  const parts = []
  if (Number(site?.language_count || 0) > 1 && locale) parts.push(String(locale).replace(/^\/+|\/+$/g, ''))
  if (slug) parts.push(String(slug).replace(/^\/+|\/+$/g, ''))
  return `/${parts.filter(Boolean).join('/')}`.replace(/\/\/+/, '/')
}
