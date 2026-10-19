import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const output = '../../output/navigation-review';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const results = [], failures = [];
async function openLanguage(page) {
  const details = page.locator('header summary[aria-label="Sprache wechseln"],header .fv-topic-language > summary');
  if (await details.count()) await details.first().click();
  else await page.getByRole('button', { name: /Language: English/ }).click();
}
async function languageLink(page, code) {
  return page.locator(`header a[hreflang^="${code}"]`).filter({ visible: true }).first();
}
for (const width of [1440, 390]) for (const port of [8081,8082,8083,8084,8085,8086]) for (const path of ['/', '/product-sourcing']) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    window.reviewCLS = 0;
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.reviewCLS += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    cls: window.reviewCLS,
    overflow: document.documentElement.scrollWidth > innerWidth,
    heading: document.querySelector('h1')?.textContent,
  }));
  if (port === 8082) {
    if (width === 1440) {
      const service = page.locator(path === '/' ? '.fv-de-nav details' : '.de-topic-menu').first();
      await service.locator('summary').click();
      await expect(service.locator('a')).toHaveCount(6);
      await page.keyboard.press('Escape');
      await expect(service).not.toHaveAttribute('open', '');
      await expect(service.locator('summary')).toBeFocused();
      await service.locator('summary').click();
    } else {
      if (path === '/') await page.locator('.fv-de-mobile > summary').click();
      else await page.getByRole('button', { name: 'Menü öffnen' }).click();
      const service = page.locator(path === '/' ? '.fv-de-mobile nav details' : '#de-mobile-nav details').first();
      await service.locator('summary').click();
      await expect(service.locator('a')).toHaveCount(6);
    }
  }
  await page.screenshot({ path: `${output}/${port}-${path === '/' ? 'home' : 'topic'}-${width}.png` });
  await page.setViewportSize({ width: 320, height: 800 });
  const overflow320 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const row = { width, port, path, ...metrics, overflow320, errors };
  results.push(row);
  if (errors.length || metrics.overflow || overflow320) failures.push(row);
  console.log(JSON.stringify(row));
  await page.close();
}
// Actual cross-document language clicks preserve a topic through all six sites.
const page = await browser.newPage({ viewport: { width:1440,height:1000 } });
const clickErrors=[];page.on('pageerror',e=>clickErrors.push(e.message));
await page.goto('http://localhost:8082/product-sourcing');
for (const [code, port] of [['en',8081],['de',8082],['fr',8083],['es',8084],['it',8085],['nl',8086],['de',8082]]) {
  await openLanguage(page);
  const link = await languageLink(page, code);
  await Promise.all([page.waitForURL(`http://localhost:${port}/product-sourcing`), link.click()]);
  await expect(page.locator('h1')).toBeVisible();
}
await openLanguage(page);
const current = await languageLink(page, 'de');
let navigations=0;page.on('framenavigated',()=>navigations++);
await current.click();
await page.waitForTimeout(150);
if(navigations!==0) failures.push({sameLanguageReloads:navigations});
await page.evaluate(()=>scrollTo(0,700));
await page.waitForTimeout(150);
await openLanguage(page);
await Promise.all([page.waitForURL('http://localhost:8081/product-sourcing'), (await languageLink(page,'en')).click()]);
await page.goBack({waitUntil:'domcontentloaded'});
await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(600);
if(clickErrors.length) failures.push({clickErrors});
await page.close();
// Complete pages are usable before any React bundle runs.
for(const port of [8083,8084,8085,8086]) {
 const page=await browser.newPage({javaScriptEnabled:false});
 await page.goto(`http://localhost:${port}/`,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#root[data-prerendered="true"] header')).toHaveCount(1);
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('footer')).toHaveCount(1);
 await page.close();
}
writeFileSync(`${output}/verification.json`,JSON.stringify({results,failures,languageClicks:8,noJavaScriptHomes:4},null,2));
await browser.close();
if(failures.length) throw new Error(`${failures.length} browser checks failed; inspect verification.json`);
console.log('All language clicks, menus, scroll restoration and server-rendered homepage checks passed.');
