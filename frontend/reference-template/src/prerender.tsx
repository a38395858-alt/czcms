import { writePreloads } from '../../shared/build-preloads';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import CmsHome from './CmsHome';
import fr from './sites/fr/HomeClient';
import es from './sites/es/HomeClient';
import it from './sites/it/HomeClient';
const definitions = { fr, es, it };
const locales = ['fr', 'es', 'it'] as const;
writePreloads('dist', '/assets/freightvanta-template/', { fr:'src/sites/fr/HomeClient.tsx', es:'src/sites/es/HomeClient.tsx', it:'src/sites/it/HomeClient.tsx' });
mkdirSync('dist/pages', { recursive: true });
for (const locale of locales) {
  globalThis.__FV_HOME__ = { sharedHeader: true, locale, languages: Object.fromEntries(['en','de','fr','es','it','nl'].map(code => [code, `__FV_HOME_${code}__`])) };
  writeFileSync(`dist/pages/${locale}-home.html`, renderToString(<StrictMode><CmsHome definition={definitions[locale]} /></StrictMode>));
}
cpSync(resolve('dist'), resolve('../assets/freightvanta-template'), { recursive: true });
console.log(`Prerendered ${locales.join(', ')} homepages.`);
