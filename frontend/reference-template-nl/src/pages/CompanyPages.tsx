import type { ReactNode } from 'react';
import { EnquiryForm } from '../components/enquiry/EnquiryForm';
import { CheckList, CtaBand, PageHero } from '../components/layout/PageParts';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../components/ui/Icons';
import { hasDirectContact, siteConfig } from '../config/site';
import { enquirySection, operationSection, processSection } from '../content/en-global/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type LegalSlug } from '../lib/router';
import { useDocumentMeta } from '../lib/seo';

/* ------------------------------------------------------------------ About */
export function AboutPage() {
  useDocumentMeta({
    title: 'About FreightVanta',
    description:
      'FreightVanta turns scattered sourcing and freight handoffs into one workable shipment plan for importers, ecommerce operators, product teams, distributors, and growing brands.',
    path: '/about',
  });

  const audiences = ['Importers', 'Ecommerce operators', 'Product teams', 'Distributors', 'Growing brands'];
  const confirmations = [
    'Transit times, pricing, and service scope are confirmed in the shipment plan — never promised up front.',
    'Customs responsibilities, the broker, and the clearance scope are identified before any commitment.',
    'Warehousing and fulfillment scope is confirmed before inventory moves.',
    'If an assumption changes, the plan shows the change.',
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About FreightVanta' }]}
        eyebrow="About FreightVanta"
        title="One workable shipment plan."
        lead="FreightVanta turns scattered sourcing and freight handoffs into one workable shipment plan."
      />

      <section aria-labelledby="about-who" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="about-who" className="h2 text-navy-900">
              Who we work with
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Growing businesses that buy from China and sell to U.S.-oriented customers — and need the connected journey
              from product sourcing through the delivery handoff to stay clear.
            </p>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {audiences.map((audience) => (
              <li
                key={audience}
                className="flex items-center gap-3 border-b border-mist-200 py-4 font-display text-2xl font-semibold text-navy-900"
              >
                <span aria-hidden="true" className="h-2 w-2 bg-signal-600" />
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-how" className="bg-navy-950 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell">
          <h2 id="about-how" className="h2 max-w-3xl text-white">
            How we work
          </h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {operationSection.items.map((item) => (
              <li key={item.title} className="border-t border-white/15 pt-6">
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-navy-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-confirm" className="bg-mist-50 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="about-confirm" className="h2 text-navy-900">
              What we confirm before we commit
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">{processSection.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <CheckList items={confirmations} />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Contact */
export function ContactPage() {
  useDocumentMeta({
    title: 'Contact FreightVanta | Request a Shipment Plan',
    description: enquirySection.body,
    path: '/contact',
  });
  const { email, phone, address } = siteConfig.contact;

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact FreightVanta"
        lead={enquirySection.body}
      />
      <section aria-labelledby="contact-form-title" className="bg-mist-150 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="contact-form-title" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
              Request a shipment plan
            </h2>
            {hasDirectContact && (
              <ul className="mt-6 space-y-3 text-[16px] text-navy-700">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-2 font-semibold text-signal-700 underline underline-offset-4">
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 font-semibold text-signal-700 underline underline-offset-4">
                      <PhoneIcon className="h-4 w-4" />
                      {phone}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex gap-2">
                    <PinIcon className="mt-1 h-4 w-4 shrink-0" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            )}
            <h3 className="mt-10 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
              Helpful to include
            </h3>
            <p className="mt-3 text-[16px] leading-relaxed text-navy-700">{processSection.items[0].copy}</p>
            <CheckList items={enquirySection.settings.reassurance} className="mt-6" />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm idPrefix="contact-enquiry" placement="contact" copy={enquirySection.settings} />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Legal summaries */
const LEGAL: Record<LegalSlug, { title: string; lead: string; sections: Array<{ heading: string; body: ReactNode }> }> = {
  privacy: {
    title: 'Privacy policy',
    lead: 'How the English Global website handles the information you share with FreightVanta.',
    sections: [
      {
        heading: 'Shipment-plan requests',
        body: 'The request form collects your name, work email, company, optional phone number, origin, destination, starting point, and any cargo details or context you choose to share. These details are used to review your request and follow up with the right next step.',
      },
      {
        heading: 'Analytics',
        body: 'First-party analytics run only after you allow them. They record which parts of the page are used — never the values you type into the form.',
      },
      {
        heading: 'Your choices',
        body: 'You can change your analytics preference at any time from the cookie settings link in the footer. For questions about your information, use the contact page.',
      },
    ],
  },
  cookies: {
    title: 'Cookie policy',
    lead: 'What this website stores in your browser, and why.',
    sections: [
      {
        heading: 'Essential storage',
        body: 'Your analytics preference is stored locally in your browser so the site can respect it on future visits.',
      },
      {
        heading: 'First-party analytics (optional)',
        body: 'With your permission, the site records interaction events such as tab changes and link clicks to understand which sections help visitors. Form entries are never included.',
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    lead: 'The basics of using this website and its guides.',
    sections: [
      {
        heading: 'General information',
        body: 'Guides and page content are general planning information, not legal, customs, or tax advice.',
      },
      {
        heading: 'Scope is confirmed in the plan',
        body: 'Service scope, responsibilities, pricing, and timing are confirmed in writing in the shipment plan. Nothing on this website is a commitment to a transit time, price, or clearance outcome.',
      },
    ],
  },
};

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const page = LEGAL[slug];
  const { consent } = useConsent();
  useDocumentMeta({ title: `${page.title} | FreightVanta`, description: page.lead, path: `/${slug}` });

  return (
    <>
      <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: page.title }]} eyebrow="Legal" title={page.title} lead={page.lead} />
      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {page.sections.map((section) => (
            <div key={section.heading} className="border-t border-mist-200 pt-6">
              <h2 className="font-display text-2xl font-semibold text-navy-900">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-navy-700">{section.body}</p>
            </div>
          ))}
          {siteConfig.legalEntity && (
            <p className="text-sm text-navy-500">Operated by {siteConfig.legalEntity}.</p>
          )}
          {slug !== 'terms' && (
            <div className="rounded-[4px] bg-mist-50 p-6">
              <p className="font-semibold text-navy-900">
                Analytics preference: {consent === 'granted' ? 'allowed' : consent === 'denied' ? 'declined' : 'not chosen yet'}
              </p>
              <button type="button" onClick={openConsentSettings} className="text-link mt-3">
                Change cookie settings
              </button>
            </div>
          )}
          <Link to="/contact" className="text-link">
            Contact FreightVanta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ 404 */
export function NotFoundPage({ path }: { path: string }) {
  useDocumentMeta({
    title: 'Page not found | FreightVanta',
    description: 'The page you were looking for could not be found.',
    path,
  });

  return (
    <section className="relative isolate overflow-hidden bg-navy-900 py-24 text-white sm:py-32">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="shell max-w-3xl">
        <p className="eyebrow text-signal-300">Route not found</p>
        <h1 className="mt-5 font-display text-5xl font-bold leading-tight">This handoff does not lead anywhere.</h1>
        <p className="mt-5 text-lg text-navy-200">
          The page <span className="font-mono text-base text-navy-100">{path}</span> is not available. Choose a next step below.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn btn-primary">
            Back to the homepage
          </Link>
          <Link to="#services" className="btn btn-ghost-light">
            Explore solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
