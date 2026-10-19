import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='../../output/menu-polish';mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const rows=[];
for(const [path,width] of [['/',1440],['/product-sourcing',1440],['/services/packaging-branding',1815],['/product-sourcing',1280],['/',1120],['/product-sourcing',390],['/product-sourcing',320],['/',320]]){
 const p=await b.newPage({viewport:{width,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://localhost:8082'+path,{waitUntil:'networkidle'});
 const desktop=path==='/'?width>1080:width>=1280;
 if(!desktop){if(path==='/')await p.locator('.fv-de-mobile > summary').click();else await p.getByRole('button',{name:'Menü öffnen'}).click();}
 const selector=desktop?(path==='/'?'.fv-de-nav details':'.de-topic-menu'):(path==='/'?'.fv-de-mobile nav details':'#de-mobile-nav details');
 const service=p.locator(selector).first();await service.locator('summary').click();await expect(service.locator('a')).toHaveCount(6);
 const panel=service.locator(desktop?(path==='/'?'.fv-de-mega':'.de-topic-panel'):'div').first();
 const rect=await panel.boundingBox();if(desktop){expect(rect.width).toBeLessThanOrEqual(880);expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(width);}
 const active=await service.locator('a[aria-current="page"]').count();if(path!=='/')expect(active).toBe(1);
 await p.screenshot({path:out+'/'+path.replaceAll('/','-')+'-'+width+'.png'});
 await p.keyboard.press('Escape');await expect(service).not.toHaveAttribute('open','');await expect(service.locator('summary')).toBeFocused();
 const industry=p.locator(selector).nth(1);await industry.locator('summary').click();await expect(industry.locator('a')).toHaveCount(4);await p.keyboard.press('Escape');
 const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);expect(errors).toEqual([]);
 rows.push({path,width,desktop,menuWidth:rect.width,active,errors,overflow});await p.close();
}
const p=await b.newPage();await p.goto('http://localhost:8082/product-sourcing');await p.locator('.de-topic-menu > summary').first().click();await Promise.all([p.waitForURL('http://localhost:8082/services/packaging-branding'),p.locator('.de-topic-panel a[href="/services/packaging-branding"]').click()]);await expect(p.locator('h1')).toBeVisible();await p.close();await b.close();writeFileSync(out+'/review.json',JSON.stringify({rows,topicClick:'passed'},null,2));console.log(JSON.stringify(rows));
