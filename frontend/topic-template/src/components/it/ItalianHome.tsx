import { useRef, useState, type KeyboardEvent } from 'react';
import {
  itCoverage,
  itEnquiry,
  itFaq,
  itHero,
  itIndustries,
  itOperation,
  itProcess,
  itResources,
  itServices,
  itServicesSection,
} from '../../content/it/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { IT_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const IT_FORM_THEME: FormTheme = {
  accentText: 'text-verde-800',
  accentSolid: 'bg-verde-800',
  accentButton: 'rounded-none bg-rosso-600 text-white hover:bg-rosso-700',
  radius: 'rounded-none',
};

/** Didone headline — the Italian template's typographic signature. */
const itH2 = 'font-bodoni text-[2.1rem] font-bold leading-[1.04] text-verde-950 sm:text-[2.8rem]';

const btnPrimary =
  'btn w-full rounded-none bg-rosso-600 px-6 text-base text-white hover:bg-rosso-700 sm:w-auto';
const btnGhost =
  'btn w-full rounded-none border-2 border-verde-900 px-6 text-base text-verde-900 hover:bg-verde-900 hover:text-avorio-50 sm:w-auto';

/** Classical numbering used across the whole Italian template. */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const INDUSTRY_MEDIA: Record<string, { id: string; alt: string }> = {
  'cross-border-ecommerce': { id: 'industry-ecommerce', alt: 'Team di magazzino al lavoro tra scaffali e colli.' },
  'consumer-goods': { id: 'industry-consumer-goods', alt: 'Un cliente apre un pacco con un piccolo prodotto.' },
  'industrial-components': { id: 'industry-industrial', alt: 'Primo piano di ingranaggi e pezzi meccanici in officina.' },
  'time-critical-cargo': { id: 'industry-time-critical', alt: 'Aereo al gate di notte durante le operazioni di carico.' },
};

/* ------------------------------------------------------------------ Eroe
   Editorial mirror: framed photograph on the left, Bodoni headline on the right,
   and the route as a ledger of Roman numerals. Mobile keeps copy first. */
