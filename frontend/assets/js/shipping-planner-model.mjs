export class PlannerInputError extends Error {
  constructor(field) { super(field); this.field = field }
}

// Share only the known query fields; no result prices or arbitrary return URLs
// are trusted from a link. The destination page recalculates from its catalogue.
export function shippingQuery(input, language = 'en') {
  const params = new URLSearchParams()
  const defaults = { oceanService:'all', oceanType:'lcl', containerType:'40hc', containerCount:1, warehouse:language==='en'?'lax-warehouse':'', postcode:language==='en'?'90001':'', deliveryType:'all', pallets:1 }
  for (const key of ['origin', 'destination', 'mode', 'oceanService', 'oceanType', 'containerType', 'containerCount', 'weight', 'volume', 'warehouse', 'postcode', 'deliveryType', 'pallets']) {
    if(input.mode==='sea'&&input.oceanType==='fcl'&&['weight','volume'].includes(key))continue
    params.set(key, String(input[key] ?? defaults[key] ?? ''))
  }
  params.set('lang', ['en','de','fr','es','it','nl'].includes(language) ? language : 'en')
  return params
}

// The route catalogue is explicit: missing lanes or services never inherit
// prices from a neighbouring city. All monetary values use the catalogue currency.
export function estimateShipping(catalogue, input) {
  if (input.mode === 'lastmile') return estimateLastMile(catalogue, input)
  if (!catalogue.origins.some(p => p.id === input.origin)) throw new PlannerInputError('origin')
  if (!catalogue.destinations.some(p => p.id === input.destination)) throw new PlannerInputError('destination')
  if (!['all', 'sea', 'air', 'express'].includes(input.mode)) throw new PlannerInputError('mode')
  if (input.oceanService !== 'all' && !catalogue.services.some(s => s.mode === 'sea' && s.id === input.oceanService)) throw new PlannerInputError('oceanService')
  const oceanType = input.oceanType ?? 'lcl'
  if (!['lcl','fcl'].includes(oceanType)) throw new PlannerInputError('oceanType')
  const includesSea = ['sea','all'].includes(input.mode)
  const fcl = includesSea && oceanType === 'fcl'
  const containerType = input.containerType ?? '40hc', containerCount = Number(input.containerCount ?? 1)
  if (fcl && !['20gp','40gp','40hc'].includes(containerType)) throw new PlannerInputError('containerType')
  if (fcl && (!Number.isInteger(containerCount) || containerCount < 1 || containerCount > 100)) throw new PlannerInputError('containerCount')
  const containerOnly = fcl && input.mode === 'sea'
  const weight = containerOnly ? 0 : Number(input.weight), volume = containerOnly ? 0 : input.volume === '' ? 0 : Number(input.volume)
  if (!Number.isFinite(weight) || weight < 0 || (!containerOnly && weight === 0) || weight > 1000000) throw new PlannerInputError('weight')
  if (!Number.isFinite(volume) || volume < 0 || volume > 10000 || (includesSea && !fcl && volume <= 0)) throw new PlannerInputError('volume')
  const route = catalogue.routes.find(r => r.origin === input.origin && r.destination === input.destination)
  const offers = (route?.offers || []).flatMap(offer => {
    const service = catalogue.services.find(s => s.id === offer.service)
    if (!service || (input.mode !== 'all' && service.mode !== input.mode)) return []
    if (service.mode === 'sea' && input.oceanService !== 'all' && service.id !== input.oceanService) return []
    if (service.mode === 'sea' && fcl) return []
    const volumetricWeight = service.billing === 'kg' ? volume * 1000000 / service.divisor : null
    const raw = service.billing === 'wm' ? Math.max(volume, weight / 1000, service.minimum) : Math.max(weight, volumetricWeight, service.minimum)
    // Round upward to the carrier's billing increment, avoiding floating-point
    // noise turning an exact boundary into an extra kilogram.
    const chargeable = service.billing === 'wm' ? Math.ceil((raw - 1e-9) * 1000) / 1000 : Math.ceil((raw - 1e-9) / service.increment) * service.increment
    return [{
      service: service.id, mode: service.mode, days: offer.days, rate: offer.rate,
      billing: service.billing, chargeable, volumetricWeight,
      divisor: service.divisor || null, minimum: service.minimum,
      total: offer.rate.map(rate => Math.round(rate * chargeable * 100) / 100)
    }]
  })
  if (fcl) {
    const lane = catalogue.fclRoutes?.find(r => r.origin === input.origin && r.destination === input.destination)
    for (const offer of lane?.offers ?? []) {
      if (input.oceanService !== 'all' && offer.service !== input.oceanService) continue
      const rate = offer.rates[containerType]
      if (!rate) continue
      offers.push({service:offer.service,mode:'sea',billing:'container',basis:'port-to-port',days:offer.days,rate,chargeable:containerCount,containerType,containerCount,total:rate.map(n=>Math.round(n*containerCount*100)/100)})
    }
  }
  return { origin: input.origin, destination: input.destination, weight, volume, oceanType, containerType, containerCount, currency: catalogue.currency, dataMode: catalogue.dataMode, basis: containerOnly?'port-to-port':fcl?'mixed':catalogue.basis, offers }
}

function estimateLastMile(catalogue, input) {
  if (!catalogue.warehouses?.some(w => w.id === input.warehouse)) throw new PlannerInputError('warehouse')
  let postcode = String(input.postcode ?? '').trim().toUpperCase()
  if (!new RegExp(catalogue.postcodePattern || '^\\d{5}$').test(postcode)) throw new PlannerInputError('postcode')
  if (catalogue.country === 'NL') postcode = postcode.replace(/\s/g, '').replace(/^(\d{4})([A-Z]{2})$/, '$1 $2')
  if (!['all','parcel','truck'].includes(input.deliveryType)) throw new PlannerInputError('deliveryType')
  const weight = Number(input.weight), volume = Number(input.volume || 0), pallets = Number(input.pallets)
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000000) throw new PlannerInputError('weight')
  if (!Number.isFinite(volume) || volume < 0 || volume > 10000) throw new PlannerInputError('volume')
  if (input.deliveryType !== 'parcel' && (!Number.isInteger(pallets) || pallets < 1 || pallets > 100)) throw new PlannerInputError('pallets')
  const lane = catalogue.lastMileRoutes?.find(r => r.warehouse === input.warehouse && r.postcode === postcode)
  const offers = (lane?.offers ?? []).flatMap(offer => {
    const service = catalogue.services.find(s=>s.id===offer.service)
    if (!service || (input.deliveryType !== 'all' && service.deliveryType !== input.deliveryType)) return []
    const volumetricWeight = service.billing === 'kg' ? volume*1000000/service.divisor : null
    const chargeable = service.billing === 'pallet' ? pallets : Math.ceil((Math.max(weight,volumetricWeight,service.minimum)-1e-9)/service.increment)*service.increment
    return [{service:service.id,mode:'lastmile',billing:service.billing,basis:'warehouse-to-door',days:offer.days,rate:offer.rate,chargeable,volumetricWeight,divisor:service.divisor,minimum:service.minimum,total:offer.rate.map(n=>Math.round(n*chargeable*100)/100)}]
  })
  return {mode:'lastmile',warehouse:input.warehouse,postcode,weight,volume,pallets,currency:catalogue.currency,dataMode:catalogue.dataMode,basis:'warehouse-to-door',offers}
}
