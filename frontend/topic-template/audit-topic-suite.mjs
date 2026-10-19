import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const stage = process.argv.includes('--after') ? 'after' : 'before';
const out = '../../output/topic-suite-polish';
mkdirSync(out, { recursive: true });
const manifest = JSON.parse(readFileSync('../assets/freightvanta-topic-v18/manifest.json', 'utf8'));
const ports = { en:8081, de:8082, fr:8083, es:8084, it:8085, nl:8086 };
const browser = await chromium.launch({ headless:true, executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe' });
const jobs = Object.entries(manifest).flatMap(([key,entry]) => [1440,390].map(width => ({key,entry,width})));
const rows = [];
try {
 await Promise.all(Array.from({length:4}, async () => {
  while(jobs.length) {
   const {key,entry,width} = jobs.shift();
   const [locale,...parts] = key.split('/'); const route = parts.join('/');
   const page = await browser.newPage({ viewport:{width,height:960}, reducedMotion:'reduce' });
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   page.on('console',e=>{ if(e.type()==='error') errors.push(e.text()); });
   const start=Date.now();
   try {
    await page.goto(`http://localhost:${ports[locale]}/${route}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.getElementById('freightvanta-cms-context') && document.querySelector('main'));
    await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,7000))]));
    const decline={en:'Decline',de:'Ablehnen',fr:'Refuser',es:'Rechazar',it:'Rifiuti',nl:'Weigeren'}[locale];
    const consent=page.getByRole('button',{name:decline,exact:true}); if(await consent.isVisible())await consent.click();
    const checks=await page.evaluate(async () => {
     const images=[...document.querySelectorAll('main img')];
     for(const img of images) { img.loading='eager'; }
     await Promise.all(images.map(img=>Promise.race([img.decode().catch(()=>{}),new Promise(r=>setTimeout(r,4000))])));
     const links=[...document.querySelectorAll('main a[href^="#"], header a[href^="#"]')];
     const context=JSON.parse(document.getElementById('freightvanta-cms-context').textContent);
     const schema=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>JSON.parse(s.textContent)['@graph']??[]);
     return { lang:document.documentElement.lang, title:document.title, h1:[...document.querySelectorAll('h1')].map(h=>h.textContent),
      overflow:document.documentElement.scrollWidth>innerWidth,
      missingAnchors:links.filter(a=>a.hash.length>1 && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),
      brokenImages:images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc||i.src),
      footerText:document.querySelector('footer')?.textContent,
      faqCount:document.querySelectorAll('main details').length,
      schemaFaqCount:schema.find(s=>s['@type']==='FAQPage')?.mainEntity.length,
      layout:document.querySelector('[data-topic-layout]')?.dataset.topicLayout??null,
      locale:context.locale, internalLinks:[...document.querySelectorAll('main a,header a')].map(a=>a.getAttribute('href')).filter(h=>h&&!h.startsWith('#')),
      heroHeight:document.querySelector('main > section')?.getBoundingClientRect().height,
      resources:performance.getEntriesByType('resource').filter(r=>/topic\.(js|css)/.test(r.name)).map(r=>({url:r.name.split('/').pop(),durationMs:Math.round(r.duration),transferSize:r.transferSize})),
     };
    });
    checks.titleMatches=checks.title===entry.title;
    checks.h1Matches=checks.h1.length===1&&checks.h1[0]===entry.heading;
    checks.faqMatches=checks.faqCount===entry.faqs.length&&checks.schemaFaqCount===entry.faqs.length;
    if(locale==='nl'||route==='services/packaging-branding') await page.screenshot({path:`${out}/${stage}-${locale}-${route.replaceAll('/','-')}-${width}.png`});
    await page.setViewportSize({width:320,height:960});checks.overflow320=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    rows.push({key,width,elapsedMs:Date.now()-start,...checks,errors});
   } catch(error) {rows.push({key,width,fatal:String(error),errors});}
   finally {await page.close();}
   writeFileSync(`${out}/${stage}.json`,JSON.stringify({rows},null,2));
  }
 }));
 const issues=rows.filter(r=>r.fatal||r.errors.length||r.overflow||r.overflow320||r.missingAnchors.length||r.brokenImages.length||!r.h1Matches||!r.titleMatches||!r.faqMatches);
 writeFileSync(`${out}/${stage}.json`,JSON.stringify({rows,issues},null,2));
 console.log(JSON.stringify({stage,cases:rows.length,issues:issues.map(r=>({key:r.key,width:r.width,fatal:r.fatal,errors:r.errors,missingAnchors:r.missingAnchors,brokenImages:r.brokenImages,overflow:r.overflow,overflow320:r.overflow320}))},null,2));
} finally {await browser.close();}
