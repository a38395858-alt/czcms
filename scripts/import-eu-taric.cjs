// Public European Commission classification trees; no remote JavaScript is executed.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const stamp = date.replaceAll('-', '');
const base = 'https://ec.europa.eu/taxation_customs/dds2/taric/';
const cache = path.join('.tmp', 'eu-taric-import', stamp);
fs.mkdirSync(cache, {recursive: true});
function array(text, name) {
  const start = text.indexOf(name + ' = ');
  if (start < 0) throw new Error('Missing official ' + name);
  const from = text.indexOf('[', start);
  let to = from, depth = 0, quoted = false, escaped = false;
  for (; to < text.length; to++) {
    const ch = text[to];
    if (quoted) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === '"') quoted = false; }
    else if (ch === '"') quoted = true;
    else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) break;
  }
  // The source permits literal tabs in JS strings. JSON requires escaped tabs.
  return JSON.parse(text.slice(from, to + 1).replace(/[\u0000-\u001f]/g, c => JSON.stringify(c).slice(1, -1)));
}
async function get(file) {
  const dest = path.join(cache, file.split('/').at(-1));
  if (fs.existsSync(dest)) return fs.readFileSync(dest, 'utf8');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(base + file, {signal: AbortSignal.timeout(60000)});
      const text = await response.text();
      if (!response.ok || !text.includes('tree = [')) throw new Error('Invalid official response: ' + response.status);
      fs.writeFileSync(dest, text);
      return text;
    } catch (error) { if (attempt === 2) throw error; }
  }
}
async function main() {
  if (process.argv[2] === '--normalize') {
    const dest = 'internal/taric/data/current.json.gz';
    const result = normalize(JSON.parse(zlib.gunzipSync(fs.readFileSync(dest))));
    fs.writeFileSync(dest, zlib.gzipSync(Buffer.from(JSON.stringify(result)), {level:9}));
    console.log(Object.fromEntries(Object.entries(result.languages).map(([lang,rows])=>[lang,rows.length])));
    return;
  }
  const languages = {};
  for (const lang of ['de', 'fr', 'es', 'it', 'nl']) {
    const sections = array(await get(`nomenclaturetree/nomenclaturetree_${lang}_${stamp}.js`), 'sectiontree');
    const chapters = sections.flatMap(s => s[3].map(c => c[3].slice(0, 2)));
    const trees = new Array(chapters.length);
    let next = 0;
    await Promise.all(Array.from({length: 3}, async () => {
      while (next < chapters.length) {
        const i = next++, code = chapters[i];
        trees[i] = array(await get(`nomenclaturetree/nomenclaturetree_${lang}_${stamp}_${code}_${lang}.js`), 'chaptertree');
        if (i % 20 === 0) console.log(`${lang}: ${i + 1}/${chapters.length} chapters`);
      }
    }));
    languages[lang] = trees.flat();
  }
  const result = normalize({date, retrievedAt: new Date().toISOString(), source: base, languages});
  const bytes = zlib.gzipSync(Buffer.from(JSON.stringify(result)), {level: 9});
  const dest = 'internal/taric/data/current.json.gz';
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, bytes);
  fs.writeFileSync('internal/taric/data/current.meta.json', JSON.stringify({date, retrievedAt: result.retrievedAt, source: base, languages: Object.keys(languages), sha256: crypto.createHash('sha256').update(bytes).digest('hex')}, null, 2) + '\n');
  console.log('Saved complete five-language official classification:', bytes.length, 'bytes');
}
function plain(text) {
  return (text||'').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,v)=>String.fromCodePoint(v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):+v)).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim();
}
function normalize(data) {
  if (data.notes) return data;
  data.notes={};
  for(const [lang,trees] of Object.entries(data.languages)) {
    const entries=new Map(), notes={};
    function walk(rows,hierarchy=[],inherited=[],unit='') {
      for(const n of rows){
        const keys=[...inherited];
        for(const f of n[6]||[]){const key=f[1]+f[2];notes[key]=plain(f[3]);if(!keys.includes(key))keys.push(key);}
        const description=plain(n[5]), u=n[10]||unit;
        if(n[7]?.length)walk(n[7],[...hierarchy,{code:n[3]==='80'?headingCode(n[2]):'',description}],keys,u);
        else if(n[3]==='80')entries.set(n[2],{code:n[2],description,hierarchy,unit:u,notes:keys});
      }
    }
    walk(trees);data.languages[lang]=[...entries.values()];data.notes[lang]=notes;
  }
  return data;
}
function headingCode(code){let n=2;for(let i=2;i<code.length;i++)if(code[i]!=='0')n=i+1;return code.slice(0,n%2?n+1:n);}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
