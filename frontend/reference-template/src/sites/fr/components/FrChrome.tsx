import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { Logo } from '../../../components/ui/Logo';
import { SiteSwitch } from '../../../components/ui/SiteSwitch';
import { LOCALIZED_HOMEPAGES, localizedUrl, siteConfig } from '../../../config/site';
import { FR_ANCHORS, announcementFr, footerFr, heroFr } from '../../../content/fr/home';
import { INDUSTRIES_FR } from '../../../content/fr/industries';
import { SERVICES_FR } from '../../../content/fr/services';
import type { FooterColumn } from '../../../content/types';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { Link, type Route } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export const SIENNE = '#b45a24';
type MenuId = 'solutions' | 'secteurs';

const NAV_LINKS: Array<{ label: string; to: string; match: (route: Route) => boolean }> = [
  { label: 'Guides', to: '/fr/guides', match: (r) => r.name === 'guides' || r.name === 'article' },
  { label: 'À propos', to: '/fr/a-propos', match: (r) => r.name === 'about' },
  { label: 'Contact', to: '/fr/contact', match: (r) => r.name === 'contact' },
];

const navItem =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-encre-700 transition-colors hover:text-encre-900 aria-expanded:text-encre-900 aria-[current=page]:text-encre-900 aria-[current=page]:underline aria-[current=page]:decoration-outremer-600 aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]';

export function FrAnnouncementBar() {
  return (
    <div className="bg-encre-900 text-lin-100">
      <div className="shell flex min-h-10 items-center justify-center py-2">
        <Link
          to={announcementFr.cta_primary_url}
          className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white sm:text-sm"
        >
          <span>{announcementFr.body}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-outremer-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function FrHeader({ route }: { route: Route }) {
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
      aria-controls={`fr-menu-${id}`}
      onClick={() => toggle(id)}
      className={cn(navItem, active && 'text-encre-900 underline decoration-outremer-600 decoration-2 underline-offset-[10px]')}
    >
      {label}
      <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === id && 'rotate-180')} />
    </button>
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-encre-900/10 text-encre-900 transition-[background-color,box-shadow] duration-300',
          compact ? 'bg-ivoire/95 shadow-[0_8px_24px_-16px_rgba(28,31,39,0.35)] backdrop-blur-md' : 'bg-ivoire',
        )}
      >
        <div ref={barRef} onBlur={onBarBlur} className="relative">
          <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
            <Link
              to="/fr/"
              onClick={() => {
                if (route.name === 'home') window.scrollTo({ top: 0 });
              }}
              className="shrink-0 text-encre-900"
              aria-label="FreightVanta, page d’accueil"
            >
              <Logo tone="dark" accent={SIENNE} className="font-fr-serif" />
            </Link>

            <nav aria-label="Navigation principale" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                <li>{trigger('solutions', 'Solutions', route.name === 'service')}</li>
                <li className="relative">
                  {trigger('secteurs', 'Secteurs', route.name === 'industries' || route.name === 'industry')}
                  <SecteursMenu open={openMenu === 'secteurs'} route={route} />
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
              <SiteSwitch current="fr" tone="ivory" />
              <Link to={announcementFr.cta_primary_url} className="fr-btn fr-btn-primary hidden min-h-11 px-4 text-[14px] md:inline-flex">
                {announcementFr.cta_primary_label}
              </Link>
              <button
                ref={mobileButton}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="fr-mobile-menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-encre-900/30 text-encre-900 transition-colors hover:bg-lin-50 xl:hidden"
              >
                <span className="sr-only">Ouvrir le menu</span>
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <SolutionsMenu open={openMenu === 'solutions'} route={route} />
        </div>
      </header>

      {mobileOpen && createPortal(<FrMobileMenu route={route} onClose={closeMobile} onNavigate={mobileNavigated} />, document.body)}
    </>
  );
}

function SolutionsMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="fr-menu-solutions"
      hidden={!open}
      className="absolute inset-x-0 top-full border-t border-encre-900/10 bg-white text-encre-900 shadow-[0_32px_64px_-24px_rgba(28,31,39,0.4)]"
    >
      <div className="shell grid grid-cols-12 gap-10 py-10">
        <div className="col-span-8">
          <p className="fr-eyebrow text-encre-500">Solutions</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-8">
            {SERVICES_FR.map((service) => {
              const current = route.name === 'service' && route.slug === service.slug;
              return (
                <li key={service.slug} className="border-b border-encre-900/10">
                  <Link
                    to={`/fr/solutions/${service.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-start justify-between gap-4 py-3.5 transition-colors hover:text-outremer-700 aria-[current=page]:text-outremer-700"
                  >
                    <span>
                      <span className="block font-fr-serif text-[1.1rem] font-semibold">{service.navLabel}</span>
                      <span className="mt-0.5 block text-sm text-encre-500">{service.menuLine}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-outremer-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="col-span-4 border-l border-encre-900/10 pl-10">
          <p className="font-fr-serif text-2xl font-semibold leading-tight">Vous ne savez pas par où commencer ?</p>
          <p className="mt-3 text-[15px] leading-relaxed text-encre-600">{heroFr.settings.microcopy}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link to={FR_ANCHORS.enquiry} className="fr-btn fr-btn-primary">
              Demander un plan d’expédition
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={FR_ANCHORS.services} className="fr-link">
              Comparer les parcours de prestations
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SecteursMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="fr-menu-secteurs"
      hidden={!open}
      className="absolute left-0 top-full mt-3 w-[27rem] rounded-[10px] border border-encre-900/10 bg-white p-3 shadow-[0_24px_48px_-20px_rgba(28,31,39,0.35)]"
    >
      <ul>
        {INDUSTRIES_FR.map((industry) => {
          const current = route.name === 'industry' && route.slug === industry.slug;
          return (
            <li key={industry.slug}>
              <Link
                to={`/fr/secteurs/${industry.slug}`}
                aria-current={current ? 'page' : undefined}
                className="block rounded-[6px] px-3 py-3 transition-colors hover:bg-lin-50 aria-[current=page]:bg-lin-100"
              >
                <span className="block font-semibold">{industry.navLabel}</span>
                <span className="mt-0.5 block text-sm text-encre-500">{industry.menuLine}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-encre-900/10 px-3 pb-1 pt-3">
        <Link to="/fr/secteurs" className="fr-link text-[15px]">
          Toutes les solutions par secteur
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function FrLanguageList({ variant }: { variant: 'menu' | 'light' }) {
  return (
    <ul className={variant === 'light' ? 'flex flex-wrap gap-2' : undefined}>
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const current = locale.site === 'fr';
        const className =
          variant === 'menu'
            ? cn('flex items-center justify-between rounded-[6px] px-3 py-2.5 transition-colors hover:bg-lin-50', current ? 'bg-lin-100 font-semibold text-encre-900' : 'text-encre-700 hover:text-encre-900')
            : cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors',
                current ? 'border-encre-900 bg-encre-900 font-semibold text-white' : 'border-encre-300 text-encre-700 hover:border-encre-900 hover:text-encre-900',
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
              {current && <CheckIcon className={cn('h-4 w-4', variant === 'menu' ? 'text-outremer-600' : 'text-outremer-300')} />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function FrMobileMenu({ route, onClose, onNavigate }: { route: Route; onClose: () => void; onNavigate: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<MenuId | null>(route.name === 'industry' || route.name === 'industries' ? 'secteurs' : 'solutions');

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
          aria-controls={`fr-mobile-${id}`}
          onClick={() => setExpanded(isOpen ? null : id)}
          className="flex min-h-14 w-full items-center justify-between text-left font-fr-serif text-xl font-semibold text-encre-900"
        >
          {label}
          <ChevronDown className={cn('h-5 w-5 text-encre-500 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <div id={`fr-mobile-${id}`} hidden={!isOpen} className="pb-4">
          <ul className="space-y-0.5 border-l border-encre-900/20 pl-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={onNavigate} className="block py-2.5 text-[16px] text-encre-700 hover:text-encre-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={footer.to} onClick={onNavigate} className="fr-link mt-3 pl-4 text-[15px]">
            {footer.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div id="fr-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu du site" className="fixed inset-0 z-[80] font-fr-sans xl:hidden">
      <div className="absolute inset-0 bg-encre-950/60" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivoire text-encre-900 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-encre-900/10 px-5">
          <Link to="/fr/" onClick={onNavigate} aria-label="FreightVanta, page d’accueil" className="text-encre-900">
            <Logo tone="dark" accent={SIENNE} className="font-fr-serif" />
          </Link>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-encre-900/30 hover:bg-lin-100">
            <span className="sr-only">Fermer le menu</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="divide-y divide-encre-900/10">
            {group(
              'solutions',
              'Solutions',
              SERVICES_FR.map((service) => ({ to: `/fr/solutions/${service.slug}`, label: service.navLabel })),
              { to: FR_ANCHORS.services, label: 'Comparer les parcours de prestations' },
            )}
            {group(
              'secteurs',
              'Secteurs',
              INDUSTRIES_FR.map((industry) => ({ to: `/fr/secteurs/${industry.slug}`, label: industry.navLabel })),
              { to: '/fr/secteurs', label: 'Toutes les solutions par secteur' },
            )}
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={link.match(route) ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between font-fr-serif text-xl font-semibold text-encre-900 aria-[current=page]:text-outremer-700"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-encre-400" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-encre-900/10 pt-5 text-sm text-encre-600">
            <li>
              <Link to={siteConfig.legalFr.mentions} onClick={onNavigate} className="underline underline-offset-4">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalFr.confidentialite} onClick={onNavigate} className="underline underline-offset-4">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </nav>

        <div className="shrink-0 border-t border-encre-900/10 p-5">
          <Link to={FR_ANCHORS.enquiry} onClick={onNavigate} className="fr-btn fr-btn-primary w-full">
            Demander un plan d’expédition
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Pied de page */
const footerHeading = 'fr-eyebrow text-encre-500';
const footerLink = 'inline-flex py-1 text-[15px] text-encre-700 transition-colors hover:text-encre-900 hover:underline underline-offset-4';

export function FrFooter() {
  const titles = Object.fromEntries(footerFr.items.map((column) => [column.key, column.title])) as Record<FooterColumn['key'], string>;
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const company = siteConfig.mentionsLegales.company || siteConfig.legalEntity || siteConfig.brand;

  return (
    <footer className="border-t border-encre-900/10 bg-lin-50 text-encre-700">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="sr-only">{titles.brand}</h2>
            <Link to="/fr/" aria-label="FreightVanta, page d’accueil" className="inline-flex text-encre-900">
              <Logo tone="dark" accent={SIENNE} className="font-fr-serif" />
            </Link>
            <p className="mt-5 max-w-xs font-fr-serif text-[17px] leading-relaxed text-encre-800">{footerFr.body}</p>
            {siteConfig.mentionsLegales.company && <p className="mt-4 text-sm text-encre-600">{siteConfig.mentionsLegales.company}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-encre-600">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={footerFr.cta_primary_url} className="fr-btn fr-btn-primary mt-8">
              {footerFr.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="fr-footer-solutions" className="lg:col-span-3">
            <h2 id="fr-footer-solutions" className={footerHeading}>
              {titles.solutions}
            </h2>
            <ul className="mt-5 space-y-1">
              {SERVICES_FR.map((service) => (
                <li key={service.slug}>
                  <Link to={`/fr/solutions/${service.slug}`} className={footerLink}>
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="fr-footer-secteurs" className="lg:col-span-2">
            <h2 id="fr-footer-secteurs" className={footerHeading}>
              {titles.industries}
            </h2>
            <ul className="mt-5 space-y-1">
              {INDUSTRIES_FR.map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/fr/secteurs/${industry.slug}`} className={footerLink}>
                    {industry.navLabel}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/fr/guides" className={footerLink}>
                  Guides et ressources
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={footerHeading}>{titles.contact}</h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link to="/fr/contact" className={footerLink}>
                  Contact
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
                <Link to={siteConfig.legalFr.mentions} className={footerLink}>
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalFr.confidentialite} className={footerLink}>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalFr.cgv} className={footerLink}>
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalFr.cookies} className={footerLink}>
                  Politique de cookies
                </Link>
              </li>
              <li>
                <button type="button" onClick={openConsentSettings} className={`${footerLink} text-left`}>
                  Gérer les cookies
                </button>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {siteConfig.social.map((profile) => (
                  <li key={profile.url}>
                    <a href={profile.url} className={footerLink} target="_blank" rel="noopener noreferrer">
                      {profile.label}
                      <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-encre-900 text-lin-200">
        <div className="shell flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company}. Tous droits réservés.
          </p>
          <p className="text-[12px] uppercase tracking-[0.12em]">Français · France</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Consentement (art. 82 loi Informatique et Libertés, lignes directrices CNIL) */
export function FrConsentBanner() {
  const { promptOpen, reopened, consent } = useConsent();
  const refuseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (promptOpen && reopened) refuseRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;

  return (
    <div role="region" aria-label="Gestion des cookies" className="fixed inset-x-0 bottom-0 z-[70] font-fr-sans">
      <div className="border-t border-encre-900/15 bg-white text-encre-800 shadow-[0_-16px_40px_-24px_rgba(28,31,39,0.45)]">
        <div className="shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="font-fr-serif text-lg font-semibold text-encre-900">Vos choix en matière de cookies</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              Ce site enregistre votre choix dans votre navigateur (stockage strictement nécessaire). Nous ne mesurons
              l’audience qu’avec votre consentement (art. 82 de la loi Informatique et Libertés, art. 6-1-a du RGPD) : une
              mesure interne, sans prestataire tiers et sans jamais collecter vos saisies de formulaire. Refuser est aussi
              simple qu’accepter, et vous pouvez changer d’avis à tout moment via « Gérer les cookies » en pied de page.
              {consent !== 'unset' && ` Choix actuel : ${consent === 'granted' ? 'mesure d’audience acceptée' : 'refusée'}.`}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
              <Link to={siteConfig.legalFr.confidentialite} className="fr-link">
                Politique de confidentialité
              </Link>
              <Link to={siteConfig.legalFr.cookies} className="fr-link">
                Politique de cookies
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button ref={refuseRef} type="button" onClick={() => setConsent('denied')} className="fr-btn fr-btn-outline min-h-11 px-5 text-sm">
              Tout refuser
            </button>
            <button type="button" onClick={() => setConsent('granted')} className="fr-btn fr-btn-outline min-h-11 px-5 text-sm">
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
