import { homeContext } from './lib/home-context';
import { RouterProvider, useRoute } from './lib/router';
import { SkipLink, useRouteScroll } from './lib/route-effects';
import { NlHeader, NlFooter } from './components/nl/DutchChrome';
import { DutchHomePage } from './pages/DutchPages';
import { ConsentBanner } from './components/layout/ConsentBanner';
function Home() {
  const route = useRoute();
  useRouteScroll(route);
  return <div className="flex min-h-screen flex-col overflow-x-clip">
    <SkipLink label="Direct naar inhoud" />
    {!homeContext()?.sharedHeader && <NlHeader />}
    <main id="main" tabIndex={-1} className="flex-1 outline-none"><DutchHomePage /></main>
    <NlFooter />
    <ConsentBanner locale="nl" />
  </div>;
}
function RouteContent() {
  const route = useRoute();
  const needsLegacy = route.name !== 'nl-home';
  const [Legacy, setLegacy] = useState<ComponentType | null>(null);
  useEffect(() => {
    if (!needsLegacy || Legacy) return;
    withClientRecovery(() => import('./App').then(({ default: App }) => setLegacy(() => App)), 'nl');
  }, [needsLegacy, Legacy]);
  return needsLegacy && Legacy ? <Legacy /> : <Home />;
}
export default function CmsHome() { return <RouterProvider><RouteContent /></RouterProvider>; }
import { useEffect, useState, type ComponentType } from 'react';
import { withClientRecovery } from '../../shared/client-recovery';
