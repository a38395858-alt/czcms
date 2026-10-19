import {chromium} from '@playwright/test';import {writeFileSync,mkdirSync} from 'node:fs';
const b=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const rows=[];mkdirSync('../../output/navigation-review',{recursive:true});
for(const port of [8081,8082,8083,8084,8085,8086])for(const path of ['/','/product-sourcing']){
 const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[],failed=[];
 p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()})});
 const start=Date.now();await p.goto(`http://localhost:${port}${path}`,{waitUntil:'networkidle',timeout:30000}).catch(e=>errors.push(e.message));
 const data=await p.evaluate(()=>({lang:document.documentElement.lang,body:document.body.className,template:document.body.dataset.topicTemplate,scripts:[...document.scripts].map(e=>e.src).filter(Boolean),links:[...document.querySelectorAll('a[hreflang],.language-menu a,.language-switcher a,[data-language-menu] a')].map(e=>({label:e.textContent.trim(),href:e.getAttribute('href')})),h1:document.querySelector('h1')?.textContent}));
 rows.push({port,path,ms:Date.now()-start,errors,failed,...data});console.log(JSON.stringify(rows.at(-1)));await p.close();
}
writeFileSync('../../output/navigation-review/after.json',JSON.stringify(rows,null,2));await b.close();
