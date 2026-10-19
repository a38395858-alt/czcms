import '../../shared/client-recovery.css';
import { withClientRecovery } from '../../shared/client-recovery';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import { homeContext } from './lib/home-context';
import { parseHash } from './lib/router';
const root = document.getElementById('root')!;
const route = parseHash(location.hash);
if (homeContext()?.locale === 'nl' && (route.name === 'home' || route.name === 'nl-home')) {
  withClientRecovery(() => import('./CmsHome').then(({ default: CmsHome }) => {
    const app = <StrictMode><CmsHome /></StrictMode>;
    if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
    else createRoot(root).render(app);
  }), 'nl');
} else {
  withClientRecovery(() => import('./App').then(({ default: App }) => createRoot(root).render(<StrictMode><App /></StrictMode>)), homeContext()?.locale ?? 'en');
}
