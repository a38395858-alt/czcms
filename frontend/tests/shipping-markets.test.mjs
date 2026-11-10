import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { estimateShipping, shippingQuery, PlannerInputError } from '../assets/js/shipping-planner-model.mjs'

const markets=['de','fr','es','it','nl'].map(code=>JSON.parse(readFileSync(new URL(`../assets/data/shipping-planner.${code}.demo.json`,import.meta.url))))
const input={origin:'shanghai',mode:'all',oceanService:'all',weight:500,volume:2}
for(const market of markets){
  test(`${market.country}: local catalogue, currency and each explicit lane work independently`,()=>{
    assert.equal(market.currency,'EUR')
    assert.equal(market.dataMode,'demo')
    assert(!market.services.some(s=>s.id==='matson'||s.id.startsWith('us-')))
    assert.equal(new Set(market.destinations.map(d=>d.id)).size,market.destinations.length)
    const pairs=new Set()
    for(const lane of market.routes){
      const key=`${lane.origin}:${lane.destination}`
      assert(!pairs.has(key));pairs.add(key)
      assert(market.origins.some(p=>p.id===lane.origin))
      assert(market.destinations.some(p=>p.id===lane.destination))
      const result=estimateShipping(market,{...input,...lane})
      assert.equal(result.offers.length,3)
      assert.equal(result.currency,'EUR')
      assert(result.offers.every(o=>o.total[0]>0&&o.total[1]>=o.total[0]&&o.days[0]>0&&o.days[1]>=o.days[0]))
    }
    const destination=market.destinations[0].id
    assert.throws(()=>estimateShipping(market,{...input,destination:'los-angeles'}),PlannerInputError)
    assert.throws(()=>estimateShipping(market,{...input,destination,oceanService:'matson'}),PlannerInputError)
    const sparse={...market,routes:market.routes.filter(r=>r.origin!=='shanghai')}
    assert.deepEqual(estimateShipping(sparse,{...input,destination}).offers,[])
  })
  test(`${market.country}: FCL ignores cargo inputs and query links preserve the market`,()=>{
    for(const lane of market.fclRoutes){
      const q={...input,...lane,mode:'sea',oceanType:'fcl',containerType:'40hc',containerCount:2,weight:'invalid',volume:'invalid'}
      const result=estimateShipping(market,q)
      assert.equal(result.basis,'port-to-port')
      assert.deepEqual(result.offers[0].total,lane.offers[0].rates['40hc'].map(n=>n*2))
      const link=shippingQuery(q,market.language)
      assert.equal(link.get('lang'),market.language)
      assert(!link.has('weight'));assert(!link.has('volume'))
      assert.deepEqual(estimateShipping(market,Object.fromEntries(link)).offers,result.offers)
    }
  })
  test(`${market.country}: each warehouse has exact postcode rates and localized labels`,()=>{
    for(const w of market.warehouses){
      assert(w[market.language]);assert(w.region)
      const q={mode:'lastmile',warehouse:w.id,postcode:w.examplePostcode,weight:50,volume:.2,pallets:2,deliveryType:'all'}
      const result=estimateShipping(market,q)
      assert.equal(result.offers.length,2)
      assert.equal(result.postcode,w.examplePostcode)
      assert(result.offers.every(o=>o.total[0]>0))
      assert.equal(estimateShipping(market,{...q,postcode:market.country==='NL'?'9999 ZZ':'99999'}).offers.length,0)
      assert.throws(()=>estimateShipping(market,{...q,postcode:'invalid'}),PlannerInputError)
    }
  })
}
test('Dutch postcodes normalize case and spacing, Italian leading zero is retained',()=>{
  const nl=markets.find(m=>m.country==='NL'),it=markets.find(m=>m.country==='IT')
  const q={mode:'lastmile',deliveryType:'all',weight:50,volume:.2,pallets:1}
  assert.equal(estimateShipping(nl,{...q,warehouse:'rotterdam-warehouse',postcode:'3011aa'}).offers.length,2)
  assert.equal(estimateShipping(it,{...q,warehouse:'rome-warehouse',postcode:'00118'}).postcode,'00118')
})
test('markets have different prices, transit times and destination geography',()=>{
  assert.equal(new Set(markets.map(m=>m.routes[0].offers[0].rate.join(','))).size,5)
  assert.equal(new Set(markets.map(m=>m.routes[0].offers[0].days.join(','))).size,5)
  assert.equal(new Set(markets.map(m=>m.seo.title)).size,5)
  for(const m of markets){
    assert(m.sections.length>=3&&m.faqs.length>=2)
    for(const other of markets.filter(x=>x!==m))assert(!m.destinations.some(d=>other.destinations.some(o=>o.id===d.id)))
  }
})
