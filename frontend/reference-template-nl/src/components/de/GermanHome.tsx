import { useState } from 'react';
import {
  deCoverage,
  deEnquiry,
  deFaq,
  deHero,
  deIndustries,
  deOperation,
  deProcess,
  deResources,
  deServices,
  deServicesSection,
} from '../../content/de/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { DE_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const DE_FORM_THEME: FormTheme = {
  accentText: 'text-petrol-700',
  accentSolid: 'bg-petrol-700',
  accentButton: 'rounded-[2px] bg-brick-600 text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500',
  radius: 'rounded-[2px]',
};

/** Serif section heading — the German template's typographic signature. */
const deH2 = 'font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]';

const num = (index: number) => String(index + 1).padStart(2, '0');

/* ------------------------------------------------------------------ Hero
   Editorial dossier: full-width serif headline, archive-framed B/W photo,
   route as a DIN-style table — no dark band, no EN-style split hero. */
export function DeHero() {
  const media = getMedia(deHero.media_id);
  return (
    <section id="start" aria-labelledby="de-hero-title" className="bg-din-grid border-b border-line-200 bg-paper-25">
      <div className="shell pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="de-kicker text-brick-600">{deHero.eyebrow}</p>
        <h1
          id="de-hero-title"
          className="mt-7 max-w-5xl font-serif text-[2.35rem] font-bold leading-[1.1] text-graphite-900 text-balance sm:text-[3.1rem] xl:text-[3.8rem]"
        >
          {deHero.title}
        </h1>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-graphite-500 sm:text-[1.15rem]">{deHero.body}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to={deHero.cta_primary_url}
                onClick={() => track('home_hero_primary_click', { site: 'de' })}
                className="btn w-full rounded-[2px] bg-brick-600 px-6 text-base text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500 sm:w-auto"
              >
                {deHero.cta_primary_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={deHero.cta_secondary_url}
                onClick={() => track('home_hero_secondary_click', { site: 'de' })}
                className="btn w-full rounded-[2px] border border-graphite-900/30 px-6 text-base text-graphite-900 hover:border-graphite-900 sm:w-auto"
              >
                {deHero.cta_secondary_label}
              </Link>
            </div>
            <p className="mt-8 max-w-lg border-l-2 border-line-300 pl-4 text-[15px] leading-relaxed text-graphite-500">
              {deHero.microcopy}
            </p>
          </div>

          <div className="lg:col-span-7">
            <figure className="border border-graphite-900/25 bg-white p-2 shadow-[6px_6px_0_rgba(22,24,28,0.08)] sm:p-3">
              <Img
                media={media}
                alt={deHero.media_alt}
                priority
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="aspect-[3/2] w-full object-cover grayscale-25"
              />
              <figcaption className="flex items-baseline justify-between gap-3 px-1 pb-1 pt-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-graphite-500">
                <span>Abb. 01 · Umschlaghafen, Containerbrücken</span>
                <span aria-hidden="true">FV·DE</span>
              </figcaption>
            </figure>

            <ol
              aria-label="Versandroute"
              className="mt-4 grid grid-cols-2 gap-px border border-graphite-900/25 bg-graphite-900/25 sm:grid-cols-4"
            >
              {deHero.route_labels.map((label, index) => (
                <li key={label} className="bg-white px-4 py-3">
                  <span aria-hidden="true" className="font-mono text-[12px] font-medium text-petrol-700">
                    {num(index)}
                    {index < deHero.route_labels.length - 1 && <span className="ml-1.5 text-graphite-400">→</span>}
                  </span>
                  <span className="mt-1 block text-sm font-semibold tracking-[0.04em] text-graphite-900">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Coverage rail */
export function DeCoverage() {
  return (
    <section aria-label="Leistungsübersicht" className="border-b border-line-200 bg-white">
      <ul className="shell grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {deCoverage.map((label, index) => (
          <li key={label} className={cn('xl:border-l xl:border-line-200', index === 0 && 'xl:border-l-0')}>
            <Link
              to="/de/leistungen"
              className="flex min-h-12 items-center gap-2.5 py-2 text-[14.5px] font-medium leading-snug text-graphite-700 transition-colors hover:text-brick-600 xl:min-h-[4.5rem] xl:px-4"
            >
              <span aria-hidden="true" className="font-mono text-[11px] text-graphite-400">
                {num(index)}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Services: numbered accordion index */
export function DeServices() {
  const [open, setOpen] = useState<string>(deServices[0].id);

  return (
    <section id="leistungen" aria-labelledby="de-services-title" className="bg-paper-25 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deServicesSection.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="de-services-title" className={cn(deH2, 'lg:col-span-7')}>
            {deServicesSection.title}
          </h2>
          <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5">{deServicesSection.body}</p>
        </div>

        <div className="mt-12 border-t-2 border-graphite-900">
          {deServices.map((service, index) => {
            const isOpen = open === service.id;
            const panelId = `de-service-panel-${service.id}`;
            return (
              <div key={service.id} className="border-b border-line-300">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => {
                      setOpen(isOpen ? '' : service.id);
                      if (!isOpen) track('home_service_tab_change', { site: 'de', service: service.id, method: 'click' });
                    }}
                    className={cn(
                      'grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-baseline gap-3 py-5 text-left transition-colors sm:grid-cols-[3.5rem_minmax(0,1fr)_2.5rem] sm:py-6',
                      isOpen ? 'text-graphite-900' : 'text-graphite-700 hover:text-graphite-900',
                    )}
                  >
                    <span aria-hidden="true" className={cn('font-mono text-sm', isOpen ? 'text-brick-600' : 'text-graphite-400')}>
                      {num(index)}
                    </span>
                    <span className="font-serif text-xl font-bold sm:text-[1.55rem]">{service.label}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid h-8 w-8 place-items-center self-center border transition-all',
                        isOpen ? 'rotate-45 border-brick-600 bg-brick-600 text-white' : 'border-line-300 text-graphite-500',
                      )}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div id={panelId} hidden={!isOpen} className="pb-8 sm:pl-[3.5rem] lg:pr-[2.5rem]">
                  <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
                    <div>
                      <p className="text-[1.3rem] font-semibold leading-snug text-graphite-900">{service.title}</p>
                      <p className="mt-3 max-w-3xl text-[16.5px] leading-relaxed text-graphite-500">{service.copy}</p>
                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                          to="/de/anfrage"
                          onClick={() => {
                            if (service.starting_point) setPrefill(service.starting_point);
                            track('home_service_link_click', { site: 'de', service: service.id, link: 'enquiry' });
                          }}
                          className="inline-flex items-center gap-2 font-semibold text-brick-600 underline decoration-brick-600/40 decoration-2 underline-offset-4 hover:decoration-brick-600"
                        >
                          {deServicesSection.panel_cta_label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          to={service.detail_url}
                          hrefLang="en"
                          onClick={() =>
                            track('home_service_link_click', { site: 'de', service: service.id, link: 'service_page_en' })
                          }
                          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-petrol-700 underline decoration-petrol-700/30 underline-offset-4 hover:decoration-petrol-700"
                        >
                          {deServicesSection.detail_link_label}
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    <ul
                      aria-label={`${service.label} – Leistungsmerkmale`}
                      className="flex flex-wrap content-start gap-2 lg:flex-col lg:items-start lg:border-l lg:border-line-300 lg:pl-6"
                    >
                      {service.tags.map((tag) => (
                        <li key={tag} className="border border-line-300 bg-white px-3 py-1.5 font-mono text-[12.5px] font-medium text-graphite-700">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Operation: light ledger, serif pull-quote (no dark band) */
export function DeOperation() {
  return (
    <section id="betrieb" aria-labelledby="de-operation-title" className="border-y border-line-200 bg-paper-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deOperation.kicker}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="de-operation-title" className={deH2}>
              {deOperation.title}
            </h2>
            <blockquote className="mt-8 max-w-md border-l-2 border-brick-600 pl-5">
              <p className="font-serif text-xl font-medium italic leading-normal text-graphite-700 sm:text-[1.45rem]">
                {deOperation.pull_quote}
              </p>
            </blockquote>
          </div>
          <ol className="border-t-2 border-graphite-900 lg:col-span-7">
            {deOperation.items.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-line-300 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                <p aria-hidden="true" className="font-mono text-sm text-petrol-700">
                  {num(index)}
                </p>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-graphite-900">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-graphite-500">{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Process */
export function DeProcess() {
  const last = deProcess.steps.length - 1;
  return (
    <section id="ablauf" aria-labelledby="de-process-title" className="bg-din-grid bg-paper-25 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deProcess.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="de-process-title" className={cn(deH2, 'lg:col-span-6')}>
            {deProcess.title}
          </h2>
          <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5 lg:col-start-8">{deProcess.body}</p>
        </div>

        <ol className="mt-14 grid lg:grid-cols-4 lg:gap-8">
          {deProcess.steps.map((step, index) => (
            <li
              key={step.step}
              className={cn(
                'relative pb-12 pl-12 lg:pb-0 lg:pl-0 lg:pt-12',
                index !== last &&
                  'before:absolute before:bottom-0 before:left-[6px] before:top-6 before:w-px before:bg-line-300 lg:before:hidden',
                index !== last && 'lg:after:absolute lg:after:left-6 lg:after:right-[-2rem] lg:after:top-[6px] lg:after:h-px lg:after:bg-line-300',
              )}
            >
              <span aria-hidden="true" className="absolute left-0 top-1 h-[13px] w-[13px] rotate-45 bg-brick-600 ring-4 ring-paper-25 lg:top-0" />
              <p className="font-mono text-sm font-medium tracking-[0.08em] text-petrol-700">
                <span className="sr-only">Schritt </span>
                {step.step}
              </p>
              <h3 className="mt-3 font-serif text-[1.35rem] font-bold leading-snug text-graphite-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-graphite-500">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 border-t border-line-300 pt-8">
          <span aria-hidden="true" className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-petrol-700 text-petrol-700">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-serif text-xl font-medium italic leading-normal text-graphite-700 sm:text-[1.4rem]">{deProcess.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Industries */
export function DeIndustries() {
  return (
    <section id="branchen" aria-labelledby="de-industries-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deIndustries.kicker}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="de-industries-title" className={deH2}>
              {deIndustries.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-graphite-500">{deIndustries.body}</p>
          </div>
          <ul className="border-t-2 border-graphite-900 lg:col-span-7 lg:col-start-6">
            {deIndustries.items.map((item, index) => (
              <li key={item.slug} className="group relative border-b border-line-300 py-7 transition-colors hover:bg-paper-50 sm:px-3">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                  <p aria-hidden="true" className="pt-1.5 font-mono text-sm text-graphite-400 group-hover:text-brick-600">
                    {num(index)}
                  </p>
                  <div>
                    <h3 className="font-serif text-[1.45rem] font-bold text-graphite-900">
                      <Link
                        to={item.href}
                        hrefLang="en"
                        onClick={() => track('home_industry_click', { site: 'de', industry: item.slug })}
                        className="outline-none after:absolute after:inset-0 group-hover:text-brick-600 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-petrol-700"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-2 max-w-2xl text-base leading-relaxed text-graphite-500">{item.copy}</p>
                    <span aria-hidden="true" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                      {deIndustries.detail_label}
                      <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Resources */
export function DeResources() {
  return (
    <section id="wissen" aria-labelledby="de-resources-title" className="border-y border-line-200 bg-paper-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deResources.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="de-resources-title" className={deH2}>
              {deResources.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-graphite-500">{deResources.body}</p>
            <p className="mt-6 border-l-2 border-petrol-700 bg-white px-5 py-4 text-[15px] leading-relaxed text-graphite-700">
              {deResources.note}
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="border-t-2 border-graphite-900">
              {deResources.topics.map((topic, index) => (
                <li key={topic.href} className="border-b border-line-300">
                  <Link
                    to={topic.href}
                    hrefLang="en"
                    onClick={() => track('home_guides_click', { site: 'de', target: 'topic', slug: topic.href.split('/').pop() })}
                    className="group flex min-h-14 items-center gap-4 py-4 text-[16px] font-semibold text-graphite-900 transition-colors hover:text-brick-600"
                  >
                    <span aria-hidden="true" className="font-mono text-[12px] text-graphite-400">
                      {num(index)}
                    </span>
                    <span className="flex-1">{topic.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-petrol-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={deResources.cta_url}
              hrefLang="en"
              onClick={() => track('home_guides_click', { site: 'de', target: 'resource_center' })}
              className="btn mt-8 w-full rounded-[2px] border border-graphite-900/30 text-graphite-900 hover:border-graphite-900 sm:w-auto"
            >
              {deResources.cta_label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */
export function DeFaq() {
  return (
    <section id="fragen" aria-labelledby="de-faq-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="de-kicker text-graphite-500">{deFaq.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 id="de-faq-title" className={deH2}>
                {deFaq.title}
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-graphite-500">{deFaq.aside_prompt}</p>
              <Link
                to={deFaq.aside_link_url}
                className="mt-3 inline-flex items-center gap-2 font-semibold text-brick-600 underline decoration-brick-600/40 decoration-2 underline-offset-4 hover:decoration-brick-600"
              >
                {deFaq.aside_link_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="border-t-2 border-graphite-900">
              {deFaq.items.map((item, index) => (
                <details key={item.id} className="group border-b border-line-300">
                  <summary className="grid min-h-[44px] cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-baseline gap-3 py-6 text-left font-serif text-[1.2rem] font-bold leading-snug text-graphite-900 transition-colors hover:text-brick-600 sm:text-[1.3rem]">
                    <span aria-hidden="true" className="font-mono text-sm font-normal text-graphite-400">
                      {num(index)}
                    </span>
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 place-items-center self-center border border-line-300 text-graphite-700 transition-all group-open:rotate-45 group-open:border-brick-600 group-open:bg-brick-600 group-open:text-white"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-7 text-[16.5px] leading-relaxed text-graphite-500 sm:pl-[2.5rem]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Enquiry: "Formblatt" panel with graphite header bar */
export function DeEnquiry() {
  return (
    <section id="anfrage" aria-labelledby="de-enquiry-title" className="bg-din-grid border-t border-line-300 bg-paper-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="border-2 border-graphite-900 bg-paper-25 shadow-[8px_8px_0_rgba(22,24,28,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-2 border-graphite-900 bg-graphite-900 px-5 py-3 sm:px-8">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-paper-50">{deEnquiry.form_tag}</p>
            <p aria-hidden="true" className="hidden font-mono text-[12px] text-graphite-400 sm:block">
              {deEnquiry.kicker}
            </p>
          </div>

          <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <h2 id="de-enquiry-title" className="font-serif text-[1.8rem] font-bold leading-[1.15] text-graphite-900 text-balance sm:text-[2.2rem]">
                {deEnquiry.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-graphite-500">{deEnquiry.body}</p>
              <ul className="mt-10 space-y-4 border-t border-line-300 pt-8">
                {deEnquiry.reassurance.map((line) => (
                  <li key={line} className="flex gap-3 text-base leading-relaxed text-graphite-700">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-line-300 bg-white text-petrol-700">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <EnquiryForm
                idPrefix="de-enquiry"
                placement="de-home"
                copy={deEnquiry.copy}
                strings={DE_STRINGS}
                privacyUrl="/de/datenschutz"
                theme={DE_FORM_THEME}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
