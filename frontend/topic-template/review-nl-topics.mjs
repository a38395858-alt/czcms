import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = '../../output/nl-topics';
const model = JSON.parse(readFileSync(`${out}/content-model.json`, 'utf8'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const resume=process.argv.includes('--resume');
const rows=resume?JSON.parse(readFileSync(`${out}/browser-review.json`,'utf8')).rows:[], interactions=[], problems=[];
try {
 for(const [route,topic] of Object.entries(model)) for(const width of [1440,390]) {
  if(resume&&rows.some(row=>row.route===route&&row.width===width))continue;
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://localhost:8086/${route}`,{waitUntil:'networkidle'});
  const consent=page.getByRole('button',{name:'Weigeren',exact:true});if(await consent.isVisible())await consent.click();
  await page.evaluate(()=>document.fonts.ready);
  const prefix=`${out}/${route.replaceAll('/','-')}-${width}`;
  await page.screenshot({path:`${prefix}.png`});
  const checks=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,title:document.title,h1:document.querySelector('h1').textContent,description:document.querySelector('meta[name="description"]').content,font:getComputedStyle(document.querySelector('h1')).fontFamily,bodyFont:getComputedStyle(document.querySelector('main')).fontFamily,submitBackground:getComputedStyle(document.querySelector('#aanvraag button[type="submit"]')).backgroundColor,homeHref:document.querySelector('.nl-topic-breadcrumb a').href,logoHref:document.querySelector('.nl-topic-logo').href,faqCount:document.querySelectorAll('.nl-topic-faq details').length,schema:[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(e=>JSON.parse(e.textContent)['@graph']??[]).find(e=>e['@type']==='FAQPage').mainEntity,missingTargets:[...document.querySelectorAll('.nl-topic-page-nav a')].filter(e=>!document.querySelector(e.hash)).map(e=>e.hash)}));
  const faqs=topic.sections.find(s=>s.type==='faq').content.items;
  checks.copyMatches=checks.title===topic.meta.title&&checks.h1===topic.hero.title&&checks.description===topic.meta.description;
  checks.faqMatches=checks.faqCount===faqs.length&&checks.schema.every((q,i)=>q.name===faqs[i].question&&q.acceptedAnswer.text===faqs[i].answer);
  const anchors=[];
  for(const label of ['Werkwijze','FAQ','Plan aanvragen']) {
   await page.locator('.nl-topic-page-nav').getByRole('link',{name:label,exact:true}).click();
   anchors.push(await page.evaluate(()=>({hash:location.hash,top:document.querySelector(location.hash).getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,focused:document.activeElement.id})));
  }
  await page.locator('.nl-topic-faq summary').first().click();checks.faqOpens=await page.locator('.nl-topic-faq details').first().getAttribute('open')!==null;
  for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(async e=>{if(!e.complete)await new Promise((resolve,reject)=>{e.addEventListener('load',resolve,{once:true});e.addEventListener('error',reject,{once:true});});await e.decode();});}
  await page.locator('.nl-topic-hero-actions button').click();
  checks.primaryCta=await page.evaluate(()=>({top:document.querySelector('#aanvraag').getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,focused:document.activeElement.id}));
  await page.setViewportSize({width:320,height:960});checks.overflow320=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  const row={route,width,...checks,anchors,errors};rows.push(row);
  if(errors.length||checks.overflow||checks.overflow320||!checks.copyMatches||!checks.faqMatches||!checks.faqOpens||checks.missingTargets.length||checks.homeHref!=='http://localhost:8086/'||checks.logoHref!=='http://localhost:8086/'||checks.submitBackground!=='rgb(12, 107, 74)'||anchors.some(a=>a.top<a.headerBottom))problems.push(row);
  writeFileSync(`${out}/browser-review.json`,JSON.stringify({rows,problems},null,2));await page.close();
 }
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  await page.goto('http://localhost:8086/',{waitUntil:'networkidle'});
  const reject=page.getByRole('button',{name:'Weigeren',exact:true});if(await reject.isVisible())await reject.click();
  if(width===390)await page.getByRole('button',{name:'Menu openen',exact:true}).click();
  const scope=width===390?page.locator('#nl-mobile-nav'):page.locator('header');
  const trigger=scope.locator('.nl-home-topic-menu summary').first();await trigger.click();
  const packaging=scope.getByRole('link',{name:/Verpakking en merk/});const target=await packaging.getAttribute('href');await packaging.click();await page.waitForLoadState('networkidle');assert.equal(page.url(),'http://localhost:8086/services/packaging-branding');
  const consent=page.getByRole('button',{name:'Weigeren',exact:true});if(await consent.isVisible())await consent.click();
  if(width===390)await page.getByRole('button',{name:'Menu openen',exact:true}).click();
  const topicScope=width===390?page.locator('#nl-topic-mobile-nav'):page.getByRole('navigation',{name:'Hoofdnavigatie',exact:true});await topicScope.locator('summary').first().click();const links=await topicScope.locator('details[open] .nl-topic-menu-panel a').count();assert.equal(links,6);
  await page.keyboard.press('Escape');const nestedEscape=width===1440||await page.locator('#nl-topic-mobile-nav').isVisible();assert(nestedEscape);if(width===390)await page.keyboard.press('Escape');
  await page.getByLabel('Taal wijzigen',{exact:true}).click();const frTarget=await page.locator('header a[hreflang="fr"]').getAttribute('href');await page.locator('header a[hreflang="fr"]').click();await page.waitForLoadState('networkidle');assert.equal(page.url(),'http://localhost:8083/services/packaging-branding');interactions.push({width,target,links,nestedEscape,frTarget,frUrl:page.url()});
  await page.goto('http://localhost:8080/preview/netherlands/services/packaging-branding',{waitUntil:'networkidle'});const home=page.locator('.nl-topic-breadcrumb a').first();assert.equal(await home.getAttribute('href'),'/preview/netherlands/');await home.click();await page.waitForLoadState('networkidle');assert.equal(page.url(),'http://localhost:8080/preview/netherlands/');interactions.push({width,previewHome:page.url()});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});await page.goto('http://localhost:8086/services/packaging-branding',{waitUntil:'networkidle'});const consent=page.getByRole('button',{name:'Weigeren',exact:true});if(await consent.isVisible())await consent.click();await page.locator('.nl-topic-hero-actions button').click();const form=page.locator('#aanvraag form');const submit=form.getByRole('button',{name:model['services/packaging-branding'].formButton,exact:true});await submit.click();const validation={dutchErrors:await page.locator('[role="alert"]').allTextContents(),invalidFields:await form.locator('[aria-invalid="true"]').count()};assert.equal(validation.invalidFields,6);
 await form.getByLabel('Volledige naam',{exact:false}).fill('Testpersoon');await form.getByLabel('Zakelijke e-mail',{exact:false}).fill('preview@example.test');await form.locator('input[name="company"]').fill('Testbedrijf');await form.getByLabel('Herkomst',{exact:false}).fill('China');await form.getByLabel('Bestemming',{exact:false}).fill('Nederland');await form.locator('input[id$="-consent"]').check();
 await form.locator('input[type="file"]').setInputFiles({name:'brief.exe',mimeType:'application/octet-stream',buffer:Buffer.from('invalid')});assert(await form.getByText(/is geen ondersteund bestandstype/).isVisible());await form.locator('input[type="file"]').setInputFiles({name:'brief.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 preview')});await form.getByRole('button',{name:'Verwijder brief.pdf',exact:true}).click();
 let payload;await page.route('**/topic-enquiry',async route=>{payload=route.request().postDataJSON();await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({reference:'NL-UI-REVIEW'})});});await submit.click();await page.getByText('Bedankt. Wij hebben uw aanvraag ontvangen.',{exact:true}).waitFor();const submission={locale:payload.locale,route:payload.route,startingPoint:payload.starting_point,tokenPresent:!!payload.form_token,successVisible:true};assert.equal(submission.locale,'nl');assert.equal(submission.startingPoint,'packaging-branding');await page.close();
 const ssr=[],noJS=await browser.newContext({javaScriptEnabled:false});for(const route of Object.keys(model)){const p=await noJS.newPage();await p.goto('http://localhost:8086/'+route);ssr.push({route,h1:await p.locator('h1').textContent(),faqCount:await p.locator('.nl-topic-faq details').count()});await p.close();}
 // Body screenshots use a separate capture-only context to avoid sticky-header occlusion.
 const captures=await browser.newContext({bypassCSP:true,reducedMotion:'reduce'});
 for(const route of ['product-sourcing','services/packaging-branding','industries/industrial-components'])for(const width of [1440,390]){const p=await captures.newPage();await p.setViewportSize({width,height:960});await p.goto('http://localhost:8086/'+route,{waitUntil:'networkidle'});const reject=p.getByRole('button',{name:'Weigeren',exact:true});if(await reject.isVisible())await reject.click();await p.addStyleTag({content:'.nl-topic-header {position:static}'});await p.evaluate(()=>document.fonts.ready);const prefix=`${out}/${route.replaceAll('/','-')}-${width}`;for(const type of ['decision','scenarios','workflow','controls','checklist','faq']){const section=p.locator(`[data-section-type="${type}"]`).first();if(await section.count())await section.screenshot({path:`${prefix}-${type}.png`});}await p.locator('#aanvraag').screenshot({path:`${prefix}-enquiry.png`});await p.close();}
 mkdirSync('../../.impeccable/review/nl',{recursive:true});for(const width of [1440,390])copyFileSync(`${out}/services-packaging-branding-${width}.png`,`../../.impeccable/review/nl/${width===1440?'desktop':'mobile'}.png`);
 writeFileSync(`${out}/browser-review.json`,JSON.stringify({rows,problems,interactions,validation,submission,ssr,captureNote:'Functional checks keep production CSP; body capture-only context uses bypassCSP and static header to avoid screenshot occlusion.'},null,2));console.log(JSON.stringify({cases:rows.length,problems:problems.length,interactions,validation,submission,ssrPages:ssr.length},null,2));assert.equal(problems.length,0);
}finally{await browser.close();}
