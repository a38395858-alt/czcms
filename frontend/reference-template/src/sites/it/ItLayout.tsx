import { ItShell } from './ItShell';
import type { Route } from '../../lib/router';
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

export function ItLayout(props: Omit<Parameters<typeof ItShell>[0], 'children'>) {
  return <ItShell {...props}><ItPageSwitch route={props.route} /></ItShell>;
}
