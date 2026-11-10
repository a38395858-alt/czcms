// Render precise English UI concepts as PNGs. No production app is changed.
const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const assert = require('node:assert/strict')

async function run() {
  const directory = path.resolve(__dirname, '../docs/design')
  const source = path.join(directory, 'customs-code-details-concept-v1.html')
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, args: ['--no-proxy-server'] })
  const result = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    for (const [market, name] of [['cn', 'customs-detail-china-concept-v1'], ['us', 'customs-detail-us-concept-v1']]) {
      const url = pathToFileURL(source)
      url.searchParams.set('market', market)
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.goto(url.href, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      assert.equal(await page.locator('h1').innerText(), 'Customs Code & Duty Lookup')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      const content = await page.locator('#detail').innerText()
      if (market === 'cn') {
        for (const phrase of ['3909500000', '6.5%', '45%', '13%', 'RCEP rates', 'CIQ', 'Classification hierarchy', 'Export commodity inspection']) assert(content.includes(phrase), phrase)
        assert.equal(await page.locator('.ciq-table tbody tr').count(), 6)
        assert((await page.locator('#notice').innerText()).includes('not verified current tariff data'))
      } else {
        for (const phrase of ['3909505000', '6.3%', '15.4¢/kg + 51.5%', 'Column 1 · Special', 'Full legal classification']) assert(content.includes(phrase), phrase)
        assert.equal(await page.locator('.ciq-table').count(), 0)
      }
      await page.evaluate(() => window.scrollTo(0, 0))
      const png = path.join(directory, name + '.png')
      await page.screenshot({ path: png, fullPage: true })
      const dimensions = await page.evaluate(() => ({ width: innerWidth, height: document.documentElement.scrollHeight }))
      const provenance = { kind: 'deterministic HTML UI design capture', source: path.basename(source), market, viewport: { width: 1440, height: 1000 }, output: dimensions, status: 'design concept; not an implemented application feature', data: market === 'cn' ? 'User-provided Chinese reference screenshots; values not independently verified' : 'USITC 2026 HTS Revision 22, code3909505000, locally verified official export' }
      fs.writeFileSync(png + '.json', JSON.stringify(provenance, null, 2))
      await page.setViewportSize({ width: 390, height: 844 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, market + ' mobile overflow')
      result.push({ png, ...provenance })
    }
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ result, errors }, null, 2))
  } finally { await browser.close() }
}
run().catch(error => { console.error(error); process.exitCode = 1 })
