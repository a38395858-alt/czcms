/* One batched desktop/mobile browser inspection of the five local directories. */
const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test');
const fs = require('fs');
const assert = require('node:assert/strict');
const markets = [
  ['germany', 'de', 'DE', 16, 'DUS2', '47495', 'NW'],
  ['france', 'fr', 'FR', 13, 'ORY4', '91220', 'IDF'],
  ['spain', 'es', 'ES', 19, 'MAD4', '28830', 'MD'],
  ['italy', 'it', 'IT', 20, 'FCO1', '02032', '62'],
  ['netherlands', 'nl', 'NL', 12, '3PL-AA-ROO', '4704 RG', 'NB'],
];
const streetQueries = {
  de: 'Amazonstraße 1, 47495 Rheinberg',
  fr: '20 Avenue du Centre d’Essais en Vol, 91220 Brétigny-sur-Orge',
  es: 'Avenida de la Astronomía 24, 28830 San Fernando de Henares',
  it: 'Via della Meccanica, 02032 Passo Corese',
  nl: 'Borchwerf 5, 4704 RG Roosendaal',
};

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--no-proxy-server'] });
  const out = '.tmp/eu-warehouses/screenshots'; fs.mkdirSync(out, { recursive: true });
  const report = [];
  try {
    for (const [site, lang, country, regions, code, postal, state] of markets) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const url = `http://127.0.0.1:8180/preview/${site}/tools/fba-warehouse-lookup`;
      await page.goto(url, { waitUntil: 'networkidle' });
      const root = page.locator('[data-country-warehouse-map]');
      await root.waitFor(); await page.waitForFunction(() => document.querySelector('[data-country-warehouse-map]')?.dataset.mapReady === 'true');
      assert.equal(await root.getAttribute('lang'), lang);
      assert.equal(await page.locator('#map path.state').count(), regions);
      const mapBounds = await page.locator('#map path.state').evaluateAll(paths => paths.map(p => { const b = p.getBBox(); return [b.width, b.height]; }));
      assert.ok(mapBounds.every(([w, h]) => w > 0 && h > 0 && w < 1000 && h < 600));
      assert.equal(await root.locator('[data-code="ONT8"]').count(), 0);
      await page.screenshot({ path: `${out}/${site}-desktop.png`, fullPage: true });
      await page.locator('#clear-query').click();
      assert.equal(await page.locator('#results [data-fba-card]').count(), 0);
      await page.locator('#query').fill(code.toLowerCase()); await page.locator('#search-form').evaluate(form => form.requestSubmit());
      await page.waitForFunction(code => document.querySelector('#results [data-code]')?.dataset.code === code, code);
      assert.equal(await page.locator('#results [data-fba-card]').count(), 1);
      await page.locator('#results [data-locate]').click();
      assert.ok(await page.locator('#map [role="button"]').count() > regions);
      await page.locator('#zoom-in').click();
      assert.ok((await page.locator('#map > g > g').getAttribute('transform')).includes('1.6'));
      await page.locator('#state-select').selectOption(state);
      assert.ok(await page.locator('#results [data-fba-card]').count() > 0);
      // Keyboard region selection uses the same result action as a map click.
      await page.locator('#map path.state').filter({ has: page.locator('title') }).first().focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('#state-select').inputValue());
      await page.locator('#nearby-tab').click(); await page.locator('#query').fill(postal);
      await page.locator('#search-form').evaluate(form => form.requestSubmit());
      await page.locator('#location-selection').waitFor({ state: 'visible' });
      const count = await page.locator('#results [data-fba-card]').count(); assert.ok(count > 0);
      assert.ok((await page.locator('#result-description').innerText()).includes('km'));
      assert.equal(await page.locator('#location-candidates').isVisible(), false);
      assert.ok((await page.locator('#results .miles').first().innerText()).includes('km'));
      await page.locator('#warehouse-type').selectOption('3pl');
      assert.equal(await page.locator('#results [data-type="fba"]').count(), 0);
      await page.locator('#warehouse-type').selectOption('all');
      if (process.argv.includes('--live')) {
        await page.locator('#query').fill(streetQueries[lang]);
        await page.locator('#search-form').evaluate(form => form.requestSubmit());
        await page.waitForFunction(() => !document.querySelector('#location-selection').hidden || !document.querySelector('#location-candidates').hidden || !document.querySelector('#query-error').hidden);
        if (await page.locator('#location-candidates').isVisible()) await page.locator('[data-candidate]').first().click();
        assert.equal(await page.locator('#query-error').isVisible(), false, await page.locator('#query-error').innerText());
        await page.locator('#location-selection').waitFor({ state: 'visible' });
        assert.ok(await page.locator('#results .miles').count() > 0);
      }
      await page.locator('#query').fill('edited address');
      assert.equal(await page.locator('#location-selection').isVisible(), false);
      assert.equal(await page.locator('#results .miles').count(), 0);
      await page.locator('#reset').click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/${site}-mobile.png`, fullPage: true });
      const overflow = await page.evaluate(() => ({ window: innerWidth, document: document.documentElement.scrollWidth, root: document.querySelector('[data-country-warehouse-map]').scrollWidth }));
      assert.ok(overflow.document <= overflow.window + 1 && overflow.root <= overflow.window + 1, JSON.stringify(overflow));
      assert.deepEqual(errors, []);
      const home = await page.request.get(`http://127.0.0.1:8180/preview/${site}`);
      assert.ok((await home.text()).includes(`href="/preview/${site}/tools/fba-warehouse-lookup"`));
      report.push({ country, regions, postal, nearbyResults: count, liveStreet: process.argv.includes('--live'), desktop: true, mobile390: true, pageErrors: errors });
      await page.close();
    }
    fs.writeFileSync('.tmp/eu-warehouses/browser-report.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
