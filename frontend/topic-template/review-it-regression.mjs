import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const rows=[];
try {
 for(const [locale,port] of [['en',8081],['de',8082],['fr',8083],['es',8084]])for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://localhost:${port}/services/packaging-branding`,{waitUntil:'networkidle'});
  const row=await page.evaluate(()=>({h1:document.querySelector('h1').textContent,font:getComputedStyle(document.querySelector('h1')).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth}));rows.push({locale,width,...row,errors});assert(!row.overflow);assert.equal(errors.length,0);await page.close();
 }
 writeFileSync('../../output/it-topics/regression.json',JSON.stringify({rows,passed:true},null,2));console.log('PASS: 8 EN/DE/FR/ES regression cases.');
}finally{await browser.close();}
