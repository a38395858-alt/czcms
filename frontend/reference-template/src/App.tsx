import { useEffect, useRef, type MouseEvent } from 'react';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { SiteFooter } from './components/layout/Footer';
import { AnnouncementBar, SiteHeader } from './components/layout/Header';
import { LocaleSuggestion } from './components/layout/LocaleSuggestion';
import { SITE_META } from './config/site';
import {
  RouterProvider,
  consumePushIntent,
  getSavedScroll,
  resumeScrollTracking,
  routeKey,
  useRoute,
  type Route,
} from './lib/router';
import { AboutPage, ContactPage, LegalPage, NotFoundPage, isLegalSlug } from './pages/CompanyPages';
import { ArticlePage, GuidesPage } from './pages/GuidePages';
import { HomePage } from './pages/HomePage';
import { IndustriesPage, IndustryPage } from './pages/IndustryPages';
import { ServicePage } from './pages/ServicePage';
import { DeLayout } from './sites/de/DeLayout';
import { ensureEnFonts } from './sites/en/fonts';
import { EsLayout } from './sites/es/EsLayout';
import { FrLayout } from './sites/fr/FrLayout';
import { ItLayout } from './sites/it/ItLayout';

function EnPageSwitch({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'service':
      return <ServicePage key={route.slug} slug={route.slug} />;
    case 'industries':
      return <IndustriesPage />;
    case 'industry':
      return <IndustryPage key={route.slug} slug={route.slug} />;
    case 'guides':
      return <GuidesPage />;
    case 'article':
      return <ArticlePage key={route.slug} slug={route.slug} />;
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'legal':
      return isLegalSlug(route.slug) ? <LegalPage key={route.slug} slug={route.slug} /> : <NotFoundPage path={`/${route.slug}`} />;
    default:
      return <NotFoundPage path={route.path} />;
  }
}

/** Jump without smooth scrolling (works in browsers that do not support behavior: 'instant'). */
function jump(action: () => void) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  action();
  root.style.scrollBehavior = previous;
}

function focusWithoutScroll(element: HTMLElement) {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
    element.style.outline = 'none';
  }
  element.focus({ preventScroll: true });
}

/** Scroll + focus management: new pages start at the top, anchors land below the sticky header. */
function useRouteScroll(route: Route) {
  const key = routeKey(route);
  const anchor = route.name === 'home' ? route.anchor : null;
  const anchorKey = `${key}#${anchor ?? ''}`;
  const previousKey = useRef<string | null>(null);
  const previousAnchorKey = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousKey.current;
    const previousAnchor = previousAnchorKey.current;
    previousKey.current = key;
    previousAnchorKey.current = anchorKey;
    const firstRender = previous === null;
    const pageChanged = !firstRender && previous !== key;
    const anchorChanged = !firstRender && previousAnchor !== anchorKey;
    const isPush = consumePushIntent();

    requestAnimationFrame(() => {
      if (pageChanged || firstRender || (anchor && anchorChanged)) {
        const saved = getSavedScroll(key);
        if (pageChanged && !isPush && saved !== undefined && !anchor) {
          jump(() => window.scrollTo(0, saved));
        } else if (anchor) {
          const target = document.getElementById(anchor);
          if (target) {
            jump(() => target.scrollIntoView({ block: 'start' }));
            if (pageChanged || anchorChanged) focusWithoutScroll(target);
          }
        } else if (pageChanged) {
          jump(() => window.scrollTo(0, 0));
        }
        if (pageChanged && !anchor) {
          const main = document.getElementById('main');
          if (main) focusWithoutScroll(main);
        }
      }
      resumeScrollTracking(key);
    });
  }, [key, anchor, anchorKey]);
}

function useSiteDocument(route: Route) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = SITE_META[route.site].locale;
    root.dataset.site = route.site;
    if (route.site === 'en') ensureEnFonts();
  }, [route.site]);
}

const focusMain = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const main = document.getElementById('main');
  if (!main) return;
  focusWithoutScroll(main);
  jump(() => main.scrollIntoView({ block: 'start' }));
};

function EnLayout({ route }: { route: Route }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy-900 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <LocaleSuggestion site="en" />
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <EnPageSwitch route={route} />
      </main>
      <SiteFooter />
      <ConsentBanner />
    </div>
  );
}

function Root() {
  const route = useRoute();
  useRouteScroll(route);
  useSiteDocument(route);
  if (route.site === 'de') return <DeLayout route={route} focusMain={focusMain} />;
  if (route.site === 'fr') return <FrLayout route={route} focusMain={focusMain} />;
  if (route.site === 'es') return <EsLayout route={route} focusMain={focusMain} />;
  if (route.site === 'it') return <ItLayout route={route} focusMain={focusMain} />;
  return <EnLayout route={route} />;
}

export default function App() {
  return (
    <RouterProvider>
      <Root />
    </RouterProvider>
  );
}
