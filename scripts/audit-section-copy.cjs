const { chromium } = require('../frontend/topic-template/node_modules/@playwright/test')
const fs = require('node:fs')
const path = require('node:path')
const sites = ['global', 'germany', 'france', 'spain', 'italy', 'netherlands']
const phase = process.argv[2] || 'before'
async function run() {
  const output = path.resolve('.tmp/section-cleanup')
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ channel:'msedge',headless:true,args:['--no-proxy-server'] })
  try {
    const page = await browser.newPage()
    const records = []
    for (const site of sites) {
      const map = await (await fetch(`http://127.0.0.1:8180/preview/${site}/sitemap.xml`)).text()
      const urls = [...map.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
      for (let start=0;start<urls.length;start+=4) {
        const batch = await Promise.all(urls.slice(start,start+4).map(async url => {
          const response = await fetch(url)
          return {url,status:response.status,html:await response.text()}
        }))
        for (const record of batch) {
          records.push(await page.evaluate(({site,url,status,html}) => {
            const doc = new DOMParser().parseFromString(html,'text/html')
            const main = doc.querySelector('main') || doc.body
            const text = node => node?.textContent.replace(/\s+/g,' ').trim() || ''
            const labels = [...main.querySelectorAll('[class]')].filter(n => /(?:eyebrow|kicker|overline|(?:section|panel|hero|intro|entry|form|enquiry)-(?:label|tag))/i.test(n.className)).map(n => ({tag:n.tagName,class:n.className,text:text(n),next:text(n.nextElementSibling).slice(0,150)}))
            const sections = [...main.querySelectorAll('section')].map(n=>({id:n.id,heading:text(n.querySelector('h1,h2,h3')),lead:[...n.querySelectorAll('p')].filter(p=>p.closest('section')===n).slice(0,3).map(text)}))
            const brokenSectionLabels = [...main.querySelectorAll('section[aria-labelledby]')].filter(n=>n.getAttribute('aria-labelledby').split(/\s+/).some(id=>!doc.getElementById(id))).map(n=>({id:n.id,label:n.getAttribute('aria-labelledby')}))
            const fields = [...main.querySelectorAll('form input,form select,form textarea')].map(n=>({name:n.name,type:n.type,required:n.required}))
            return {site,url,status,h1:[...main.querySelectorAll('h1')].map(text),labels,sections,forms:main.querySelectorAll('form').length,fields,brokenSectionLabels}
          }, {site,...record}))
        }
      }
    }
    fs.writeFileSync(path.join(output,phase+'.json'),JSON.stringify(records,null,2))
    console.log(JSON.stringify(sites.map(site=>{const rows=records.filter(r=>r.site===site);return {site,pages:rows.length,sections:rows.reduce((n,r)=>n+r.sections.length,0),labels:rows.reduce((n,r)=>n+r.labels.length,0),bad:rows.filter(r=>r.status!==200).map(r=>r.url)}}),null,2))
    if (phase === 'after' && fs.existsSync(path.join(output,'before.json'))) {
      const before = JSON.parse(fs.readFileSync(path.join(output,'before.json'),'utf8'))
      const changes = records.flatMap(row=>{
        const old = before.find(x=>x.url===row.url)
        if (!old) return [{url:row.url,newPage:true}]
        const diff = {url:row.url}
        if (old.status !== row.status) diff.status = [old.status,row.status]
        if (JSON.stringify(old.h1) !== JSON.stringify(row.h1)) diff.h1 = [old.h1,row.h1]
        if (old.forms !== row.forms) diff.forms = [old.forms,row.forms]
        if (old.sections.length !== row.sections.length) diff.sections = [old.sections.length,row.sections.length]
        if (row.brokenSectionLabels.length) diff.brokenSectionLabels = row.brokenSectionLabels
        return Object.keys(diff).length>1?[diff]:[]
      })
      fs.writeFileSync(path.join(output,'structural-comparison.json'),JSON.stringify(changes,null,2))
      console.log(JSON.stringify({structuralChanges:changes},null,2))
    }
  } finally {await browser.close()}
}
run().catch(e=>{console.error(e);process.exitCode=1})
