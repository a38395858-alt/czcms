import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { Logo } from '../../../components/ui/Logo';
import { SiteSwitch } from '../../../components/ui/SiteSwitch';
import { LOCALIZED_HOMEPAGES, localizedUrl, siteConfig } from '../../../config/site';
import { ES_ANCHORS, announcementEs, footerEs, heroEs } from '../../../content/es/home';
import { INDUSTRIES_ES } from '../../../content/es/industries';
import { SERVICES_ES } from '../../../content/es/services';
import type { FooterColumn } from '../../../content/types';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { Link, type Route } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export const ALMAGRE = '#a33a1b';
type MenuId = 'soluciones' | 'sectores';

const NAV_LINKS: Array<{ label: string; to: string; match: (route: Route) => boolean }> = [
  { label: 'Guías', to: '/es/guias', match: (r) => r.name === 'guides' || r.name === 'article' },
  { label: 'Quiénes somos', to: '/es/quienes-somos', match: (r) => r.name === 'about' },
  { label: 'Contacto', to: '/es/contacto', match: (r) => r.name === 'contact' },
];

const navItem =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-carbon-700 transition-colors hover:text-pino-900 aria-expanded:text-pino-900 aria-[current=page]:text-pino-900 aria-[current=page]:underline aria-[current=page]:decoration-albero-400 aria-[current=page]:decoration-3 aria-[current=page]:underline-offset-[10px]';

export function EsAnnouncementBar() {
  return (
    <div className="bg-pino-900 text-pino-100">
      <div className="shell flex min-h-10 items-center justify-center py-2">
        <Link
          to={announcementEs.cta_primary_url}
          className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white sm:text-sm"
        >
          <span>{announcementEs.body}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-albero-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function EsHeader({ route }: { route: Route }) {
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
      aria-controls={`es-menu-${id}`}
      onClick={() => toggle(id)}
      className={cn(navItem, active && 'text-pino-900 underline decoration-albero-400 decoration-3 underline-offset-[10px]')}
    >
      {label}
      <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === id && 'rotate-180')} />
    </button>
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b-[3px] border-albero-400 text-carbon-900 transition-[background-color,box-shadow] duration-300',
          compact ? 'bg-cal/95 shadow-[0_8px_24px_-16px_rgba(11,48,39,0.4)] backdrop-blur-md' : 'bg-cal',
        )}
      >
        <div ref={barRef} onBlur={onBarBlur} className="relative">
          <div className="shell flex h-16 items-center justify-between gap-3 sm:gap-4 lg:h-[72px]">
            <Link
              to="/es/"
              onClick={() => {
                if (route.name === 'home') window.scrollTo({ top: 0 });
              }}
              className="shrink-0 text-pino-900"
              aria-label="FreightVanta, página de inicio"
            >
              <Logo tone="dark" accent={ALMAGRE} className="font-es" />
            </Link>

            <nav aria-label="Navegación principal" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                <li>{trigger('soluciones', 'Soluciones', route.name === 'service')}</li>
                <li className="relative">
                  {trigger('sectores', 'Sectores', route.name === 'industries' || route.name === 'industry')}
                  <SectoresMenu open={openMenu === 'sectores'} route={route} />
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
              <SiteSwitch current="es" tone="cal" />
              <Link to={announcementEs.cta_primary_url} className="es-btn es-btn-primary hidden min-h-11 px-4 text-[14px] md:inline-flex">
                {announcementEs.cta_primary_label}
              </Link>
              <button
                ref={mobileButton}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="es-mobile-menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-pino-900/25 text-pino-900 transition-colors hover:bg-arena-50 xl:hidden"
              >
                <span className="sr-only">Abrir el menú</span>
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <SolucionesMenu open={openMenu === 'soluciones'} route={route} />
        </div>
      </header>

      {mobileOpen && createPortal(<EsMobileMenu route={route} onClose={closeMobile} onNavigate={mobileNavigated} />, document.body)}
    </>
  );
}

function SolucionesMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div id="es-menu-soluciones" hidden={!open} className="absolute inset-x-0 top-full bg-white text-carbon-900 shadow-[0_32px_64px_-24px_rgba(11,48,39,0.45)]">
      <div className="shell grid grid-cols-12 gap-10 py-10">
        <div className="col-span-8">
          <p className="es-eyebrow text-mar-700">Soluciones</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-8">
            {SERVICES_ES.map((service) => {
              const current = route.name === 'service' && route.slug === service.slug;
              return (
                <li key={service.slug} className="border-b border-carbon-900/10">
                  <Link
                    to={`/es/soluciones/${service.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-start justify-between gap-4 py-3.5 transition-colors hover:text-mar-700 aria-[current=page]:text-mar-700"
                  >
                    <span>
                      <span className="block text-[1.02rem] font-extrabold tracking-[-0.01em]">{service.navLabel}</span>
                      <span className="mt-0.5 block text-sm text-carbon-600">{service.menuLine}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-mar-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="es-azulejo col-span-4 rounded-lg bg-arena-100 p-8">
          <p className="text-2xl font-extrabold leading-tight tracking-[-0.02em]">¿No sabe por dónde empezar?</p>
          <p className="mt-3 text-[15px] leading-relaxed text-carbon-700">{heroEs.settings.microcopy}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link to={ES_ANCHORS.enquiry} className="es-btn es-btn-primary">
              Solicitar plan de envío
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={ES_ANCHORS.services} className="es-link">
              Comparar recorridos de servicio
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectoresMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div id="es-menu-sectores" hidden={!open} className="absolute left-0 top-full mt-3 w-[27rem] rounded-lg border border-carbon-900/10 bg-white p-3 shadow-[0_24px_48px_-20px_rgba(11,48,39,0.4)]">
      <ul>
        {INDUSTRIES_ES.map((industry) => {
          const current = route.name === 'industry' && route.slug === industry.slug;
          return (
            <li key={industry.slug}>
              <Link
                to={`/es/sectores/${industry.slug}`}
                aria-current={current ? 'page' : undefined}
                className="block rounded-md px-3 py-3 transition-colors hover:bg-arena-50 aria-[current=page]:bg-arena-100"
              >
                <span className="block font-extrabold tracking-[-0.01em]">{industry.navLabel}</span>
                <span className="mt-0.5 block text-sm text-carbon-600">{industry.menuLine}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-carbon-900/10 px-3 pb-1 pt-3">
        <Link to="/es/sectores" className="es-link text-[15px]">
          Todas las soluciones por sector
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function EsLanguageList({ variant }: { variant: 'light' | 'dark' }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const current = locale.site === 'es';
        const className = cn(
          'inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
          variant === 'light'
            ? current
              ? 'border-pino-900 bg-pino-900 font-semibold text-white'
              : 'border-carbon-300 text-carbon-700 hover:border-pino-900 hover:text-pino-900'
            : current
              ? 'border-albero-300 bg-albero-300 font-semibold text-carbon-900'
              : 'border-white/25 text-pino-100 hover:border-white hover:text-white',
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

function EsMobileMenu({ route, onClose, onNavigate }: { route: Route; onClose: () => void; onNavigate: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<MenuId | null>(route.name === 'industry' || route.name === 'industries' ? 'sectores' : 'soluciones');

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
          aria-controls={`es-mobile-${id}`}
          onClick={() => setExpanded(isOpen ? null : id)}
          className="flex min-h-14 w-full items-center justify-between text-left text-xl font-extrabold tracking-[-0.01em] text-carbon-900"
        >
          {label}
          <ChevronDown className={cn('h-5 w-5 text-carbon-600 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <div id={`es-mobile-${id}`} hidden={!isOpen} className="pb-4">
          <ul className="space-y-0.5 border-l-[3px] border-albero-400 pl-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={onNavigate} className="block py-2.5 text-[16px] text-carbon-700 hover:text-pino-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={footer.to} onClick={onNavigate} className="es-link mt-3 pl-4 text-[15px]">
            {footer.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div id="es-mobile-menu" role="dialog" aria-modal="true" aria-label="Menú del sitio" className="fixed inset-0 z-[80] font-es xl:hidden">
      <div className="absolute inset-0 bg-pino-950/60" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cal text-carbon-900 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b-[3px] border-albero-400 px-5">
          <Link to="/es/" onClick={onNavigate} aria-label="FreightVanta, página de inicio" className="text-pino-900">
            <Logo tone="dark" accent={ALMAGRE} className="font-es" />
          </Link>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-pino-900/25 hover:bg-arena-100">
            <span className="sr-only">Cerrar el menú</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navegación móvil" className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="divide-y divide-carbon-900/10">
            {group(
              'soluciones',
              'Soluciones',
              SERVICES_ES.map((service) => ({ to: `/es/soluciones/${service.slug}`, label: service.navLabel })),
              { to: ES_ANCHORS.services, label: 'Comparar recorridos de servicio' },
            )}
            {group(
              'sectores',
              'Sectores',
              INDUSTRIES_ES.map((industry) => ({ to: `/es/sectores/${industry.slug}`, label: industry.navLabel })),
              { to: '/es/sectores', label: 'Todas las soluciones por sector' },
            )}
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={link.match(route) ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between text-xl font-extrabold tracking-[-0.01em] text-carbon-900 aria-[current=page]:text-mar-700"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-carbon-500" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-carbon-900/10 pt-5 text-sm text-carbon-600">
            <li>
              <Link to={siteConfig.legalEs.aviso} onClick={onNavigate} className="underline underline-offset-4">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalEs.privacidad} onClick={onNavigate} className="underline underline-offset-4">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link to={siteConfig.legalEs.cookies} onClick={onNavigate} className="underline underline-offset-4">
                Política de cookies
              </Link>
            </li>
          </ul>
        </nav>

        <div className="shrink-0 border-t border-carbon-900/10 p-5">
          <Link to={ES_ANCHORS.enquiry} onClick={onNavigate} className="es-btn es-btn-primary w-full">
            Solicitar plan de envío
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Pie de página */
const footerHeading = 'text-[12px] font-extrabold uppercase tracking-[0.14em] text-albero-300';
const footerLink = 'inline-flex py-1 text-[15px] text-pino-100 transition-colors hover:text-white hover:underline underline-offset-4';

export function EsFooter() {
  const titles = Object.fromEntries(footerEs.items.map((column) => [column.key, column.title])) as Record<FooterColumn['key'], string>;
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const company = siteConfig.avisoLegal.company || siteConfig.legalEntity || siteConfig.brand;

  return (
    <footer className="bg-pino-900 text-pino-100">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="sr-only">{titles.brand}</h2>
            <Link to="/es/" aria-label="FreightVanta, página de inicio" className="inline-flex">
              <Logo accent={ALMAGRE} className="font-es" />
            </Link>
            <p className="mt-5 max-w-xs text-[16px] leading-relaxed">{footerEs.body}</p>
            {siteConfig.avisoLegal.company && <p className="mt-4 text-sm text-pino-200">{siteConfig.avisoLegal.company}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-pino-200">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={footerEs.cta_primary_url} className="es-btn es-btn-primary mt-8">
              {footerEs.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="es-footer-soluciones" className="lg:col-span-3">
            <h2 id="es-footer-soluciones" className={footerHeading}>
              {titles.solutions}
            </h2>
            <ul className="mt-5 space-y-1">
              {SERVICES_ES.map((service) => (
                <li key={service.slug}>
                  <Link to={`/es/soluciones/${service.slug}`} className={footerLink}>
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="es-footer-sectores" className="lg:col-span-2">
            <h2 id="es-footer-sectores" className={footerHeading}>
              {titles.industries}
            </h2>
            <ul className="mt-5 space-y-1">
              {INDUSTRIES_ES.map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/es/sectores/${industry.slug}`} className={footerLink}>
                    {industry.navLabel}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/es/guias" className={footerLink}>
                  Guías y recursos
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={footerHeading}>{titles.contact}</h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link to="/es/contacto" className={footerLink}>
                  Contacto
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
                <Link to={siteConfig.legalEs.aviso} className={footerLink}>
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalEs.privacidad} className={footerLink}>
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalEs.cookies} className={footerLink}>
                  Política de cookies
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legalEs.condiciones} className={footerLink}>
                  Condiciones generales
                </Link>
              </li>
              <li>
                <button type="button" onClick={openConsentSettings} className={`${footerLink} text-left`}>
                  Configurar cookies
                </button>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {siteConfig.social.map((profile) => (
                  <li key={profile.url}>
                    <a href={profile.url} className={footerLink} target="_blank" rel="noopener noreferrer">
                      {profile.label}
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t-[3px] border-albero-400 bg-pino-950 text-pino-200">
        <div className="shell flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company}. Todos los derechos reservados.
          </p>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">Español · España</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Cookies (art. 22.2 LSSI, Guía sobre el uso de las cookies de la AEPD) */
export function EsConsentBanner() {
  const { promptOpen, reopened, consent } = useConsent();
  const rejectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (promptOpen && reopened) rejectRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;
  const editor = siteConfig.avisoLegal.company;

  return (
    <div role="region" aria-label="Configuración de cookies" className="fixed inset-x-0 bottom-0 z-[70] font-es">
      <div className="border-t-[3px] border-albero-400 bg-pino-950 text-pino-100 shadow-[0_-16px_40px_-24px_rgba(0,0,0,0.6)]">
        <div className="shell flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-lg font-extrabold tracking-[-0.01em] text-white">Su privacidad, su elección</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              {editor ? `${editor} utiliza` : 'Utilizamos'} almacenamiento propio estrictamente necesario para recordar su elección y, solo si lo acepta,
              una medición de audiencia propia, sin terceros y sin recoger lo que escribe en los formularios, para saber qué secciones ayudan a
              planificar envíos. Puede aceptar, rechazar o configurar su elección, y cambiarla cuando quiera desde «Configurar cookies» en el pie de
              página.
              {consent !== 'unset' && ` Elección actual: ${consent === 'granted' ? 'medición aceptada' : 'medición rechazada'}.`}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
              <Link to={siteConfig.legalEs.cookies} className="font-semibold text-mar-200 underline underline-offset-4 hover:text-white">
                Política de cookies
              </Link>
              <Link to={siteConfig.legalEs.privacidad} className="font-semibold text-mar-200 underline underline-offset-4 hover:text-white">
                Política de privacidad
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button ref={rejectRef} type="button" onClick={() => setConsent('denied')} className="es-btn es-btn-ghost-light min-h-11 px-5 text-sm">
              Rechazar
            </button>
            <button type="button" onClick={() => setConsent('granted')} className="es-btn es-btn-ghost-light min-h-11 px-5 text-sm">
              Aceptar
            </button>
            <Link to={siteConfig.legalEs.cookies} className="es-btn min-h-11 px-5 text-sm text-white underline underline-offset-4 hover:bg-white/[0.06]">
              Configurar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
