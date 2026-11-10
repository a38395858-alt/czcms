const {chromium}=require('../frontend/topic-template/node_modules/@playwright/test');
const fs=require('fs');
const assert=require('node:assert/strict');
const dir='.impeccable/review/eu-taric';
fs.mkdirSync(dir,{recursive:true});
const markets=[['germany','de','Baumwolle'],['france','fr','coton'],['spain','es','algodón'],['italy','it','cotone'],['netherlands','nl','katoen']];
const origin='http://127.0.0.1:8180';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--no-proxy-server']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[],checks=[],screenshots=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push(r.url()+': '+r.failure()?.errorText)});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [site,lang,word] of markets){
  const base=`${origin}/preview/${site}/tools/taric-code-lookup`;
  await page.goto(base);await page.locator('[data-taric]').waitFor();
  assert((await page.locator('html').getAttribute('lang')).startsWith(lang));
  let requests=0;const watch=r=>{if(r.url().includes('/tools/taric-code-lookup?q='))requests++};page.on('request',watch);
  await page.locator('#taric-query').fill(word);await page.waitForTimeout(120);assert.equal(requests,0);
  await page.locator('.taric-result-table tbody tr').first().waitFor();assert.equal(requests,1);page.off('request',watch);
  await page.locator('[data-taric-copy]').first().click();
  const clipboard=await page.evaluate(()=>navigator.clipboard.readText());assert.match(clipboard,/^\d{10}$/);
  await page.locator('#taric-query').fill('390950');await page.locator(`a[href$="/3909509090"]`).first().waitFor();
  if(lang==='de'){for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});await page.waitForTimeout(300);await page.screenshot({path:`${dir}/de-search-${width}.png`,fullPage:true,animations:'disabled'});screenshots.push(`de-search-${width}.png`);}}
  await page.locator(`a[href$="/3909509090"]`).first().click();await page.locator('[data-taric-measures]').waitFor();
  assert.equal(await page.locator('#taric-origin').inputValue(),'CN');
  const apiPromise=page.waitForResponse(r=>r.url().includes('/api/public/taric-measures?'));
  await page.locator('[data-taric-measures] button').click();
  const api=await apiPromise;
  assert.equal(api.status(),200,lang+' measure API: '+await api.text());const response=await api.json();assert(response.items.some(m=>m.rate==='6.50 %'));
  await page.locator('.taric-measure-table').waitFor();
  assert((await page.locator('.taric-measure-table').innerText()).includes('6.50 %'));
  const sourceLinks = await page.locator('[data-taric-measure-link]').evaluateAll(links => links.map(link => link.href));
  assert.equal(sourceLinks.length, 2); assert(sourceLinks.every(link => link === response.sourceURL));
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const size=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth}));
   if(size.page>size.viewport+1)errors.push(`${site} overflow at ${width}: ${JSON.stringify(size)}`);
   if(width===1440){const wrapped=await page.locator('.taric-measure-table tbody td:last-child').evaluateAll(cells=>cells.filter(cell=>/^R\d{4}\/\d{2}$/.test(cell.textContent.trim())).some(cell=>{const range=document.createRange();range.selectNodeContents(cell);return new Set([...range.getClientRects()].map(rect=>Math.round(rect.y))).size>1}));assert(!wrapped,site+' short regulation wrapped');}
   if(width===390||width===1440){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});await page.waitForTimeout(300);await page.screenshot({path:`${dir}/${lang}-detail-${width}.png`,fullPage:true,animations:'disabled'});screenshots.push(`${lang}-detail-${width}.png`);}
  }
  checks.push({site,lang,keyword:word,classification:'3909509090',measureCount:response.items.length,snapshot:'2026-11-06',widths:[320,390,768,1440]});
  console.log('Verified',site);
 }
 // Country/date changes clear previous measures; a request failure keeps recovery controls usable.
 await page.goto(`${origin}/preview/germany/tools/taric-code-lookup/3909509090`);
 await page.locator('[data-taric-measures] button').click();await page.locator('.taric-measure-table').waitFor();
 await page.locator('#taric-origin').fill('US');await page.locator('#taric-origin').dispatchEvent('change');assert.equal(await page.locator('.taric-measure-table').count(),0);
 await page.locator('#taric-date').fill('2026-11-05');
 let links=await page.locator('[data-taric-measure-link]').evaluateAll(nodes=>nodes.map(node=>node.href));
 assert.equal(links.length,2);assert(links.every(link=>{const url=new URL(link);return url.searchParams.get('Area')==='US'&&url.searchParams.get('SimDate')==='20261105'}));
 await page.locator('#taric-origin').fill('ZZ');assert.equal(await page.locator('[data-taric-measure-link][href]').count(),0);
 await page.locator('#taric-origin').fill('US');
 await page.route('**/api/public/taric-measures?**',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"upstream unavailable"}'}));
 await page.locator('[data-taric-measures] button').click();await page.locator('[data-taric-measure-output] [role=alert]').waitFor();assert(!(await page.locator('[data-taric-measures] button').isDisabled()));await page.unroute('**/api/public/taric-measures?**');
 await page.locator('#taric-origin').fill('CN');await page.locator('#taric-date').fill('2026-11-06');await page.locator('[data-taric-measures] button').click();await page.locator('.taric-measure-table').waitFor();
 links=await page.locator('[data-taric-measure-link]').evaluateAll(nodes=>nodes.map(node=>node.href));assert(links.every(link=>{const url=new URL(link);return url.searchParams.get('Area')==='CN'&&url.searchParams.get('SimDate')==='20261106'}));
 // A no-JS visitor can search and open classifications and submit measures.
 const noJS=await browser.newContext({javaScriptEnabled:false});const fallback=await noJS.newPage();
 await fallback.goto(`${origin}/preview/france/tools/taric-code-lookup?q=390950`);await fallback.locator('a[href$="/3909509090"]').first().click();assert((await fallback.locator('#classification').innerText()).replace(/\s/g,'').includes('3909509090'));
 await fallback.locator('[data-taric-measures] button').click();await fallback.locator('.taric-measure-table').waitFor();await noJS.close();
 await page.goto(`${origin}/preview/germany/tools/taric-code-lookup/3909505000`);assert.equal(await page.locator('[data-taric-search]').count(),1);assert.equal(await page.locator('a[href$="?q=390950"]').count(),1);
 await page.goto(`${origin}/preview/global/tools/hts-code-lookup/3909505000`);assert((await page.locator('[data-hts-detail]').innerText()).includes('6.3%'));
 
 fs.writeFileSync(`${dir}/verification.json`,JSON.stringify({checks,screenshots,errors,clipboard:true,debounce300:true,noJS:true,originChange:true,officialLinksSync:true,invalidOriginLinksDisabled:true,shortRegulationsUnbroken:true,errorRetry:true,USRegression:true},null,2));
 await browser.close();assert.equal(errors.length,0,errors.join('\n'));console.log('All browser checks passed');
})().catch(error=>{console.error(error);process.exit(1)});
