import { focusMain, useRouteScroll, useSiteDocument } from './lib/route-effects';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { SiteFooter } from './components/layout/Footer';
import { AnnouncementBar, SiteHeader } from './components/layout/Header';
import { LocaleSuggestion } from './components/layout/LocaleSuggestion';
import {
  RouterProvider,
  useRoute,
  type Route,
} from './lib/router';
import { AboutPage, ContactPage, LegalPage, NotFoundPage, isLegalSlug } from './pages/CompanyPages';
import { ArticlePage, GuidesPage } from './pages/GuidePages';
import { HomePage } from './pages/HomePage';
import { IndustriesPage, IndustryPage } from './pages/IndustryPages';
import { ServicePage } from './pages/ServicePage';
import { DeLayout } from './sites/de/DeLayout';
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
