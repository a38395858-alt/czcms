import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const out = '../../output/fr-topics';
const model = JSON.parse(readFileSync(`${out}/content-model.json`, 'utf8'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const rows = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of Object.keys(model)) {
      await page.goto(`http://localhost:8083/${route}`, { waitUntil: 'networkidle' });
      const home = page.locator('.fr-topic-breadcrumb a').first();
      const href = await home.getAttribute('href');
      assert.equal(new URL(href, page.url()).href, 'http://localhost:8083/');
      const deHref = await page.locator('header a[hreflang="de"]').getAttribute('href');
      assert.equal(deHref, `http://localhost:8082/${route}`);
      if (route === 'services/packaging-branding') {
        const consent = page.getByRole('button', { name: 'Refuser', exact: true });
        if (await consent.isVisible()) await consent.click();
        await page.evaluate(() => document.fonts.ready);
        const capture = `${out}/services-packaging-branding-${width}.png`;
        await page.screenshot({ path: capture });
        copyFileSync(capture, `../../.impeccable/review/fr/${width === 1440 ? 'desktop' : 'mobile'}.png`);
      }
      await home.click();
      await page.waitForLoadState('networkidle');
      assert.equal(page.url(), 'http://localhost:8083/');
      rows.push({ width, route, href, deHref, homeUrl: page.url() });
    }
    await page.goto('http://localhost:8080/preview/france/services/packaging-branding', { waitUntil: 'networkidle' });
    const home = page.locator('.fr-topic-breadcrumb a').first();
    const href = await home.getAttribute('href');
    assert.equal(href, '/preview/france/');
    await home.click();
    await page.waitForLoadState('networkidle');
    assert.equal(page.url(), 'http://localhost:8080/preview/france/');
    rows.push({ width, route: 'preview/france/services/packaging-branding', href, homeUrl: page.url() });
    await context.close();
  }
  writeFileSync(`${out}/breadcrumb-review.json`, JSON.stringify({ rows, materialFix: 'French Accueil points to the French homepage', passed: true }, null, 2));
  console.log(`PASS: ${rows.length} French breadcrumb round trips; route-preserving German links and required hero captures confirmed.`);
} finally {
  await browser.close();
}
