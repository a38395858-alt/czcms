import { estimateShipping, PlannerInputError, shippingQuery } from './shipping-planner-model.mjs?v=20261103.22'

const copy = {
  en: {
    resultTitle:'Shipping Cost & Transit Time Results',back:'Back to calculator',
    title:'China to USA Shipping Cost & Transit Time Lookup', intro:'Estimate shipping costs and transit times from China to the USA by ocean, air or express, or check US warehouse-to-address delivery.',
    demo:'Reference only',demoNote:'Sample rates and transit times are for reference only, not live quotes or guaranteed delivery dates. Contact us for a shipment-specific quote and transit details.',contact:'Contact us for pricing & transit',
    oceanType:'Ocean shipment',lcl:'LCL / shared container',fcl:'FCL / full container',containerType:'Container type',containerCount:'Container quantity',
    lastmile:'US last-mile delivery',warehouse:'Dispatch warehouse city',postcode:'US delivery ZIP code',deliveryType:'Delivery method',bothDelivery:'Compare parcel & truck',parcel:'Parcel delivery',truck:'Pallet / truck delivery',pallets:'Pallet quantity',
    lastmileHelp:'Choose a US warehouse city to see its configured demo delivery ZIP codes. Warehouse availability and current rates must be confirmed.',
    port:'Port-to-port reference · excludes US last-mile delivery',mixedBasis:'Scope shown per option',lastmileBasis:'US warehouse-to-door reference',businessDays:'business days',
    fclNote:'FCL · port-to-port · charged per container',lastmileNote:'US domestic delivery · excludes international freight',
    fclHelp:'FCL price = rate per container × container quantity. Port-to-port ocean freight only; contact us to confirm current rates and local charges.',
    lastmileCargoHelp:'Parcel uses chargeable weight (5,000 divisor); truck uses pallet quantity. Each is a separate delivery option; do not add the two prices.',
    containers:(n,type,lo,hi)=>`${n} × ${type.toUpperCase().replace('40HC','40HQ')} container × USD ${lo}–${hi}/container. Ocean port-to-port only; origin/destination local charges, clearance, duties and US delivery are excluded.`,
    palletCost:(n,lo,hi)=>`${n} pallet(s) × USD ${lo}–${hi}/pallet. Warehouse-to-address demo only; appointment, residential, liftgate, remote-area and oversize fees are excluded.`,
    fclSummary:(n,type)=>`${n} × ${type.toUpperCase().replace('40HC','40HQ')} · sample container rates`,
    modeLabel:'Shipping mode',sea:'Ocean freight',air:'Air freight',express:'Express courier',allModes:'Compare all',
    from:'From',to:'To',oceanLabel:'Ocean service',bothOcean:'Compare Matson & standard',matson:'Matson',standard:'Standard ocean',
    weight:'Gross weight',volume:'Total volume',search:'Check cost & transit time',cargoHelp:'LCL uses weight or volume; FCL uses container type and quantity. Air and courier use chargeable weight.',
    door:'Door-to-door reference',loading:'Loading sample routes…',enquiry:'Request a quote for this route',
    exclusions:'Demo estimates only, not live quotes or guaranteed delivery dates. FCL is port-to-port; U.S. last-mile is warehouse-to-address. Duties, taxes, insurance, local handling and exceptional surcharges are excluded. International transit uses calendar days; U.S. last-mile uses business days. Booking, preparation and customs delays are additional. Contact us to confirm the full scope, current quote and transit details.',
    changed:'Details changed. Search again to update your results.',empty:'No sample rate is configured for this route and service. Try another selection or request a quote.',
    loadError:'Sample routes could not be loaded. Please try again.',retry:'Retry',
    seaNote:'LCL · charged by weight or volume',airNote:'Chargeable weight · 6,000 divisor',expressNote:'Chargeable weight · 5,000 divisor',
    transit:'Reference transit',freight:'Estimated freight',days:'days',sample:'Sample estimate · USD',details:'How this estimate is calculated',
    summary:(n,w,v)=>`${n} option${n===1?'':'s'} · ${w} kg · ${v} CBM · demonstration rates`,
    count:n=>`${n} shipping option${n===1?'':'s'} found.`,
    errors:{origin:'Choose a valid origin.',destination:'Choose a valid destination.',mode:'Choose a shipping mode.',oceanService:'Choose an ocean service.',oceanType:'Choose LCL or FCL.',containerType:'Choose a valid container type.',containerCount:'Enter 1–100 whole containers.',warehouse:'Choose a US warehouse.',postcode:'Enter a five-digit US ZIP code.',deliveryType:'Choose a delivery method.',pallets:'Enter 1–100 whole pallets.',weight:'Enter a gross weight greater than 0 and up to 1,000,000 kg.',volume:'Enter a valid volume (up to 10,000 CBM). LCL requires a volume greater than 0.'},
    wm:(q,lo,hi,min)=>`${q} W/M × USD ${lo}–${hi} per W/M. Billable units are the greater of cubic metres, gross weight ÷ 1,000, or the ${min} W/M minimum.`,
    kg:(q,lo,hi,d,v,min)=>`${q} chargeable kg × USD ${lo}–${hi}/kg. Chargeable weight is the greater of gross weight, volume × 1,000,000 ÷ ${d} (${v} kg), or the ${min} kg minimum, rounded up to the billing increment.`,
    noVolume:' No volume entered: the estimate uses gross weight only. Packed dimensions may increase the price.'
  }
}

