import { useEffect, useRef, useState } from 'react';
import { LOCALIZED_HOMEPAGES, siteConfig } from '../../config/site';
import { deAnnouncement, deFooter, deNav, deServices } from '../../content/de/home';
import { DE_INDUSTRY_TOPIC_NAV_LINKS, DE_SERVICE_TOPIC_NAV_LINKS } from '../../content/de/topics';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cmsHref, languageHref } from '../../lib/cms';
import { cn } from '../../utils/cn';
import { ArrowRight, CheckIcon, ChevronDown, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** German wordmark on the "Speicherstadt Präzision" template: graphite + brick node. */
function DeLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-graphite-900' : 'text-white')}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false" className="shrink-0">
        <rect x="0.75" y="0.75" width="30.5" height="30.5" fill="none" stroke="currentColor" strokeOpacity="0.4" />
        <path d="M7 22 13 12l6 6 6-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
        <rect x="4.8" y="19.8" width="4.4" height="4.4" fill="currentColor" />
        <rect x="22.4" y="6.4" width="5.2" height="5.2" fill="#b23c1f" className="fill-brick-600" />
      </svg>
      <span className="font-serif text-[1.05rem] min-[380px]:text-[1.35rem] font-bold leading-none">
        Freight<span className="font-semibold opacity-75">Vanta</span>
      </span>
    </span>
  );
}

