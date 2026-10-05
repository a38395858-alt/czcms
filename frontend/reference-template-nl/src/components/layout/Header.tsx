import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { LOCALIZED_HOMEPAGES, localizedUrl } from '../../config/site';
import { announcementSection, heroSection } from '../../content/en-global/home';
import { INDUSTRIES } from '../../content/en-global/industries';
import { SERVICES } from '../../content/en-global/services';
import { Link, useRoute, type Route } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, GlobeIcon, MenuIcon } from '../ui/Icons';
import { Logo } from '../ui/Logo';

type MenuId = 'solutions' | 'industries' | 'language';

const NAV_LINKS: Array<{ label: string; to: string; match: (route: Route) => boolean }> = [
  { label: 'Insights', to: '/guides', match: (r) => r.name === 'guides' || r.name === 'article' },
  { label: 'About FreightVanta', to: '/about', match: (r) => r.name === 'about' },
  { label: 'Contact', to: '/contact', match: (r) => r.name === 'contact' },
];

const navItem =
  'inline-flex items-center gap-1.5 rounded-[3px] px-3 py-2 text-[15px] font-medium text-navy-100 transition-colors hover:bg-white/[0.06] hover:text-white aria-expanded:bg-white/[0.08] aria-expanded:text-white aria-[current=page]:text-white aria-[current=page]:underline aria-[current=page]:decoration-signal-300 aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]';

export function AnnouncementBar() {
  return (
    <div className="bg-navy-950 text-navy-100">
      <div className="shell flex min-h-10 items-center justify-center py-2">
        <Link
          to={announcementSection.cta_primary_url}
          className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white sm:text-sm"
        >
          <span>{announcementSection.body}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-signal-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const route = useRoute();
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const mobileButton = useRef<HTMLButtonElement>(null);

  // Close menus whenever the route or anchor changes.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [route]);

  // Compact sticky styling once the hero has scrolled away.
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

  // Outside click + Escape for desktop menus.
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

  const onLogoClick = () => {
    if (route.name === 'home') window.scrollTo({ top: 0 });
  };

  const trigger = (id: MenuId, label: string, active: boolean) => (
    <button
      ref={(element) => {
        triggers.current[id] = element;
      }}
      type="button"
      aria-expanded={openMenu === id}
      aria-controls={`menu-${id}`}
      onClick={() => toggle(id)}
      className={cn(navItem, active && 'text-white underline decoration-signal-300 decoration-2 underline-offset-[10px]')}
    >
      {label}
      <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === id && 'rotate-180')} />
    </button>
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-white/10 transition-[background-color,box-shadow] duration-300',
          compact
            ? 'bg-navy-950/95 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md'
            : 'bg-navy-900',
        )}
      >
        <div ref={barRef} onBlur={onBarBlur} className="relative">
          <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
            <Link
              to="/"
              onClick={onLogoClick}
              className={cn('shrink-0 rounded-[2px] transition-transform duration-300', compact && 'xl:scale-95')}
              aria-label="FreightVanta home"
            >
              <Logo />
            </Link>

            <nav aria-label="Primary" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                <li>{trigger('solutions', 'Solutions', route.name === 'service')}</li>
                <li className="relative">
                  {trigger('industries', 'Industries', route.name === 'industries' || route.name === 'industry')}
                  <IndustriesMenu open={openMenu === 'industries'} route={route} />
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

            <div className="flex items-center gap-2">
              <div className="relative hidden xl:block">
                <button
                  ref={(element) => {
                    triggers.current.language = element;
                  }}
                  type="button"
                  aria-expanded={openMenu === 'language'}
                  aria-controls="menu-language"
                  onClick={() => toggle('language')}
                  className={navItem}
                >
                  <GlobeIcon className="h-[18px] w-[18px]" />
                  <span aria-hidden="true">EN</span>
                  <span className="sr-only">Language: English (Global). Change site language</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === 'language' && 'rotate-180')} />
                </button>
                <LanguageMenu open={openMenu === 'language'} />
              </div>
              <Link
                to={announcementSection.cta_primary_url}
                className="btn btn-primary hidden min-h-11 px-4 text-[14px] sm:inline-flex"
              >
                {announcementSection.cta_primary_label}
              </Link>
              <button
                ref={mobileButton}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] text-white ring-1 ring-white/25 transition-colors hover:bg-white/[0.06] xl:hidden"
              >
                <span className="sr-only">Open menu</span>
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <SolutionsMenu open={openMenu === 'solutions'} route={route} />
        </div>
      </header>

      {mobileOpen &&
        createPortal(<MobileMenu route={route} onClose={closeMobile} onNavigate={mobileNavigated} />, document.body)}
    </>
  );
}

function SolutionsMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="menu-solutions"
      hidden={!open}
      className="absolute inset-x-0 top-full border-t border-white/10 bg-white text-navy-900 shadow-[0_32px_64px_-24px_rgba(5,15,31,0.55)]"
    >
      <div className="shell grid grid-cols-12 gap-10 py-10">
        <div className="col-span-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-navy-500">Solutions</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-8">
            {SERVICES.map((service) => {
              const current = route.name === 'service' && route.slug === service.slug;
              return (
                <li key={service.slug}>
                  <Link
                    to={`/solutions/${service.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group -mx-3 flex items-start justify-between gap-4 rounded-[3px] px-3 py-3 transition-colors hover:bg-mist-50 aria-[current=page]:bg-mist-100"
                  >
                    <span>
                      <span className="block font-semibold text-navy-900">{service.navLabel}</span>
                      <span className="mt-0.5 block text-sm text-navy-500">{service.menuLine}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-signal-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="col-span-4 border-l border-mist-200 pl-10">
          <p className="font-display text-2xl font-semibold leading-tight text-navy-900">Not sure where to start?</p>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-600">{heroSection.settings.microcopy}</p>
          <div className="mt-6 flex flex-col items-start gap-4">
            <Link to="#enquiry" className="btn btn-primary">
              Get a shipment plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="#services" className="text-link">
              Compare service paths
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function IndustriesMenu({ open, route }: { open: boolean; route: Route }) {
  return (
    <div
      id="menu-industries"
      hidden={!open}
      className="absolute left-0 top-full mt-3 w-[27rem] rounded-[4px] bg-white p-3 text-navy-900 shadow-[0_28px_56px_-20px_rgba(5,15,31,0.55)] ring-1 ring-navy-900/10"
    >
      <ul>
        {INDUSTRIES.map((industry) => {
          const current = route.name === 'industry' && route.slug === industry.slug;
          return (
            <li key={industry.slug}>
              <Link
                to={`/industries/${industry.slug}`}
                aria-current={current ? 'page' : undefined}
                className="block rounded-[3px] px-3 py-3 transition-colors hover:bg-mist-50 aria-[current=page]:bg-mist-100"
              >
                <span className="block font-semibold">{industry.navLabel}</span>
                <span className="mt-0.5 block text-sm text-navy-500">{industry.menuLine}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-mist-200 px-3 pb-1 pt-3">
        <Link to="/industries" className="text-link text-[15px]">
          All industry solutions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function LanguageMenu({ open }: { open: boolean }) {
  return (
    <div
      id="menu-language"
      hidden={!open}
      className="absolute right-0 top-full mt-3 w-72 rounded-[4px] bg-white p-2 text-navy-900 shadow-[0_28px_56px_-20px_rgba(5,15,31,0.55)] ring-1 ring-navy-900/10"
    >
      <p className="px-3 pb-1 pt-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-navy-500">
        Choose your site
      </p>
      <LanguageList variant="menu" />
      <p className="px-3 pb-2 pt-2 text-[12px] leading-snug text-navy-500">
        Localized sites open their own homepage.
      </p>
    </div>
  );
}

export function LanguageList({ variant }: { variant: 'menu' | 'dark' }) {
  return (
    <ul className={variant === 'dark' ? 'flex flex-wrap gap-2' : undefined}>
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const className =
          variant === 'menu'
            ? cn(
                'flex items-center justify-between rounded-[3px] px-3 py-2.5 transition-colors hover:bg-mist-50',
                locale.current ? 'bg-mist-100 font-semibold text-navy-900' : 'text-navy-700 hover:text-navy-900',
              )
            : cn(
                'inline-flex min-h-10 items-center gap-2 rounded-[3px] px-3 py-2 text-sm ring-1 transition-colors',
                locale.current ? 'bg-white/10 font-semibold text-white ring-white/40' : 'text-navy-200 ring-white/15 hover:text-white hover:ring-white/40',
              );
        return (
          <li key={locale.hreflang}>
            <a
              href={localizedUrl(locale.path, locale.hreflang.split('-')[0])}
              aria-current={locale.current ? 'true' : undefined}
              hrefLang={locale.hreflang}
              lang={locale.hreflang}
              className={className}
            >
              {locale.label}
              {locale.current && <CheckIcon className={cn('h-4 w-4', variant === 'menu' ? 'text-signal-600' : 'text-signal-300')} />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function MobileMenu({ route, onClose, onNavigate }: { route: Route; onClose: () => void; onNavigate: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<'solutions' | 'industries' | null>(
    route.name === 'industry' || route.name === 'industries' ? 'industries' : 'solutions',
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

  const group = (id: 'solutions' | 'industries', label: string, links: Array<{ to: string; label: string }>, footer?: { to: string; label: string }) => {
    const isOpen = expanded === id;
    return (
      <li>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`mobile-${id}`}
          onClick={() => setExpanded(isOpen ? null : id)}
          className="flex min-h-14 w-full items-center justify-between text-left text-lg font-medium text-white"
        >
          {label}
          <ChevronDown className={cn('h-5 w-5 text-navy-300 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <div id={`mobile-${id}`} hidden={!isOpen} className="pb-4">
          <ul className="space-y-0.5 border-l border-white/15 pl-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={onNavigate} className="block rounded-[3px] py-2.5 text-[16px] text-navy-100 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {footer && (
            <Link to={footer.to} onClick={onNavigate} className="mt-3 inline-flex items-center gap-1.5 pl-4 text-[15px] font-semibold text-signal-300">
              {footer.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </li>
    );
  };

  return (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-[80] xl:hidden">
      <div className="absolute inset-0 bg-navy-950/70" aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-navy-950 text-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link to="/" onClick={onNavigate} aria-label="FreightVanta home">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] ring-1 ring-white/25 hover:bg-white/[0.06]"
          >
            <span className="sr-only">Close menu</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="divide-y divide-white/10">
            {group(
              'solutions',
              'Solutions',
              SERVICES.map((service) => ({ to: `/solutions/${service.slug}`, label: service.navLabel })),
              { to: '#services', label: 'Compare service paths' },
            )}
            {group(
              'industries',
              'Industries',
              INDUSTRIES.map((industry) => ({ to: `/industries/${industry.slug}`, label: industry.navLabel })),
              { to: '/industries', label: 'All industry solutions' },
            )}
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={link.match(route) ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between text-lg font-medium text-white aria-[current=page]:text-signal-300"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-navy-300" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-navy-300">Language</p>
            <div className="mt-3">
              <LanguageList variant="dark" />
            </div>
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-5">
          <Link to="#enquiry" onClick={onNavigate} className="btn btn-primary w-full">
            Get a shipment plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
