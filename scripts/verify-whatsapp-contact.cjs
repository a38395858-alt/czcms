const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium, expect } = require('../frontend/topic-template/node_modules/@playwright/test');
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const origin = process.env.WHATSAPP_CHECK_ORIGIN || 'http://127.0.0.1:8180';
const live = origin === 'live';
const dir = process.env.WHATSAPP_CHECK_OUTPUT || 'output/whatsapp-contact-20261109';
fs.mkdirSync(dir, { recursive: true });
const markets = [['global','en','freightvanta.com','contact'],['germany','de','de.freightvanta.com','kontakt'],['france','fr','fr.freightvanta.com','contact'],['spain','es','es.freightvanta.com','contacto'],['italy','it','it.freightvanta.com','contatti'],['netherlands','nl','nl.freightvanta.com','contact']].filter(([site])=>!process.env.WHATSAPP_CHECK_SITE || site===process.env.WHATSAPP_CHECK_SITE);
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-proxy-server'] });
  const checks = [], errors = [];
  let popupChecks = 0;
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 900 }, ...(mobile ? { isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' } : {}) });
      await context.addInitScript(() => localStorage.setItem('fv.analytics-consent.v1', 'denied'));
      await context.route(/https:\/\/(?:web\.whatsapp\.com|wa\.me)\//, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>WhatsApp link check only</title>' }));
      for (const [site, locale, host, contact] of markets) {
        for (const route of ['', '/product-sourcing', '/'+contact, locale === 'en' ? '/tools/hts-code-lookup' : '/tools/taric-code-lookup']) {
          const page = await context.newPage();
          page.on('pageerror', error => errors.push({ site, route, mobile, error: error.message }));
          const url = live ? `https://${host}${route || '/'}` : `${origin}/preview/${site}${route}`;
          for (let attempt = 0; ; attempt++) {
            try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }); break; }
            catch (error) { if (attempt >= 1) throw error; }
          }
          const link = page.locator('[data-whatsapp-contact]');
          await expect(link).toHaveCount(1);
          await expect(link).toBeVisible();
          const destination = mobile ? 'https://wa.me/8613538281696' : 'https://web.whatsapp.com/send?phone=8613538281696';
          await expect(link).toHaveAttribute('href', destination);
          await expect(link).toHaveAttribute('target', '_blank');
          assert.ok(await link.getAttribute('aria-label'));
          const metrics = await link.evaluate(el => {
            const r = el.getBoundingClientRect(), style = getComputedStyle(el);
            return { x:r.x, y:r.y, width:r.width, height:r.height, right:innerWidth-r.right, position:style.position, visibleAtCenter:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-whatsapp-contact]')===el, textVisible:getComputedStyle(el.querySelector('span')).display!=='none', pageWidth:document.documentElement.scrollWidth, viewport:innerWidth };
          });
          assert.equal(metrics.position, 'fixed');
          assert.ok(metrics.width >= 44 && metrics.height >= 44 && metrics.right >= 10);
          assert.ok(metrics.visibleAtCenter, JSON.stringify({site,route,mobile,metrics}));
          assert.ok(metrics.pageWidth <= metrics.viewport+1);
          if (route === '') await page.screenshot({ path:`${dir}/${locale}-${mobile?'mobile':'desktop'}.png`, animations:'disabled' });
          if (site === 'germany' && route === '') {
            const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);
            await popup.waitForLoadState('domcontentloaded');
            assert.equal(popup.url(), destination);
            popupChecks++;
            await popup.close();
          }
          checks.push({site,route,mobile,destination,...metrics});
          fs.writeFileSync(`${dir}/verification.json`,JSON.stringify({checks,errors,complete:false,messagesSent:0},null,2));
          await page.close();
        }
        console.log(JSON.stringify({site,mobile,pages:checks.length}));
      }
      await context.close();
    }
    // The entry must remain reachable before the visitor makes a cookie choice.
    const page = await browser.newPage({ viewport:{width:390,height:844} });
    await page.goto(live ? 'https://de.freightvanta.com/' : `${origin}/preview/germany`, {waitUntil:'networkidle'});
    const reachable = await page.locator('[data-whatsapp-contact]').evaluate(el=>{ const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-whatsapp-contact]')===el; });
    assert.ok(reachable,'Cookie prompt covers the contact entry');
    await page.screenshot({path:`${dir}/de-mobile-first-visit.png`,animations:'disabled'});
    await page.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(`${dir}/verification.json`,JSON.stringify({checks,errors,popupChecks,popupDestinationsVerified:popupChecks===2,messagesSent:0},null,2));
    console.log(JSON.stringify({pages:checks.length,errors:errors.length,popupChecks,messagesSent:0}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
