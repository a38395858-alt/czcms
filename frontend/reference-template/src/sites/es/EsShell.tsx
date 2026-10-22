import { homeContext } from '../../lib/home-context';
import type { MouseEvent, ReactNode } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { EsAnnouncementBar, EsConsentBanner, EsFooter, EsHeader } from './components/EsChrome';

export function EsShell({ route, focusMain, children }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cal font-es text-carbon-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-pino-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Saltar al contenido principal
      </a>
      {!homeContext()?.sharedHeader && <><LocaleSuggestion site="es" />
      <EsAnnouncementBar />
      <EsHeader route={route} /></>}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <EsFooter />
      <EsConsentBanner />
    </div>
  );
}
