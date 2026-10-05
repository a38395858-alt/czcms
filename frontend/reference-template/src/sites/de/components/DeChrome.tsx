import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { LOCALIZED_HOMEPAGES, localizedUrl, siteConfig } from '../../../config/site';
import { DE_ANCHORS, announcementDe, footerDe, heroDe } from '../../../content/de/home';
import { INDUSTRIES_DE } from '../../../content/de/industries';
import { SERVICES_DE } from '../../../content/de/services';
import type { FooterColumn } from '../../../content/types';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { Link, type Route } from '../../../lib/router';
import { cn } from '../../../utils/cn';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { Logo } from '../../../components/ui/Logo';
import { SiteSwitch } from '../../../components/ui/SiteSwitch';

export const ZIEGEL = '#a8432c';
type MenuId = 'leistungen' | 'branchen';

const NAV_LINKS: Array<{ label: string; to: string; match: (route: Route) => boolean }> = [
  { label: 'Ratgeber', to: '/de/ratgeber', match: (r) => r.name === 'guides' || r.name === 'article' },
  { label: 'Über FreightVanta', to: '/de/ueber-uns', match: (r) => r.name === 'about' },
  { label: 'Kontakt', to: '/de/kontakt', match: (r) => r.name === 'contact' },
];

const navItem =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium text-anthrazit-700 transition-colors hover:text-anthrazit-900 aria-expanded:text-anthrazit-900 aria-[current=page]:text-anthrazit-900 aria-[current=page]:underline aria-[current=page]:decoration-enzian-600 aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]';

export function DeAnnouncementBar() {
  return (
    <div className="bg-anthrazit-900 text-anthrazit-100">
      <div className="shell flex min-h-10 items-center justify-center py-2">
        <Link
          to={announcementDe.cta_primary_url}
          className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white sm:text-sm"
        >
          <span>{announcementDe.body}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-enzian-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function DeHeader({ route }: { route: Route }) {
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
      aria-controls={`de-menu-${id}`}
      onClick={() => toggle(id)}
      className={cn(navItem, active && 'text-anthrazit-900 underline decoration-enzian-600 decoration-2 underline-offset-[10px]')}
    >
      {label}
      <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === id && 'rotate-180')} />
    </button>
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-anthrazit-900/15 text-anthrazit-900 transition-[background-color,box-shadow] duration-300',
          compact ? 'bg-white/95 shadow-[0_8px_24px_-16px_rgba(20,23,26,0.35)] backdrop-blur-md' : 'bg-white',
        )}
      >
        <div ref={barRef} onBlur={onBarBlur} className="relative">
          <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
            <Link
              to="/de/"
              onClick={() => {
                if (route.name === 'home') window.scrollTo({ top: 0 });
              }}
              className="shrink-0 text-anthrazit-900"
              aria-label="FreightVanta Startseite"
            >
              <Logo tone="dark" accent={ZIEGEL} className="font-de-display" />
            </Link>

            <nav aria-label="Hauptnavigation" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                <li>{trigger('leistungen', 'Leistungen', route.name === 'service')}</li>
                <li className="relative">
                  {trigger('branchen', 'Branchen', route.name === 'industries' || route.name === 'industry')}
                  <BranchenMenu open={openMenu === 'branchen'} route={route} />
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
              <SiteSwitch current="de" tone="paper" />
              <Link to={announcementDe.cta_primary_url} className="de-btn de-btn-primary hidden min-h-11 px-4 text-[14px] md:inline-flex">
                {announcementDe.cta_primary_label}
              </Link>
              <button
                ref={mobileButton}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="de-mobile-menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center border border-anthrazit-900/30 text-anthrazit-900 transition-colors hover:bg-kiesel-50 xl:hidden"
              >
                <span className="sr-only">Menü öffnen</span>
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <LeistungenMenu open={openMenu === 'leistungen'} route={route} />
        </div>
      </header>

      {mobileOpen &&
        createPortal(<DeMobileMenu route={route} onClose={closeMobile} onNavigate={mobileNavigated} />, document.body)}
    </>
  );
}

function LeistungenMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="de-menu-leistungen"
      hidden={!open}
      className="absolute inset-x-0 top-full border-t border-anthrazit-900 bg-papier text-anthrazit-900 shadow-[0_32px_64px_-24px_rgba(20,23,26,0.45)]"
    >
      <div className="shell grid grid-cols-12 gap-10 py-10">
        <div className="col-span-8">
          <p className="de-eyebrow text-anthrazit-500">Leistungen</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-8">
            {SERVICES_DE.map((service) => {
              const current = route.name === 'service' && route.slug === service.slug;
              return (
                <li key={service.slug} className="border-b border-anthrazit-900/10">
                  <Link
                    to={`/de/loesungen/${service.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-start justify-between gap-4 py-3.5 transition-colors hover:text-enzian-700 aria-[current=page]:text-enzian-700"
                  >
                    <span>
                      <span className="block font-semibold">{service.navLabel}</span>
                      <span className="mt-0.5 block text-sm text-anthrazit-500">{service.menuLine}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-enzian-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="col-span-4 border-l border-anthrazit-900/15 pl-10">
          <p className="font-de-display text-2xl font-bold leading-tight">Noch unklar, wo Sie anfangen sollen?</p>
          <p className="mt-3 text-[15px] leading-relaxed text-anthrazit-600">{heroDe.settings.microcopy}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link to={DE_ANCHORS.enquiry} className="de-btn de-btn-primary">
              Sendungsplan anfragen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={DE_ANCHORS.services} className="de-link">
              Leistungspfade vergleichen
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BranchenMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="de-menu-branchen"
      hidden={!open}
      className="absolute left-0 top-full mt-3 w-[27rem] border border-anthrazit-900 bg-white p-3 shadow-[0_24px_48px_-20px_rgba(20,23,26,0.4)]"
    >
      <ul>
        {INDUSTRIES_DE.map((industry) => {
          const current = route.name === 'industry' && route.slug === industry.slug;
          return (
            <li key={industry.slug}>
              <Link
                to={`/de/branchen/${industry.slug}`}
                aria-current={current ? 'page' : undefined}
                className="block px-3 py-3 transition-colors hover:bg-kiesel-50 aria-[current=page]:bg-kiesel-100"
              >
                <span className="block font-semibold">{industry.navLabel}</span>
                <span className="mt-0.5 block text-sm text-anthrazit-500">{industry.menuLine}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-anthrazit-900/10 px-3 pb-1 pt-3">
        <Link to="/de/branchen" className="de-link text-[15px]">
          Alle Branchenlösungen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function DeLanguageList({ variant }: { variant: 'menu' | 'light' }) {
  return (
    <ul className={variant === 'light' ? 'flex flex-wrap gap-2' : undefined}>
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const current = locale.site === 'de';
        const className =
          variant === 'menu'
            ? cn(
                'flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-kiesel-50',
                current ? 'bg-kiesel-100 font-semibold text-anthrazit-900' : 'text-anthrazit-700 hover:text-anthrazit-900',
              )
            : cn(
                'inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm transition-colors',
                current
                  ? 'border-anthrazit-900 bg-anthrazit-900 font-semibold text-white'
                  : 'border-anthrazit-300 text-anthrazit-700 hover:border-anthrazit-900 hover:text-anthrazit-900',
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
              {current && <CheckIcon className={cn('h-4 w-4', variant === 'menu' ? 'text-enzian-600' : 'text-enzian-300')} />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function DeMobileMenu({ route, onClose, onNavigate }: { route: Route; onClose: () => void; onNavigate: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<'leistungen' | 'branchen' | null>(
    route.name === 'industry' || route.name === 'industries' ? 'branchen' : 'leistungen',
  );

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

  const group = (id: 'leistungen' | 'branchen', label: string, links: Array<{ to: string; label: string }>, footer: { to: string; label: string }) => {
    const isOpen = expanded === id;
    return (
      <li>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`de-mobile-${id}`}
          onClick={() => setExpanded(isOpen ? null : id)}
          className="flex min-h-14 w-full items-center justify-between text-left text-lg font-semibold text-anthrazit-900"
        >
          {label}
          <ChevronDown className={cn('h-5 w-5 text-anthrazit-500 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <div id={`de-mobile-${id}`} hidden={!isOpen} className="pb-4">
          <ul className="space-y-0.5 border-l border-anthrazit-900/20 pl-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={onNavigate} className="block py-2.5 text-[16px] text-anthrazit-700 hover:text-anthrazit-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={footer.to} onClick={onNavigate} className="de-link mt-3 pl-4 text-[15px]">
            {footer.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div id="de-mobile-menu" role="dialog" aria-modal="true" aria-label="Website-Menü" className="fixed inset-0 z-[80] font-de-sans xl:hidden">
      <div className="absolute inset-0 bg-anthrazit-950/60" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-papier text-anthrazit-900 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-anthrazit-900/15 px-5">
          <Link to="/de/" onClick={onNavigate} aria-label="FreightVanta Startseite" className="text-anthrazit-900">
            <Logo tone="dark" accent={ZIEGEL} className="font-de-display" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center border border-anthrazit-900/30 hover:bg-kiesel-100"
          >
            <span className="sr-only">Menü schließen</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile Navigation" className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="divide-y divide-anthrazit-900/10">
            {group(
              'leistungen',
              'Leistungen',
              SERVICES_DE.map((service) => ({ to: `/de/loesungen/${service.slug}`, label: service.navLabel })),
              { to: DE_ANCHORS.services, label: 'Leistungspfade vergleichen' },
            )}
            {group(
              'branchen',
              'Branchen',
              INDUSTRIES_DE.map((industry) => ({ to: `/de/branchen/${industry.slug}`, label: industry.navLabel })),
              { to: '/de/branchen', label: 'Alle Branchenlösungen' },
            )}
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={link.match(route) ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between text-lg font-semibold text-anthrazit-900 aria-[current=page]:text-enzian-700"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-anthrazit-400" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-anthrazit-900/10 pt-5 text-sm text-anthrazit-600">
            <li>
              <Link to={siteConfig.legalDe.impressum} onClick={onNavigate} className="underline underline-offset-4">
                Impressum
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalDe.datenschutz} onClick={onNavigate} className="underline underline-offset-4">
                Datenschutzerklärung
              </Link>
            </li>
          </ul>
        </nav>

        <div className="shrink-0 border-t border-anthrazit-900/15 p-5">
          <Link to={DE_ANCHORS.enquiry} onClick={onNavigate} className="de-btn de-btn-primary w-full">
            Sendungsplan anfragen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Footer */
const footerHeading = 'de-eyebrow text-anthrazit-500';
const footerLink = 'inline-flex py-1 text-[15px] text-anthrazit-700 transition-colors hover:text-anthrazit-900 hover:underline underline-offset-4';

export function DeFooter() {
  const titles = Object.fromEntries(footerDe.items.map((column) => [column.key, column.title])) as Record<FooterColumn['key'], string>;
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-anthrazit-900 bg-kiesel-50 text-anthrazit-700">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="sr-only">{titles.brand}</h2>
            <Link to="/de/" aria-label="FreightVanta Startseite" className="inline-flex text-anthrazit-900">
              <Logo tone="dark" accent={ZIEGEL} className="font-de-display" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{footerDe.body}</p>
            {siteConfig.impressum.company && <p className="mt-4 text-sm text-anthrazit-600">{siteConfig.impressum.company}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-anthrazit-600">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={footerDe.cta_primary_url} className="de-btn de-btn-primary mt-8">
              {footerDe.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="de-footer-leistungen" className="lg:col-span-3">
            <h2 id="de-footer-leistungen" className={footerHeading}>
              {titles.solutions}
            </h2>
            <ul className="mt-5 space-y-1">
              {SERVICES_DE.map((service) => (
                <li key={service.slug}>
                  <Link to={`/de/loesungen/${service.slug}`} className={footerLink}>
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="de-footer-branchen" className="lg:col-span-2">
            <h2 id="de-footer-branchen" className={footerHeading}>
              {titles.industries}
            </h2>
            <ul className="mt-5 space-y-1">
              {INDUSTRIES_DE.map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/de/branchen/${industry.slug}`} className={footerLink}>
                    {industry.navLabel}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/de/ratgeber" className={footerLink}>
                  Ratgeber & Planungswissen
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={footerHeading}>{titles.contact}</h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link to="/de/kontakt" className={footerLink}>
                  Kontakt
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
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className={`${footerLink} items-center gap-2`}>
                    <PhoneIcon className="h-4 w-4" />
                    {phone}
                  </a>
                </li>
              )}
              <li>
                <Link to={siteConfig.legalDe.impressum} className={footerLink}>
                  Impressum
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalDe.datenschutz} className={footerLink}>
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalDe.agb} className={footerLink}>
                  AGB
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalDe.cookies} className={footerLink}>
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <button type="button" onClick={openConsentSettings} className={`${footerLink} text-left`}>
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {siteConfig.social.map((profile) => (
                  <li key={profile.url}>
                    <a href={profile.url} className={footerLink} target="_blank" rel="noopener noreferrer">
                      {profile.label}
                      <span className="sr-only"> (öffnet in neuem Tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-anthrazit-900 text-anthrazit-200">
        <div className="shell flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.impressum.company || siteConfig.legalEntity || siteConfig.brand}. Alle Rechte vorbehalten.
          </p>
          <p className="font-de-mono text-[12px] uppercase tracking-[0.12em]">Deutsch · Deutschland</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Einwilligung (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO) */
export function DeConsentBanner() {
  const { promptOpen, reopened, consent } = useConsent();
  const declineRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (promptOpen && reopened) declineRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;

  return (
    <div role="region" aria-label="Datenschutz-Einstellungen" className="fixed inset-x-0 bottom-0 z-[70] font-de-sans">
      <div className="border-t border-anthrazit-900 bg-white text-anthrazit-800 shadow-[0_-16px_40px_-24px_rgba(20,23,26,0.5)]">
        <div className="shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="font-de-display text-lg font-bold text-anthrazit-900">Datenschutz-Einstellungen</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              Diese Website speichert Ihre Auswahl lokal im Browser (technisch notwendig). Nutzungsstatistiken erheben wir
              nur mit Ihrer Einwilligung nach § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO – als First-Party-Analyse
              ohne Formulareingaben und ohne Drittanbieter. Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“
              im Footer ändern.
              {consent !== 'unset' && ` Aktuelle Auswahl: ${consent === 'granted' ? 'Statistik zugelassen' : 'abgelehnt'}.`}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
              <Link to={siteConfig.legalDe.datenschutz} className="de-link">
                Datenschutzerklärung
              </Link>
              <Link to={siteConfig.legalDe.impressum} className="de-link">
                Impressum
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button ref={declineRef} type="button" onClick={() => setConsent('denied')} className="de-btn de-btn-outline min-h-11 px-5 text-sm">
              Ablehnen
            </button>
            <button type="button" onClick={() => setConsent('granted')} className="de-btn de-btn-outline min-h-11 px-5 text-sm">
              Statistik zulassen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
