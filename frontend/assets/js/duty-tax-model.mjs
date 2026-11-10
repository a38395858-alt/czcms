// Display and form helpers only. All tax arithmetic belongs to the server.
export const REQUEST_FIELDS = Object.freeze([
  'destination_country', 'origin_country', 'commodity_code', 'import_date',
  'delivery_term', 'transport_mode', 'input_currency', 'goods_value',
  'international_freight', 'insurance', 'domestic_delivery', 'clearance_service',
  'duty_rate_percent', 'vat_rate_percent', 'mode',
])
export const CURRENCIES = Object.freeze({ US: 'USD', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', GB: 'GBP' })
export const COMPONENT_LABELS = Object.freeze({
  base_duty: 'Base duty', additional_duties: 'Additional duties', import_vat: 'Import VAT',
  government_fees: 'Government fees', clearance_service: 'Clearance service',
})

export function formatMoney(value, currency = 'EUR') {
  // Keep money strings exact. Do not coerce null or missing amounts into zero.
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) return 'Needs review'
  const [whole, fraction = ''] = value.split('.')
  const formatted = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${/^[A-Z]{3}$/.test(currency) ? currency : 'EUR'} ${formatted}.${fraction.padEnd(2, '0')}`
}

export function componentLabel(component, synthetic = false, manual = false) {
  let label = COMPONENT_LABELS[component?.key] || 'Other charge'
  if (component?.key === 'base_duty' && synthetic) label = 'Example duty'
  if (component?.key === 'import_vat' && synthetic) label = 'Example VAT'
  if (manual && component?.key === 'base_duty') label = 'Assumed base duty'
  if (component?.rate_percent != null && /^\d+(?:\.\d+)?$/.test(String(component.rate_percent))) label += ` · ${component.rate_percent}%`
  return label
}

export function componentValue(component, currency) {
  if (component?.status === 'not_applicable') return 'Not applicable'
  if (component?.status !== 'known' || component?.amount == null) return component?.key === 'clearance_service' ? 'Not provided' : 'Needs review'
  return formatMoney(component.amount, currency)
}

export function resultPresentation(result) {
  if (!result?.engine_version) return { valid: false, title: 'Your estimate will appear here', label: 'Ready to calculate', tone: 'empty', complete: false }
  const manual = result.request?.mode === 'manual' || result.status === 'manual_review'
  // Only explicit synthetic fixtures may show complete totals in this release.
  const complete = result.synthetic === true && result.status === 'estimated' && !!result.sample_totals && !manual
  if (manual) return { valid: true, title: 'Scenario costs', label: 'Manual review — rates are your assumptions', tone: 'review', complete: false, manual: true }
  if (complete) return { valid: true, title: 'Estimated import costs', label: 'Sample scenario', tone: 'sample', complete: true, manual: false }
  return { valid: true, title: 'Estimated import costs', label: 'Partial estimate — additional charges need review', tone: 'partial', complete: false, manual: false }
}

export function responsibility(term) {
  return term === 'DAP'
    ? 'Under DAP, import formalities and import charges are normally the buyer’s responsibility. Confirm your contract.'
    : 'Under DDP, import formalities and charges are normally the seller’s responsibility. Importer eligibility still needs confirmation.'
}

export function formRequest(entries) {
  const source = entries instanceof Map ? entries : new Map(entries)
  const request = Object.fromEntries(REQUEST_FIELDS.map(key => [key, String(source.get(key) ?? '').trim()]))
  request.commodity_code = request.commodity_code.replace(/[.\s-]/g, '')
  if (request.mode !== 'manual') {
    request.duty_rate_percent = ''
    request.vat_rate_percent = ''
  }
  if (request.destination_country === 'US') request.vat_rate_percent = ''
  return request
}

export function modeForDestination(mode, destination) {
  return mode === 'sample' && !['FR', 'US'].includes(destination) ? 'estimate' : mode
}

export function safeSourceURL(value) {
  try {
    const url = new URL(String(value))
    const allowed = ['hts.usitc.gov', 'www.cbp.gov', 'www.gov.uk', 'www.trade-tariff.service.gov.uk', 'ec.europa.eu', 'taxation-customs.ec.europa.eu']
    return url.protocol === 'https:' && !url.username && !url.password && allowed.includes(url.hostname) ? url.href : ''
  } catch { return '' }
}

export function normalizeFieldErrors(payload) {
  const errors = payload?.field_errors ?? payload?.errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}
  return Object.fromEntries(Object.entries(errors).filter(([key, value]) => /^[a-z_]+$/.test(key) && typeof value === 'string'))
}
