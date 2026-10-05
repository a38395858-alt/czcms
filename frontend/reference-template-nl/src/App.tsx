import { useEffect, useRef, type MouseEvent } from 'react';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { SiteFooter } from './components/layout/Footer';
import { AnnouncementBar, SiteHeader } from './components/layout/Header';
import {
  RouterProvider,
  consumePushIntent,
  getSavedScroll,
  resumeScrollTracking,
  routeKey,
  useRoute,
  type Route,
} from './lib/router';
import { DeFooter, DeHeader } from './components/de/GermanChrome';
import { EsFooter, EsHeader } from './components/es/SpanishChrome';
import { FrFooter, FrHeader } from './components/fr/FrenchChrome';
import { ItFooter, ItHeader } from './components/it/ItalianChrome';
import { NlFooter, NlHeader } from './components/nl/DutchChrome';
import { AboutPage, ContactPage, LegalPage, NotFoundPage } from './pages/CompanyPages';
import { FrenchHomePage, FrenchLegalPage } from './pages/FrenchPages';
import { SpanishHomePage, SpanishLegalPage } from './pages/SpanishPages';
import { ItalianHomePage, ItalianLegalPage } from './pages/ItalianPages';
import { DutchHomePage, DutchLegalPage } from './pages/DutchPages';
import { GermanHomePage, GermanLegalPage } from './pages/GermanPages';
import { ArticlePage, GuidesPage } from './pages/GuidePages';
import { HomePage } from './pages/HomePage';
import { IndustriesPage, IndustryPage } from './pages/IndustryPages';
import { ServicePage } from './pages/ServicePage';

function PageSwitch({ route }: { route: Route }) {
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
      return <LegalPage key={route.slug} slug={route.slug} />;
    case 'de-home':
      return <GermanHomePage />;
    case 'de-legal':
      return <GermanLegalPage key={route.slug} slug={route.slug} />;
    case 'fr-home':
      return <FrenchHomePage />;
    case 'fr-legal':
      return <FrenchLegalPage key={route.slug} slug={route.slug} />;
    case 'es-home':
      return <SpanishHomePage />;
    case 'es-legal':
      return <SpanishLegalPage key={route.slug} slug={route.slug} />;
    case 'it-home':
      return <ItalianHomePage />;
    case 'it-legal':
      return <ItalianLegalPage key={route.slug} slug={route.slug} />;
    case 'nl-home':
      return <DutchHomePage />;
    case 'nl-legal':
      return <DutchLegalPage key={route.slug} slug={route.slug} />;
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
  const previousKey = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousKey.current;
    previousKey.current = key;
    const pageChanged = previous !== null && previous !== key;
    const isPush = consumePushIntent();
    const anchor =
      route.name === 'home' ||
      route.name === 'de-home' ||
      route.name === 'fr-home' ||
      route.name === 'es-home' ||
      route.name === 'it-home' ||
      route.name === 'nl-home'
        ? route.anchor
        : null;

    requestAnimationFrame(() => {
      if (pageChanged || previous === null) {
        const saved = getSavedScroll(key);
        if (pageChanged && !isPush && saved !== undefined && !anchor) {
          jump(() => window.scrollTo(0, saved));
        } else if (anchor) {
          const target = document.getElementById(anchor);
          if (target) {
            jump(() => target.scrollIntoView({ block: 'start' }));
            if (pageChanged) focusWithoutScroll(target);
          }
        } else if (pageChanged) {
          jump(() => window.scrollTo(0, 0));
        }
        if (pageChanged && !anchor) {
          const main = document.getElementById('main');
          if (main) focusWithoutScroll(main);
        }
      } else if (anchor && isPush) {
        // Same-page anchor navigation via path-style hashes (e.g. #/de → #/de/anfrage):
        // the browser has no matching element id, so the router scrolls explicitly.
        const target = document.getElementById(anchor);
        if (target) jump(() => target.scrollIntoView({ block: 'start' }));
      }
      resumeScrollTracking(key);
    });
  }, [key, route]);
}

function SkipLink({ label }: { label: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById('main');
    if (!main) return;
    focusWithoutScroll(main);
    jump(() => main.scrollIntoView({ block: 'start' }));
  };
  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy-900 focus:shadow-lg"
    >
      {label}
    </a>
  );
}

function Layout() {
  const route = useRoute();
  useRouteScroll(route);
  // Localized sites are their own templates with their own chrome:
  // DE «Speicherstadt», FR «Affiche Atlantique», ES «Mediterráneo Azulejo»,
  // IT «Piazza Italiana», NL «Deltaraster».
  const isGerman = route.name === 'de-home' || route.name === 'de-legal';
  const isFrench = route.name === 'fr-home' || route.name === 'fr-legal';
  const isSpanish = route.name === 'es-home' || route.name === 'es-legal';
  const isItalian = route.name === 'it-home' || route.name === 'it-legal';
  // The Netherlands bundle also owns the clean public service/industry paths
  // rendered by CZCMS. Keep the Dutch chrome around those pages so a direct
  // visit to /services/... does not silently fall back to the English shell.
  const defaultSite = typeof document !== 'undefined' ? document.documentElement.dataset.defaultSite : '';
  const isDutch =
    route.name === 'nl-home' ||
    route.name === 'nl-legal' ||
    (defaultSite === 'nl' && ['home', 'service', 'industries', 'industry', 'guides', 'article', 'about', 'contact', 'legal'].includes(route.name));
  const skipLabel = isGerman
    ? 'Zum Inhalt springen'
    : isFrench
      ? 'Aller au contenu'
      : isSpanish
        ? 'Saltar al contenido'
        : isItalian
          ? 'Vai al contenuto'
          : isDutch
            ? 'Direct naar inhoud'
            : 'Skip to main content';

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <SkipLink label={skipLabel} />
      {isGerman ? (
        <DeHeader />
      ) : isFrench ? (
        <FrHeader />
      ) : isSpanish ? (
        <EsHeader />
      ) : isItalian ? (
        <ItHeader />
      ) : isDutch ? (
        <NlHeader />
      ) : (
        <>
          <AnnouncementBar />
          <SiteHeader />
        </>
      )}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <PageSwitch route={route} />
      </main>
      {isGerman ? (
        <DeFooter />
      ) : isFrench ? (
        <FrFooter />
      ) : isSpanish ? (
        <EsFooter />
      ) : isItalian ? (
        <ItFooter />
      ) : isDutch ? (
        <NlFooter />
      ) : (
        <SiteFooter />
      )}
      <ConsentBanner
        locale={isGerman ? 'de' : isFrench ? 'fr' : isSpanish ? 'es' : isItalian ? 'it' : isDutch ? 'nl' : 'en'}
      />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <Layout />
    </RouterProvider>
  );
}
