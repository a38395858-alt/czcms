import { homeContext } from '../../lib/home-context';
import type { MouseEvent, ReactNode } from 'react';
import { LocaleSuggestion } from '../../components/layout/LocaleSuggestion';
import type { Route } from '../../lib/router';
import { FrAnnouncementBar, FrConsentBanner, FrFooter, FrHeader } from './components/FrChrome';

export function FrShell({ route, focusMain, children }: { route: Route; focusMain: (event: MouseEvent<HTMLAnchorElement>) => void; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-fr-sans text-encre-800">
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-encre-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>
      {!homeContext()?.sharedHeader && <><LocaleSuggestion site="fr" />
      <FrAnnouncementBar />
      <FrHeader route={route} /></>}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <FrFooter />
      <FrConsentBanner />
    </div>
  );
}
