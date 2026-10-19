import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const output = '../../output/de-topic-refinement';
const checksOnly = process.argv.includes('--checks-only');
mkdirSync(output, { recursive: true });
const routes = ['product-sourcing', 'services/bulk-procurement', 'services/packaging-branding', 'services/inventory-storage', 'services/private-white-label', 'services/worldwide-fulfillment', 'industries/cross-border-ecommerce', 'industries/consumer-goods', 'industries/industrial-components', 'industries/time-critical-cargo'];
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const rows = [];
for (const route of routes) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(`http://localhost:8082/${route}`, { waitUntil: 'networkidle' });
    const consent = page.getByRole('button', { name: 'Ablehnen', exact: true });
    if (await consent.isVisible()) await consent.click();
    await page.evaluate(() => document.fonts.ready);
    const prefix = `${output}/after-${route.replaceAll('/', '-')}-${width}`;
    if (!checksOnly) await page.screenshot({ path: `${prefix}.png` });
    const result = await page.evaluate(() => ({
      height: document.body.scrollHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      headings: [...document.querySelectorAll('main h1,main h2')].map(e => ({ text: e.textContent, width: e.clientWidth, height: e.clientHeight, fontSize: getComputedStyle(e).fontSize })),
      primaryCtaBottom: document.querySelector('.de-topic-hero-columns button')?.getBoundingClientRect().bottom,
      missingTargets: [...document.querySelectorAll('.de-topic-navigation a')].filter(e => !document.querySelector(e.getAttribute('href'))).map(e => e.textContent),
      schemaFaqs: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(e => JSON.parse(e.textContent)['@graph'] ?? []).find(e => e['@type'] === 'FAQPage')?.mainEntity.length,
      visibleFaqs: document.querySelectorAll('[data-section-type="faq"] details').length,
      images: [...document.querySelectorAll('main img')].filter(e => e.complete && e.naturalWidth === 0).map(e => e.src),
    }));
    const anchors = [];
    for (const label of ['Ablauf', 'FAQ', 'Anfrage']) {
      await page.locator('.de-topic-navigation').getByRole('link', { name: label, exact: true }).click();
      anchors.push(await page.evaluate(() => ({ hash: location.hash, top: document.querySelector(location.hash)?.getBoundingClientRect().top, headerBottom: document.querySelector('header').getBoundingClientRect().bottom, focus: document.activeElement.id })));
    }
    await page.locator('[data-section-type="faq"] summary').first().click();
    result.faqOpens = await page.locator('[data-section-type="faq"] details').first().getAttribute('open') !== null;
    if (!checksOnly && ['product-sourcing', 'services/packaging-branding', 'industries/industrial-components'].includes(route)) {
      for (const type of ['decision', 'workflow', 'scopeTable', 'controls', 'faq']) {
        const section = page.locator(`[data-section-type="${type}"]`).first();
        if (await section.count()) await section.screenshot({ path: `${prefix}-${type}.png` });
      }
      await page.locator('#topic-anfrage').screenshot({ path: `${prefix}-enquiry.png` });
      await page.locator('.de-topic-rail').screenshot({ path: `${prefix}-rail.png` });
    }
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(e => e.decode());
    }
    await page.locator('.de-topic-hero-columns button').first().click();
    result.primaryCta = await page.evaluate(() => ({ top: document.querySelector('#topic-anfrage').getBoundingClientRect().top, headerBottom: document.querySelector('header').getBoundingClientRect().bottom }));
    await page.locator('.de-topic-hero-columns button').nth(1).click();
    result.secondaryCta = await page.evaluate(() => ({ top: document.querySelector('#ablauf').getBoundingClientRect().top, headerBottom: document.querySelector('header').getBoundingClientRect().bottom }));
    await page.setViewportSize({ width: 320, height: 960 });
    result.overflow320 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    rows.push({ route, width, ...result, anchors, errors });
    writeFileSync(`${output}/browser-review.json`, JSON.stringify({ rows }, null, 2));
    await page.close();
  }
}
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:8082/services/packaging-branding', { waitUntil: 'networkidle' });
const consent = page.getByRole('button', { name: 'Ablehnen', exact: true });
if (await consent.isVisible()) await consent.click();
await page.locator('header nav[aria-label="Hauptnavigation"] summary').first().click();
const menu = { topicLinks: await page.locator('header nav[aria-label="Hauptnavigation"] [data-public-menu][open] a').count() };
await page.keyboard.press('Escape');
await page.getByLabel('Sprache wechseln', { exact: true }).click();
const english = page.locator('header a[hreflang="en"]');
menu.englishTarget = await english.getAttribute('href');
await english.click();
await page.waitForLoadState('networkidle');
menu.englishUrl = page.url();
menu.englishHasGermanClass = await page.locator('.de-topic-page').count() > 0;
menu.errors = errors;
writeFileSync(`${output}/browser-review.json`, JSON.stringify({ rows, menu }, null, 2));
await browser.close();
console.log(JSON.stringify({ pages: rows.length, problems: rows.filter(r => r.errors.length || r.overflow || r.overflow320 || r.images.length || r.missingTargets.length || !r.faqOpens || r.schemaFaqs !== r.visibleFaqs), menu }, null, 2));
