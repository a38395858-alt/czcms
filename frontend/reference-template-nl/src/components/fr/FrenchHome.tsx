import { useRef, useState, type KeyboardEvent } from 'react';
import {
  frCoverage,
  frEnquiry,
  frFaq,
  frHero,
  frIndustries,
  frOperation,
  frProcess,
  frResources,
  frServices,
  frServicesSection,
} from '../../content/fr/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { FR_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const FR_FORM_THEME: FormTheme = {
  accentText: 'text-bleufr-700',
  accentSolid: 'bg-bleufr-600',
  accentButton: 'rounded-full bg-bleufr-600 text-white hover:bg-bleufr-500',
  radius: 'rounded-3xl',
};

/** Poster headline style — the French template's typographic signature. */
const frH2 = 'font-poster text-[1.95rem] font-bold leading-[1.08] tracking-[0.005em] text-encre-900 sm:text-[2.55rem]';

const pillBtnPrimary =
  'btn w-full rounded-full bg-bleufr-600 px-6 text-base text-white hover:bg-bleufr-500 sm:w-auto';
const pillBtnGhost =
  'btn w-full rounded-full border border-encre-900/30 px-6 text-base text-encre-900 hover:border-encre-900 sm:w-auto';

/* ------------------------------------------------------------------ Hero
   « Affiche » : centered poster masthead, framed image with caption plate,
   route as a ticket strip of pills — nothing shared with EN or DE layouts. */
