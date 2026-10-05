import type { MouseEvent } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { EsAnnouncementBar, EsConsentBanner, EsFooter, EsHeader } from './components/EsChrome';
import { EsAboutPage, EsContactPage, EsLegalPage, EsNotFoundPage, isEsLegalSlug } from './pages/EsCompanyPages';
import { EsArticlePage, EsGuidesPage, EsIndustriesPage, EsIndustryPage, EsServicePage } from './pages/EsDetailPages';
import { EsHomePage } from './pages/EsHomePage';

function EsPageSwitch({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <EsHomePage />;
    case 'service':
      return <EsServicePage key={route.slug} slug={route.slug} />;
    case 'industries':
      return <EsIndustriesPage />;
    case 'industry':
      return <EsIndustryPage key={route.slug} slug={route.slug} />;
    case 'guides':
      return <EsGuidesPage />;
    case 'article':
      return <EsArticlePage key={route.slug} slug={route.slug} />;
    case 'about':
      return <EsAboutPage />;
    case 'contact':
      return <EsContactPage />;
    case 'legal':
      return isEsLegalSlug(route.slug) ? <EsLegalPage key={route.slug} slug={route.slug} /> : <EsNotFoundPage path={`/es/${route.slug}`} />;
    default:
      return <EsNotFoundPage path={route.path} />;
  }
}

export function EsLayout({ route, focusMain }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cal font-es text-carbon-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-pino-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Saltar al contenido principal
      </a>
      <LocaleSuggestion site="es" />
      <EsAnnouncementBar />
      <EsHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <EsPageSwitch route={route} />
      </main>
      <EsFooter />
      <EsConsentBanner />
    </div>
  );
}
