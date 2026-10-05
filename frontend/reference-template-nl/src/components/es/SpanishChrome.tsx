import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/site';
import { esAnnouncement, esFooter, esNav, esServices } from '../../content/es/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** Spanish wordmark: a glazed blue tile with a route line and a sun node. */
function EsLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-carbon-900' : 'text-arena-50')}>
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#1b46a8" />
        <path d="M8 22 13.5 13l5 5.5L24 10" fill="none" stroke="#fbf5e6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="22" r="2.3" fill="#fbf5e6" />
        <circle cx="24" cy="10" r="3.2" fill="#ffc21a" />
      </svg>
      <span className="font-bricolage text-[1.4rem] font-extrabold leading-none tracking-tight">
        Freight<span className="font-semibold opacity-80">Vanta</span>
      </span>
    </span>
  );
}

const ctaSmall =
  'btn hidden min-h-11 rounded-xl border-2 border-carbon-900 bg-sol-400 px-4 text-[14px] text-carbon-900 hover:bg-sol-300 sm:inline-flex';

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
      <div className="bg-sol-400 text-carbon-900">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={esAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] font-medium leading-snug underline decoration-carbon-900/40 underline-offset-4 hover:decoration-carbon-900 focus-visible:outline-carbon-900 sm:text-sm"
          >
            <span>{esAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-arena-50/95 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/es" aria-label="FreightVanta – página de inicio en español" className="shrink-0 rounded-lg">
            <EsLogo />
          </Link>

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {esNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-lg px-3.5 py-2 text-[15px] font-semibold text-carbon-800 transition-colors hover:bg-carbon-900/[0.07] hover:text-carbon-900"
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
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-carbon-600 hover:text-carbon-900 sm:inline-flex"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-carbon-900 ring-2 ring-carbon-900/20 hover:bg-carbon-900/[0.07] lg:hidden"
            >
              <span className="sr-only">{open ? 'Cerrar el menú' : 'Abrir el menú'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="azulejo-strip" />

        <nav id="es-mobile-nav" aria-label="Navegación móvil" hidden={!open} className="border-b border-arena-200 bg-arena-50 lg:hidden">
          <ul className="shell divide-y divide-arena-200 py-2">
            {esNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-semibold text-carbon-900">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-carbon-600" />
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
                className="btn w-full rounded-xl border-2 border-carbon-900 bg-sol-400 text-carbon-900 hover:bg-sol-300"
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

export function EsFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-bricolage text-[12.5px] font-bold uppercase tracking-[0.18em] text-arena-300';
  const linkClass = 'inline-flex py-1 text-[15px] text-arena-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="bg-carbon-900 text-arena-200">
      <div aria-hidden="true" className="azulejo-strip" />
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/es" aria-label="FreightVanta – página de inicio en español" className="inline-flex rounded-lg">
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
              className="btn mt-8 rounded-xl border-2 border-sol-400 bg-sol-400 text-carbon-900 hover:bg-sol-300"
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
