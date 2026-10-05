import { useEffect, useRef, useState } from 'react';
import { localizedUrl, siteConfig } from '../../config/site';
import { nlAnnouncement, nlFooter, nlNav, nlServices } from '../../content/nl/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** Dutch wordmark: a chamfered Delft-blue tile with a white route and an orange node. */
function NlLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-dijk-950' : 'text-getij-50')}>
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false" className="shrink-0">
        <path d="M3 0h23l6 6v23a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3Z" fill="#1e4fa1" />
        <path
          d="M8 22 13.5 13l5 5.5L24 10"
          fill="none"
          stroke="#f2f5f8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="22" r="2.1" fill="#f2f5f8" />
        <circle cx="24" cy="10" r="3" fill="#e85d04" stroke="#f2f5f8" strokeWidth="1" />
      </svg>
      <span className="font-archivo text-[1.25rem] leading-none tracking-tight">
        Freight<span className="opacity-80">Vanta</span>
      </span>
    </span>
  );
}

const ctaSmall =
  'btn hidden min-h-11 rounded-[3px] bg-polder-700 px-4 text-[14px] text-white hover:bg-polder-800 sm:inline-flex';

export function NlHeader() {
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
      <div className="bg-delfts-700 text-white">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={nlAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/30 underline-offset-4 hover:decoration-white sm:text-sm"
          >
            <span>{nlAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-oranje-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b-[3px] border-oranje-500 bg-getij-50/95 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/nl" aria-label="FreightVanta – Nederlandse homepage" className="shrink-0 rounded-[2px]">
            <NlLogo />
          </Link>

          <nav aria-label="Hoofdnavigatie" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nlNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-[3px] px-3.5 py-2 text-[15px] font-semibold text-dijk-800 transition-colors hover:bg-dijk-900/[0.07] hover:text-dijk-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={localizedUrl('/', 'en')}
              hrefLang="en"
              lang="en"
              className="hidden items-center gap-1.5 rounded-[3px] px-3 py-2 text-sm font-semibold text-lei-600 hover:text-dijk-950 sm:inline-flex"
            >
              EN
              <span className="sr-only">— naar de Engelstalige site</span>
            </a>
            <Link to={nlAnnouncement.cta_url} className={cn(ctaSmall, 'nl-btn-seal')}>
              {nlAnnouncement.cta_label}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="nl-mobile-nav"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] text-dijk-950 ring-1 ring-dijk-900/30 hover:bg-dijk-900/[0.07] lg:hidden"
            >
              <span className="sr-only">{open ? 'Menu sluiten' : 'Menu openen'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav id="nl-mobile-nav" aria-label="Mobiele navigatie" hidden={!open} className="border-t border-getij-200 bg-getij-50 lg:hidden">
          <ul className="shell divide-y divide-getij-200 py-2">
            {nlNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-semibold text-dijk-950">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-lei-600" />
                </Link>
              </li>
            ))}
            <li>
              <a href={localizedUrl('/', 'en')} hrefLang="en" lang="en" className="flex min-h-12 items-center py-2 text-[15px] text-lei-600">
                Engelstalige site
              </a>
            </li>
            <li className="py-3">
              <Link
                to={nlAnnouncement.cta_url}
                className="btn nl-btn-seal w-full rounded-[3px] bg-polder-700 text-white hover:bg-polder-800"
              >
                {nlAnnouncement.cta_label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export function NlFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-archivo text-[12px] uppercase tracking-[0.18em] text-oranje-300';
  const linkClass = 'inline-flex py-1 text-[15px] text-getij-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="border-t-[3px] border-oranje-500 bg-dijk-950 text-getij-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/nl" aria-label="FreightVanta – Nederlandse homepage" className="inline-flex rounded-[2px]">
              <NlLogo tone="light" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{nlFooter.tagline}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-getij-300">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-getij-300">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link
              to={nlFooter.cta_url}
              className="btn nl-btn-seal mt-8 rounded-[3px] bg-polder-700 text-white hover:bg-polder-800"
            >
              {nlFooter.cta_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="nl-footer-diensten" className="lg:col-span-3">
            <h2 id="nl-footer-diensten" className={heading}>
              {nlFooter.columns.services}
            </h2>
            <ul className="mt-5 space-y-1">
              {nlServices.map((service) => (
                <li key={service.id}>
                  <Link to="/nl/diensten" className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="nl-footer-navigatie" className="lg:col-span-2">
            <h2 id="nl-footer-navigatie" className={heading}>
              {nlFooter.columns.site}
            </h2>
            <ul className="mt-5 space-y-1">
              {nlNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{nlFooter.columns.legal}</h2>
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
              {nlFooter.legal_links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  {nlFooter.cookie_settings}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-getij-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. {nlFooter.rights}
          </p>
          <p className="font-archivo text-[12px] uppercase tracking-[0.18em]">{nlFooter.locale_tag}</p>
        </div>
      </div>
    </footer>
  );
}
