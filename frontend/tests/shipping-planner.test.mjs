import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { estimateShipping, PlannerInputError, shippingQuery } from '../assets/js/shipping-planner-model.mjs'

const catalogue=JSON.parse(readFileSync(new URL('../assets/data/shipping-planner.demo.json',import.meta.url)))
const query={origin:'shanghai',destination:'los-angeles',mode:'all',oceanService:'all',weight:500,volume:2}

test('query links preserve selections, force English, and ignore client supplied prices or destinations',()=>{
  const params=shippingQuery({...query,total:1,redirect:'https://example.com',volume:''},'zh')
  assert.equal(params.get('weight'),'500')
  assert.equal(params.get('volume'),'')
  assert.equal(params.get('lang'),'en')
  assert.equal(params.has('total'),false)
  assert.equal(params.has('redirect'),false)
  assert.equal(shippingQuery(query,'other').get('lang'),'en')
})

test('ocean comparison distinguishes Matson from standard and filters the requested service',()=>{
  const result=estimateShipping(catalogue,{...query,mode:'sea'})
  assert.deepEqual(result.offers.map(o=>o.service),['matson','standard'])
  assert.deepEqual(result.offers.map(o=>o.total),[[440,560],[250,340]])
  assert.deepEqual(estimateShipping(catalogue,{...query,mode:'sea',oceanService:'standard'}).offers.map(o=>o.service),['standard'])
})

test('ocean W/M bills the greater of volume, metric tonnes and the minimum',()=>{
  for(const [weight,volume,expected] of [[500,2,2],[2500,1,2.5],[25,.1,1]]){
    const result=estimateShipping(catalogue,{...query,mode:'sea',weight,volume})
    assert.equal(result.offers[0].chargeable,expected)
  }
})

test('air and courier use different volume divisors and billing increments',()=>{
  const air=estimateShipping(catalogue,{...query,mode:'air',weight:50,volume:1}).offers[0]
  const express=estimateShipping(catalogue,{...query,mode:'express',weight:50,volume:1}).offers[0]
  assert.equal(air.chargeable,167)
  assert.equal(express.chargeable,200)
  assert.deepEqual(air.total,[1202.4,1569.8])
  assert.equal(estimateShipping(catalogue,{...query,mode:'air',weight:10,volume:0}).offers[0].chargeable,45)
  assert.equal(estimateShipping(catalogue,{...query,mode:'express',weight:.6,volume:0}).offers[0].chargeable,1)
})

test('unconfigured lanes and services never fabricate rates from another location',()=>{
  const sparse={...catalogue,routes:catalogue.routes.filter(r=>r.destination!=='houston')}
  assert.deepEqual(estimateShipping(sparse,{...query,destination:'houston'}).offers,[])
  assert.deepEqual(estimateShipping({...catalogue,routes:catalogue.routes.map(r=>({...r,offers:r.offers.filter(o=>o.service!=='matson')}))},{...query,origin:'qingdao',mode:'sea',oceanService:'matson'}).offers,[])
})

test('FCL bills per selected container and keeps its port-to-port scope separate from LCL',()=>{
  const fcl={...query,mode:'sea',oceanType:'fcl',containerType:'40hc',containerCount:2,weight:undefined,volume:undefined}
  const result=estimateShipping(catalogue,fcl)
  assert.equal(result.basis,'port-to-port')
  assert.deepEqual(result.offers.map(o=>o.total),[[10000,12400],[6200,8200]])
  assert(result.offers.every(o=>o.billing==='container'&&o.chargeable===2&&o.basis==='port-to-port'))
  assert.deepEqual(estimateShipping(catalogue,{...fcl,weight:'invalid',volume:-1}).offers,result.offers)
  const link=shippingQuery({...fcl,weight:99999,volume:999})
  assert.equal(link.has('weight'),false)
  assert.equal(link.has('volume'),false)
  assert.deepEqual(estimateShipping(catalogue,Object.fromEntries(link)).offers,result.offers)
  assert.deepEqual(estimateShipping(catalogue,{...fcl,containerType:'20gp',containerCount:1,oceanService:'standard'}).offers[0].total,[2300,3200])
  assert.deepEqual(estimateShipping({...catalogue,fclRoutes:catalogue.fclRoutes.filter(r=>r.destination!=='new-york')},{...fcl,destination:'new-york'}).offers,[])
  const mixed=estimateShipping(catalogue,{...query,oceanType:'fcl',containerCount:1,containerType:'40gp'})
  assert.equal(mixed.offers.length,4)
  assert.equal(mixed.basis,'mixed')
  assert.equal(mixed.offers.filter(o=>o.billing==='container').length,2)
  for(const patch of [{containerCount:0},{containerCount:1.5},{containerCount:101},{containerType:'invalid'},{oceanType:'invalid'}]) {
    assert.throws(()=>estimateShipping(catalogue,{...fcl,...patch}),PlannerInputError)
  }
})