export function FrHero() {
  const media = getMedia(frHero.media_id);
  return (
    <section id="accueil" aria-labelledby="fr-hero-title" className="border-b border-sable-200 bg-creme-25">
      <div className="shell pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="fr-kicker mx-auto max-w-3xl justify-center text-safran-600">{frHero.eyebrow}</p>
        <h1
          id="fr-hero-title"
          className="mx-auto mt-7 max-w-4xl text-center font-poster text-[2.35rem] font-bold leading-[1.08] tracking-[0.005em] text-encre-900 text-balance sm:text-[3.1rem] xl:text-[3.7rem]"
        >
          {frHero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-encre-500 sm:text-[1.15rem]">
          {frHero.body}
        </p>
        <div className="mx-auto mt-9 flex max-w-xl flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link to={frHero.cta_primary_url} onClick={() => track('home_hero_primary_click', { site: 'fr' })} className={pillBtnPrimary}>
            {frHero.cta_primary_label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={frHero.cta_secondary_url} onClick={() => track('home_hero_secondary_click', { site: 'fr' })} className={pillBtnGhost}>
            {frHero.cta_secondary_label}
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-[14.5px] leading-relaxed text-encre-400">{frHero.microcopy}</p>

        <div className="mx-auto mt-12 max-w-5xl lg:mt-16">
          <figure className="overflow-hidden rounded-[2rem] border-2 border-encre-900 bg-white">
            <Img
              media={media}
              alt={frHero.media_alt}
              priority
              sizes="(min-width: 1280px) 1024px, 100vw"
              className="aspect-[3/2] w-full object-cover sm:aspect-[21/10]"
            />
            <figcaption className="flex items-baseline justify-between gap-3 border-t-2 border-encre-900 bg-creme-50 px-5 py-3 font-poster text-[12px] font-semibold uppercase tracking-[0.18em] text-encre-700 sm:px-7">
              <span>{frHero.media_caption}</span>
              <span aria-hidden="true" className="text-safran-600">FV·FR</span>
            </figcaption>
          </figure>

          <ol aria-label="Itinéraire d’expédition" className="mt-6 flex flex-wrap items-center justify-center gap-y-3">
            {frHero.route_labels.map((label, index) => (
              <li key={label} className="flex items-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-encre-900/30 bg-white px-4 py-2 font-poster text-[12.5px] font-semibold tracking-[0.14em] text-encre-900">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-safran-500" />
                  {label}
                </span>
                {index < frHero.route_labels.length - 1 && (
                  <span aria-hidden="true" className="mx-1 w-5 border-t-2 border-dotted border-encre-900/40 sm:mx-2 sm:w-8" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Coverage rail */
export function FrCoverage() {
  return (
    <section aria-label="Panorama des prestations" className="border-b border-sable-200 bg-white">
      <ul className="shell grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {frCoverage.map((label, index) => (
          <li key={label} className={cn('xl:border-l xl:border-dotted xl:border-sable-300', index === 0 && 'xl:border-l-0')}>
            <Link
              to="/fr/prestations"
              className="flex min-h-12 items-center gap-2.5 py-2 text-[14.5px] font-medium leading-snug text-encre-700 transition-colors hover:text-bleufr-700 xl:min-h-[4.5rem] xl:justify-center xl:px-4"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-safran-500" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Services: pill tab strip + poster card (accessible tabs) */
export function FrServices() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const service = frServices[active];

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { site: 'fr', service: frServices[index].id, method });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % frServices.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + frServices.length) % frServices.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = frServices.length - 1;
    else return;
    event.preventDefault();
    select(next, 'keyboard');
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="prestations" aria-labelledby="fr-services-title" className="bg-creme-25 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-600">{frServicesSection.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="fr-services-title" className={cn(frH2, 'lg:col-span-7')}>
            {frServicesSection.title}
          </h2>
          <p className="text-lg leading-relaxed text-encre-500 lg:col-span-5">{frServicesSection.body}</p>
        </div>

        <div
          role="tablist"
          aria-label="Prestations"
          className="tab-strip -mx-5 mt-10 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:p-0"
        >
          {frServices.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`fr-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="fr-service-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index, 'click')}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'shrink-0 snap-start whitespace-nowrap rounded-full border px-5 py-2.5 font-poster text-[15px] font-semibold transition-colors',
                  selected
                    ? 'border-encre-900 bg-encre-900 text-creme-50'
                    : 'border-encre-900/30 bg-white text-encre-700 hover:border-encre-900 hover:text-encre-900',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="fr-service-panel"
          aria-labelledby={`fr-tab-${service.id}`}
          className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-encre-900 bg-white p-6 motion-safe:animate-panel-in sm:p-10 lg:p-12"
          key={service.id}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-10 font-poster text-[9rem] font-bold leading-none text-creme-100 sm:text-[13rem]"
          >
            {String(active + 1).padStart(2, '0')}
          </span>
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
            <div>
              <h3 className="font-poster text-[1.7rem] font-bold leading-tight text-encre-900 sm:text-[2.1rem]">{service.title}</h3>
              <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-encre-500">{service.copy}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/fr/demande"
                  onClick={() => {
                    if (service.starting_point) setPrefill(service.starting_point);
                    track('home_service_link_click', { site: 'fr', service: service.id, link: 'enquiry' });
                  }}
                  className="btn w-full rounded-full bg-bleufr-600 px-6 text-white hover:bg-bleufr-500 sm:w-auto"
                >
                  {frServicesSection.panel_cta_label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={service.detail_url}
                  hrefLang="en"
                  onClick={() => track('home_service_link_click', { site: 'fr', service: service.id, link: 'service_page_en' })}
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-bleufr-700 underline decoration-bleufr-700/30 underline-offset-4 hover:decoration-bleufr-700"
                >
                  {frServicesSection.detail_link_label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul aria-label={`${service.label} — savoir-faire`} className="flex flex-wrap content-start gap-2 lg:flex-col lg:items-start">
              {service.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-dotted border-encre-900/40 bg-creme-50 px-4 py-1.5 text-[13px] font-medium text-encre-700">
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

/* ------------------------------------------------------------------ Coordination: ink poster band with compass list */
export function FrOperation() {
  return (
    <section id="coordination" aria-labelledby="fr-operation-title" className="bg-encre-900 py-20 text-creme-50 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-300">{frOperation.kicker}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="fr-operation-title" className="font-poster text-[1.95rem] font-bold leading-[1.08] sm:text-[2.55rem]">
              {frOperation.title}
            </h2>
            <p className="mt-8 max-w-md font-poster text-xl font-medium leading-normal text-encre-200 sm:text-[1.4rem]">
              {frOperation.pull_quote}
            </p>
          </div>
          <ul className="grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {frOperation.items.map((item) => (
              <li key={item.title} className="border-t-2 border-dotted border-white/25 py-6">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-safran-500" />
                <h3 className="mt-3 font-poster text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-encre-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Process: numbered medallions on a dotted line */
export function FrProcess() {
  const last = frProcess.steps.length - 1;
  return (
    <section id="deroulement" aria-labelledby="fr-process-title" className="bg-creme-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-600">{frProcess.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="fr-process-title" className={cn(frH2, 'lg:col-span-6')}>
            {frProcess.title}
          </h2>
          <p className="text-lg leading-relaxed text-encre-500 lg:col-span-5 lg:col-start-8">{frProcess.body}</p>
        </div>

        <ol className="mt-14 grid lg:grid-cols-4 lg:gap-8">
          {frProcess.steps.map((step, index) => (
            <li
              key={step.step}
              className={cn(
                'relative pb-12 pl-16 lg:pb-0 lg:pl-0 lg:pt-16',
                index !== last &&
                  'before:absolute before:bottom-0 before:left-[19px] before:top-12 before:w-0 before:border-l-2 before:border-dotted before:border-encre-900/30 lg:before:hidden',
                index !== last &&
                  'lg:after:absolute lg:after:left-12 lg:after:right-[-2rem] lg:after:top-[19px] lg:after:h-0 lg:after:border-t-2 lg:after:border-dotted lg:after:border-encre-900/30',
              )}
            >
              <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border-2 border-encre-900 bg-white font-poster text-sm font-bold text-encre-900">
                <span className="sr-only">Étape </span>
                {step.step}
              </span>
              <h3 className="font-poster text-[1.35rem] font-bold leading-snug text-encre-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-encre-500">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 border-t-2 border-dotted border-encre-900/25 pt-8">
          <span aria-hidden="true" className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-safran-500 text-safran-600">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-poster text-xl font-medium leading-normal text-encre-700 sm:text-[1.4rem]">{frProcess.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Secteurs */
export function FrIndustries() {
  return (
    <section id="secteurs" aria-labelledby="fr-industries-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-600">{frIndustries.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="fr-industries-title" className={cn(frH2, 'lg:col-span-7')}>
            {frIndustries.title}
          </h2>
          <p className="text-lg leading-relaxed text-encre-500 lg:col-span-5">{frIndustries.body}</p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {frIndustries.items.map((item) => (
            <li
              key={item.slug}
              className="group relative rounded-[1.5rem] border border-encre-900/25 bg-creme-25 p-6 transition-colors hover:border-encre-900 sm:p-8"
            >
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-safran-500" />
              <h3 className="mt-4 font-poster text-[1.5rem] font-bold leading-tight text-encre-900">
                <Link
                  to={item.href}
                  hrefLang="en"
                  onClick={() => track('home_industry_click', { site: 'fr', industry: item.slug })}
                  className="outline-none after:absolute after:inset-0 after:rounded-[1.5rem] group-hover:text-bleufr-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-bleufr-600"
                >
                  {item.name}
                </Link>
              </h3>
              <p className="mt-3 text-base leading-relaxed text-encre-500">{item.copy}</p>
              <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-bleufr-700">
                {frIndustries.detail_label}
                <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Ressources */
export function FrResources() {
  return (
    <section id="ressources" aria-labelledby="fr-resources-title" className="border-y border-sable-200 bg-creme-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-600">{frResources.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="fr-resources-title" className={frH2}>
              {frResources.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-encre-500">{frResources.body}</p>
            <p className="mt-6 rounded-[1.25rem] border border-dotted border-encre-900/40 bg-white px-5 py-4 text-[15px] leading-relaxed text-encre-700">
              {frResources.note}
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="space-y-3">
              {frResources.topics.map((topic) => (
                <li key={topic.href}>
                  <Link
                    to={topic.href}
                    hrefLang="en"
                    onClick={() => track('home_guides_click', { site: 'fr', target: 'topic', slug: topic.href.split('/').pop() })}
                    className="group flex min-h-14 items-center gap-4 rounded-full border border-encre-900/25 bg-white px-6 py-3 text-[15.5px] font-semibold text-encre-900 transition-colors hover:border-encre-900 hover:text-bleufr-700"
                  >
                    <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-safran-500" />
                    <span className="flex-1">{topic.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-bleufr-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={frResources.cta_url}
              hrefLang="en"
              onClick={() => track('home_guides_click', { site: 'fr', target: 'resource_center' })}
              className={cn(pillBtnGhost, 'mt-8')}
            >
              {frResources.cta_label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */
export function FrFaq() {
  return (
    <section id="questions" aria-labelledby="fr-faq-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="fr-kicker fr-kicker--left text-safran-600">{frFaq.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 id="fr-faq-title" className={frH2}>
                {frFaq.title}
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-encre-500">{frFaq.aside_prompt}</p>
              <Link
                to={frFaq.aside_link_url}
                className="mt-4 inline-flex items-center gap-2 font-semibold text-bleufr-700 underline decoration-bleufr-700/40 decoration-2 underline-offset-4 hover:decoration-bleufr-700"
              >
                {frFaq.aside_link_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="space-y-4 lg:col-span-8">
            {frFaq.items.map((item) => (
              <details key={item.id} className="group rounded-[1.5rem] border border-encre-900/25 bg-creme-25 open:border-encre-900">
                <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 rounded-[1.5rem] px-6 py-5 text-left font-poster text-[1.2rem] font-bold leading-snug text-encre-900 transition-colors hover:text-bleufr-700 sm:px-7 sm:text-[1.3rem]">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-encre-900/30 text-encre-700 transition-all group-open:rotate-45 group-open:border-bleufr-600 group-open:bg-bleufr-600 group-open:text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl px-6 pb-6 text-[16.5px] leading-relaxed text-encre-500 sm:px-7">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Demande: ticket-style conversion band */
export function FrEnquiry() {
  return (
    <section id="demande" aria-labelledby="fr-enquiry-title" className="border-t border-sable-200 bg-creme-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="overflow-hidden rounded-[2rem] border-2 border-encre-900 bg-creme-25">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-2 border-dashed border-encre-900/40 bg-encre-900 px-5 py-3 text-creme-50 sm:px-8">
            <p className="font-poster text-[12px] font-semibold uppercase tracking-[0.2em]">{frEnquiry.form_tag}</p>
            <p aria-hidden="true" className="hidden font-poster text-[12px] font-semibold uppercase tracking-[0.2em] text-safran-300 sm:block">
              {frEnquiry.kicker}
            </p>
          </div>

          <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <h2 id="fr-enquiry-title" className="font-poster text-[1.8rem] font-bold leading-[1.12] text-encre-900 text-balance sm:text-[2.25rem]">
                {frEnquiry.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-encre-500">{frEnquiry.body}</p>
              <ul className="mt-10 space-y-4 border-t-2 border-dotted border-encre-900/25 pt-8">
                {frEnquiry.reassurance.map((line) => (
                  <li key={line} className="flex gap-3 text-base leading-relaxed text-encre-700">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-bleufr-700 ring-1 ring-encre-900/20">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <EnquiryForm
                idPrefix="fr-enquiry"
                placement="fr-home"
                copy={frEnquiry.copy}
                strings={FR_STRINGS}
                privacyUrl="/fr/confidentialite"
                theme={FR_FORM_THEME}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
