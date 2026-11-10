const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const sites = [
  ['global', 'en', 'about', 'services'],
  ['germany', 'de', 'abwicklung', 'leistungen'],
  ['france', 'fr', 'operation', 'solutions'],
  ['spain', 'es', 'solicitud', 'soluciones'],
  ['italy', 'it', 'richiesta', 'servizi'],
  ['netherlands', 'nl', 'aanvraag', 'diensten'],
];
const output = path.resolve('.impeccable/review/section-cleanup');

async function run() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--no-proxy-server'] });
  const report = [], captures = { 'home-desktop': [], 'home-mobile': [], 'topic-desktop': [], 'topic-mobile': [] };
  try {
    for (const [site, lang, homeTarget, services] of sites) {
      for (const kind of ['home', 'topic']) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error' && /hydrat|react|uncaught/i.test(m.text())) errors.push(m.text()); });
        const url = `http://127.0.0.1:8180/preview/${site}${kind === 'home' ? '/' : '/services/bulk-procurement'}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        const decline = page.getByRole('button', {name: /^(Decline|Ablehnen|Tout refuser|Refuser|Rechazar|Rifiuta|Rifiuti|Weigeren)$/}).first();
        if (await decline.isVisible()) await decline.click();
        await page.evaluate(async () => {
          for (const section of document.querySelectorAll('main > section, main > div > section')) {
            section.scrollIntoView();
            await new Promise(r => setTimeout(r, 55));
          }
          window.scrollTo(0, 0);
          await document.fonts.ready;
        });
        const checks = { site, kind, url, language: await page.locator('html').getAttribute('lang'), sizes: [], errors };
        checks.languageMatches = checks.language.startsWith(lang);
        const summary = page.locator('main details > summary').first();
        if (await summary.count()) {
          await summary.click();
          checks.faqOpens = await summary.evaluate(n => n.parentElement.open);
          await summary.click();
        }
        const serviceTabs = page.locator(`#${services} [role=tab]`);
        if (kind === 'home' && await serviceTabs.count() > 1) {
          await serviceTabs.nth(1).click();
          checks.serviceTabWorks = await serviceTabs.nth(1).getAttribute('aria-selected') === 'true';
          await serviceTabs.first().click();
        }
        for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 900], ['narrow', 320, 900], ['tablet', 768, 1000]]) {
          await page.setViewportSize({ width, height });
          await page.evaluate(() => window.scrollTo(0, 0));
          const state = await page.evaluate(() => {
            const main = document.querySelector('main');
            const visible = n => !!(n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden');
            const labels = [...main.querySelectorAll('[class]')].filter(n => /eyebrow|kicker|overline/.test(n.className) && visible(n)).map(n => n.textContent.trim());
            const emptyHeadings = [...main.querySelectorAll('h1,h2,h3')].filter(n=>visible(n)&&!n.textContent.trim()).length;
            const unlabeledFields = [...main.querySelectorAll('input,select,textarea')].filter(n=>visible(n)&&n.type!=='hidden'&&!n.labels?.length&&!n.getAttribute('aria-label')&&!n.getAttribute('aria-labelledby')).map(n=>n.name||n.id);
            const overflow = document.documentElement.scrollWidth - window.innerWidth;
            const headingSpacing = [...main.querySelectorAll('section h2')].slice(0, 12).map(n=>({text:n.textContent.trim().slice(0,60),marginTop:getComputedStyle(n).marginTop}));
            return { overflow, labels, emptyHeadings, unlabeledFields, headingSpacing };
          });
          checks.sizes.push({ device, width, ...state });
          if (device === 'mobile') {
            const toggle = page.locator('summary.fv-head-toggle');
            if (await toggle.isVisible()) {
              await toggle.click();
              checks.mobileMenuWorks = await toggle.evaluate(n=>n.parentElement.open);
              await toggle.click();
            }
          }
          if (device === 'desktop' || device === 'mobile') {
            if (kind === 'home') {
              let target = page.locator(`#${homeTarget}`);
              if (!await target.count()) target = page.locator('main section').filter({has:page.locator('form')}).last();
              await target.scrollIntoViewIfNeeded();
              await target.evaluate(n=>window.scrollTo(0,window.scrollY+n.getBoundingClientRect().top-90));
            }
            const buffer = await page.screenshot({ animations: 'disabled' });
            captures[`${kind}-${device}`].push({ site, image: buffer.toString('base64') });
          }
        }
        report.push(checks);
        await page.close();
      }
    }
    // Shared standard inner pages use the same cleaned title and contact patterns.
    for (const suffix of ['about', 'contact']) {
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      await page.goto(`http://127.0.0.1:8180/preview/global/${suffix}`,{waitUntil:'networkidle'});
      const sizes=[];
      for(const width of [1440,390,320,768]) {
        await page.setViewportSize({width,height:1000});
        sizes.push({width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelector('h1')?.textContent.trim(),forms:document.querySelectorAll('main form').length}))});
      }
      report.push({site:'global',kind:suffix,sizes});
      await page.close();
    }
    for(const [name, items] of Object.entries(captures)) {
      const mobile=name.endsWith('mobile'), columns=mobile?3:2, tileWidth=mobile?300:720, imageHeight=mobile?692:500;
      const sheet=await browser.newPage({viewport:{width:columns*tileWidth,height:Math.ceil(items.length/columns)*(imageHeight+32)},deviceScaleFactor:1});
      await sheet.setContent(`<style>*{box-sizing:border-box}body{margin:0;display:grid;grid-template-columns:repeat(${columns},${tileWidth}px);background:#d8dce0;font:14px Arial}figure{margin:0;border:1px solid #b8bec8}figcaption{height:30px;padding:7px 12px;background:#fff}img{display:block;width:100%;height:${imageHeight}px}</style>`+items.map(i=>`<figure><figcaption>${i.site} · ${name}</figcaption><img src="data:image/png;base64,${i.image}"></figure>`).join(''));
      await sheet.locator('img').last().evaluate(n=>n.decode());
      await sheet.screenshot({path:path.join(output,`${name}.png`),fullPage:true});
      await sheet.close();
    }
    fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));
    const issues = report.flatMap(r=>r.sizes.filter(s=>s.overflow>1||s.labels?.length||s.emptyHeadings||s.unlabeledFields?.length).map(s=>({site:r.site,kind:r.kind,...s})))
      .concat(report.filter(r=>r.errors?.length||r.languageMatches===false||r.faqOpens===false||r.serviceTabWorks===false||r.mobileMenuWorks===false).map(r=>({site:r.site,kind:r.kind,errors:r.errors,languageMatches:r.languageMatches,faq:r.faqOpens,tabs:r.serviceTabWorks,menu:r.mobileMenuWorks})));
    console.log(JSON.stringify({pages:report.length,viewportChecks:report.reduce((n,r)=>n+r.sizes.length,0),screenshots:Object.keys(captures).map(k=>path.join(output,k+'.png')),issues},null,2));
    if(issues.length)process.exitCode=1;
  } finally { await browser.close(); }
}
run().catch(e=>{console.error(e);process.exitCode=1});