test('US last-mile matches exact warehouse and ZIP, with separate parcel and pallet billing',()=>{
  const tail={mode:'lastmile',warehouse:'lax-warehouse',postcode:'90001',deliveryType:'all',weight:50,volume:1,pallets:2}
  const result=estimateShipping(catalogue,tail)
  assert.equal(result.basis,'warehouse-to-door')
  assert.deepEqual(result.offers.map(o=>[o.billing,o.chargeable,o.total]),[['kg',200,[440,680]],['pallet',2,[190,290]]])
  assert.equal(estimateShipping(catalogue,{...tail,deliveryType:'parcel',pallets:''}).offers.length,1)
  assert.equal(estimateShipping(catalogue,{...tail,deliveryType:'truck'}).offers[0].service,'us-truck')
  assert.deepEqual(estimateShipping(catalogue,{...tail,postcode:'90002'}).offers,[])
  assert.deepEqual(estimateShipping(catalogue,{...tail,postcode:'01001'}).offers,[])
  assert.deepEqual(estimateShipping(catalogue,{...tail,warehouse:'dfw-warehouse'}).offers,[])
  for(const patch of [{warehouse:'invalid'},{postcode:'9000'},{postcode:'ABCDE'},{deliveryType:'invalid'},{pallets:1.5},{pallets:0},{weight:0},{volume:-1}]) {
    assert.throws(()=>estimateShipping(catalogue,{...tail,...patch}),PlannerInputError)
  }
})

test('query links retain FCL and US last-mile fields for recalculation after navigation',()=>{
  const fcl={...query,oceanType:'fcl',containerType:'20gp',containerCount:3}
  const restored=Object.fromEntries(shippingQuery(fcl,'zh'))
  assert.equal(restored.oceanType,'fcl')
  assert.equal(restored.containerCount,'3')
  assert.deepEqual(estimateShipping(catalogue,restored).offers,estimateShipping(catalogue,fcl).offers)
  const tail={mode:'lastmile',warehouse:'ewr-warehouse',postcode:'10001',deliveryType:'truck',weight:100,volume:1,pallets:3}
  assert.deepEqual(estimateShipping(catalogue,Object.fromEntries(shippingQuery(tail))).offers,estimateShipping(catalogue,tail).offers)
  assert.equal(shippingQuery({...tail,postcode:'01001'}).get('postcode'),'01001')
})

test('every listed US warehouse has a unique ID and a working sample ZIP with parcel and truck estimates',()=>{
  const ids=new Set()
  for(const warehouse of catalogue.warehouses){
    assert(!ids.has(warehouse.id));ids.add(warehouse.id)
    assert(['West','Central','East & Southeast'].includes(warehouse.region))
    assert(/^\d{5}$/.test(warehouse.examplePostcode))
    const result=estimateShipping(catalogue,{mode:'lastmile',warehouse:warehouse.id,postcode:warehouse.examplePostcode,deliveryType:'all',weight:50,volume:.1,pallets:1})
    assert.deepEqual(result.offers.map(o=>o.service),['us-parcel','us-truck'])
    assert(result.offers.every(o=>o.total[0]>0&&o.total[1]>=o.total[0]))
  }
  const boston=catalogue.warehouses.find(w=>w.id==='boston-warehouse')
  assert.equal(boston.examplePostcode,'02108')
  assert.equal(shippingQuery({mode:'lastmile',warehouse:boston.id,postcode:boston.examplePostcode}).get('postcode'),'02108')
})

test('invalid weights, volumes and selections are rejected before calculating',()=>{
  for(const patch of [{weight:0},{weight:-1},{weight:Infinity},{weight:'abc'},{volume:-1},{volume:0},{volume:NaN},{mode:'unknown'},{origin:'unknown'},{destination:'unknown'},{oceanService:'unknown'}]){
    assert.throws(()=>estimateShipping(catalogue,{...query,...patch}),PlannerInputError)
  }
})

test('demonstration catalogue has valid references, unique lanes and positive ordered ranges',()=>{
  assert.equal(catalogue.dataMode,'demo')
  assert.equal(catalogue.basis,'door-to-door')
  const lanes=new Set()
  for(const route of catalogue.routes){
    assert(!lanes.has(`${route.origin}/${route.destination}`));lanes.add(`${route.origin}/${route.destination}`)
    assert(catalogue.origins.some(p=>p.id===route.origin))
    assert(catalogue.destinations.some(p=>p.id===route.destination))
    const services=new Set()
    for(const offer of route.offers){
      assert(catalogue.services.some(s=>s.id===offer.service))
      assert(!services.has(offer.service));services.add(offer.service)
      for(const range of [offer.rate,offer.days])assert(range.length===2&&range[0]>0&&range[1]>=range[0])
    }
  }
  const fclLanes=new Set(),tailLanes=new Set()
  for(const route of catalogue.fclRoutes){
    const key=`${route.origin}/${route.destination}`
    assert(!fclLanes.has(key));fclLanes.add(key)
    assert(catalogue.origins.some(p=>p.id===route.origin))
    assert(catalogue.destinations.some(p=>p.id===route.destination))
    const services=new Set()
    for(const offer of route.offers){
      assert(catalogue.services.some(s=>s.id===offer.service&&s.mode==='sea'))
      assert(!services.has(offer.service));services.add(offer.service)
      for(const [type,range] of Object.entries(offer.rates)){
        assert(['20gp','40gp','40hc'].includes(type))
        assert(range.length===2&&range[0]>0&&range[1]>=range[0])
      }
      assert(offer.days.length===2&&offer.days[0]>0&&offer.days[1]>=offer.days[0])
    }
  }
  for(const route of catalogue.lastMileRoutes){
    const key=`${route.warehouse}/${route.postcode}`
    assert(!tailLanes.has(key));tailLanes.add(key)
    assert(catalogue.warehouses.some(w=>w.id===route.warehouse))
    assert(/^\d{5}$/.test(route.postcode))
    const services=new Set()
    for(const offer of route.offers){
      assert(catalogue.services.some(s=>s.id===offer.service&&s.mode==='lastmile'))
      assert(!services.has(offer.service));services.add(offer.service)
      for(const range of [offer.rate,offer.days])assert(range.length===2&&range[0]>0&&range[1]>=range[0])
    }
  }
})