function initializePlanner(root) {
  if(root.dataset.spInitialized)return
  root.dataset.spInitialized='true'
  const form=root.querySelector('[data-sp-form]'), status=root.querySelector('[data-sp-status]'), results=root.querySelector('[data-sp-results]'), error=root.querySelector('[data-sp-error]')
  const button=form.querySelector('button[type="submit"]')
  const isResults=root.dataset.spPage==='results'
  const params=new URLSearchParams(window.location.search)
  const language=['de','fr','es','it','nl'].includes(root.lang)?root.lang:'en'
  let catalogue=null, lastResult=null, dirty=false, loadFailed=false
  let localCopy=language==='en'?copy.en:JSON.parse(root.querySelector('[data-sp-dictionary]').textContent)
  const t=()=>localCopy
  const fmt=(key,values)=>String(catalogue.copy[key]).replace(/\{(\w+)\}/g,(_,name)=>values[name]??'')
  const currency=()=>catalogue?.currency||'USD'
  const anchor=()=>catalogue?.contactAnchor||'enquiry'
  const contactURL=()=>{const url=queryURL(root.dataset.spHome);url.searchParams.set('enquiry','1');url.hash=anchor();return url}
  const catalogueURL=new URL(language==='en'?'../data/shipping-planner.demo.json':`../data/shipping-planner.${language}.demo.json`,import.meta.url)
  const number=n=>n.toLocaleString(catalogue?.locale||'en-US',{maximumFractionDigits:3})
  const money=n=>n.toLocaleString(catalogue?.locale||'en-US',{maximumFractionDigits:2})
  const amount=n=>new Intl.NumberFormat(catalogue?.locale||'en-US',{style:'currency',currency:currency(),maximumFractionDigits:2}).format(n)
  const input=()=>Object.fromEntries(new FormData(form))
  const field=name=>form.elements.namedItem(name)
  const location=(kind,id)=>catalogue[kind].find(p=>p.id===id)?.[language] || id
  const portOf=(kind,id)=>{const p=catalogue[kind].find(x=>x.id===id);return p?.port?.[language]||p?.[language]||id}
  const setGroup=(selector,visible)=>{
    const group=root.querySelector(selector);group.hidden=!visible
    for(const control of group.querySelectorAll('input,select'))control.disabled=!visible
  }
  const oceanVisibility=()=>{
    const mode=field('mode').value,sea=['sea','all'].includes(mode),lastmile=mode==='lastmile'
    setGroup('[data-sp-international]',!lastmile)
    setGroup('[data-sp-ocean]',sea)
    setGroup('[data-sp-ocean-options]',sea)
    const fcl=sea&&field('oceanType').value==='fcl'
    for(const group of root.querySelectorAll('[data-sp-container]')){group.hidden=!fcl;group.querySelector('input,select').disabled=!fcl}
    setGroup('[data-sp-lastmile]',lastmile)
    setGroup('[data-sp-pallets]',lastmile&&field('deliveryType').value!=='parcel')
    const containerOnly=fcl&&mode==='sea'
    for(const group of root.querySelectorAll('[data-sp-loose-cargo]')){group.hidden=containerOnly;group.querySelector('input').disabled=containerOnly}
    root.querySelector('.sp-cargo-fields').classList.toggle('is-container-only',containerOnly)
    field('weight').required=!containerOnly
    root.querySelector('#sp-cargo-help').textContent=lastmile?t().lastmileCargoHelp:fcl&&mode==='sea'?t().fclHelp:t().cargoHelp
    if(catalogue){
      const warehouse=catalogue.warehouses.find(w=>w.id===field('warehouse').value)
      const codes=catalogue.lastMileRoutes.filter(r=>r.warehouse===warehouse?.id).map(r=>r.postcode)
      root.querySelector('#sp-lastmile-help').textContent=warehouse&&language!=='en'?fmt('sampleHelp',{warehouse:warehouse[language],codes:codes.join(' / ')}):warehouse?`Demo dispatch location: ${warehouse.en}. Sample delivery ZIP codes: ${codes.join(' / ')}. Other ZIP codes have no sample rate. Confirm warehouse availability with us.`:t().lastmileHelp
      root.querySelector('[data-sp-sample-zip]').textContent=warehouse&&language!=='en'?fmt('samplePostcode',{postcode:warehouse.examplePostcode}):warehouse?`Use sample ZIP ${warehouse.examplePostcode}`:'Use sample ZIP code'
    }
    updateContact()
  }
  function restoreQuery() {
    for(const name of ['origin','destination','oceanService','oceanType','containerType','containerCount','weight','volume','warehouse','postcode','deliveryType','pallets']) {
      if(params.get('mode')==='lastmile'&&['origin','destination'].includes(name))continue
      if(params.has(name))field(name).value=params.get(name)
    }
    if(params.has('mode')) {
      const radio=[...form.querySelectorAll('[name="mode"]')].find(r=>r.value===params.get('mode'))
      if(radio)radio.checked=true
      else for(const r of form.querySelectorAll('[name="mode"]'))r.checked=false
    }
    oceanVisibility()
  }
  function queryURL(target, values=input()) {
    const url=new URL(target,window.location.origin)
    url.search=shippingQuery({warehouse:catalogue?.warehouses[0]?.id||'',postcode:catalogue?.warehouses[0]?.examplePostcode||'',...values,oceanService:values.oceanService||'all'},language).toString()
    return url
  }
  function renderLocations() {
    for(const [name,kind] of [['origin','origins'],['destination','destinations'],['warehouse','warehouses']]) {
      const selected=field(name).value
      if(name==='warehouse'){
        const groups=new Map()
        for(const warehouse of catalogue.warehouses){
          if(!groups.has(warehouse.region)){const group=document.createElement('optgroup');group.label=warehouse.region;groups.set(warehouse.region,group)}
          groups.get(warehouse.region).append(new Option(warehouse[language],warehouse.id))
        }
        field(name).replaceChildren(...groups.values())
      } else if(name==='destination'&&language!=='en') {
        const groups=new Map()
        for(const place of catalogue.destinations){
          if(!groups.has(place.region)){const group=document.createElement('optgroup');group.label=place.region;groups.set(place.region,group)}
          groups.get(place.region).append(new Option(place[language],place.id))
        }
        field(name).replaceChildren(...groups.values())
      } else field(name).replaceChildren(...catalogue[kind].map(p=>new Option(p[language],p.id)))
      field(name).value=catalogue[kind].some(p=>p.id===selected)?selected:catalogue[kind][0]?.id||''
    }
  }
  function showError(err) {
    for(const control of form.querySelectorAll('[aria-invalid]'))control.removeAttribute('aria-invalid')
    error.textContent=t().errors[err.field] || t().loadError;error.hidden=false
    const control=field(err.field)
    if(control instanceof HTMLElement){control.setAttribute('aria-invalid','true');control.focus()}
  }
  function renderResult(result) {
    const offers=root.querySelector('[data-sp-offers]')
    root.querySelector('[data-sp-route]').textContent=routeTitle(result)
    root.querySelector('[data-sp-result-summary]').textContent=result.oceanType==='fcl'&&field('mode').value==='sea'?t().fclSummary(result.containerCount,result.containerType):t().summary(result.offers.length,number(result.weight),number(result.volume))
    root.querySelector('[data-sp-copy="door"]').textContent=result.basis==='port-to-port'?t().port:result.basis==='mixed'?t().mixedBasis:result.mode==='lastmile'?t().lastmileBasis:t().door
    offers.replaceChildren(...result.offers.map(offer=>{
      const service=catalogue.services.find(s=>s.id===offer.service)
      const row=document.createElement('article');row.className='sp-offer'
      row.innerHTML='<div class="sp-service"><h4></h4><p></p></div><div class="sp-transit"><span class="sp-metric-label"></span><strong class="sp-metric-value"></strong></div><div class="sp-price"><span class="sp-metric-label"></span><strong class="sp-metric-value"></strong><small></small></div><details class="sp-calculation"><summary></summary><p></p></details>'
      row.querySelector('h4').textContent=service[language]
      row.querySelector('.sp-service p').textContent=offer.billing==='container'?t().fclNote:t()[offer.mode+'Note']
      if(offer.billing==='container'){
        const route=(catalogue.fclRoutes||[]).find(r=>r.origin===result.origin&&r.destination===result.destination)
        const match=route?.offers?.find(o=>o.service===offer.service)
        if(match?.rates){
          const list=document.createElement('ul');list.className='sp-container-rates'
          for(const size of ['20gp','40gp','40hc']){
            const item=document.createElement('li')
            item.innerHTML=`<b>${size.toUpperCase()}</b> ${amount(match.rates[size][0])}–${amount(match.rates[size][1])}`
            if(size===offer.containerType)item.className='is-active'
            list.appendChild(item)
          }
          row.querySelector('.sp-service').appendChild(list)
        }
      }
      row.querySelector('.sp-transit .sp-metric-label').textContent=t().transit
      row.querySelector('.sp-transit strong').textContent=`${offer.days[0]}–${offer.days[1]} ${offer.mode==='lastmile'?t().businessDays:t().days}`
      row.querySelector('.sp-price .sp-metric-label').textContent=t().freight
      row.querySelector('.sp-price strong').textContent=`${amount(offer.total[0])}–${amount(offer.total[1])}`
      row.querySelector('.sp-price small').textContent=t().sample
      row.querySelector('summary').textContent=t().details
      const args=[number(offer.chargeable),money(offer.rate[0]),money(offer.rate[1])]
      row.querySelector('details p').textContent=offer.billing==='container'?t().containers(offer.containerCount,offer.containerType,args[1],args[2]):offer.billing==='pallet'?t().palletCost(...args):offer.billing==='wm'?t().wm(...args,number(offer.minimum)):t().kg(...args,number(offer.divisor),number(offer.volumetricWeight),number(offer.minimum))+(result.volume===0?t().noVolume:'')
      return row
    }))
    results.hidden=!result.offers.length
    status.textContent=result.offers.length?t().count(result.offers.length):t().empty
    const enquiry=contactURL()
    root.querySelector('[data-sp-enquiry]').href=enquiry.pathname+enquiry.search+enquiry.hash
    const back=queryURL(root.dataset.spCalculator);back.hash='shipping-planner'
    if(root.querySelector('[data-sp-back]'))root.querySelector('[data-sp-back]').href=back.pathname+back.search+back.hash
  }
  function routeTitle(result) {
    if(result.mode==='lastmile')return `${location('warehouses',result.warehouse)} → ${language==='en'?'US ZIP':t().postcode} ${result.postcode}`
    const seaOnly=(result.offers||[]).length>0&&result.offers.every(o=>o.mode==='sea')
    if(seaOnly)return `${portOf('origins',result.origin)} → ${portOf('destinations',result.destination)}`
    return `${location('origins',result.origin)} → ${location('destinations',result.destination)}`
  }
  function updateContact() {
    const url=contactURL()
    root.querySelector('[data-sp-contact]').href=url.pathname+url.search+url.hash
  }
  function translate() {
    root.lang=language
    for(const node of root.querySelectorAll('[data-sp-copy]')){const value=t()[node.dataset.spCopy];if(typeof value==='string')node.textContent=value}
    if(catalogue)renderLocations()
    oceanVisibility()
    if(loadFailed)showLoadError()
    else if(dirty)status.textContent=isResults?t().changed:''
    else if(lastResult)renderResult(lastResult)
    else status.textContent=catalogue?'':t().loading
  }
  function search(navigate = false) {
    if(!catalogue)return
    error.hidden=true
    for(const control of form.querySelectorAll('[aria-invalid]'))control.removeAttribute('aria-invalid')
    try {
      const values={...input(),oceanService:input().oceanService||'all'}
      const result=estimateShipping(catalogue,values)
      if(navigate) {
        const url=queryURL(root.dataset.spResultsUrl,values)
        window.location.assign(url.pathname+url.search)
        return
      }
      lastResult=result;dirty=false;renderResult(lastResult)
    } catch(err) {
      results.hidden=true;status.textContent=''
      if(err instanceof PlannerInputError)showError(err)
      else {status.textContent=t().loadError;console.error(err)}
    }
  }
  async function load() {
    loadFailed=false;button.disabled=true;status.textContent=t().loading
    try {
      const response=await fetch(catalogueURL,{cache:'no-cache',signal:AbortSignal.timeout(12000)})
      if(!response.ok)throw Error('Catalogue unavailable')
      const data=await response.json()
      if(data.dataMode!=='demo'||!Array.isArray(data.routes))throw Error('Invalid demo catalogue')
      if(language!=='en'&&(data.language!==language||data.country!==root.dataset.spCountry))throw Error('Market mismatch')
      catalogue=data
      if(language!=='en'){
        localCopy={...data.copy}
        localCopy.summary=(n,w,v)=>fmt('summary',{n,w,v})
        localCopy.count=n=>fmt('count',{n})
        localCopy.fclSummary=(n,type)=>fmt('fclSummary',{n,type:type.toUpperCase()})
        localCopy.containers=(n,type,lo,hi)=>fmt('containers',{n,type:type.toUpperCase(),lo,hi})
        localCopy.palletCost=(n,lo,hi)=>fmt('palletCost',{n,lo,hi})
        localCopy.wm=(q,lo,hi,min)=>fmt('wm',{q,lo,hi,min})
        localCopy.kg=(q,lo,hi,d,v,min)=>fmt('kg',{q,lo,hi,d,v,min})
        const postcode=field('postcode');postcode.pattern=data.postcodePattern.replace(/^\^|\$$/g,'');postcode.maxLength=language==='nl'?7:5
        postcode.inputMode=language==='nl'?'text':'numeric';postcode.value=data.warehouses[0].examplePostcode
      }
      renderLocations();restoreQuery();button.disabled=false;translate()
      if(isResults&&(params.has('origin')||params.get('mode')==='lastmile'))search()
      if(!isResults&&params.get('enquiry')==='1')prefillEnquiry()
    } catch {loadFailed=true;showLoadError()}
  }
  function showLoadError() {
    status.textContent=t().loadError
    const retry=document.createElement('button');retry.type='button';retry.textContent=t().retry;retry.addEventListener('click',load);status.append(retry)
  }
  if(params.has('lang')&&params.get('lang')!==language){
    params.set('lang',language)
    const url=new URL(window.location.href);url.search=params.toString();history.replaceState(null,'',url)
  }
  form.addEventListener('submit',event=>{event.preventDefault();search(true)})
  root.querySelector('[data-sp-sample-zip]').addEventListener('click',()=>{
    const warehouse=catalogue?.warehouses.find(w=>w.id===field('warehouse').value)
    if(!warehouse)return
    field('postcode').value=warehouse.examplePostcode
    field('postcode').dispatchEvent(new Event('input',{bubbles:true}))
  })
  for(const button of root.querySelectorAll('[data-sp-check]')){
    button.addEventListener('click',()=>{
      if(!catalogue)return
      const origin=field('origin'),destination=field('destination')
      if(!origin||!destination)return
      origin.value=button.dataset.origin
      destination.value=button.dataset.destination
      const all=form.querySelector('input[name="mode"][value="all"]')
      if(all)all.checked=true
      form.dispatchEvent(new Event('input',{bubbles:true}))
      form.requestSubmit()
      root.scrollIntoView({block:'start',behavior:'smooth'})
    })
  }
  form.addEventListener('input',()=>{
    oceanVisibility();dirty=true;results.hidden=true;error.hidden=true
    for(const control of form.querySelectorAll('[aria-invalid]'))control.removeAttribute('aria-invalid')
    if(catalogue)status.textContent=isResults?t().changed:''
  })
  function prefillEnquiry() {
    const brief=document.querySelector('#fv-route, [name=shipmentBrief], [name=cargoDetails], textarea[name=message], textarea[name=brief]')
    if(!brief||brief.value.trim())return
    try {
      const result=estimateShipping(catalogue,{...input(),oceanService:input().oceanService||'all'})
      const containers=result.oceanType==='fcl'?`${result.containerCount} × ${result.containerType.toUpperCase()}; `:''
      const pallets=result.mode==='lastmile'?`${language==='en'?`${result.pallets || 0} pallets`:`${t().pallets}: ${result.pallets || 0}`}; `:''
      const looseCargo=result.basis==='port-to-port'?'':`${result.weight} kg; ${result.volume} CBM; `
      brief.value=`${routeTitle(result)}; ${containers}${pallets}${looseCargo}${result.offers.map(o=>catalogue.services.find(s=>s.id===o.service)[language]).join(', ')}. ${t().enquirySuffix||'Please confirm current transit and pricing.'}`
      root.dataset.spEnquiryBrief=brief.value
      document.dispatchEvent(new CustomEvent('freightvanta:shipping-enquiry',{detail:{brief:brief.value}}))
    } catch { /* Invalid links must not prefill an enquiry. */ }
  }
  translate();oceanVisibility();load()
}

