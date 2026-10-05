import type { MouseEvent } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { DeAnnouncementBar, DeConsentBanner, DeFooter, DeHeader } from './components/DeChrome';
import { DeAboutPage, DeContactPage, DeLegalPage, DeNotFoundPage, isDeLegalSlug } from './pages/DeCompanyPages';
import { DeArticlePage, DeGuidesPage, DeIndustriesPage, DeIndustryPage, DeServicePage } from './pages/DeDetailPages';
import { DeHomePage } from './pages/DeHomePage';

function DePageSwitch({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <DeHomePage />;
    case 'service':
      return <DeServicePage key={route.slug} slug={route.slug} />;
    case 'industries':
      return <DeIndustriesPage />;
    case 'industry':
      return <DeIndustryPage key={route.slug} slug={route.slug} />;
    case 'guides':
      return <DeGuidesPage />;
    case 'article':
      return <DeArticlePage key={route.slug} slug={route.slug} />;
    case 'about':
      return <DeAboutPage />;
    case 'contact':
      return <DeContactPage />;
    case 'legal':
      return isDeLegalSlug(route.slug) ? <DeLegalPage key={route.slug} slug={route.slug} /> : <DeNotFoundPage path={`/de/${route.slug}`} />;
    default:
      return <DeNotFoundPage path={route.path} />;
  }
}

export function DeLayout({ route, focusMain }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-de-sans text-anthrazit-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-anthrazit-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Zum Hauptinhalt springen
      </a>
      <LocaleSuggestion site="de" />
      <DeAnnouncementBar />
      <DeHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <DePageSwitch route={route} />
      </main>
      <DeFooter />
      <DeConsentBanner />
    </div>
  );
}
