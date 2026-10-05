import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/site';
import { frAnnouncement, frFooter, frNav, frServices } from '../../content/fr/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** French wordmark — poster face, ink blue, safran compass node. */
function FrLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-encre-900' : 'text-creme-50')}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false" className="shrink-0">
        <circle cx="16" cy="16" r="14.6" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="2.5 3" />
        <path d="M8 21 13.5 12l5 5.5L24 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="21" r="2.4" fill="currentColor" />
        <circle cx="24" cy="9" r="3" fill="#e39d14" />
      </svg>
      <span className="font-poster text-[1.4rem] font-bold leading-none tracking-[0.01em]">
        Freight<span className="font-semibold opacity-75">Vanta</span>
      </span>
    </span>
  );
}

export function FrHeader() {
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
      <div className="bg-encre-900 text-creme-50">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={frAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 hover:decoration-white sm:text-sm"
          >
            <span>{frAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-safran-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b-2 border-dotted border-sable-300 bg-creme-25/95 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/fr" aria-label="FreightVanta – page d’accueil française" className="shrink-0 rounded-full">
            <FrLogo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {frNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-full px-3.5 py-2 text-[15px] font-medium text-encre-700 transition-colors hover:bg-encre-900/[0.06] hover:text-encre-900"
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
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-encre-500 hover:text-encre-900 sm:inline-flex"
            >
              EN
              <span className="sr-only">— vers le site anglais</span>
            </Link>
            <Link
              to={frAnnouncement.cta_url}
              className="btn hidden min-h-11 rounded-full bg-bleufr-600 px-5 text-[14px] text-white hover:bg-bleufr-500 sm:inline-flex"
            >
              {frAnnouncement.cta_label}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="fr-mobile-nav"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-encre-900 ring-1 ring-sable-300 hover:bg-encre-900/[0.06] lg:hidden"
            >
              <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav id="fr-mobile-nav" aria-label="Navigation mobile" hidden={!open} className="border-t border-sable-200 bg-creme-25 lg:hidden">
          <ul className="shell divide-y divide-sable-200 py-2">
            {frNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-medium text-encre-900">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-encre-400" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" hrefLang="en" lang="en" className="flex min-h-12 items-center py-2 text-[15px] text-encre-500">
                Site anglais
              </Link>
            </li>
            <li className="py-3">
              <Link to={frAnnouncement.cta_url} className="btn w-full rounded-full bg-bleufr-600 text-white hover:bg-bleufr-500">
                {frAnnouncement.cta_label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export function FrFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-poster text-[12px] font-semibold uppercase tracking-[0.2em] text-encre-400';
  const linkClass = 'inline-flex py-1 text-[15px] text-encre-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="bg-encre-900 text-encre-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/fr" aria-label="FreightVanta – page d’accueil française" className="inline-flex rounded-full">
              <FrLogo tone="light" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{frFooter.tagline}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-encre-400">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-encre-400">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={frFooter.cta_url} className="btn mt-8 rounded-full bg-bleufr-600 text-white hover:bg-bleufr-500">
              {frFooter.cta_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="fr-footer-prestations" className="lg:col-span-3">
            <h2 id="fr-footer-prestations" className={heading}>
              {frFooter.columns.services}
            </h2>
            <ul className="mt-5 space-y-1">
              {frServices.map((service) => (
                <li key={service.id}>
                  <Link to="/fr/prestations" className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="fr-footer-navigation" className="lg:col-span-2">
            <h2 id="fr-footer-navigation" className={heading}>
              {frFooter.columns.site}
            </h2>
            <ul className="mt-5 space-y-1">
              {frNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{frFooter.columns.legal}</h2>
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
              {frFooter.legal_links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  {frFooter.cookie_settings}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-encre-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. {frFooter.rights}
          </p>
          <p className="font-poster text-[12px] font-semibold uppercase tracking-[0.2em]">{frFooter.locale_tag}</p>
        </div>
      </div>
    </footer>
  );
}
