import '../../shared/client-recovery.css';
import { withClientRecovery } from '../../shared/client-recovery';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import CmsHome from './CmsHome';
import { homeContext } from './lib/home-context';
import { parseHash } from './lib/router';
const root = document.getElementById('root')!;
const route = parseHash(location.hash);
const loaders = {
  fr: () => import('./sites/fr/HomeClient'),
  es: () => import('./sites/es/HomeClient'),
  it: () => import('./sites/it/HomeClient'),
};
const locale = homeContext()?.locale;
const load = locale && route.name === 'home' ? loaders[locale as keyof typeof loaders] : undefined;
if (load) {
  withClientRecovery(() => load().then(({ default: definition }) => {
    const app = <StrictMode><CmsHome definition={definition} /></StrictMode>;
    if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
    else createRoot(root).render(app);
  }), locale ?? 'en');
} else {
  // Keep every standalone prototype route available without sending it to CMS home visitors.
  withClientRecovery(() => import('./App').then(({ default: App }) => createRoot(root).render(<StrictMode><App /></StrictMode>)), locale ?? 'en');
}
