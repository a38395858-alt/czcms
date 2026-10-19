import { chromium } from '@playwright/test';
import { mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const stage=process.argv.includes('--after')?'after':'before';
const out='../../output/country-layout-review';mkdirSync(out,{recursive:true});
const sites={en:8081,de:8082,fr:8083,es:8084,it:8085,nl:8086};
const manifest=JSON.parse(readFileSync('../assets/freightvanta-topic-v18/manifest.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const inventory=[],deadLinks=[],rows=[];
try {
 if(stage==='after'){const previous=JSON.parse(readFileSync(`${out}/inventory.json`,'utf8'));inventory.push(...previous.pages);deadLinks.push(...previous.deadLinks);}
 else for(const [locale,port] of Object.entries(sites)) {
  const origin=`http://localhost:${port}`;const routes=new Set(['/']);
  const sitemap=await(await fetch(origin+'/sitemap.xml')).text();for(const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))routes.add(new URL(m[1]).pathname);
  for(const key of Object.keys(manifest))if(key.startsWith(locale+'/'))routes.add('/'+key.split('/').slice(1).join('/'));
  const page=await browser.newPage();
  // Navigation discovery covers unpublished fixed routes omitted by sitemap.
  for(const route of ['/','/services/packaging-branding','/guides']) {
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(e=>e.href))) {
    try{const url=new URL(href);if(url.origin===origin&&!url.pathname.startsWith('/assets/')&&!url.pathname.startsWith('/preview/'))routes.add(url.pathname);}catch{}
   }
  }
  await page.close();
  for(const route of routes){const r=await fetch(origin+route);if(r.status===200 && /text\/html/.test(r.headers.get('content-type')??''))inventory.push({locale,port,route});else deadLinks.push({locale,route,status:r.status});}
 }
 writeFileSync(`${out}/inventory.json`,JSON.stringify({pages:inventory,deadLinks},null,2));
 const jobs=inventory.flatMap(p=>[1440,390].map(width=>({...p,width})));
 await Promise.all(Array.from({length:4},async()=>{while(jobs.length){const job=jobs.shift();const {locale,port,route,width}=job;const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(`http://localhost:${port}${route}`,{waitUntil:'domcontentloaded'});await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,5000))]));
   const decline={en:/^Decline$/,de:/^Ablehnen$/,fr:/^(Refuser|Tout refuser)$/,es:/^Rechazar$/,it:/^(Rifiuti|Rifiuta)$/,nl:/^Weigeren$/}[locale];const consent=page.getByRole('button',{name:decline});if(await consent.isVisible())await consent.click();
   await page.evaluate(async()=>{const images=[...document.querySelectorAll('main img')];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,3500))])));});
   const data=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    const metrics=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,120),width:Math.round(r.width),height:Math.round(r.height),top:Math.round(r.top+scrollY),font:s.fontFamily,size:s.fontSize,line:s.lineHeight,color:s.color,bg:s.backgroundColor,padding:s.padding};};
    const main=document.querySelector('main')??document.body;
    const images=[...main.querySelectorAll('img')];const links=[...document.querySelectorAll('a[href^="#"]')].filter(visible);
    return {title:document.title,lang:document.documentElement.lang,bodyClass:document.body.className,mainText:main.textContent.trim().replace(/\s+/g,' '),h1:[...document.querySelectorAll('h1')].map(metrics),headings:[...main.querySelectorAll('h2')].map(metrics),sections:[...main.querySelectorAll(':scope > section, :scope > div > section')].map(metrics),height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,
     overflowElements:[...main.querySelectorAll('*')].filter(e=>visible(e)&&e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(metrics),
     missingAnchors:links.filter(a=>a.hash.length>1&&!a.hash.startsWith('#/')&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),
     images:images.map(i=>({src:i.currentSrc||i.src,broken:!i.complete||!i.naturalWidth,alt:i.alt,rect:{width:i.width,height:i.height}})),
     controls:[...document.querySelectorAll('header button,header summary,main button,main summary')].filter(visible).map(metrics),styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(l=>l.href),layout:main.dataset.topicLayout??null};
   });
   const mainHash=createHash('sha256').update(data.mainText).digest('hex');delete data.mainText;
   const name=route==='/'?'home':route.slice(1).replaceAll('/','-');await page.screenshot({path:`${out}/${stage}-${locale}-${name}-${width}.png`});
   if(route==='/' && width===1440)await page.screenshot({path:`${out}/${stage}-${locale}-home-full.png`,fullPage:true});
   await page.setViewportSize({width:768,height:1000});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));data.overflow768=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));data.overflow320=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   rows.push({...job,status:response.status(),...data,mainHash,errors});
  }catch(e){rows.push({...job,fatal:String(e),errors});}finally{await page.close();}
  writeFileSync(`${out}/${stage}.json`,JSON.stringify({rows},null,2));
 }}));
 const issues=rows.filter(r=>r.fatal||r.errors.length||r.overflow||r.overflow320||r.overflow768||r.h1.length!==1||r.images.some(i=>i.broken)||r.missingAnchors.length);
 writeFileSync(`${out}/${stage}.json`,JSON.stringify({rows,issues},null,2));console.log(JSON.stringify({stage,pages:inventory.length,cases:rows.length,deadLinks,issues:issues.map(r=>({locale:r.locale,route:r.route,width:r.width,fatal:r.fatal,errors:r.errors,overflow:r.overflow,overflow320:r.overflow320,overflow768:r.overflow768,missingAnchors:r.missingAnchors,brokenImages:r.images?.filter(i=>i.broken)}))},null,2));
}finally{await browser.close();}
