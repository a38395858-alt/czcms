import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/site';
import { itAnnouncement, itFooter, itNav, itServices } from '../../content/it/home';
import { openConsentSettings } from '../../lib/analytics';
import { Link, useRoute } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../ui/Icons';

/** Italian wordmark: a bottle-green tile with a gold inner frame and a Pompeian-red node. */
function ItLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-verde-950' : 'text-avorio-50')}>
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false" className="shrink-0">
        <rect width="32" height="32" rx="3" fill="#143327" />
        <rect x="3.5" y="3.5" width="25" height="25" rx="1.5" fill="none" stroke="#c9a227" strokeWidth="1" />
        <path
          d="M8 22 13.5 13l5 5.5L24 10"
          fill="none"
          stroke="#faf7f0"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="22" r="2.1" fill="#faf7f0" />
        <circle cx="24" cy="10" r="3" fill="#a3262a" stroke="#faf7f0" strokeWidth="1" />
      </svg>
      <span className="font-bodoni text-[1.45rem] font-bold leading-none tracking-[0.005em]">
        Freight<span className="font-semibold opacity-80">Vanta</span>
      </span>
    </span>
  );
}

const ctaSmall =
  'btn hidden min-h-11 rounded-none bg-rosso-600 px-4 text-[14px] text-white hover:bg-rosso-700 sm:inline-flex';

export function ItHeader() {
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
      <div className="bg-verde-900 text-avorio-50">
        <div className="shell flex min-h-10 items-center justify-center py-2">
          <Link
            to={itAnnouncement.cta_url}
            className="group inline-flex items-center gap-2 text-center text-[13px] leading-snug underline decoration-white/25 underline-offset-4 hover:decoration-white sm:text-sm"
          >
            <span>{itAnnouncement.body}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-oro-300 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-avorio-50/95 backdrop-blur-sm">
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/it" aria-label="FreightVanta – pagina iniziale in italiano" className="shrink-0 rounded-[2px]">
            <ItLogo />
          </Link>

          <nav aria-label="Navigazione principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {itNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center rounded-none px-3.5 py-2 text-[15px] font-semibold text-verde-900 transition-colors hover:bg-verde-900/[0.07]"
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
              className="hidden items-center gap-1.5 rounded-none px-3 py-2 text-sm font-semibold text-fumo-600 hover:text-verde-900 sm:inline-flex"
            >
              EN
              <span className="sr-only">— vai al sito in inglese</span>
            </Link>
            <Link to={itAnnouncement.cta_url} className={ctaSmall}>
              {itAnnouncement.cta_label}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="it-mobile-nav"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-none text-verde-900 ring-1 ring-verde-900/30 hover:bg-verde-900/[0.07] lg:hidden"
            >
              <span className="sr-only">{open ? 'Chiuda il menu' : 'Apra il menu'}</span>
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="it-rule-gold" />

        <nav id="it-mobile-nav" aria-label="Navigazione mobile" hidden={!open} className="border-b border-avorio-200 bg-avorio-50 lg:hidden">
          <ul className="shell divide-y divide-avorio-200 py-2">
            {itNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="flex min-h-12 items-center justify-between py-2 text-[17px] font-semibold text-verde-950">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-fumo-600" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" hrefLang="en" lang="en" className="flex min-h-12 items-center py-2 text-[15px] text-fumo-600">
                Sito in inglese
              </Link>
            </li>
            <li className="py-3">
              <Link to={itAnnouncement.cta_url} className="btn w-full rounded-none bg-rosso-600 text-white hover:bg-rosso-700">
                {itAnnouncement.cta_label}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export function ItFooter() {
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();
  const heading = 'font-bodoni text-[13px] font-bold uppercase tracking-[0.22em] text-oro-300';
  const linkClass = 'inline-flex py-1 text-[15px] text-avorio-200 transition-colors hover:text-white hover:underline underline-offset-4';

  return (
    <footer className="bg-verde-950 text-avorio-200">
      <div aria-hidden="true" className="it-rule-gold" />
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/it" aria-label="FreightVanta – pagina iniziale in italiano" className="inline-flex rounded-[2px]">
              <ItLogo tone="light" />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{itFooter.tagline}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-avorio-200/70">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-avorio-200/70">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={itFooter.cta_url} className="btn mt-8 rounded-none bg-rosso-600 text-white hover:bg-rosso-700">
              {itFooter.cta_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="it-footer-servizi" className="lg:col-span-3">
            <h2 id="it-footer-servizi" className={heading}>
              {itFooter.columns.services}
            </h2>
            <ul className="mt-5 space-y-1">
              {itServices.map((service) => (
                <li key={service.id}>
                  <Link to="/it/servizi" className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="it-footer-navigazione" className="lg:col-span-2">
            <h2 id="it-footer-navigazione" className={heading}>
              {itFooter.columns.site}
            </h2>
            <ul className="mt-5 space-y-1">
              {itNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{itFooter.columns.legal}</h2>
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
              {itFooter.legal_links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  {itFooter.cookie_settings}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-avorio-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. {itFooter.rights}
          </p>
          <p className="font-bodoni text-[13px] font-bold uppercase tracking-[0.22em]">{itFooter.locale_tag}</p>
        </div>
      </div>
    </footer>
  );
}
