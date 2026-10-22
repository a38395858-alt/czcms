import { homeContext } from './lib/home-context';
import { SkipLink, useRouteScroll } from './lib/route-effects';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { SiteFooter } from './components/layout/Footer';
import { AnnouncementBar, SiteHeader } from './components/layout/Header';
import {
  RouterProvider,
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
      {!homeContext()?.sharedHeader && (isGerman ? (
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
      ))}
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
