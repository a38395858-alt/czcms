// Optional official-source integration check against an isolated local instance.
// Requires the QA owner session from verify-hts-lookup.cjs. It never enables SMTP.
const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
async function run() {
  const origin = process.env.HTS_ADMIN_TEST_ORIGIN || 'http://127.0.0.1:8186'
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw Error('Use an isolated loopback QA instance')
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, args: ['--no-proxy-server'] })
  try {
    const context = await browser.newContext({ storageState: path.resolve(__dirname, '../.tmp/hts/admin-review/browser-state.json') })
    const page = await context.newPage()
    await page.goto(origin + '/admin#/admin/settings?section=hts')
    await page.locator('[data-hts-sync]').waitFor()
    const before = await (await context.request.get(origin + '/api/v1/system/hts')).json()
    assert.equal(before.notification.enabled, false, 'QA instance must not send mail')
    const started = Date.now()
    await page.locator('[data-hts-sync]').click()
    let after
    for (let i = 0; i < 45; i++) {
      await page.waitForTimeout(3000)
      const response = await context.request.get(origin + '/api/v1/system/hts')
      assert.equal(response.status(), 200)
      after = await response.json()
      if (!after.status.running && after.status.lastAttemptAt !== before.status.lastAttemptAt) break
    }
    assert.equal(after.status.running, false, 'sync did not finish within the integration check window')
    assert.equal(after.status.lastError, '', 'official refresh failed: ' + after.status.lastError)
    assert(after.status.entries >= 10000)
    assert(after.status.retrievedAt > before.status.retrievedAt)
    const result = await (await context.request.get(origin + '/api/public/hts-search?q=8517130000')).json()
    assert.equal(result.items[0].description, 'Smartphones')
    assert.equal(result.items[0].generalRate, 'Free')
    const report = { source: 'actual USITC release/export/release; real admin POST', durationMs: Date.now() - started, release: after.status.release, effectiveDate: after.status.effectiveDate, entries: after.status.entries, retrievedAt: after.status.retrievedAt, checkedExactCode: result.items[0].code, lastError: after.status.lastError, mailEnabled: after.notification.enabled }
    fs.writeFileSync(path.resolve(__dirname, '../.impeccable/review/hts/live-sync-report.json'), JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
}
run().catch(err => { console.error(err); process.exitCode = 1 })
