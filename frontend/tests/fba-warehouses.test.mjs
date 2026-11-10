import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizeQuery, searchWarehouses, formatWarehouseAddress } from '../assets/js/fba-warehouses-model.mjs'

const directory = JSON.parse(readFileSync(new URL('../assets/data/fba-warehouses.us.json', import.meta.url)))

test('FBA code, city, ZIP, street and combined-token searches work regardless of case', () => {
  for (const query of ['ont8', ' ONt8  ', 'moreno valley', '92551', 'NANDINA', 'ont8 ca']) {
    assert(searchWarehouses(directory, query).some(item => item.code === 'ONT8'), query)
  }
  assert.equal(searchWarehouses(directory, 'ont8')[0].code, 'ONT8')
  assert.equal(normalizeQuery('  new\t JERSEY  '), 'new jersey')
  assert(searchWarehouses(directory, 'ont').every(item => item.code.startsWith('ONT') || [item.city, item.address, item.stateName].join(' ').toLowerCase().includes('ont')))
})

test('state code and full name searches agree and do not match other states', () => {
  for (const [code, name] of [['CA', 'California'], ['IN', 'Indiana'], ['OR', 'Oregon'], ['NJ', 'New Jersey'], ['TX', 'Texas']]) {
    const results = searchWarehouses(directory, code)
    assert(results.length > 0)
    assert(results.every(item => item.state === code))
    assert.deepEqual(results, searchWarehouses(directory, name))
  }
  assert.deepEqual(searchWarehouses(directory, 'ME'), [])
  assert.deepEqual(searchWarehouses(directory, 'ONT8 new jersey'), [])
})

test('empty, unknown and overlong queries have no results', () => {
  for (const query of ['', ' \t ', 'unknown-warehouse', 'x'.repeat(121), '<script>alert(1)</script>']) assert.deepEqual(searchWarehouses(directory, query), [])
})

test('full address formatting keeps warehouse code, street, city, state, ZIP and country', () => {
  const ont8 = searchWarehouses(directory, 'ont8')[0]
  assert.equal(formatWarehouseAddress(ont8), `ONT8\n24300 Nandina Ave\nMoreno Valley, CA ${ont8.zip}\nUnited States`)
  const abe8 = searchWarehouses(directory, '08518')[0]
  assert.equal(abe8.code, 'ABE8')
  assert(formatWarehouseAddress(abe8).includes('NJ 08518'))
})

test('directory has unique attributed US addresses and consistent state and region labels', () => {
  assert.equal(directory.country, 'US')
  assert.equal(directory.warehouses.length, new Set(directory.warehouses.map(item => item.code)).size)
  assert.match(directory.sourceCheckedAt, /^\d{4}-\d{2}-\d{2}$/)
  for (const item of directory.warehouses) {
    assert.match(item.code, /^[A-Z0-9]{4}$/)
    assert.match(item.zip, /^\d{5}(?:-\d{4})?$/)
    assert.match(item.sourceURL, /^https:\/\/www\.fbanearme\.com\/locations\/usa\//)
    assert.equal(item.country, 'US')
    assert(item.address && item.city)
    const state = directory.states.find(state => state.code === item.state)
    assert.equal(state.name, item.stateName)
    assert.equal(state.region, item.region)
  }
})
