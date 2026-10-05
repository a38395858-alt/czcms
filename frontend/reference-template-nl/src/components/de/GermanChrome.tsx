import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/site';
import { deAnnouncement, deFooter, deNav, deServices } from '../../content/de/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

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
      <span className="font-serif text-[1.35rem] font-bold leading-none">
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
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/de" aria-label="FreightVanta – deutsche Startseite" className="shrink-0 rounded-[2px]">
            <DeLogo />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {deNav.map((item) => (
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
            <Link to="/" hrefLang="en" lang="en" className="hidden items-center gap-1.5 rounded-[2px] px-3 py-2 text-sm font-medium text-graphite-500 hover:text-graphite-900 sm:inline-flex">
              EN
              <span className="sr-only">— switch to the English site</span>
            </Link>
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] text-graphite-900 ring-1 ring-line-300 hover:bg-graphite-900/[0.05] lg:hidden"
            >
              <span className="sr-only">{open ? 'Menü schließen' : 'Menü öffnen'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav id="de-mobile-nav" aria-label="Mobile Navigation" hidden={!open} className="border-t border-line-200 bg-paper-25 lg:hidden">
          <ul className="shell divide-y divide-line-200 py-2">
            {deNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-medium text-graphite-900">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-graphite-400" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" hrefLang="en" lang="en" className="flex min-h-12 items-center py-2 text-[15px] text-graphite-500">
                English site
              </Link>
            </li>
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
