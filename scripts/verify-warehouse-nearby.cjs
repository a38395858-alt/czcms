// Focused browser regression: a unique geocoder match must show warehouses
// after one search click. Use --live to smoke-test the public Census service.
const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

async function run() {
  const live = process.argv.includes('--live')
  const base = process.env.WAREHOUSE_TEST_URL || 'http://127.0.0.1:8180/preview/global/tools/fba-warehouse-lookup'
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../frontend/assets/data/fba-warehouses.us.json'), 'utf8'))
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, args: ['--no-proxy-server'] })
  const checks = [], errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.on('pageerror', err => errors.push(err.message))
    let fixture = []
    if (!live) await page.route('**/api/public/us-warehouse-location?**', route => route.fulfill({ json: { candidates: fixture } }))
    await page.goto(base)
    await page.waitForSelector('[data-map-ready=true]')
    await page.locator('#nearby-tab').click()
    for (const [code, address] of [['ONT8', '24300 Nandina Ave, Moreno Valley, CA 92551'], ['MDW2', '250 Emerald Drive, Joliet, IL 60433']]) {
      const row = data.warehouses.find(w => w.code === code)
      fixture = [{ label: address, lat: row.lat, lng: row.lng, precision: 'address-range', state: row.state, source: 'US Census address-range match' }]
      await page.fill('#query', address)
      await page.locator('#search-button').click()
      await page.waitForFunction(() => !document.querySelector('#location-selection').hidden || !document.querySelector('#query-error').hidden, { timeout: 18000 })
      if (await page.locator('#query-error').isVisible()) throw Error(await page.locator('#query-error').innerText())
      assert(await page.locator('#location-candidates').isHidden(), 'one match must not require a second click')
      assert(await page.locator(`.result-item[data-code="${code}"]`).count(), `${code} must appear automatically`)
      assert((await page.locator('.miles').count()) > 0, 'nearby distances must appear automatically')
      assert.match(await page.locator('#map-title').innerText(), /Nearby warehouse search/)
      checks.push({ code, automaticListings: await page.locator('.result-item').count(), description: await page.locator('#result-description').innerText() })
    }
    const output = path.resolve(__dirname, '../output/fba-map')
    fs.mkdirSync(output, { recursive: true })
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
    await page.screenshot({ path: path.join(output, 'nearby-auto-desktop.png'), fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(200)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.screenshot({ path: path.join(output, 'nearby-auto-mobile.png'), fullPage: true })
    if (!live) {
      fixture = [
        { label: 'Springfield, IL', lat: 39.791063, lng: -89.644572, precision: 'city-centroid', source: 'US Census place' },
        { label: 'Springfield, MO', lat: 37.194157, lng: -93.292642, precision: 'city-centroid', source: 'US Census place' },
      ]
      await page.fill('#query', 'Springfield')
      await page.locator('#search-button').click()
      await page.waitForSelector('[data-candidate]')
      assert.equal(await page.locator('.result-item').count(), 0, 'ambiguous locations must not silently choose a city')
      assert.equal(await page.locator('[data-candidate]').count(), 2)
      assert.match(await page.locator('#result-description').innerText(), /Choose/)
      assert.match(await page.locator('[data-candidate]').first().innerText(), /Show nearby warehouses/)
      await page.locator('[data-candidate]').first().click()
      assert.match(await page.locator('#location-selection').innerText(), /Springfield, IL/)
      await page.selectOption('#radius', '200')
      assert((await page.locator('.result-item').count()) > 0)
      checks.push({ test: 'ambiguous location requires an explicit choice; selected city drives the results' })
      await page.fill('#query', 'new location')
      assert.equal(await page.locator('.result-item').count(), 0)
      assert(await page.locator('#location-selection').isHidden())
      fixture = []
      await page.locator('#search-button').click()
      await page.waitForSelector('#query-error:not([hidden])')
      assert.equal(await page.locator('.result-item').count(), 0)
      checks.push({ test: 'editing clears old distances; no match never reuses the previous location' })
    }
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ mode: live ? 'live Census' : 'mocked geocoder boundary', checks, errors }, null, 2))
  } finally { await browser.close() }
}
run().catch(err => { console.error(err); process.exit(1) })
