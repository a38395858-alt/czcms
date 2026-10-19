import { useEffect, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import { withClientRecovery } from '../../shared/client-recovery';
import { homeContext } from './lib/home-context';
import { RouterProvider, useRoute, type Route } from './lib/router';
import { focusMain, useRouteScroll, useSiteDocument } from './lib/route-effects';
export interface HomeDefinition {
  Shell: ComponentType<{ route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void; children: ReactNode }>;
  Page: ComponentType;
}
function Home({ definition: { Shell, Page } }: { definition: HomeDefinition }) {
  const route = useRoute();
  useRouteScroll(route);
  useSiteDocument(route);
  return <Shell route={route} focusMain={focusMain}><Page /></Shell>;
}
export default function CmsHome({ definition }: { definition: HomeDefinition }) {
  return <RouterProvider><RouteContent definition={definition} /></RouterProvider>;
}

function RouteContent({ definition }: { definition: HomeDefinition }) {
  const route = useRoute();
  const needsLegacy = route.name !== 'home' || route.site !== homeContext()?.locale;
  const [Legacy, setLegacy] = useState<ComponentType | null>(null);
  useEffect(() => {
    if (!needsLegacy || Legacy) return;
    // Retain the current page while a historical hash route loads on demand.
    withClientRecovery(() => import('./App').then(({ default: App }) => setLegacy(() => App)), homeContext()?.locale ?? 'en');
  }, [needsLegacy, Legacy]);
  return needsLegacy && Legacy ? <Legacy /> : <Home definition={definition} />;
}
