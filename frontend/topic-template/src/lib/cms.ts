/** CMS values are supplied with the server-rendered document, never from the ZIP's .env. */
export interface CMSContext {
  locale: string;
  route: string;
  basePath: string;
  siteId: number;
  siteUrl: string;
  canonical: string;
  preview: boolean;
  languages: Record<string, string>;
  formToken: string;
}

declare global {
  var __FREIGHTVANTA_CMS__: CMSContext | undefined;
}

export function cmsContext(): CMSContext | undefined {
  if (globalThis.__FREIGHTVANTA_CMS__) return globalThis.__FREIGHTVANTA_CMS__;
  if (typeof document === 'undefined') return undefined;
  const source = document.getElementById('freightvanta-cms-context')?.textContent;
  if (!source) return undefined;
  globalThis.__FREIGHTVANTA_CMS__ = JSON.parse(source) as CMSContext;
  return globalThis.__FREIGHTVANTA_CMS__;
}

/** Keep the visitor on the same topic when selecting another site language. */
export function languageHref(language: string): string {
  const ctx = cmsContext();
  if (!ctx) return language === 'en' ? '/' : `/${language}`;
  const base = ctx.languages[language] ?? ctx.basePath;
  return `${base}/${ctx.route}`;
}

/** Real CMS paths, including independent language ports and /preview/{site}. */
export function cmsHref(to: string): string {
  const ctx = cmsContext();
  if (!ctx || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to)) return to;
  if (to.startsWith('#/')) to = to.slice(1);
  if (to === '#enquiry') return '#topic-enquiry';
  if (to === '#about') {
    const about = { en: 'about', de: 'ueber-uns', fr: 'a-propos', es: 'quienes-somos', it: 'chi-siamo', nl: 'over-ons' }[ctx.locale] ?? 'about';
    return `${ctx.basePath}/${about}`;
  }
  if (['#services', '#industries', '#process', '#about', '#resources'].includes(to)) {
    return `${ctx.basePath}/${to === '#resources' ? '#guides' : to}`;
  }
  if (!to.startsWith('/')) return to;
  const match = to.match(/^\/(de|fr|es|it|nl)(?=\/|$)/);
  const language = match?.[1] ?? 'en';
  const path = match ? to.slice(match[0].length) || '/' : to;
  const base = ctx.languages[language] ?? ctx.basePath;
  if (path === '/about') {
    const about = { en: 'about', de: 'ueber-uns', fr: 'a-propos', es: 'quienes-somos', it: 'chi-siamo', nl: 'over-ons' }[language] ?? 'about';
    return `${base}/${about}`;
  }
  // These labels are homepage sections in the supplied navigation. Keep CMS
  // content links on the server so the imported SPA cannot replace CMS pages.
  const homeSections: Record<string, string> = {
    '/services': 'services', '/industries': 'industries', '/about': 'about',
    '/solutions': 'services', '/leistungen': 'leistungen', '/branchen': 'branchen',
    '/ablauf': 'ablauf', '/anfrage': 'anfrage', '/kontakt': 'anfrage',
    '/wissen': 'wissen', '/fragen': 'fragen', '/news': 'guides',
    '/servicios': 'soluciones', '/sectores': 'sectores', '/proceso': 'metodo',
    '/solicitud': 'solicitud', '/recursos': 'guias', '/preguntas': 'faq',
    '/secteurs': 'secteurs', '/deroule': 'methode', '/demande': 'demande',
    '/servizi': 'servizi', '/settori': 'settori', '/percorso': 'metodo', '/richiesta': 'richiesta',
    '/diensten': 'diensten', '/sectoren': 'sectoren', '/proces': 'proces', '/aanvraag': 'aanvraag', '/over-ons': 'werkwijze', '/bronnen': 'bronnen',
  };
  if (language === 'fr' && path === '/solutions') return `${base}/#solutions`;
  if (homeSections[path]) return `${base}/#${homeSections[path]}`;
  if (path === '/contact') return `${base}/contact-us`;
  const serviceAliases: Record<string, string> = {
    '/solutions/packaging-branding': '/services/packaging-branding',
    '/solutions/private-label': '/services/private-white-label',
    '/solutions/warehousing-fulfillment': '/services/inventory-storage',
  };
  if (serviceAliases[path]) return `${base}${serviceAliases[path]}`;
  if (path.startsWith('/solutions/')) return `${base}/#services`;
  // The CMS owns the live resource catalogue; the ZIP's demo article slugs
  // should lead to it rather than produce a server-side 404.
  if (path.startsWith('/guides/')) return `${base}/guides`;
  return `${base}${path}`;
}
