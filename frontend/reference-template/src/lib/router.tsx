import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/**
 * Lightweight, site-aware hash router so every navigation target resolves inside the static build.
 *
 *   #/solutions/ocean-freight   → English Global page route
 *   #/de/loesungen/seefracht    → German page route (localized path segments)
 *   #enquiry  /  #/de/#anfrage  → intentional same-page anchors on a homepage
 *
 * In production each localized site is served under its own path prefix (see hreflang links);
 * the prototype keeps both sites in one bundle while sharing the section contract.
 */
export type SiteId = 'en' | 'de' | 'fr' | 'es' | 'it';

type RouteBody =
  | { name: 'home'; anchor: string | null }
  | { name: 'service'; slug: string }
  | { name: 'industries' }
  | { name: 'industry'; slug: string }
  | { name: 'guides' }
  | { name: 'article'; slug: string }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'legal'; slug: string }
  | { name: 'not-found'; path: string };

export type Route = RouteBody & { site: SiteId };

interface SiteSegments {
  solutions: string;
  industries: string;
  guides: string[];
  about: string;
  contact: string;
  legal: string[];
  servicesAnchor: string;
}

export const SITE_SEGMENTS: Record<SiteId, SiteSegments> = {
  en: {
    solutions: 'solutions',
    industries: 'industries',
    guides: ['guides', 'insights'],
    about: 'about',
    contact: 'contact',
    legal: ['privacy', 'cookies', 'terms'],
    servicesAnchor: 'services',
  },
  de: {
    solutions: 'loesungen',
    industries: 'branchen',
    guides: ['ratgeber'],
    about: 'ueber-uns',
    contact: 'kontakt',
    legal: ['impressum', 'datenschutz', 'agb', 'cookies'],
    servicesAnchor: 'leistungen',
  },
  fr: {
    solutions: 'solutions',
    industries: 'secteurs',
    guides: ['guides'],
    about: 'a-propos',
    contact: 'contact',
    legal: ['mentions-legales', 'confidentialite', 'cgv', 'cookies'],
    servicesAnchor: 'solutions',
  },
  es: {
    solutions: 'soluciones',
    industries: 'sectores',
    guides: ['guias'],
    about: 'quienes-somos',
    contact: 'contacto',
    legal: ['aviso-legal', 'privacidad', 'politica-de-cookies', 'condiciones'],
    servicesAnchor: 'soluciones',
  },
  it: {
    solutions: 'servizi',
    industries: 'settori',
    guides: ['guide'],
    about: 'chi-siamo',
    contact: 'contatti',
    legal: ['note-legali', 'privacy', 'cookie', 'condizioni'],
    servicesAnchor: 'servizi',
  },
};

function defaultSite(): SiteId {
  if (typeof document === 'undefined') return 'en';
  const site = document.documentElement.dataset.defaultSite;
  return site === 'de' || site === 'fr' || site === 'es' || site === 'it' || site === 'en' ? site : 'en';
}

export function parseHash(hash: string): Route {
  let raw = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* keep the raw value */
  }

  let anchor: string | null = null;
  const anchorIndex = raw.indexOf('#');
  if (anchorIndex >= 0) {
    anchor = raw.slice(anchorIndex + 1) || null;
    raw = raw.slice(0, anchorIndex);
  }

  // The CMS mounts this original multi-language build on dedicated country
  // domains. The HTML shell declares which localized homepage owns the clean
  // root URL, while the original hash routes remain available unchanged.
  if (raw === '') return { site: defaultSite(), name: 'home', anchor };
  // Legacy English anchors: "#enquiry"
  if (!raw.startsWith('/')) return { site: 'en', name: 'home', anchor: raw };

  let segments = raw.split('/').filter(Boolean);
  let site: SiteId = 'en';
  if (segments[0] === 'de' || segments[0] === 'fr' || segments[0] === 'es' || segments[0] === 'it') {
    site = segments[0];
    segments = segments.slice(1);
  }
  const seg = SITE_SEGMENTS[site];
  const [first, second] = segments;

  if (!first) return { site, name: 'home', anchor };
  if (first === seg.solutions) {
    return second ? { site, name: 'service', slug: second } : { site, name: 'home', anchor: seg.servicesAnchor };
  }
  if (first === seg.industries) return second ? { site, name: 'industry', slug: second } : { site, name: 'industries' };
  if (seg.guides.includes(first)) return second ? { site, name: 'article', slug: second } : { site, name: 'guides' };
  if (first === seg.about) return { site, name: 'about' };
  if (first === seg.contact) return { site, name: 'contact' };
  if (seg.legal.includes(first)) return { site, name: 'legal', slug: first };
  return { site, name: 'not-found', path: raw };
}

export function routeKey(route: Route): string {
  switch (route.name) {
    case 'home':
      return `${route.site}:home`;
    case 'service':
    case 'industry':
    case 'article':
    case 'legal':
      return `${route.site}:${route.name}:${route.slug}`;
    case 'not-found':
      return `${route.site}:not-found:${route.path}`;
    default:
      return `${route.site}:${route.name}`;
  }
}

export function toHref(to: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to)) return to;
  if (to.startsWith('/')) return `#${to}`;
  return to;
}

export const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

/* ---------- scroll memory (restores position on back/forward) ---------- */
let pushIntent = false;
let trackingKey: string | null = null;
const savedScroll = new Map<string, number>();

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      if (trackingKey) savedScroll.set(trackingKey, window.scrollY);
    },
    { passive: true },
  );
}

export function consumePushIntent(): boolean {
  const value = pushIntent;
  pushIntent = false;
  return value;
}
export const resumeScrollTracking = (key: string) => {
  trackingKey = key;
};
export const getSavedScroll = (key: string) => savedScroll.get(key);

/* ---------- provider ---------- */
const RouteContext = createContext<Route>({ site: 'en', name: 'home', anchor: null });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  );

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const sync = () => {
      trackingKey = null; // freeze memory for the page we are leaving
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>;
}

export const useRoute = () => useContext(RouteContext);

export function navigate(to: string) {
  const href = toHref(to);
  if (!href.startsWith('#')) {
    window.location.assign(href);
    return;
  }
  pushIntent = true;
  window.location.hash = href;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  /** Open in a new tab (keeps in-progress form entries intact). */
  newTab?: boolean;
};

export function Link({ to, newTab, onClick, rel, target, children, ...rest }: LinkProps) {
  const href = toHref(to);
  const external = isExternalHref(href);
  const openInNewTab = Boolean(newTab);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || openInNewTab || external) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (href.startsWith('#') && href !== window.location.hash) pushIntent = true;
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target={openInNewTab ? '_blank' : target}
      rel={openInNewTab || (external && target === '_blank') ? 'noopener noreferrer' : rel}
      {...rest}
    >
      {children}
    </a>
  );
}