export function DeHeader() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [route]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="border-b border-line-200 bg-graphite-900 text-paper-50">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={deAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 hover:decoration-white sm:text-sm"
          >
            <span>{deAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-petrol-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line-300 bg-paper-25/95 backdrop-blur-sm">
        <div className="shell relative flex h-16 items-center justify-between gap-2 sm:gap-4 xl:h-[72px]">
          <Link to="/de" aria-label="FreightVanta – deutsche Startseite" className="shrink-0 rounded-[2px]">
            <DeLogo />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              <li><DeTopicMenu /></li><li><DeTopicMenu industry /></li>
              {deNav.filter(item => !['Leistungen', 'Branchen'].includes(item.label)).map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-[2px] px-3 py-2 text-[15px] font-medium text-graphite-700 transition-colors hover:bg-graphite-900/[0.05] hover:text-graphite-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <details data-public-menu className="relative">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-2 py-2 text-sm font-medium text-graphite-700 sm:px-3" aria-label="Sprache wechseln">DE <ChevronDown className="h-4 w-4" /></summary>
              <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-line-300 bg-paper-25 p-2 shadow-[0_16px_32px_-12px_rgba(22,24,28,0.25)]"><DeLanguageList menu /></div>
            </details>
            <Link
              to={deAnnouncement.cta_url}
              className="btn hidden min-h-11 rounded-[2px] bg-brick-600 px-4 text-[14px] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500 sm:inline-flex"
            >
              {deAnnouncement.cta_label}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="de-mobile-nav"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] text-graphite-900 ring-1 ring-line-300 hover:bg-graphite-900/[0.05] xl:hidden"
            >
              <span className="sr-only">{open ? 'Menü schließen' : 'Menü öffnen'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav id="de-mobile-nav" aria-label="Mobile Navigation" hidden={!open} className="border-t border-line-200 bg-paper-25 xl:hidden">
          <ul className="shell divide-y divide-line-200 py-2">
            <li><DeTopicMenu mobile /></li><li><DeTopicMenu industry mobile /></li>
            {deNav.filter(item => !['Leistungen', 'Branchen'].includes(item.label)).map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-medium text-graphite-900">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-graphite-400" />
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link to={deAnnouncement.cta_url} className="btn w-full rounded-[2px] bg-brick-600 text-white hover:bg-brick-500">
                {deAnnouncement.cta_label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

function DeLanguageList({ menu = false }: { menu?: boolean }) {
  return (
    <ul className={menu ? 'space-y-1' : 'flex flex-wrap gap-2'}>
      {LOCALIZED_HOMEPAGES.map((locale) => (
        <li key={locale.hreflang}>
          <a href={languageHref(locale.hreflang)} hrefLang={locale.hreflang} lang={locale.hreflang} aria-current={locale.hreflang === 'de' ? 'page' : undefined}
            className={menu ? 'flex min-h-11 items-center justify-between px-3 py-2 text-sm text-graphite-900 hover:bg-paper-100 aria-[current=page]:font-semibold' : 'inline-flex min-h-10 items-center gap-2 px-3 py-2 text-sm text-white ring-1 ring-white/25 hover:bg-white/10'}>
            {locale.label}
            {locale.hreflang === 'de' && <CheckIcon className="h-4 w-4 text-petrol-700" />}
          </a>
        </li>
      ))}
    </ul>
  );
}

function DeTopicMenu({ industry = false, mobile = false }: { industry?: boolean; mobile?: boolean }) {
  const links = industry ? DE_INDUSTRY_TOPIC_NAV_LINKS : DE_SERVICE_TOPIC_NAV_LINKS;
  return (
    <details data-public-menu className={mobile ? 'py-2' : 'de-topic-menu'}>
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 text-[15px] font-medium text-graphite-700 hover:bg-paper-100">
        {industry ? 'Branchen' : 'Leistungen'}<ChevronDown className="h-4 w-4" />
      </summary>
      <div className={mobile ? 'grid gap-1 pb-2' : 'de-topic-panel'}>
        {links.map(item => <Link key={item.href} to={item.href} aria-current={cmsHref(item.href) === languageHref('de') ? 'page' : undefined} className="block px-4 py-3 text-graphite-900 hover:bg-paper-100">
          <strong className="block text-[15px] font-medium">{item.label}</strong>
          <span className="mt-1 block text-[13px] leading-relaxed text-graphite-500">{item.menuLine}</span>
        </Link>)}
      </div>
    </details>
  );
}

export function DeFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-graphite-400';
  const linkClass = 'inline-flex py-1 text-[15px] text-graphite-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="bg-graphite-900 text-graphite-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/de" aria-label="FreightVanta – deutsche Startseite" className="inline-flex rounded-[2px]">
              <DeLogo tone="light" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{deFooter.tagline}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-graphite-400">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-graphite-400">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link
              to={deFooter.cta_url}
              className="btn mt-8 rounded-[2px] bg-brick-600 text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500"
            >
              {deFooter.cta_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="de-footer-leistungen" className="lg:col-span-3">
            <h2 id="de-footer-leistungen" className={heading}>
              {deFooter.columns.services}
            </h2>
            <ul className="mt-5 space-y-1">
              {deServices.map((service) => (
                <li key={service.id}>
                  <Link to="/de/leistungen" className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-graphite-400">
              Themenseiten
            </p>
            <ul className="mt-3 space-y-1">
              {DE_SERVICE_TOPIC_NAV_LINKS.map((topic) => (
                <li key={topic.href}>
                  <Link to={topic.href} className={linkClass}>
                    {topic.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="de-footer-navigation" className="lg:col-span-2">
            <h2 id="de-footer-navigation" className={heading}>
              {deFooter.columns.site}
            </h2>
            <ul className="mt-5 space-y-1">
              {deNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-graphite-400">
              Branchenthemen
            </p>
            <ul className="mt-3 space-y-1">
              {DE_INDUSTRY_TOPIC_NAV_LINKS.map((topic) => (
                <li key={topic.href}>
                  <Link to={topic.href} className={linkClass}>
                    {topic.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{deFooter.columns.legal}</h2>
            <ul className="mt-5 space-y-1">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className={`${linkClass} items-center gap-2`}>
                    <MailIcon className="h-4 w-4" />
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className={`${linkClass} items-center gap-2`}>
                    <PhoneIcon className="h-4 w-4" />
                    {phone}
                  </a>
                </li>
              )}
              {deFooter.legal_links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  {deFooter.cookie_settings}
                </button>
              </li>
            </ul>
            <div className="mt-8">
              <h3 className={heading}>{deFooter.language_label}</h3>
              <div className="mt-4">
                <DeLanguageList />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-graphite-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. {deFooter.rights}
          </p>
          <p className="font-mono text-[12px] uppercase tracking-[0.12em]">{deFooter.locale_tag}</p>
        </div>
      </div>
    </footer>
  );
}
