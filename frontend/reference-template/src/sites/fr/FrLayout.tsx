import { FrShell } from './FrShell';
import type { Route } from '../../lib/router';
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

export function FrLayout(props: Omit<Parameters<typeof FrShell>[0], 'children'>) {
  return <FrShell {...props}><FrPageSwitch route={props.route} /></FrShell>;
}
