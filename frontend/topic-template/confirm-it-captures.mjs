import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out='../../output/it-topics',model=JSON.parse(readFileSync(`${out}/content-model.json`,'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const rows=[];
try{
 for(const route of Object.keys(model))for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});await page.goto('http://localhost:8085/'+route,{waitUntil:'networkidle'});const reject=page.getByRole('button',{name:'Rifiuti',exact:true});if(await reject.isVisible())await reject.click();await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>({logoFont:getComputedStyle(document.querySelector('.it-topic-logo')).fontFamily,logoWeight:getComputedStyle(document.querySelector('.it-topic-logo')).fontWeight,h1Font:getComputedStyle(document.querySelector('h1')).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth,home:document.querySelector('.it-topic-breadcrumb a').href}));assert(result.logoFont.includes('Manrope'));assert(result.h1Font.includes('Bodoni'));assert(!result.overflow);assert.equal(result.home,'http://localhost:8085/');
  const path=`${out}/${route.replaceAll('/','-')}-${width}.png`;await page.screenshot({path});if(route==='services/packaging-branding')copyFileSync(path,`../../.impeccable/review/it/${width===1440?'desktop':'mobile'}.png`);rows.push({route,width,...result});await page.close();
 }
 writeFileSync(`${out}/confirmation.json`,JSON.stringify({rows,passed:true},null,2));console.log('PASS: final20 captures, Manrope wordmark and Bodoni headings confirmed.');
}finally{await browser.close();}
