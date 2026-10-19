import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const out = '../../output/fr-topics';
const model = JSON.parse(readFileSync(`${out}/content-model.json`, 'utf8'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const interactionsOnly = process.argv.includes('--interactions-only');
const rows = interactionsOnly ? JSON.parse(readFileSync(`${out}/browser-review.json`, 'utf8')).rows : [];
const problems = [];
if (!interactionsOnly) for (const [route, topic] of Object.entries(model)) for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(`http://localhost:8083/${route}`, { waitUntil: 'networkidle' });
  const consent = page.getByRole('button', { name: 'Refuser', exact: true });
  if (await consent.isVisible()) await consent.click();
  await page.evaluate(() => document.fonts.ready);
  const prefix = `${out}/${route.replaceAll('/', '-')}-${width}`;
  await page.screenshot({ path: `${prefix}.png` });
  const checks = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    height: document.body.scrollHeight,
    title: document.title, h1: document.querySelector('h1').textContent,
    description: document.querySelector('meta[name="description"]').content,
    font: getComputedStyle(document.querySelector('h1')).fontFamily,
    submitBackground: getComputedStyle(document.querySelector('#demande button[type="submit"]')).backgroundColor,
    faqCount: document.querySelectorAll('.fr-topic-faq details').length,
    schema: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(e => JSON.parse(e.textContent)['@graph'] ?? []).find(e => e['@type'] === 'FAQPage').mainEntity,
    missingTargets: [...document.querySelectorAll('.fr-topic-page-nav a')].filter(e => !document.querySelector(e.hash)).map(e => e.hash),
  }));
  const faqs = topic.sections.find(s => s.type === 'faq').content.items;
  checks.copyMatches = checks.title === topic.meta.title && checks.h1 === topic.hero.title && checks.description === topic.meta.description;
  checks.faqMatches = checks.faqCount === faqs.length && checks.schema.every((q,i) => q.name === faqs[i].question && q.acceptedAnswer.text === faqs[i].answer);
  const anchors = [];
  for (const label of ['Déroulé', 'FAQ', 'Demander un plan']) {
    await page.locator('.fr-topic-page-nav').getByRole('link', { name: label, exact: true }).click();
    anchors.push(await page.evaluate(() => ({ hash: location.hash, top: document.querySelector(location.hash).getBoundingClientRect().top, headerBottom: document.querySelector('header').getBoundingClientRect().bottom, focused: document.activeElement.id })));
  }
  await page.locator('.fr-topic-faq summary').first().click();
  checks.faqOpens = await page.locator('.fr-topic-faq details').first().getAttribute('open') !== null;
  for (const img of await page.locator('main img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(e => e.decode()); }
  await page.locator('.fr-topic-hero-actions button').click();
  checks.primaryCta = await page.evaluate(() => ({ top: document.querySelector('#demande').getBoundingClientRect().top, headerBottom: document.querySelector('header').getBoundingClientRect().bottom, focused: document.activeElement.id }));
  if (['product-sourcing', 'services/packaging-branding', 'industries/industrial-components'].includes(route)) {
    for (const type of ['decision', 'scenarios', 'workflow', 'controls', 'checklist', 'faq']) {
      const section = page.locator(`[data-section-type="${type}"]`).first();
      if (await section.count()) await section.screenshot({ path: `${prefix}-${type}.png` });
    }
    await page.locator('#demande').screenshot({ path: `${prefix}-enquiry.png` });
  }
  await page.setViewportSize({ width: 320, height: 960 });
  checks.overflow320 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const row = { route, width, ...checks, anchors, errors };
  rows.push(row);
  if (errors.length || checks.submitBackground === 'rgba(0, 0, 0, 0)' || checks.overflow || checks.overflow320 || !checks.copyMatches || !checks.faqMatches || !checks.faqOpens || checks.missingTargets.length || anchors.some(a => a.top < a.headerBottom)) problems.push(row);
  writeFileSync(`${out}/browser-review.json`, JSON.stringify({ rows }, null, 2));
  await page.close();
}
const interactions = [];
for (const width of [1440,390]) {
  const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle' });
  const cookies = page.getByRole('button', { name: 'Tout refuser', exact: true });
  if (await cookies.isVisible()) await cookies.click();
  if(width===390) await page.getByRole('button',{name:'Ouvrir le menu',exact:true}).click();
  const menuScope=width===390?page.getByRole('dialog',{name:'Menu du site'}):page.locator('header');
  const solutionsTrigger=menuScope.getByRole('button',{name:'Solutions',exact:true});
  if(await solutionsTrigger.getAttribute('aria-expanded')!=='true')await solutionsTrigger.click();
  const packaging=menuScope.getByRole('link',{name:/Emballage et image de marque/});
  const target=await packaging.getAttribute('href');
  await packaging.click();await page.waitForLoadState('networkidle');
  const topicUrl=page.url();
  const consent=page.getByRole('button',{name:'Refuser',exact:true});if(await consent.isVisible())await consent.click();
  if(width===390)await page.getByRole('button',{name:'Ouvrir le menu',exact:true}).click();
  const navScope=width===390?page.locator('#fr-topic-mobile-nav'):page.getByRole('navigation',{name:'Navigation principale',exact:true});
  await navScope.locator('summary').first().click();
  const topicLinks=await navScope.locator('details[open] .fr-topic-menu-panel a').count();
  await page.keyboard.press('Escape');
  const nestedEscape=width===1440||(await page.locator('#fr-topic-mobile-nav').isVisible());
  if(width===390)await page.keyboard.press('Escape');
  await page.getByLabel('Changer de langue',{exact:true}).click();
  const deTarget=await page.locator('header a[hreflang="de"]').getAttribute('href');
  await page.locator('header a[hreflang="de"]').click();await page.waitForLoadState('networkidle');
  const deUrl=page.url();
  interactions.push({width,target,topicUrl,topicLinks,nestedEscape,deTarget,deUrl,errors});
  await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
await page.goto('http://localhost:8083/services/packaging-branding',{waitUntil:'networkidle'});
const consent=page.getByRole('button',{name:'Refuser',exact:true});if(await consent.isVisible())await consent.click();
await page.locator('.fr-topic-hero-actions button').click();
const form=page.locator('#demande form');
await form.getByRole('button',{name:'Demander un plan emballage et marque',exact:true}).click();
const validation={frenchErrors:await page.locator('[role="alert"]').allTextContents(), invalidFields:await form.locator('[aria-invalid="true"]').count()};
await form.getByLabel('Nom complet',{exact:false}).fill('Personne de contrôle');
await form.getByLabel('E-mail professionnel',{exact:false}).fill('preview@example.test');
await form.locator('input[name="company"]').fill('Entreprise de contrôle');
await form.getByLabel('Origine',{exact:false}).fill('China');
await form.getByLabel('Destination',{exact:false}).fill('France');
await form.locator('input[id$="-consent"]').check();
await form.locator('input[type="file"]').setInputFiles({ name: 'brief.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 preview reference') });
await form.getByRole('button',{name:'Retirer brief.pdf',exact:true}).click();
let payload;
await page.route('**/topic-enquiry',async route=>{payload=route.request().postDataJSON();await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({reference:'FR-UI-REVIEW'})});});
await form.getByRole('button',{name:'Demander un plan emballage et marque',exact:true}).click();
await page.getByText('Merci. Nous avons bien reçu votre demande.',{exact:true}).waitFor();
await page.locator('#demande').screenshot({path:`${out}/form-success-1440.png`});
const submission={locale:payload.locale,route:payload.route,startingPoint:payload.starting_point,tokenPresent:!!payload.form_token,successVisible:true};
const ssr=[];
const noJS=await browser.newContext({javaScriptEnabled:false});
for(const route of Object.keys(model)){const p=await noJS.newPage();await p.goto('http://localhost:8083/'+route);ssr.push({route,h1:await p.locator('h1').textContent(),faqCount:await p.locator('.fr-topic-faq details').count()});await p.close();}
await browser.close();
writeFileSync(`${out}/browser-review.json`,JSON.stringify({rows,interactions,validation,submission,ssr},null,2));
console.log(JSON.stringify({pages:rows.length,problems,interactions,validation,submission,ssrPages:ssr.length},null,2));
if(problems.length || interactions.some(i=>i.errors.length))process.exitCode=1;
