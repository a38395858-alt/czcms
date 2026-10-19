import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = '../../output/topic-suite-polish';
const ports = { en:8081, de:8082, fr:8083, es:8084, it:8085, nl:8086 };
const targets = {en:'topic-enquiry',de:'topic-anfrage',es:'solicitud',fr:'demande',it:'richiesta',nl:'aanvraag'};
const browser = await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const results=[], captures=[];
try {
 for(const [locale,port] of Object.entries(ports)) for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  await page.goto(`http://localhost:${port}/services/packaging-branding`,{waitUntil:'networkidle'});
  const decline={en:'Decline',de:'Ablehnen',es:'Rechazar',fr:'Refuser',it:'Rifiuti',nl:'Weigeren'}[locale];
  const banner=page.getByRole('button',{name:decline,exact:true});if(await banner.isVisible())await banner.click();
  const cta=page.locator('main > section').first().getByRole('button').first();
  await cta.click();
  const ctaResult=await page.evaluate(id=>{const el=document.getElementById(id);return {top:el.getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,focused:document.activeElement.id};},targets[locale]);
  assert(ctaResult.top>=ctaResult.headerBottom-2,`${locale} CTA covered`);
  const faq=page.locator('main details').first(); await faq.locator('summary').click();assert(await faq.getAttribute('open')!==null);
  const form=page.locator(`#${targets[locale]} form`);await form.locator('button[type="submit"]').click();assert(await form.locator('[aria-invalid="true"]').count()>0);
  // Language navigation keeps the current topic; exercise each available target.
  const languageLinks=await page.locator('header a[hreflang]').evaluateAll(links=>links.map(a=>({lang:a.hreflang,href:a.href})));
  assert.equal(new Set(languageLinks.map(a=>a.lang)).size,6);
  assert(languageLinks.every(a=>a.href.endsWith('/services/packaging-branding')));
  const menu=page.locator('header details').filter({has:page.locator('a[hreflang]')}).first();
  if(await menu.count()) {await menu.locator('summary').click();}
  else {
   const toggle=page.locator('header button[aria-controls="desktop-language-panel"]');
   if(await toggle.count())await toggle.click();
  }
  const next=languageLinks.find(a=>a.lang===(locale==='nl'?'en':'nl'));
  await page.goto(next.href,{waitUntil:'networkidle'});assert.equal(new URL(page.url()).pathname,'/services/packaging-branding');
  results.push({locale,width,cta:ctaResult,faqOpens:true,validation:true,languageTargets:languageLinks,nextURL:page.url()});
  await page.close();
 }
 // Complete section inspection on distinct topics, with intermediate widths.
 const context=await browser.newContext({bypassCSP:true,reducedMotion:'reduce'});
 for(const [locale,port] of [['nl',8086],['de',8082]]) for(const route of ['product-sourcing','services/packaging-branding','services/inventory-storage','industries/time-critical-cargo']) {
  const page=await context.newPage({viewport:{width:1440,height:960}});await page.goto(`http://localhost:${port}/${route}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'header {position:static!important}'});
  const types=locale==='nl'?['scenarios','workflow','controls','checklist']:['workflow'];
  for(const type of types) {const section=page.locator(`[data-section-type="${type}"]`).first();if(await section.count())await section.screenshot({path:`${out}/after-${locale}-${route.replaceAll('/','-')}-${type}.png`});}
  const checks=[];for(const width of [768,1024]){await page.setViewportSize({width,height:960});checks.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});}
  assert(checks.every(c=>!c.overflow));captures.push({locale,route,checks});await page.close();
 }
 writeFileSync(`${out}/interactions.json`,JSON.stringify({results,captures,captureNote:'Only section screenshots use bypassCSP and a static header. Interaction checks use production CSP.'},null,2));
 console.log(JSON.stringify({interactionCases:results.length,sectionCases:captures.length,passed:true}));
}finally{await browser.close();}
