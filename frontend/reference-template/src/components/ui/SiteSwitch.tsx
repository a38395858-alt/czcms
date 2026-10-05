import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import { type SiteId } from '../../lib/router';
import { localizedUrl } from '../../config/site';
import { cn } from '../../utils/cn';
import { CheckIcon, ChevronDown, GlobeIcon } from './Icons';

type SwitchSiteId = SiteId | 'nl';

const SITES: Array<{ site: SwitchSiteId; code: string; label: string }> = [
  { site: 'en', code: 'EN', label: 'English (Global)' },
  { site: 'de', code: 'DE', label: 'Deutsch' },
  { site: 'fr', code: 'FR', label: 'Français' },
  { site: 'es', code: 'ES', label: 'Español' },
  { site: 'it', code: 'IT', label: 'Italiano' },
  { site: 'nl', code: 'NL', label: 'Nederlands' },
];

const COPY: Record<SiteId, { button: string; heading: string }> = {
  en: { button: 'Language: English. Change site language', heading: 'Choose your site' },
  de: { button: 'Sprache: Deutsch. Website-Sprache wechseln', heading: 'Website wählen' },
  fr: { button: 'Langue : français. Changer la langue du site', heading: 'Choisir votre site' },
  es: { button: 'Idioma: español. Cambiar el idioma del sitio', heading: 'Elija su sitio' },
  it: { button: 'Lingua: italiano. Cambia la lingua del sito', heading: 'Scegli il sito' },
};

export const SITE_CHOICE_KEY = 'fv.site-choice.v1';

/** Remember an explicit site choice so the browser-language suggestion stops appearing. */
export function rememberSiteChoice(site: SiteId) {
  try {
    window.localStorage.setItem(SITE_CHOICE_KEY, site);
  } catch {
    /* storage unavailable */
  }
}

export type SwitchTone = 'navy' | 'paper' | 'ivory' | 'cal' | 'grafite';

const TONES: Record<SwitchTone, { button: string; panel: string; item: string; active: string; muted: string; check: string }> = {
  navy: {
    button: 'rounded-[3px] text-white ring-1 ring-white/30 hover:bg-white/[0.06] aria-expanded:bg-white/10',
    panel: 'rounded-[4px] bg-white text-navy-900 ring-1 ring-navy-900/10',
    item: 'rounded-[3px] text-navy-700 hover:bg-mist-50 hover:text-navy-900',
    active: 'bg-mist-100 font-semibold text-navy-900',
    muted: 'text-navy-500',
    check: 'text-signal-600',
  },
  paper: {
    button: 'border border-anthrazit-900/40 text-anthrazit-900 hover:bg-kiesel-50 aria-expanded:bg-kiesel-100',
    panel: 'border border-anthrazit-900 bg-white text-anthrazit-900',
    item: 'text-anthrazit-700 hover:bg-kiesel-50 hover:text-anthrazit-900',
    active: 'bg-kiesel-100 font-semibold text-anthrazit-900',
    muted: 'text-anthrazit-500',
    check: 'text-enzian-600',
  },
  ivory: {
    button: 'rounded-full border border-encre-900/30 text-encre-900 hover:bg-lin-50 aria-expanded:bg-lin-100',
    panel: 'rounded-[10px] border border-encre-900/10 bg-white text-encre-900',
    item: 'rounded-[6px] text-encre-700 hover:bg-lin-50 hover:text-encre-900',
    active: 'bg-lin-100 font-semibold text-encre-900',
    muted: 'text-encre-500',
    check: 'text-outremer-600',
  },
  cal: {
    button: 'rounded-md border border-pino-900/25 text-pino-900 hover:bg-arena-50 aria-expanded:bg-arena-100',
    panel: 'rounded-lg border border-pino-900/15 bg-white text-carbon-900',
    item: 'rounded-md text-carbon-700 hover:bg-arena-50 hover:text-carbon-900',
    active: 'bg-arena-100 font-semibold text-carbon-900',
    muted: 'text-carbon-600',
    check: 'text-mar-700',
  },
  grafite: {
    button: 'border border-grafite-900 text-grafite-900 hover:bg-grafite-900 hover:text-white aria-expanded:bg-grafite-900 aria-expanded:text-white',
    panel: 'border border-grafite-900 bg-white text-grafite-900',
    item: 'text-grafite-700 hover:bg-nebbia-100 hover:text-grafite-900',
    active: 'bg-nebbia-100 font-semibold text-grafite-900',
    muted: 'text-grafite-500',
    check: 'text-ottanio-700',
  },
};

/**
 * Always-visible language switch: a globe with the current site code that opens a short list.
 * Compact enough that four (or more) sites still fit the header at 320px; below 380px only
 * the globe is shown, with the full label kept for screen readers.
 */
export function SiteSwitch({ current, tone, className }: { current: SiteId; tone: SwitchTone; className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const t = TONES[tone];
  const active = SITES.find((item) => item.site === current) ?? SITES[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) setOpen(false);
  };

  return (
    <div ref={rootRef} onBlur={onBlur} className={cn('relative shrink-0', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn('inline-flex h-10 min-w-10 items-center justify-center gap-1.5 px-2.5 text-[13px] font-semibold tracking-[0.04em] transition-colors sm:h-11', t.button)}
      >
        <GlobeIcon className="h-[18px] w-[18px]" />
        <span aria-hidden="true" className="max-[379px]:hidden">
          {active.code}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform max-[379px]:hidden', open && 'rotate-180')} />
        <span className="sr-only">{COPY[current].button}</span>
      </button>
      <div id={panelId} hidden={!open} className={cn('absolute right-0 top-full z-[60] mt-2 w-64 p-2 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]', t.panel)}>
        <p className={cn('px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em]', t.muted)}>{COPY[current].heading}</p>
        <ul>
          {SITES.map((item) => {
            const isCurrent = item.site === current;
            return (
              <li key={item.site}>
                <a
                  href={localizedUrl('/', item.site)}
                  hrefLang={item.site}
                  lang={item.site}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => {
                    if (item.site !== 'nl') rememberSiteChoice(item.site);
                    setOpen(false);
                  }}
                  className={cn('flex min-h-11 items-center justify-between gap-3 px-3 py-2 text-[15px] transition-colors', t.item, isCurrent && t.active)}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn('w-6 text-[12px] font-semibold', t.muted)}>{item.code}</span>
                    {item.label}
                  </span>
                  {isCurrent && <CheckIcon className={cn('h-4 w-4', t.check)} />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
