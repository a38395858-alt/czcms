import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('../../output/it-topics', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const evidence = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    await page.goto('http://localhost:8085/', { waitUntil: 'networkidle' });
    const reject = page.getByRole('button', { name: 'Rifiuta tutto', exact: true });
    if (await reject.isVisible()) await reject.click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `../../output/it-topics/before-home-${width}.png` });
    evidence.push(await page.evaluate(() => ({ width: innerWidth, title: document.title, headings: [...document.querySelectorAll('h1')].map(e => ({ text: e.textContent, font: getComputedStyle(e).fontFamily, size: getComputedStyle(e).fontSize })), bodyFont: getComputedStyle(document.body).fontFamily, links: [...document.querySelectorAll('header a')].slice(0, 8).map(e => ({ label: e.textContent, href: e.getAttribute('href') })) })));
    await page.close();
  }
  writeFileSync('../../output/it-topics/home-evidence.json', JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
} finally { await browser.close(); }
