import { useEffect, useRef, useState } from 'react';
import { LOCALIZED_HOMEPAGES, localizedUrl, siteConfig } from '../../config/site';
import { esAnnouncement, esFooter, esNav, esServices } from '../../content/es/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CheckIcon, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** Spanish wordmark: a restrained route mark, shared with the editorial homepage. */
function EsLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-azul-800' : 'text-arena-50')}>
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false" className="shrink-0">
        <rect width="32" height="32" rx="3" fill="#123483" />
        <path d="M8 22 13.5 13l5 5.5L24 10" fill="none" stroke="#fbf5e6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="22" r="2.3" fill="#fbf5e6" />
        <circle cx="24" cy="10" r="3.2" fill="#c2510a" />
      </svg>
      <span className="font-bricolage text-[1.4rem] font-semibold leading-none tracking-[-0.04em]">
        Freight<span className="opacity-75">Vanta</span>
      </span>
    </span>
  );
}

const ctaSmall =
  'btn hidden min-h-11 rounded-[3px] bg-terra-700 px-4 text-[14px] text-white hover:bg-terra-600 sm:inline-flex';

export function EsHeader() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [route]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
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
      <div className="bg-azul-800 text-white">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={esAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/35 underline-offset-4 hover:decoration-white sm:text-sm"
          >
            <span>{esAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-oranje-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-carbon-900/15 bg-arena-50/95 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/es" aria-label="FreightVanta – página de inicio en español" className="shrink-0 rounded-[3px]">
            <EsLogo />
          </Link>

          <nav aria-label="Navegación principal" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {esNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-[3px] px-3.5 py-2 text-[15px] font-medium text-azul-800 transition-colors hover:bg-azul-800/[0.06] hover:text-azul-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              hrefLang="en"
              lang="en"
              className="hidden items-center gap-1.5 rounded-[3px] px-3 py-2 text-sm font-medium text-carbon-600 hover:text-azul-800 sm:inline-flex"
            >
              EN
              <span className="sr-only">— ir al sitio en inglés</span>
            </Link>
            <Link to={esAnnouncement.cta_url} className={ctaSmall}>
              {esAnnouncement.cta_label}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="es-mobile-nav"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] text-azul-800 ring-1 ring-azul-800/25 hover:bg-azul-800/[0.06] xl:hidden"
            >
              <span className="sr-only">{open ? 'Cerrar el menú' : 'Abrir el menú'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <nav id="es-mobile-nav" aria-label="Navegación móvil" hidden={!open} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-arena-200 bg-arena-50 xl:hidden">
          <ul className="shell divide-y divide-arena-200 py-2">
            {esNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-medium text-azul-800">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-terra-700" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" hrefLang="en" lang="en" className="flex min-h-12 items-center py-2 text-[15px] text-carbon-600">
                Sitio en inglés
              </Link>
            </li>
            <li className="py-3">
              <Link
                to={esAnnouncement.cta_url}
                className="btn w-full rounded-[3px] bg-terra-700 text-white hover:bg-terra-600"
              >
                {esAnnouncement.cta_label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

function EsLanguageList() {
  return (
    <ul className="flex flex-wrap gap-2">
      {LOCALIZED_HOMEPAGES.map((locale) => {
        const isCurrent = locale.hreflang === 'es';
        const className = cn(
          'inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 py-2 text-sm ring-1 transition-colors',
          isCurrent
            ? 'bg-white/10 font-semibold text-white ring-white/40'
            : 'text-arena-200 ring-white/15 hover:text-white hover:ring-white/40',
        );
        if (isCurrent)
          return (
            <li key={locale.hreflang}>
              <Link to="/es" aria-current="true" hrefLang="es" lang="es" className={className}>
                {locale.label}
                <CheckIcon className="h-4 w-4 text-sol-400" />
              </Link>
            </li>
          );
        if (locale.internal || locale.current)
          return (
            <li key={locale.hreflang}>
              <Link
                to={locale.current ? '/' : (locale.internal as string)}
                hrefLang={locale.hreflang}
                lang={locale.hreflang}
                className={className}
              >
                {locale.label}
              </Link>
            </li>
          );
        return (
          <li key={locale.hreflang}>
            <a href={localizedUrl(locale.path)} hrefLang={locale.hreflang} lang={locale.hreflang} className={className}>
              {locale.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function EsFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-arena-300';
  const linkClass = 'inline-flex py-1 text-[15px] text-arena-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="bg-azul-800 text-arena-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/es" aria-label="FreightVanta – página de inicio en español" className="inline-flex rounded-[3px]">
              <EsLogo tone="light" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{esFooter.tagline}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-arena-300">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-arena-300">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link
              to={esFooter.cta_url}
              className="btn mt-8 rounded-[3px] bg-terra-700 text-white hover:bg-terra-600"
            >
              {esFooter.cta_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="es-footer-servicios" className="lg:col-span-3">
            <h2 id="es-footer-servicios" className={heading}>
              {esFooter.columns.services}
            </h2>
            <ul className="mt-5 space-y-1">
              {esServices.map((service) => (
                <li key={service.id}>
                  <Link to="/es/servicios" className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="es-footer-navegacion" className="lg:col-span-2">
            <h2 id="es-footer-navegacion" className={heading}>
              {esFooter.columns.site}
            </h2>
            <ul className="mt-5 space-y-1">
              {esNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{esFooter.columns.legal}</h2>
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
              {esFooter.legal_links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  {esFooter.cookie_settings}
                </button>
              </li>
            </ul>
            <div className="mt-8">
              <h3 className={heading}>{esFooter.language_label}</h3>
              <div className="mt-4">
                <EsLanguageList />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-arena-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. {esFooter.rights}
          </p>
          <p className="font-bricolage text-[12.5px] font-bold uppercase tracking-[0.18em]">{esFooter.locale_tag}</p>
        </div>
      </div>
    </footer>
  );
}
