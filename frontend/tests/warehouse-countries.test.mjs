import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { normalizeCountryQuery, searchCountryWarehouses, nearbyCountryWarehouses, countryAddress, countryProjectionGeometry } from '../assets/js/warehouse-countries-model.mjs'

const directory = language => JSON.parse(fs.readFileSync(new URL(`../assets/data/warehouse-country.${language}.json`, import.meta.url)))
test('country searches preserve accents, leading-zero postcodes, Dutch spaces and country isolation', () => {
  assert.equal(normalizeCountryQuery('Île-DE-France'), 'ile-de-france')
  for (const [lang, query, code] of [['de', 'DUS2', 'DUS2'], ['fr', 'ile-de-france', 'ORY4'], ['es', '08820', 'BCN1'], ['it', '02032', 'FCO1'], ['nl', '4704rg', '3PL-AA-ROO']]) {
    const d = directory(lang)
    assert.equal(searchCountryWarehouses(d, query)[0].code, code)
    assert.equal(searchCountryWarehouses(d, 'ONT8').length, 0)
    assert.equal(searchCountryWarehouses(d, '').length, 0)
    assert.ok(!countryAddress(d.Warehouses[0], d).includes('United States'))
  }
})
test('nearby uses kilometers and never accepts a point from a different country', () => {
  const d = directory('nl'), origin = { country: 'NL', lat: 51.93, lng: 4.53 }
  const rows = nearbyCountryWarehouses(d, origin, { radius: 50, type: '3pl' })
  assert.ok(rows.length > 1)
  assert.ok(rows.every(w => w.km <= 50 && w.type === '3pl'))
  assert.ok(rows.every((w, i) => !i || w.km >= rows[i - 1].km))
  assert.equal(nearbyCountryWarehouses(d, { ...origin, country: 'US' }).length, 0)
  assert.equal(nearbyCountryWarehouses(d, origin, { radius: 50, type: 'fba' }).length, 0)
})
test('all national maps retain their real geographic bounds after spherical winding conversion', () => {
  const context = {}; vm.runInNewContext(fs.readFileSync(new URL('../assets/vendor/d3.v7.min.js', import.meta.url), 'utf8'), context)
  for (const [lang, total] of [['de', 16], ['fr', 13], ['es', 19], ['it', 20], ['nl', 12]]) {
    const data = JSON.parse(fs.readFileSync(new URL(`../assets/data/warehouse-regions.${lang}.geojson`, import.meta.url)))
    const map = countryProjectionGeometry(data), bounds = context.d3.geoBounds(map)
    assert.equal(map.features.length, total)
    assert.ok(bounds[0][0] > -19 && bounds[1][0] < 20, lang)
    assert.ok(bounds[0][1] > 27 && bounds[1][1] < 56, lang)
    assert.ok(map.features.every(f => context.d3.geoArea(f) < 1), lang)
  }
})
