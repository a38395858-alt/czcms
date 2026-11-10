import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasMapPoint, straightLineMiles, nearbyWarehouses, readMapOptions } from '../assets/js/warehouse-map-model.mjs'

test('straight-line miles use spherical coordinates and reject missing points', () => {
  const lax = { lat: 33.9416, lng: -118.4085 }, jfk = { lat: 40.6413, lng: -73.7781 }
  assert(Math.abs(straightLineMiles(lax, jfk) - 2469) < 3)
  assert.equal(straightLineMiles(lax, lax), 0)
  assert(Number.isNaN(straightLineMiles(lax, {})))
  for (const point of [{ lat: null, lng: null }, { lat: 34, lng: NaN }, { lat: -30, lng: -118 }, { lat: '34', lng: '-118' }]) assert.equal(hasMapPoint(point), false)
})

test('nearby filtering sorts by distance, obeys radius, type and services, and keeps examples opt-in', () => {
  const center = { lat: 34, lng: -117 }
  const rows = [
    { code: 'far', type: 'fba', lat: 40, lng: -117 },
    { code: 'near', type: 'fba', lat: 34.1, lng: -117 },
    { code: 'example', type: '3pl', example: true, lat: 34.01, lng: -117, services: ['Returns'] },
    { code: 'missing', type: 'fba' },
  ]
  assert.deepEqual(nearbyWarehouses(rows, center).map(w => w.code), ['near'])
  assert.deepEqual(nearbyWarehouses(rows, center, { examples: true }).map(w => w.code), ['example', 'near'])
  assert.deepEqual(nearbyWarehouses(rows, center, { examples: true, service: 'Returns' }).map(w => w.code), ['example'])
  assert.deepEqual(nearbyWarehouses(rows, center, { examples: true, type: 'fba' }).map(w => w.code), ['near'])
  assert.deepEqual(nearbyWarehouses(rows, center, { radius: 999999 }), [])
  assert.deepEqual(nearbyWarehouses(rows, null), [])
})

test('map URL parameters validate radius and filter values', () => {
  assert.equal(readMapOptions(new URLSearchParams()).query, 'California')
  assert.equal(readMapOptions(new URLSearchParams('q=')).query, '')
  assert.deepEqual(readMapOptions(new URLSearchParams('mode=nearby&radius=-1&type=bad&service=bad&q=08518')), { mode: 'nearby', radius: 50, type: 'all', service: 'all', query: '08518' })
})

test('all indexed FBA map points disclose source and precision; 3PL samples stay separate', () => {
  const directory = JSON.parse(readFileSync(new URL('../assets/data/fba-warehouses.us.json', import.meta.url)))
  for (const row of directory.warehouses) {
    assert(hasMapPoint(row), row.code)
    assert(['address-range', 'zip-centroid'].includes(row.coordinatePrecision), row.code)
    assert.match(row.coordinateSourceURL, /^https:\/\/(geocoding\.geo|www2)\.census\.gov\//)
    assert.equal(row.example, undefined)
  }
  const demo = JSON.parse(readFileSync(new URL('../assets/data/us-3pl-examples.json', import.meta.url)))
  assert.equal(demo.status, 'illustrative-only')
  assert(demo.warehouses.every(w => w.example && w.type === '3pl' && !w.sourceURL))
})
