import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { Logo } from '../../../components/ui/Logo';
import { SiteSwitch } from '../../../components/ui/SiteSwitch';
import { LOCALIZED_HOMEPAGES, localizedUrl, siteConfig } from '../../../config/site';
import { IT_ANCHORS, announcementIt, footerIt, heroIt } from '../../../content/it/home';
import { INDUSTRIES_IT } from '../../../content/it/industries';
import { SERVICES_IT } from '../../../content/it/services';
import type { FooterColumn } from '../../../content/types';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { Link, type Route } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export const ROSSO = '#c02620';
type MenuId = 'servizi' | 'settori';

const NAV_LINKS: Array<{ label: string; to: string; match: (route: Route) => boolean }> = [
  { label: 'Guide', to: '/it/guide', match: (r) => r.name === 'guides' || r.name === 'article' },
  { label: 'Chi siamo', to: '/it/chi-siamo', match: (r) => r.name === 'about' },
  { label: 'Contatti', to: '/it/contatti', match: (r) => r.name === 'contact' },
];

const navItem =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-grafite-700 transition-colors hover:text-grafite-900 aria-expanded:text-grafite-900 aria-[current=page]:text-grafite-900 aria-[current=page]:underline aria-[current=page]:decoration-rosso-600 aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]';

export function ItAnnouncementBar() {
  return (
    <div className="bg-grafite-900 text-grafite-200">
      <div className="shell flex min-h-10 items-center justify-center py-2">
        <Link
          to={announcementIt.cta_primary_url}
          className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white sm:text-sm"
        >
          <span>{announcementIt.body}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ottanio-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function ItHeader({ route }: { route: Route }) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const mobileButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [route]);

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById('hero');
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 96 : 8;
      setCompact(window.scrollY > threshold);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [route]);

  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const current = openMenu;
      setOpenMenu(null);
      triggers.current[current]?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const onBarBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (openMenu && next && !event.currentTarget.contains(next)) setOpenMenu(null);
  };
  const toggle = (id: MenuId) => setOpenMenu((current) => (current === id ? null : id));
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => mobileButton.current?.focus());
  }, []);
  const mobileNavigated = useCallback(() => setMobileOpen(false), []);

  const trigger = (id: MenuId, label: string, active: boolean) => (
    <button
      ref={(element) => {
        triggers.current[id] = element;
      }}
      type="button"
      aria-expanded={openMenu === id}
      aria-controls={`it-menu-${id}`}
      onClick={() => toggle(id)}
      className={cn(navItem, active && 'text-grafite-900 underline decoration-rosso-600 decoration-2 underline-offset-[10px]')}
    >
      {label}
      <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === id && 'rotate-180')} />
    </button>
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-grafite-900 text-grafite-900 transition-[background-color,box-shadow] duration-300',
          compact ? 'bg-white/95 shadow-[0_8px_24px_-18px_rgba(18,18,19,0.5)] backdrop-blur-md' : 'bg-white',
        )}
      >
        <div ref={barRef} onBlur={onBarBlur} className="relative">
          <div className="shell flex h-16 items-center justify-between gap-3 sm:gap-4 lg:h-[72px]">
            <Link
              to="/it/"
              onClick={() => {
                if (route.name === 'home') window.scrollTo({ top: 0 });
              }}
              className="shrink-0 text-grafite-900"
              aria-label="FreightVanta, pagina iniziale"
            >
              <Logo tone="dark" accent={ROSSO} className="font-it-display" />
            </Link>

            <nav aria-label="Navigazione principale" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                <li>{trigger('servizi', 'Servizi', route.name === 'service')}</li>
                <li className="relative">
                  {trigger('settori', 'Settori', route.name === 'industries' || route.name === 'industry')}
                  <SettoriMenu open={openMenu === 'settori'} route={route} />
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} aria-current={link.match(route) ? 'page' : undefined} className={navItem}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <SiteSwitch current="it" tone="grafite" />
              <Link to={announcementIt.cta_primary_url} className="it-btn it-btn-primary hidden min-h-11 px-4 text-[14px] md:inline-flex">
                {announcementIt.cta_primary_label}
              </Link>
              <button
                ref={mobileButton}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="it-mobile-menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center border border-grafite-900 text-grafite-900 transition-colors hover:bg-grafite-900 hover:text-white xl:hidden"
              >
                <span className="sr-only">Apri il menu</span>
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ServiziMenu open={openMenu === 'servizi'} route={route} />
        </div>
      </header>

      {mobileOpen && createPortal(<ItMobileMenu route={route} onClose={closeMobile} onNavigate={mobileNavigated} />, document.body)}
    </>
  );
}

function ServiziMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div id="it-menu-servizi" hidden={!open} className="absolute inset-x-0 top-full border-b border-grafite-900 bg-white text-grafite-900 shadow-[0_32px_64px_-28px_rgba(18,18,19,0.4)]">
      <div className="shell grid grid-cols-12 gap-10 py-10">
        <div className="col-span-8">
          <p className="it-eyebrow text-grafite-500">Servizi</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-10">
            {SERVICES_IT.map((service, index) => {
              const current = route.name === 'service' && route.slug === service.slug;
              return (
                <li key={service.slug} className="border-b border-grafite-200">
                  <Link
                    to={`/it/servizi/${service.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-start gap-4 py-3.5 transition-colors hover:text-ottanio-700 aria-[current=page]:text-ottanio-700"
                  >
                    <span className="it-folio pt-0.5">{String(index + 1).padStart(2, '0')}</span>
                    <span className="flex-1">
                      <span className="block font-it-display text-[1.1rem] font-semibold">{service.navLabel}</span>
                      <span className="mt-0.5 block text-sm text-grafite-500">{service.menuLine}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ottanio-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="col-span-4 border-l border-grafite-900 pl-10">
          <p className="font-it-display text-2xl font-semibold leading-tight">Non sa da dove iniziare?</p>
          <p className="mt-3 text-[15px] leading-relaxed text-grafite-600">{heroIt.settings.microcopy}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link to={IT_ANCHORS.enquiry} className="it-btn it-btn-primary">
              Richiedi un piano di spedizione
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={IT_ANCHORS.services} className="it-link">
              Confronta i percorsi di servizio
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SettoriMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div id="it-menu-settori" hidden={!open} className="absolute left-0 top-full mt-3 w-[27rem] border border-grafite-900 bg-white p-3 shadow-[0_24px_48px_-20px_rgba(18,18,19,0.4)]">
      <ul>
        {INDUSTRIES_IT.map((industry) => {
          const current = route.name === 'industry' && route.slug === industry.slug;
          return (
            <li key={industry.slug}>
              <Link
                to={`/it/settori/${industry.slug}`}
                aria-current={current ? 'page' : undefined}
                className="block px-3 py-3 transition-colors hover:bg-nebbia-100 aria-[current=page]:bg-nebbia-100"
              >
                <span className="block font-it-display text-[1.05rem] font-semibold">{industry.navLabel}</span>
                <span className="mt-0.5 block text-sm text-grafite-500">{industry.menuLine}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-grafite-200 px-3 pb-1 pt-3">
        <Link to="/it/settori" className="it-link text-[15px]">
          Tutte le soluzioni per settore
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ItLanguageList({ variant }: { variant: 'light' | 'dark' }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const current = locale.site === 'it';
        const className = cn(
          'inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm transition-colors',
          variant === 'light'
            ? current
              ? 'border-grafite-900 bg-grafite-900 font-semibold text-white'
              : 'border-grafite-300 text-grafite-700 hover:border-grafite-900 hover:text-grafite-900'
            : current
              ? 'border-white bg-white font-semibold text-grafite-900'
              : 'border-white/25 text-grafite-200 hover:border-white hover:text-white',
        );
        return (
          <li key={locale.hreflang}>
            <a
              href={localizedUrl(locale.path, locale.site ?? locale.hreflang.split('-')[0])}
              aria-current={current ? 'true' : undefined}
              hrefLang={locale.hreflang}
              lang={locale.hreflang}
              className={className}
            >
              {locale.label}
              {current && <CheckIcon className="h-4 w-4" />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function ItMobileMenu({ route, onClose, onNavigate }: { route: Route; onClose: () => void; onNavigate: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<MenuId | null>(route.name === 'industry' || route.name === 'industries' ? 'settori' : 'servizi');

  useEffect(() => {
    closeRef.current?.focus();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [onClose]);

  const group = (id: MenuId, label: string, links: Array<{ to: string; label: string }>, footer: { to: string; label: string }) => {
    const isOpen = expanded === id;
    return (
      <li>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`it-mobile-${id}`}
          onClick={() => setExpanded(isOpen ? null : id)}
          className="flex min-h-14 w-full items-center justify-between text-left font-it-display text-xl font-semibold text-grafite-900"
        >
          {label}
          <ChevronDown className={cn('h-5 w-5 text-grafite-500 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <div id={`it-mobile-${id}`} hidden={!isOpen} className="pb-4">
          <ul className="space-y-0.5 border-l border-grafite-900 pl-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={onNavigate} className="block py-2.5 text-[16px] text-grafite-700 hover:text-grafite-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={footer.to} onClick={onNavigate} className="it-link mt-3 pl-4 text-[15px]">
            {footer.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div id="it-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu del sito" className="fixed inset-0 z-[80] font-it xl:hidden">
      <div className="absolute inset-0 bg-grafite-950/60" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white text-grafite-900 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-grafite-900 px-5">
          <Link to="/it/" onClick={onNavigate} aria-label="FreightVanta, pagina iniziale" className="text-grafite-900">
            <Logo tone="dark" accent={ROSSO} className="font-it-display" />
          </Link>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center border border-grafite-900 hover:bg-nebbia-100">
            <span className="sr-only">Chiudi il menu</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navigazione mobile" className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="divide-y divide-grafite-200">
            {group(
              'servizi',
              'Servizi',
              SERVICES_IT.map((service) => ({ to: `/it/servizi/${service.slug}`, label: service.navLabel })),
              { to: IT_ANCHORS.services, label: 'Confronta i percorsi di servizio' },
            )}
            {group(
              'settori',
              'Settori',
              INDUSTRIES_IT.map((industry) => ({ to: `/it/settori/${industry.slug}`, label: industry.navLabel })),
              { to: '/it/settori', label: 'Tutte le soluzioni per settore' },
            )}
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={link.match(route) ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between font-it-display text-xl font-semibold text-grafite-900 aria-[current=page]:text-ottanio-700"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-grafite-400" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-grafite-200 pt-5 text-sm text-grafite-600">
            <li>
              <Link to={siteConfig.legalIt.note} onClick={onNavigate} className="underline underline-offset-4">
                Note legali
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalIt.privacy} onClick={onNavigate} className="underline underline-offset-4">
                Privacy
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalIt.cookie} onClick={onNavigate} className="underline underline-offset-4">
                Cookie
              </Link>
            </li>
          </ul>
        </nav>

        <div className="shrink-0 border-t border-grafite-900 p-5">
          <Link to={IT_ANCHORS.enquiry} onClick={onNavigate} className="it-btn it-btn-primary w-full">
            Richiedi un piano di spedizione
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Piè di pagina */
const footerHeading = 'it-eyebrow text-grafite-400';
const footerLink = 'inline-flex py-1 text-[15px] text-grafite-200 transition-colors hover:text-white hover:underline underline-offset-4';

export function ItFooter() {
  const titles = Object.fromEntries(footerIt.items.map((column) => [column.key, column.title])) as Record<FooterColumn['key'], string>;
  const { email, phone, address } = siteConfig.contact;
  const n = siteConfig.noteLegali;
  const year = new Date().getFullYear();
  const company = n.company || siteConfig.legalEntity || siteConfig.brand;

  /** Art. 2250 c.c. requires company data on business correspondence and websites. */
  const registryLine = [n.registry && `Reg. Imprese ${n.registry}`, n.rea && `REA ${n.rea}`, n.vatId && `P. IVA ${n.vatId}`, n.shareCapital && `Cap. soc. ${n.shareCapital}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <footer className="bg-grafite-900 text-grafite-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="sr-only">{titles.brand}</h2>
            <Link to="/it/" aria-label="FreightVanta, pagina iniziale" className="inline-flex">
              <Logo accent={ROSSO} className="font-it-display" />
            </Link>
            <p className="mt-5 max-w-xs font-it-display text-[19px] leading-relaxed text-white">{footerIt.body}</p>
            {n.company && <p className="mt-4 text-sm text-grafite-300">{n.company}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-grafite-300">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={footerIt.cta_primary_url} className="it-btn it-btn-primary mt-8">
              {footerIt.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="it-footer-servizi" className="lg:col-span-3">
            <h2 id="it-footer-servizi" className={footerHeading}>
              {titles.solutions}
            </h2>
            <ul className="mt-5 space-y-1">
              {SERVICES_IT.map((service) => (
                <li key={service.slug}>
                  <Link to={`/it/servizi/${service.slug}`} className={footerLink}>
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="it-footer-settori" className="lg:col-span-2">
            <h2 id="it-footer-settori" className={footerHeading}>
              {titles.industries}
            </h2>
            <ul className="mt-5 space-y-1">
              {INDUSTRIES_IT.map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/it/settori/${industry.slug}`} className={footerLink}>
                    {industry.navLabel}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/it/guide" className={footerLink}>
                  Guide e risorse
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={footerHeading}>{titles.contact}</h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link to="/it/contatti" className={footerLink}>
                  Contatti
                </Link>
              </li>
              {email && (
                <li>
                  <a href={`mailto:${email}`} className={`${footerLink} items-center gap-2`}>
                    <MailIcon className="h-4 w-4" />
                    {email}
                  </a>
                </li>
              )}
              {n.pec && (
                <li>
                  <a href={`mailto:${n.pec}`} className={`${footerLink} items-center gap-2`}>
                    <MailIcon className="h-4 w-4" />
                    PEC: {n.pec}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className={`${footerLink} items-center gap-2`}>
                    <PhoneIcon className="h-4 w-4" />
                    {phone}
                  </a>
                </li>
              )}
              <li>
                <Link to={siteConfig.legalIt.note} className={footerLink}>
                  Note legali
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalIt.privacy} className={footerLink}>
                  Informativa privacy
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalIt.cookie} className={footerLink}>
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalIt.condizioni} className={footerLink}>
                  Condizioni generali
                </Link>
              </li>
              <li>
                <button type="button" onClick={openConsentSettings} className={`${footerLink} text-left`}>
                  Preferenze cookie
                </button>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {siteConfig.social.map((profile) => (
                  <li key={profile.url}>
                    <a href={profile.url} className={footerLink} target="_blank" rel="noopener noreferrer">
                      {profile.label}
                      <span className="sr-only"> (si apre in una nuova scheda)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 bg-grafite-950 text-grafite-300">
        <div className="shell flex flex-col gap-2 py-6 text-sm">
          {registryLine && <p className="text-[13px]">{registryLine}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {company}. Tutti i diritti riservati.
            </p>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em]">Italiano · Italia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Cookie (art. 122 Codice Privacy, Linee guida cookie del Garante) */
export function ItConsentBanner() {
  const { promptOpen, reopened, consent } = useConsent();
  const rejectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (promptOpen && reopened) rejectRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;

  return (
    <div role="region" aria-label="Preferenze cookie" className="fixed inset-x-0 bottom-0 z-[70] font-it">
      <div className="border-t border-grafite-900 bg-white text-grafite-800 shadow-[0_-16px_40px_-24px_rgba(18,18,19,0.5)]">
        <div className="shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="font-it-display text-lg font-semibold text-grafite-900">Le sue preferenze sui cookie</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              Questo sito usa solo archiviazione propria tecnicamente necessaria per ricordare la sua scelta e, unicamente
              con il suo consenso, una misurazione statistica di prima parte, senza fornitori terzi e senza raccogliere
              ciò che scrive nei moduli. Rifiutare è semplice quanto accettare: può chiudere questo avviso senza
              acconsentire e modificare la scelta in ogni momento da «Preferenze cookie» nel piè di pagina.
              {consent !== 'unset' && ` Scelta attuale: ${consent === 'granted' ? 'statistiche accettate' : 'statistiche rifiutate'}.`}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
              <Link to={siteConfig.legalIt.cookie} className="it-link">
                Cookie policy
              </Link>
              <Link to={siteConfig.legalIt.privacy} className="it-link">
                Informativa privacy
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button ref={rejectRef} type="button" onClick={() => setConsent('denied')} className="it-btn it-btn-outline min-h-11 px-5 text-sm">
              Rifiuta
            </button>
            <button type="button" onClick={() => setConsent('granted')} className="it-btn it-btn-outline min-h-11 px-5 text-sm">
              Accetta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
