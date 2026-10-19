import {chromium,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const b=await chromium.launch({headless:true,executablePath:'C:/Users/pc/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'});
const checks=[];
for(const width of [320,390,1120,1440]){
 const p=await b.newPage({viewport:{width,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:8082/',{waitUntil:'networkidle'});
 expect(await p.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 if(width===1440){const menu=p.locator('.fv-de-nav details').nth(1);await menu.locator('summary').click();await expect(menu.locator('a')).toHaveCount(4);await p.mouse.click(10,650);await expect(menu).not.toHaveAttribute('open','');}
 if(width===320){await p.locator('.fv-de-mobile > summary').click();await p.locator('.fv-de-mobile nav details').first().locator('summary').click();await expect(p.locator('.fv-de-mobile .fv-de-mega').first().locator('a')).toHaveCount(6);expect(await p.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await p.screenshot({path:'../../output/navigation-review/8082-home-320-confirmation.png'});}
 expect(errors).toEqual([]);checks.push({width,errors,overflow:false});await p.close();
}
// Native localized service pages retain the new language selector and the route.
const p=await b.newPage();await p.goto('http://localhost:8083/services/packaging-branding');
const language=p.locator('.product-sourcing-language');await expect(language).toHaveCount(1);await language.locator('summary').click();await expect(language.locator('a[lang^="de"]')).toHaveAttribute('href','http://localhost:8082/services/packaging-branding');
await p.close();await b.close();
const file='../../output/navigation-review/verification.json';const report=JSON.parse(readFileSync(file,'utf8'));report.finalConfirmation={checks,nativeServiceLanguageLink:true,resolved:'German homepage long industry title wraps at 320px',status:'passed'};writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify(report.finalConfirmation));
