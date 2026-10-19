import { writePreloads } from '../../shared/build-preloads';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import CmsHome from './CmsHome';
const locales = ['nl'];
writePreloads('dist', '/assets/nl-template/', { nl:'src/CmsHome.tsx' });
mkdirSync('dist/pages', { recursive: true });
for (const locale of locales) {
  globalThis.__FV_HOME__ = { locale, languages: Object.fromEntries(['en','de','fr','es','it','nl'].map(code => [code, `__FV_HOME_${code}__`])) };
  writeFileSync(`dist/pages/${locale}-home.html`, renderToString(<StrictMode><CmsHome /></StrictMode>));
}
cpSync(resolve('dist'), resolve('../assets/nl-template'), { recursive: true });
console.log(`Prerendered ${locales.join(', ')} homepages.`);
