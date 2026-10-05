import type { MouseEvent } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { FrAnnouncementBar, FrConsentBanner, FrFooter, FrHeader } from './components/FrChrome';
import { FrAboutPage, FrContactPage, FrLegalPage, FrNotFoundPage, isFrLegalSlug } from './pages/FrCompanyPages';
import { FrArticlePage, FrGuidesPage, FrIndustriesPage, FrIndustryPage, FrServicePage } from './pages/FrDetailPages';
import { FrHomePage } from './pages/FrHomePage';

function FrPageSwitch({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <FrHomePage />;
    case 'service':
      return <FrServicePage key={route.slug} slug={route.slug} />;
    case 'industries':
      return <FrIndustriesPage />;
    case 'industry':
      return <FrIndustryPage key={route.slug} slug={route.slug} />;
    case 'guides':
      return <FrGuidesPage />;
    case 'article':
      return <FrArticlePage key={route.slug} slug={route.slug} />;
    case 'about':
      return <FrAboutPage />;
    case 'contact':
      return <FrContactPage />;
    case 'legal':
      return isFrLegalSlug(route.slug) ? <FrLegalPage key={route.slug} slug={route.slug} /> : <FrNotFoundPage path={`/fr/${route.slug}`} />;
    default:
      return <FrNotFoundPage path={route.path} />;
  }
}

export function FrLayout({ route, focusMain }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-fr-sans text-encre-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-encre-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>
      <LocaleSuggestion site="fr" />
      <FrAnnouncementBar />
      <FrHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <FrPageSwitch route={route} />
      </main>
      <FrFooter />
      <FrConsentBanner />
    </div>
  );
}
