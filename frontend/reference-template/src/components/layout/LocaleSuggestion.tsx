import { useEffect, useState } from 'react';
import { Link, type SiteId } from '../../lib/router';
import { cn } from '../../utils/cn';
import { CloseIcon } from '../ui/Icons';
import { SITE_CHOICE_KEY, rememberSiteChoice } from '../ui/SiteSwitch';

const DISMISS_KEY = 'fv.locale-suggestion.dismissed';

function preferredSite(): SiteId | null {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const code = (language ?? '').toLowerCase();
    if (code.startsWith('de')) return 'de';
    if (code.startsWith('fr')) return 'fr';
    if (code.startsWith('es')) return 'es';
    if (code.startsWith('it')) return 'it';
    if (code.startsWith('en')) return 'en';
  }
  return null;
}

const COPY: Record<SiteId, { region: string; message: string; action: string; dismiss: string; to: string }> = {
  en: { region: 'Language suggestion', message: 'This site is also available in English.', action: 'Switch to English', dismiss: 'Dismiss', to: '/' },
  de: { region: 'Sprachhinweis', message: 'Diese Website gibt es auch auf Deutsch.', action: 'Zur deutschen Website', dismiss: 'Hinweis schließen', to: '/de/' },
  fr: { region: 'Suggestion de langue', message: 'Ce site est aussi disponible en français.', action: 'Voir la version française', dismiss: 'Fermer', to: '/fr/' },
  es: { region: 'Sugerencia de idioma', message: 'Este sitio también está disponible en español.', action: 'Ver la versión en español', dismiss: 'Cerrar', to: '/es/' },
  it: { region: 'Suggerimento lingua', message: 'Questo sito è disponibile anche in italiano.', action: 'Vai alla versione italiana', dismiss: 'Chiudi', to: '/it/' },
};

const SURFACE: Record<SiteId, string> = {
  en: 'bg-signal-700 text-white',
  de: 'bg-enzian-700 font-de-sans text-white',
  fr: 'bg-outremer-700 font-fr-sans text-white',
  es: 'bg-mar-700 font-es text-white',
  it: 'bg-ottanio-700 font-it text-white',
};

/**
 * Non-blocking suggestion when the browser language does not match the current site.
 * Never redirects automatically (search engines and users keep control); dismissible per session,
 * and silent once the visitor has chosen a site explicitly.
 */
export function LocaleSuggestion({ site }: { site: SiteId }) {
  const [suggest, setSuggest] = useState<SiteId | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SITE_CHOICE_KEY) || window.sessionStorage.getItem(DISMISS_KEY)) {
        setSuggest(null);
        return;
      }
    } catch {
      /* storage unavailable — still allow the suggestion */
    }
    const preferred = preferredSite();
    setSuggest(preferred && preferred !== site ? preferred : null);
  }, [site]);

  if (!suggest) return null;
  const copy = COPY[suggest];

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setSuggest(null);
  };

  return (
    <div role="region" aria-label={copy.region} lang={suggest} className={cn(SURFACE[site])}>
      <div className="shell flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 py-1.5 text-sm">
        <p className="py-1">{copy.message}</p>
        <div className="flex items-center gap-1">
          <Link to={copy.to} hrefLang={suggest} onClick={() => rememberSiteChoice(suggest)} className="px-2 py-2 font-semibold underline underline-offset-4 hover:no-underline">
            {copy.action}
          </Link>
          <button type="button" onClick={dismiss} className="grid h-9 w-9 place-items-center hover:bg-white/10">
            <span className="sr-only">{copy.dismiss}</span>
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