export function ItHero() {
  const media = getMedia(itHero.media_id);
  return (
    <section id="inizio" aria-labelledby="it-hero-title" className="bg-avorio-50">
      <div className="shell grid items-center gap-12 pb-14 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-16">
        <div className="order-1 lg:order-2 lg:col-span-7">
          <p className="it-kicker text-rosso-600">{itHero.eyebrow}</p>
          <h1
            id="it-hero-title"
            className="mt-6 font-bodoni text-[2.5rem] font-bold leading-[1.02] text-verde-950 text-balance sm:text-[3.4rem] xl:text-[4rem]"
          >
            {itHero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fumo-600 sm:text-[1.15rem]">{itHero.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={itHero.cta_primary_url} onClick={() => track('home_hero_primary_click', { site: 'it' })} className={btnPrimary}>
              {itHero.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={itHero.cta_secondary_url} onClick={() => track('home_hero_secondary_click', { site: 'it' })} className={btnGhost}>
              {itHero.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-8 max-w-lg border-l-2 border-oro-500 pl-4 font-bodoni text-[1.08rem] italic leading-relaxed text-fumo-600">
            {itHero.microcopy}
          </p>
        </div>

        <figure className="order-2 mx-auto w-full max-w-md lg:order-1 lg:col-span-5 lg:mx-0">
          <div className="border-2 border-verde-900 bg-white p-2">
            <div className="border border-oro-500/70">
              <Img
                media={media}
                alt={itHero.media_alt}
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <figcaption className="mt-3 flex items-baseline justify-between gap-3 font-bodoni text-[13px] font-bold uppercase tracking-[0.14em] text-fumo-600">
            <span>{itHero.media_caption}</span>
            <span aria-hidden="true" className="text-rosso-600">
              FV·IT
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="shell pb-16 lg:pb-20">
        <ol aria-label="Rotta della spedizione" className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {itHero.route_labels.map((label, index) => (
            <li key={label} className="border-t-2 border-verde-900 pt-3">
              <span aria-hidden="true" className="font-bodoni text-2xl font-bold italic text-rosso-600">
                {ROMAN[index]}
              </span>
              <span className="mt-1 block text-sm font-bold tracking-[0.1em] text-verde-950">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Copertura */
export function ItCoverage() {
  return (
    <section aria-label="Panoramica dei servizi" className="border-y border-avorio-200 bg-white">
      <ul className="shell grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {itCoverage.map((label, index) => (
          <li key={label} className={cn('xl:border-l xl:border-avorio-200', index === 0 && 'xl:border-l-0')}>
            <Link
              to="/it/servizi"
              className="flex min-h-12 items-center gap-3 py-2 text-[14.5px] font-semibold leading-snug text-verde-900 transition-colors hover:text-rosso-600 xl:min-h-[4.75rem] xl:px-4"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-oro-500" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Servizi: Roman-numeral tabs + framed panel */
export function ItServices() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const service = itServices[active];

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { site: 'it', service: itServices[index].id, method });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = itServices.length;
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % total;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + total) % total;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = total - 1;
    else return;
    event.preventDefault();
    select(next, 'keyboard');
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="servizi" aria-labelledby="it-services-title" className="bg-avorio-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="it-kicker text-rosso-600">{itServicesSection.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="it-services-title" className={cn(itH2, 'lg:col-span-7')}>
            {itServicesSection.title}
          </h2>
          <p className="text-lg leading-relaxed text-fumo-600 lg:col-span-5">{itServicesSection.body}</p>
        </div>

        <div
          role="tablist"
          aria-label="Servizi"
          className="tab-strip -mx-5 mt-10 flex snap-x gap-1 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6"
        >
          {itServices.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`it-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="it-service-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index, 'click')}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'flex min-w-[9rem] shrink-0 snap-start flex-col gap-1 border-b-[3px] px-4 py-3 text-left transition-colors sm:min-w-0',
                  selected ? 'border-oro-500' : 'border-verde-900/15 hover:border-verde-900/45',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'font-bodoni text-xl font-bold italic',
                    selected ? 'text-rosso-600' : 'text-fumo-600',
                  )}
                >
                  {ROMAN[index]}
                </span>
                <span className={cn('text-[14.5px] font-bold leading-tight', selected ? 'text-verde-950' : 'text-fumo-600')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={service.id}
          role="tabpanel"
          id="it-service-panel"
          aria-labelledby={`it-tab-${service.id}`}
          className="relative mt-8 border-2 border-verde-900 bg-white p-6 motion-safe:animate-panel-in sm:p-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-2 border border-oro-500/60" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-0 font-bodoni text-[7rem] font-bold italic leading-none text-avorio-200 sm:text-[9rem]"
          >
            {ROMAN[active]}
          </span>
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
            <div>
              <h3 className="max-w-2xl font-bodoni text-[1.9rem] font-bold leading-tight text-verde-950 sm:text-[2.3rem]">
                {service.title}
              </h3>
              <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-fumo-600">{service.copy}</p>
              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link
                  to="/it/richiesta"
                  onClick={() => {
                    if (service.starting_point) setPrefill(service.starting_point);
                    track('home_service_link_click', { site: 'it', service: service.id, link: 'enquiry' });
                  }}
                  className="btn w-full rounded-none bg-rosso-600 px-6 text-white hover:bg-rosso-700 sm:w-auto"
                >
                  {itServicesSection.panel_cta_label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={service.detail_url}
                  hrefLang="en"
                  onClick={() => track('home_service_link_click', { site: 'it', service: service.id, link: 'service_page_en' })}
                  className="inline-flex items-center gap-1.5 text-[15px] font-bold text-verde-800 underline decoration-verde-800/40 decoration-2 underline-offset-4 hover:decoration-verde-800"
                >
                  {itServicesSection.detail_link_label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul
              aria-label={`${service.label}: capacità`}
              className="flex flex-wrap content-start gap-2 lg:flex-col lg:items-start lg:border-l lg:border-avorio-300 lg:pl-6"
            >
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-verde-900/30 px-3 py-1.5 font-mono text-[12.5px] font-medium text-verde-900"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Operazione: bottiglia scura, numeri d'oro */
export function ItOperation() {
  return (
    <section id="operazione" aria-labelledby="it-operation-title" className="bg-verde-900 py-20 text-avorio-50 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="it-kicker text-oro-300">{itOperation.kicker}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="it-operation-title" className="font-bodoni text-[2.1rem] font-bold leading-[1.04] sm:text-[2.8rem]">
              {itOperation.title}
            </h2>
            <blockquote className="mt-8 max-w-md border-l-2 border-oro-500 pl-5">
              <p className="font-bodoni text-xl font-medium italic leading-snug sm:text-[1.5rem]">{itOperation.pull_quote}</p>
            </blockquote>
          </div>
          <ol className="grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {itOperation.items.map((item, index) => (
              <li key={item.title} className="border-t border-oro-500/60 py-6">
                <span aria-hidden="true" className="font-bodoni text-2xl font-bold italic text-oro-300">
                  {ROMAN[index]}
                </span>
                <h3 className="mt-3 font-bodoni text-[1.4rem] font-bold leading-tight">{item.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-avorio-200">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Processo: grandi numeri romani */
export function ItProcess() {
  return (
    <section id="processo" aria-labelledby="it-process-title" className="bg-avorio-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="it-kicker text-rosso-600">{itProcess.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="it-process-title" className={cn(itH2, 'lg:col-span-6')}>
            {itProcess.title}
          </h2>
          <p className="text-lg leading-relaxed text-fumo-600 lg:col-span-5 lg:col-start-8">{itProcess.body}</p>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {itProcess.steps.map((step) => (
            <li key={step.step} className="border-t-2 border-verde-900 pt-6">
              <span className="font-bodoni text-6xl font-bold italic leading-none text-rosso-600">
                <span className="sr-only">Passo </span>
                {step.step}
              </span>
              <span aria-hidden="true" className="mt-4 block h-[3px] w-12 bg-oro-500" />
              <h3 className="mt-5 font-bodoni text-[1.55rem] font-bold leading-snug text-verde-950">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-fumo-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 border-t-2 border-verde-900/20 pt-8">
          <span aria-hidden="true" className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center border border-verde-800 text-verde-800">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-bodoni text-xl font-medium italic leading-snug text-verde-900 sm:text-[1.5rem]">{itProcess.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Settori: riquadri editoriali con immagine */
export function ItIndustries() {
  return (
    <section id="settori" aria-labelledby="it-industries-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="it-kicker text-rosso-600">{itIndustries.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="it-industries-title" className={cn(itH2, 'lg:col-span-7')}>
            {itIndustries.title}
          </h2>
          <p className="text-lg leading-relaxed text-fumo-600 lg:col-span-5">{itIndustries.body}</p>
        </div>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:gap-10">
          {itIndustries.items.map((item, index) => {
            const shot = INDUSTRY_MEDIA[item.slug] ?? INDUSTRY_MEDIA['cross-border-ecommerce'];
            return (
              <li key={item.slug} className="group relative border border-verde-900/30 bg-avorio-50 p-2">
                <div className="overflow-hidden">
                  <Img
                    media={getMedia(shot.id)}
                    alt={shot.alt}
                    sizes="(min-width: 1024px) 44vw, (min-width: 640px) 45vw, 100vw"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <span aria-hidden="true" className="font-bodoni text-xl font-bold italic text-rosso-600">
                    {ROMAN[index]}
                  </span>
                  <h3 className="mt-2 font-bodoni text-[1.6rem] font-bold leading-tight text-verde-950">
                    <Link
                      to={item.href}
                      hrefLang="en"
                      onClick={() => track('home_industry_click', { site: 'it', industry: item.slug })}
                      className="outline-none after:absolute after:inset-0 group-hover:text-rosso-600 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-verde-800"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-fumo-600">{item.copy}</p>
                  <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-verde-800">
                    {itIndustries.detail_label}
                    <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Risorse */
export function ItResources() {
  return (
    <section id="risorse" aria-labelledby="it-resources-title" className="bg-avorio-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="it-kicker text-rosso-600">{itResources.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="it-resources-title" className={itH2}>
              {itResources.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fumo-600">{itResources.body}</p>
            <p className="mt-6 border-l-2 border-oro-500 bg-white px-5 py-4 text-[15px] leading-relaxed text-verde-900">
              {itResources.note}
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="border-t-2 border-verde-900">
              {itResources.topics.map((topic, index) => (
                <li key={topic.href} className="border-b border-verde-900/15">
                  <Link
                    to={topic.href}
                    hrefLang="en"
                    onClick={() => track('home_guides_click', { site: 'it', target: 'topic', slug: topic.href.split('/').pop() })}
                    className="group flex min-h-14 items-center gap-4 py-4 text-[16px] font-bold text-verde-950 transition-colors hover:text-rosso-600"
                  >
                    <span aria-hidden="true" className="font-bodoni text-base font-bold italic text-rosso-600">
                      {ROMAN[index]}
                    </span>
                    <span className="flex-1">{topic.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-verde-800 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={itResources.cta_url}
              hrefLang="en"
              onClick={() => track('home_guides_click', { site: 'it', target: 'resource_center' })}
              className={cn(btnGhost, 'mt-8')}
            >
              {itResources.cta_label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Domande frequenti */
export function ItFaq() {
  return (
    <section id="domande" aria-labelledby="it-faq-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="it-kicker text-rosso-600">{itFaq.kicker}</p>
            <h2 id="it-faq-title" className={cn(itH2, 'mt-6')}>
              {itFaq.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-fumo-600">{itFaq.aside_prompt}</p>
            <Link
              to={itFaq.aside_link_url}
              className="mt-4 inline-flex items-center gap-2 font-bold text-rosso-600 underline decoration-rosso-600/40 decoration-2 underline-offset-4 hover:decoration-rosso-600"
            >
              {itFaq.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t-2 border-verde-900">
            {itFaq.items.map((item, index) => (
              <details key={item.id} className="group border-b border-avorio-300">
                <summary className="grid min-h-[44px] cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)_2rem] items-baseline gap-3 py-6 text-left transition-colors hover:text-rosso-600 sm:grid-cols-[3.5rem_minmax(0,1fr)_2.5rem]">
                  <span aria-hidden="true" className="font-bodoni text-lg font-bold italic text-rosso-600">
                    {ROMAN[index]}
                  </span>
                  <span className="font-bodoni text-[1.3rem] font-bold leading-snug text-verde-950 group-hover:text-rosso-600 sm:text-[1.45rem]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center self-center rounded-full border border-verde-900/40 text-verde-900 transition-all group-open:rotate-45 group-open:border-rosso-600 group-open:bg-rosso-600 group-open:text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 text-[16.5px] leading-relaxed text-fumo-600 sm:pl-[3.5rem]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Richiesta: banda verde, scheda centrata */
export function ItEnquiry() {
  return (
    <section id="richiesta" aria-labelledby="it-enquiry-title" className="bg-verde-950 py-20 text-avorio-50 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="it-kicker justify-center text-oro-300">{itEnquiry.kicker}</p>
          <h2
            id="it-enquiry-title"
            className="mt-6 font-bodoni text-[1.9rem] font-bold leading-[1.1] text-balance sm:text-[2.6rem]"
          >
            {itEnquiry.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-avorio-200">{itEnquiry.body}</p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
          {itEnquiry.reassurance.map((line) => (
            <li key={line} className="flex gap-3 border-t border-oro-500/60 pt-4 text-[15px] leading-relaxed text-avorio-200">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center bg-oro-500 text-verde-950">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="border border-oro-500/70 bg-oro-500/10 p-2 sm:p-3">
            <div className="bg-white">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-rosso-600 px-5 py-3 text-white sm:px-8">
                <p className="font-bodoni text-[12.5px] font-bold uppercase tracking-[0.2em]">{itEnquiry.form_tag}</p>
                <p aria-hidden="true" className="hidden font-bodoni text-[12.5px] font-bold uppercase tracking-[0.2em] text-white/70 sm:block">
                  FV·IT
                </p>
              </div>
              <EnquiryForm
                idPrefix="it-enquiry"
                placement="it-home"
                copy={itEnquiry.copy}
                strings={IT_STRINGS}
                privacyUrl="/it/privacy"
                theme={IT_FORM_THEME}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
