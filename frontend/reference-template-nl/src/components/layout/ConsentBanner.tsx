import { useEffect, useRef } from 'react';
import { siteConfig } from '../../config/site';
import { setConsent, useConsent } from '../../lib/analytics';
import { Link } from '../../lib/router';

const TEXTS = {
  en: {
    region: 'Analytics preferences',
    heading: 'Analytics preferences',
    body: 'We use first-party analytics to learn which parts of this page help visitors plan a shipment. Form entries are never included.',
    current: (granted: boolean) => ` Current choice: ${granted ? 'allowed' : 'declined'}.`,
    allow: 'Allow analytics',
    decline: 'Decline',
    policyLabel: 'Cookie policy',
    policyUrl: () => siteConfig.legal.cookies,
  },
  de: {
    region: 'Analyse-Einstellungen',
    heading: 'Analyse-Einstellungen',
    body: 'Wir nutzen eigene, einwilligungsbasierte Analysen, um zu verstehen, welche Teile dieser Seite bei der Versandplanung helfen. Formulareingaben werden nie erfasst.',
    current: (granted: boolean) => ` Aktuelle Auswahl: ${granted ? 'erlaubt' : 'abgelehnt'}.`,
    allow: 'Analyse erlauben',
    decline: 'Ablehnen',
    policyLabel: 'Datenschutzerklärung',
    policyUrl: () => '/de/datenschutz',
  },
  fr: {
    region: 'Préférences de mesure d’audience',
    heading: 'Mesure d’audience',
    body: 'Nous utilisons une mesure d’audience interne, soumise à votre consentement, pour comprendre quelles parties de cette page aident à préparer une expédition. Les saisies du formulaire ne sont jamais collectées.',
    current: (granted: boolean) => ` Choix actuel\u202f: ${granted ? 'autorisée' : 'refusée'}.`,
    allow: 'Autoriser la mesure',
    decline: 'Refuser',
    policyLabel: 'Politique de confidentialité',
    policyUrl: () => '/fr/confidentialite',
  },
  es: {
    region: 'Preferencias de analítica',
    heading: 'Preferencias de analítica',
    body: 'Utilizamos analítica propia, solo con su consentimiento, para saber qué partes de esta página ayudan a planificar un envío. Lo que escriba en el formulario nunca se registra.',
    current: (granted: boolean) => ` Elección actual: ${granted ? 'aceptada' : 'rechazada'}.`,
    allow: 'Aceptar analítica',
    decline: 'Rechazar',
    policyLabel: 'Política de cookies',
    policyUrl: () => '/es/cookies',
  },
  it: {
    region: 'Preferenze di analisi',
    heading: 'Preferenze di analisi',
    body: 'Usiamo analisi proprietarie, solo con il Suo consenso, per capire quali parti di questa pagina aiutano a pianificare una spedizione. Ciò che scrive nel modulo non viene mai registrato.',
    current: (granted: boolean) => ` Scelta attuale: ${granted ? 'accettata' : 'rifiutata'}.`,
    allow: 'Accetti l’analisi',
    decline: 'Rifiuti',
    policyLabel: 'Informativa sui cookie',
    policyUrl: () => '/it/cookie',
  },
  nl: {
    region: 'Voorkeuren voor analyse',
    heading: 'Voorkeuren voor analyse',
    body: 'We gebruiken eigen analyse, alleen met uw toestemming, om te begrijpen welke delen van deze pagina helpen bij het plannen van een zending. Wat u in het formulier invult, wordt nooit vastgelegd.',
    current: (granted: boolean) => ` Huidige keuze: ${granted ? 'geaccepteerd' : 'geweigerd'}.`,
    allow: 'Analyse accepteren',
    decline: 'Weigeren',
    policyLabel: 'Cookieverklaring',
    policyUrl: () => '/nl/cookies',
  },
} as const;

/** Consent prompt for first-party analytics. Non-modal, never blocks page content. */
export function ConsentBanner({ locale = 'en' }: { locale?: 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' }) {
  const { promptOpen, reopened, consent } = useConsent();
  const allowRef = useRef<HTMLButtonElement>(null);
  const t = TEXTS[locale];

  useEffect(() => {
    if (promptOpen && reopened) allowRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;

  return (
    <div
      role="region"
      aria-label={t.region}
      lang={locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : locale === 'nl' ? 'nl-NL' : undefined}
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[25rem]"
    >
      <div className="rounded-[4px] border border-white/10 bg-navy-950 p-5 text-navy-100 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.65)]">
        <p className="font-display text-lg font-semibold text-white">{t.heading}</p>
        <p className="mt-2 text-sm leading-relaxed text-navy-200">
          {t.body}
          {consent !== 'unset' && t.current(consent === 'granted')}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            ref={allowRef}
            type="button"
            onClick={() => setConsent('granted')}
            className="btn min-h-10 bg-white px-4 py-2 text-sm text-navy-950 hover:bg-mist-100"
          >
            {t.allow}
          </button>
          <button
            type="button"
            onClick={() => setConsent('denied')}
            className="btn min-h-10 px-4 py-2 text-sm text-white ring-1 ring-white/30 hover:bg-white/[0.06]"
          >
            {t.decline}
          </button>
          <Link
            to={t.policyUrl()}
            className="ml-auto py-2 text-sm font-medium text-signal-300 underline underline-offset-4 hover:text-white"
          >
            {t.policyLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
