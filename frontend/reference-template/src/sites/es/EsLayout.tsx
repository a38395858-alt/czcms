import { EsShell } from './EsShell';
import type { Route } from '../../lib/router';
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

export function EsLayout(props: Omit<Parameters<typeof EsShell>[0], 'children'>) {
  return <EsShell {...props}><EsPageSwitch route={props.route} /></EsShell>;
}
