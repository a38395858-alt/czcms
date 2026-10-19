import { writePreloads } from '../../shared/build-preloads';
import { renderToString } from 'react-dom/server';
import { mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import TopicApp from './TopicApp';
import { topicDefinitions } from './languages/server';
import { PRODUCT_SOURCING_TOPIC, SERVICE_TOPICS, INDUSTRY_TOPICS } from './content/en-global/topics';
import { getMedia } from './content/media';

const output = resolve('dist');
const shell = readFileSync(resolve(output, 'index.html'), 'utf8');
const cssPath = shell.match(/href="([^"]+\.css)"/)?.[1];
const jsPath = shell.match(/src="([^"]+\.js)"/)?.[1];
const versioned = (path: string | undefined) => path && `${path}?v=${createHash('sha256').update(readFileSync(resolve(output, 'assets', path.split('/').pop()!))).digest('hex').slice(0, 12)}`;
const css = versioned(cssPath);
// The entry filename is content-addressed. A query variant would give the
// shared imports a second module identity and could initialize React twice.
const js = jsPath;
if (!css || !js) throw new Error('Missing compiled topic assets');
const preloads = writePreloads(output, '/assets/freightvanta-topic-v18/', Object.fromEntries(['en','de','fr','es','it','nl'].map(locale => [locale, `src/languages/${locale}.tsx`])));
mkdirSync(resolve(output, 'pages'), { recursive: true });
const routes = [PRODUCT_SOURCING_TOPIC.route, ...Object.values(SERVICE_TOPICS).map(t => t.route), ...Object.values(INDUSTRY_TOPICS).map(t => t.route)];
const manifest: Record<string, unknown> = {};
for (const locale of ['en', 'de', 'es', 'fr', 'it', 'nl']) {
  for (const route of routes) {
    const clean = route.replace(/^\//, '');
    const definition = topicDefinitions[locale];
    const topic = definition.content(clean)!;
    globalThis.__FREIGHTVANTA_CMS__ = {
      locale, route: clean, basePath: `__FV_SITE_${locale}__`, siteId: 0,
      siteUrl: '__FV_ORIGIN__', canonical: '', preview: true, formToken: '',
      languages: Object.fromEntries(['en', 'de', 'fr', 'es', 'it', 'nl'].map(l => [l, `__FV_SITE_${l}__`])),
    };
    const file = `${locale}-${clean.replace(/\//g, '-')}.html`;
    const body = renderToString(<TopicApp definition={definition} />);
    writeFileSync(resolve(output, 'pages', file), body);
    const faqSection = topic.sections.find(s => s.type === 'faq');
    manifest[`${locale}/${clean}`] = {
      file, css, js, preloads: preloads[locale], title: topic.meta.title, description: topic.meta.description,
      keywords: topic.meta.keywords, heading: topic.hero.title, body: topic.hero.body,
      serviceName: topic.serviceName ?? '',
      image: getMedia(topic.hero.mediaId).src,
      faqs: faqSection?.type === 'faq' ? faqSection.content.items : [],
    };
  }
}
writeFileSync(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
cpSync(output, resolve('../assets/freightvanta-topic-v18'), { recursive: true });
console.log(`Prerendered ${Object.keys(manifest).length} English/German/Spanish/French/Italian/Dutch topic pages.`);
