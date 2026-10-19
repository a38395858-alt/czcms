import { cmsContext, cmsHref } from './cms';
import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/**
 * Lightweight hash router so every navigation target resolves inside the static build.
 *  - `#/solutions/ocean-freight` → a page route
 *  - `#enquiry`                  → an intentional same-page anchor on the homepage
 */
export type LegalSlug = 'privacy' | 'cookies' | 'terms';

export type DeLegalSlug = 'impressum' | 'datenschutz';
export type FrLegalSlug = 'mentions-legales' | 'confidentialite';
export type EsLegalSlug = 'aviso-legal' | 'privacidad' | 'cookies';
export type ItLegalSlug = 'note-legali' | 'privacy' | 'cookie';
export type NlLegalSlug = 'juridisch' | 'privacy' | 'cookies';

export type Route =
  | { name: 'home'; anchor: string | null }
  | { name: 'service'; slug: string }
  | { name: 'product-sourcing' }
  | { name: 'service-topic'; slug: string }
  | { name: 'industries' }
  | { name: 'industry'; slug: string }
  | { name: 'guides' }
  | { name: 'article'; slug: string }
  | { name: 'news' }
  | { name: 'news-article'; slug: string }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'legal'; slug: LegalSlug }
  | { name: 'de-home'; anchor: string | null }
  | { name: 'de-legal'; slug: DeLegalSlug }
  | { name: 'de-product-sourcing' }
  | { name: 'de-topic'; kind: 'service' | 'industry'; slug: string }
  | { name: 'fr-home'; anchor: string | null }
  | { name: 'fr-legal'; slug: FrLegalSlug }
  | { name: 'es-home'; anchor: string | null }
  | { name: 'es-legal'; slug: EsLegalSlug }
  | { name: 'it-home'; anchor: string | null }
  | { name: 'it-legal'; slug: ItLegalSlug }
  | { name: 'nl-home'; anchor: string | null }
  | { name: 'nl-legal'; slug: NlLegalSlug }
  | { name: 'not-found'; path: string };

export function parseHash(hash: string): Route {
  let raw = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* keep the raw value */
  }
  if (raw === '' || raw === '/') return { name: 'home', anchor: null };
  if (!raw.startsWith('/')) return { name: 'home', anchor: raw };

  const [first, second, third] = raw.replace(/\/+$/, '').split('/').filter(Boolean);
  switch (first) {
    case 'solutions':
      // The full Product Sourcing topic page lives at /product-sourcing; the legacy
      // /solutions/product-sourcing URL renders the same page (canonical stays /product-sourcing).
      if (second === 'product-sourcing') return { name: 'product-sourcing' };
      return second ? { name: 'service', slug: second } : { name: 'home', anchor: 'services' };
    case 'services':
      // English topic pages (/services/bulk-procurement, …). A bare /services
      // has no index page, so it resolves to the homepage service section.
      return second ? { name: 'service-topic', slug: second } : { name: 'home', anchor: 'services' };
    case 'product-sourcing':
      return { name: 'product-sourcing' };
    case 'industries':
      return second ? { name: 'industry', slug: second } : { name: 'industries' };
    case 'guides':
    case 'insights':
      return second ? { name: 'article', slug: second } : { name: 'guides' };
    case 'about':
      return { name: 'about' };
    case 'contact':
      return { name: 'contact' };
    case 'privacy':
    case 'cookies':
    case 'terms':
      return { name: 'legal', slug: first };
    case 'de': {
      // German site: /de is its own homepage; /de/impressum + /de/datenschutz are pages;
      // /de/product-sourcing, /de/services/* and /de/industries/* are topic pages;
      // any other segment is an in-page anchor on the German homepage.
      if (!second) return { name: 'de-home', anchor: null };
      if (second === 'impressum' || second === 'datenschutz') return { name: 'de-legal', slug: second };
      if (second === 'product-sourcing') return { name: 'de-product-sourcing' };
      if (second === 'services' && third) return { name: 'de-topic', kind: 'service', slug: third };
      if (second === 'industries' && third) return { name: 'de-topic', kind: 'industry', slug: third };
      return { name: 'de-home', anchor: second };
    }
    case 'fr': {
      if (!second) return { name: 'fr-home', anchor: null };
      if (second === 'mentions-legales' || second === 'confidentialite') return { name: 'fr-legal', slug: second };
      return { name: 'fr-home', anchor: second };
    }
    case 'es': {
      if (!second) return { name: 'es-home', anchor: null };
      if (second === 'aviso-legal' || second === 'privacidad' || second === 'cookies')
        return { name: 'es-legal', slug: second };
      return { name: 'es-home', anchor: second };
    }
    case 'it': {
      if (!second) return { name: 'it-home', anchor: null };
      if (second === 'note-legali' || second === 'privacy' || second === 'cookie')
        return { name: 'it-legal', slug: second };
      return { name: 'it-home', anchor: second };
    }
    case 'nl': {
      if (!second) return { name: 'nl-home', anchor: null };
      if (second === 'juridisch' || second === 'privacy' || second === 'cookies')
        return { name: 'nl-legal', slug: second };
      return { name: 'nl-home', anchor: second };
    }
    default:
      return { name: 'not-found', path: raw };
  }
}

export function routeKey(route: Route): string {
  switch (route.name) {
    case 'home':
      return 'home';
    case 'de-home':
      return 'de-home';
    case 'fr-home':
      return 'fr-home';
    case 'es-home':
      return 'es-home';
    case 'it-home':
      return 'it-home';
    case 'nl-home':
      return 'nl-home';
    case 'service':
    case 'service-topic':
    case 'industry':
    case 'article':
    case 'news-article':
    case 'legal':
      return `${route.name}:${route.slug}`;
    case 'de-product-sourcing':
      return 'de-product-sourcing';
    case 'de-topic':
      return `de-topic:${route.kind}:${route.slug}`;
    case 'de-legal':
    case 'fr-legal':
    case 'es-legal':
    case 'it-legal':
    case 'nl-legal':
      return `${route.name}:${route.slug}`;
    case 'not-found':
      return `not-found:${route.path}`;
    default:
      return route.name;
  }
}

export function toHref(to: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to)) return to;
  if (cmsContext()) return cmsHref(to);
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
const RouteContext = createContext<Route>({ name: 'home', anchor: null });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() =>
    cmsContext() ? parseHash(`#${cmsContext()!.locale === 'de' ? '/de' : ''}/${cmsContext()!.route}`) : parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  );

  useEffect(() => {
    if (!cmsContext() && 'scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const sync = () => {
      trackingKey = null; // freeze memory for the page we are leaving
      if (!cmsContext()) setRoute(parseHash(window.location.hash));
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
