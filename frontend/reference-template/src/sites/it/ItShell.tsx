import type { MouseEvent, ReactNode } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { ItAnnouncementBar, ItConsentBanner, ItFooter, ItHeader } from './components/ItChrome';

export function ItShell({ route, focusMain, children }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-it text-grafite-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-grafite-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Vai al contenuto principale
      </a>
      <LocaleSuggestion site="it" />
      <ItAnnouncementBar />
      <ItHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <ItFooter />
      <ItConsentBanner />
    </div>
  );
}
