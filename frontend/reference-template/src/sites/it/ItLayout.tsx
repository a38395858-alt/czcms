import type { MouseEvent } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { ItAnnouncementBar, ItConsentBanner, ItFooter, ItHeader } from './components/ItChrome';
import { ItAboutPage, ItContactPage, ItLegalPage, ItNotFoundPage, isItLegalSlug } from './pages/ItCompanyPages';
import { ItArticlePage, ItGuidesPage, ItIndustriesPage, ItIndustryPage, ItServicePage } from './pages/ItDetailPages';
import { ItHomePage } from './pages/ItHomePage';

function ItPageSwitch({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <ItHomePage />;
    case 'service':
      return <ItServicePage key={route.slug} slug={route.slug} />;
    case 'industries':
      return <ItIndustriesPage />;
    case 'industry':
      return <ItIndustryPage key={route.slug} slug={route.slug} />;
    case 'guides':
      return <ItGuidesPage />;
    case 'article':
      return <ItArticlePage key={route.slug} slug={route.slug} />;
    case 'about':
      return <ItAboutPage />;
    case 'contact':
      return <ItContactPage />;
    case 'legal':
      return isItLegalSlug(route.slug) ? <ItLegalPage key={route.slug} slug={route.slug} /> : <ItNotFoundPage path={`/it/${route.slug}`} />;
    default:
      return <ItNotFoundPage path={route.path} />;
  }
}

export function ItLayout({ route, focusMain }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-it text-grafite-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-grafite-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Vai al contenuto principale
      </a>
      <LocaleSuggestion site="it" />
      <ItAnnouncementBar />
      <ItHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <ItPageSwitch route={route} />
      </main>
      <ItFooter />
      <ItConsentBanner />
    </div>
  );
}
