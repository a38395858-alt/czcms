import { siteConfig } from '../../config/site';
import { footerSection } from '../../content/en-global/home';
import { INDUSTRIES } from '../../content/en-global/industries';
import { SERVICES } from '../../content/en-global/services';
import type { FooterColumn } from '../../content/types';
import { openConsentSettings } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../ui/Icons';
import { Logo } from '../ui/Logo';

const heading = 'font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-navy-300';
const linkClass = 'inline-flex py-1 text-[15px] text-navy-100 transition-colors hover:text-white hover:underline underline-offset-4';

export function SiteFooter() {
  const titles = Object.fromEntries(footerSection.items.map((column) => [column.key, column.title])) as Record<
    FooterColumn['key'],
    string
  >;
  const { email, phone, address } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <h2 className="sr-only">{titles.brand}</h2>
            <Link to="/" aria-label="FreightVanta home" className="inline-flex rounded-[2px]">
              <Logo />
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-navy-200">{footerSection.body}</p>
            {siteConfig.legalEntity && <p className="mt-4 text-sm text-navy-300">{siteConfig.legalEntity}</p>}
            {address && (
              <p className="mt-3 flex max-w-xs gap-2 text-sm leading-relaxed text-navy-300">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <Link to={footerSection.cta_primary_url} className="btn btn-primary mt-8">
              {footerSection.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-labelledby="footer-solutions" className="lg:col-span-3">
            <h2 id="footer-solutions" className={heading}>
              {titles.solutions}
            </h2>
            <ul className="mt-5 space-y-1">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link to={`/solutions/${service.slug}`} className={linkClass}>
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-industries" className="lg:col-span-2">
            <h2 id="footer-industries" className={heading}>
              {titles.industries}
            </h2>
            <ul className="mt-5 space-y-1">
              {INDUSTRIES.map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/industries/${industry.slug}`} className={linkClass}>
                    {industry.navLabel}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/guides" className={linkClass}>
                  Guides &amp; insights
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>{titles.contact}</h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact FreightVanta
                </Link>
              </li>
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
              <li>
                <Link to={siteConfig.legal.privacy} className={linkClass}>
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legal.cookies} className={linkClass}>
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link to={siteConfig.legal.terms} className={linkClass}>
                  Terms of use
                </Link>
              </li>
              <li>
                <button type="button" onClick={openConsentSettings} className={`${linkClass} text-left`}>
                  Cookie settings
                </button>
              </li>
            </ul>
            {siteConfig.social.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {siteConfig.social.map((profile) => (
                  <li key={profile.url}>
                    <a href={profile.url} className={linkClass} target="_blank" rel="noopener noreferrer">
                      {profile.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-sm text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalEntity || siteConfig.brand}. All rights reserved.
          </p>
          <p className="font-mono text-[12px] uppercase tracking-[0.12em]">English · Global</p>
        </div>
      </div>
    </footer>
  );
}
