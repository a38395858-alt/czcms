import {chromium} from '@playwright/test';import {readFileSync,writeFileSync} from 'node:fs';
const names=JSON.parse(readFileSync('../../.tmp/tall-topic-captures.json','utf8'));
const b=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const rows=[];
for(const name of names){
 const ref=name.endsWith('-reference');const clean=ref?name.slice(0,-10):name;
 const locale=clean.slice(0,2);const route=clean.slice(3,-7).replace(/^services-/, 'services/').replace(/^industries-/,'industries/');
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.addInitScript(()=>localStorage.setItem('fv.analytics-consent.v1','denied'));
 await p.goto(ref?`http://127.0.0.1:4178/#${locale==='de'?'/de':''}/${route}`:`http://localhost:${locale==='en'?8081:8082}/${route}`,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager'});await p.waitForTimeout(400);
 const height=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<height;y+=8000) await p.screenshot({path:`../../output/topic18-review/${name}-tile-${y}.png`,clip:{x:0,y,width:390,height:Math.min(8000,height-y)},captureBeyondViewport:true,fullPage:true});
 rows.push({name,height,tileHeight:8000});console.log(name,height);await p.close();
}
writeFileSync('../../output/topic18-review/tile-captures.json',JSON.stringify(rows,null,2));await b.close();