// React homepages reuse the server-rendered planner during hydration. A new
// mount is initialized once; detached forms never replace the active controls.
for(const root of document.querySelectorAll('[data-shipping-planner]'))initializePlanner(root)
new MutationObserver(records=>{
  for(const record of records)for(const node of record.addedNodes){
    if(!(node instanceof HTMLElement))continue
    if(node.matches('[data-shipping-planner]'))initializePlanner(node)
    for(const root of node.querySelectorAll('[data-shipping-planner]'))initializePlanner(root)
  }
}).observe(document.body,{childList:true,subtree:true})

// Quote enquiries return to the homepage, which now contains a compact tool link.
const enquiryParams=new URLSearchParams(window.location.search)
const enquiryBrief=document.querySelector('#fv-route')
if(!document.querySelector('[data-shipping-planner]')&&enquiryParams.get('enquiry')==='1'&&enquiryBrief&&!enquiryBrief.value.trim()){
  try{
    const response=await fetch(new URL('../data/shipping-planner.demo.json',import.meta.url),{cache:'no-cache',signal:AbortSignal.timeout(12000)})
    if(!response.ok)throw Error('Catalogue unavailable')
    const catalogue=await response.json(), result=estimateShipping(catalogue,Object.fromEntries(enquiryParams))
    const location=(kind,id)=>catalogue[kind].find(p=>p.id===id)?.en||id
    const route=result.mode==='lastmile'?`${location('warehouses',result.warehouse)} → US ZIP ${result.postcode}`:`${location('origins',result.origin)} → ${location('destinations',result.destination)}`
    const containers=result.oceanType==='fcl'?`${result.containerCount} × ${result.containerType.toUpperCase()}; `:''
    const pallets=result.mode==='lastmile'?`${result.pallets||0} pallets; `:''
    const cargo=result.basis==='port-to-port'?'':`${result.weight} kg; ${result.volume} CBM; `
    if(!enquiryBrief.value.trim())enquiryBrief.value=`${route}; ${containers}${pallets}${cargo}${result.offers.map(o=>catalogue.services.find(s=>s.id===o.service).en).join(', ')}. Please confirm current transit and pricing.`
  }catch{ /* Invalid or unavailable estimates must not replace a customer's brief. */ }
}
