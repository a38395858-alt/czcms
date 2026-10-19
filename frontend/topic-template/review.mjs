import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve('../../output/topic18-review');
mkdirSync(out, { recursive: true });
const manifest = JSON.parse(readFileSync('../assets/freightvanta-topic-v18/manifest.json', 'utf8'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const reports = [];
for (const size of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce' });
  // Pre-set a real consent choice so banners do not obscure screenshots.
  await context.addInitScript(() => localStorage.setItem('fv.analytics-consent.v1', 'denied'));
  for (const [key, topic] of Object.entries(manifest)) {
    const [locale, ...parts] = key.split('/');
    const route = parts.join('/');
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
    const url = `http://localhost:${locale === 'en' ? 8081 : 8082}/${route}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(async () => { await document.fonts.ready; for (const img of document.images) img.loading = 'eager'; });
    await page.waitForTimeout(400);
    const stats = await page.evaluate(() => ({
      title: document.title,
      template: document.body.dataset.topicTemplate,
      h1: document.querySelector('h1')?.textContent,
      h1Count: document.querySelectorAll('h1').length,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.currentSrc),
      hero: document.querySelector('#hero')?.getBoundingClientRect().toJSON(),
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
      robots: document.querySelector('meta[name="robots"]')?.content,
    }));
    if (stats.template !== 'v18' || stats.h1 !== topic.heading || stats.h1Count !== 1) {
      throw new Error(`Wrong topic/template at ${url}: ${JSON.stringify(stats)}`);
    }
    const name = `${locale}-${route.replaceAll('/', '-')}-${size.name}`;
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    // Four materially different original compositions, at both device sizes.
    if (['product-sourcing', 'services/packaging-branding'].includes(route)) {
      const reference = await context.newPage();
      await reference.goto(`http://127.0.0.1:4178/#${locale === 'de' ? '/de' : ''}/${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await reference.evaluate(async () => { await document.fonts.ready; for (const img of document.images) img.loading = 'eager'; });
      await reference.waitForTimeout(400);
      await reference.screenshot({ path: resolve(out, `${name}-reference.png`), fullPage: true });
      await reference.screenshot({ path: resolve(out, `${name}-reference-hero.png`) });
      await page.screenshot({ path: resolve(out, `${name}-hero.png`) });
      const refStats = await reference.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, hero: document.querySelector('#hero')?.getBoundingClientRect().toJSON(), font: getComputedStyle(document.querySelector('h1')).fontFamily }));
      stats.reference = refStats;
      await reference.close();
    }
    reports.push({ key, size: size.name, url, errors, failed, stats });
    writeFileSync(resolve(out, 'report.json'), JSON.stringify(reports, null, 2));
    console.log(JSON.stringify({ key, size: size.name, errors, failed, width: stats.scrollWidth, brokenImages: stats.brokenImages.length }));
    await page.close();
  }
  await context.close();
}
await browser.close();
