import { useRef, useState, type KeyboardEvent } from 'react';
import {
  nlCoverage,
  nlEnquiry,
  nlFaq,
  nlHero,
  nlIndustries,
  nlOperation,
  nlProcess,
  nlResources,
  nlServices,
  nlServicesSection,
} from '../../content/nl/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { NL_STRINGS } from '../../lib/enquiry-locale';
import { useMediaQuery } from '../../lib/hooks';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const NL_FORM_THEME: FormTheme = {
  accentText: 'text-delfts-700',
  accentSolid: 'bg-delfts-700',
  accentButton: 'nl-btn-seal rounded-[3px] bg-polder-700 text-white hover:bg-polder-800',
  radius: 'rounded-[3px]',
};

/** Heavy grotesque headline — the Dutch template's typographic signature. */
const nlH2 = 'font-archivo text-[1.85rem] leading-[1.08] tracking-tight text-dijk-950 sm:text-[2.5rem]';

const btnPrimary =
  'btn nl-btn-seal w-full rounded-[3px] bg-polder-700 text-base text-white hover:bg-polder-800 sm:w-auto';
const btnGhost =
  'btn w-full rounded-[3px] border-2 border-dijk-900 text-base text-dijk-950 hover:bg-dijk-900 hover:text-getij-50 sm:w-auto';

const num = (index: number) => String(index + 1).padStart(2, '0');

const INDUSTRY_MEDIA: Record<string, { id: string; alt: string }> = {
  'cross-border-ecommerce': { id: 'industry-ecommerce', alt: 'Magazijnteam aan het werk tussen stellingen en dozen.' },
  'consumer-goods': { id: 'industry-consumer-goods', alt: 'Een klant pakt een klein product uit een doos.' },
  'industrial-components': { id: 'industry-industrial', alt: 'Close-up van tandwielen en machineonderdelen in een werkplaats.' },
  'time-critical-cargo': { id: 'industry-time-critical', alt: 'Vliegtuig aan de gate ’s nachts tijdens de afhandeling van vracht.' },
};

/* ------------------------------------------------------------------ Held
   Harbour panorama: headline block on the grid, a full-width night panorama of
   Rotterdam in a corner-ticked frame, and the route as a manifest strip. */
export function NlHero() {
  const media = getMedia(nlHero.media_id);
  return (
    <section id="start" aria-labelledby="nl-hero-title" className="bg-haven-grid border-b border-getij-200 bg-getij-50">
      <div className="shell pb-16 pt-12 sm:pt-16 lg:pb-20 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="nl-kicker text-dijk-800">{nlHero.eyebrow}</p>
            <h1
              id="nl-hero-title"
              className="mt-6 font-archivo text-[2.3rem] leading-[1.04] tracking-tight text-dijk-950 text-balance sm:text-[3.2rem] xl:text-[3.8rem]"
            >
              {nlHero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-lei-600 sm:text-[1.15rem]">{nlHero.body}</p>
          </div>
          <div className="flex flex-col justify-end gap-5 lg:col-span-4">
            <div className="flex flex-col gap-3">
              <Link
                to={nlHero.cta_primary_url}
                onClick={() => track('home_hero_primary_click', { site: 'nl' })}
                className={cn(btnPrimary, 'w-full justify-center')}
              >
                {nlHero.cta_primary_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={nlHero.cta_secondary_url}
                onClick={() => track('home_hero_secondary_click', { site: 'nl' })}
                className={cn(btnGhost, 'w-full justify-center')}
              >
                {nlHero.cta_secondary_label}
              </Link>
            </div>
            <p className="border-l-4 border-oranje-500 pl-4 text-[14.5px] leading-relaxed text-lei-600">
              {nlHero.microcopy}
            </p>
          </div>
        </div>

        <figure className="nl-ticks mt-12 lg:mt-14">
          <div className="overflow-hidden border-2 border-dijk-900 bg-dijk-900">
            <Img
              media={media}
              alt={nlHero.media_alt}
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]"
            />
          </div>
          <figcaption className="flex items-baseline justify-between gap-3 border-2 border-t-0 border-dijk-900 bg-white px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-lei-600 sm:px-5">
            <span>{nlHero.media_caption}</span>
            <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-dijk-800">
              <span className="h-2 w-2 bg-oranje-500" />
              FV·NL
            </span>
          </figcaption>
        </figure>

        <ol
          aria-label="Route van de zending"
          className="mt-4 grid grid-cols-2 gap-px border-2 border-dijk-900 bg-dijk-900 sm:grid-cols-4"
        >
          {nlHero.route_labels.map((label, index) => (
            <li key={label} className={cn('bg-white px-4 py-3 sm:px-5 sm:py-4', index % 2 === 1 && 'bg-getij-100')}>
              <span aria-hidden="true" className="font-archivo text-sm text-dijk-900">
                {num(index)}
              </span>
              <span className="mt-1 flex items-center gap-2 text-sm font-bold tracking-[0.06em] text-dijk-950">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-oranje-500" />
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Dekking */
export function NlCoverage() {
  return (
    <section aria-label="Overzicht van diensten" className="border-b border-getij-200 bg-white">
      <ul className="shell grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {nlCoverage.map((label, index) => (
          <li key={label} className={cn('xl:border-l xl:border-getij-200', index === 0 && 'xl:border-l-0')}>
            <Link
              to="/nl/diensten"
              className="flex min-h-12 items-center gap-3 py-2 text-[14.5px] font-semibold leading-snug text-dijk-800 transition-colors hover:text-delfts-700 xl:min-h-[4.75rem] xl:px-4"
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-oranje-500" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Diensten: paneel links, vakkenindex rechts */
export function NlServices() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const service = nlServices[active];

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { site: 'nl', service: nlServices[index].id, method });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = nlServices.length;
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
    <section id="diensten" aria-labelledby="nl-services-title" className="bg-getij-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="nl-kicker text-dijk-800">{nlServicesSection.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="nl-services-title" className={cn(nlH2, 'lg:col-span-7')}>
            {nlServicesSection.title}
          </h2>
          <p className="text-lg leading-relaxed text-lei-600 lg:col-span-5">{nlServicesSection.body}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="nl-ticks order-2 lg:order-1 lg:col-span-8">
            <div
              key={service.id}
              role="tabpanel"
              id="nl-service-panel"
              aria-labelledby={`nl-tab-${service.id}`}
              className="relative overflow-hidden border-2 border-dijk-900 bg-white p-6 motion-safe:animate-panel-in sm:p-10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-9 font-archivo text-[9rem] leading-none text-getij-100 sm:text-[12rem]"
              >
                {num(active)}
              </span>
              <div className="relative">
                <h3 className="max-w-2xl font-archivo text-[1.7rem] leading-tight text-dijk-950 sm:text-[2.1rem]">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-lei-600">{service.copy}</p>
                <ul aria-label={`${service.label}: mogelijkheden`} className="mt-6 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-dijk-900/30 bg-getij-50 px-3 py-1.5 font-mono text-[12.5px] font-medium text-dijk-800"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-5 border-t-2 border-dijk-900/15 pt-6 sm:flex-row sm:items-center">
                  <Link
                    to="/nl/aanvraag"
                    onClick={() => {
                      if (service.starting_point) setPrefill(service.starting_point);
                      track('home_service_link_click', { site: 'nl', service: service.id, link: 'enquiry' });
                    }}
                    className="btn nl-btn-seal w-full rounded-[3px] bg-polder-700 text-white hover:bg-polder-800 sm:w-auto"
                  >
                    {nlServicesSection.panel_cta_label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={service.detail_url}
                    hrefLang="en"
                    onClick={() => track('home_service_link_click', { site: 'nl', service: service.id, link: 'service_page_en' })}
                    className="inline-flex items-center gap-1.5 text-[15px] font-bold text-delfts-700 underline decoration-delfts-700/40 decoration-2 underline-offset-4 hover:decoration-delfts-700"
                  >
                    {nlServicesSection.detail_link_label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-4">
            <div
              role="tablist"
              aria-label="Diensten"
              aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
              className="tab-strip -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:p-0"
            >
              {nlServices.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`nl-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="nl-service-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(index, 'click')}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={cn(
                      'flex shrink-0 snap-start items-center gap-3 border-2 px-4 py-3 text-left transition-colors lg:gap-4 lg:px-5 lg:py-4',
                      selected
                        ? 'border-dijk-900 bg-dijk-900 text-white'
                        : 'border-dijk-900/20 bg-white text-dijk-950 hover:border-dijk-900',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-archivo text-base lg:text-lg',
                        selected ? 'text-oranje-300' : 'text-oranje-600',
                      )}
                    >
                      {num(index)}
                    </span>
                    <span className="whitespace-nowrap text-[15px] font-bold lg:whitespace-normal">{item.label}</span>
                    <ArrowRight
                      className={cn(
                        'ml-auto hidden h-4 w-4 shrink-0 lg:block',
                        selected ? 'text-oranje-300' : 'text-getij-300',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Operatie: donkere dijkband met hoekvakken */
export function NlOperation() {
  return (
    <section id="werkwijze" aria-labelledby="nl-operation-title" className="bg-dijk-950 py-20 text-getij-50 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="nl-kicker text-getij-50">{nlOperation.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h2 id="nl-operation-title" className="font-archivo text-[1.85rem] leading-[1.08] tracking-tight sm:text-[2.5rem] lg:col-span-6">
            {nlOperation.title}
          </h2>
          <blockquote className="border border-white/25 border-l-4 border-l-oranje-500 p-5 sm:p-6 lg:col-span-6">
            <p className="font-archivo text-[1.05rem] leading-snug sm:text-[1.25rem]">{nlOperation.pull_quote}</p>
          </blockquote>
        </div>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nlOperation.items.map((item, index) => (
            <li key={item.title} className="nl-ticks border border-white/25 bg-white/[0.04] p-6">
              <span aria-hidden="true" className="font-archivo text-2xl text-oranje-300">
                {num(index)}
              </span>
              <h3 className="mt-3 font-archivo text-[1.05rem] leading-snug">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-getij-200">{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Proces: vier sluiskolken met gedeelde wanden */
export function NlProcess() {
  return (
    <section id="proces" aria-labelledby="nl-process-title" className="bg-getij-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="nl-kicker text-dijk-800">{nlProcess.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="nl-process-title" className={cn(nlH2, 'lg:col-span-6')}>
            {nlProcess.title}
          </h2>
          <p className="text-lg leading-relaxed text-lei-600 lg:col-span-5 lg:col-start-8">{nlProcess.body}</p>
        </div>

        <ol className="mt-14 grid lg:grid-cols-4">
          {nlProcess.steps.map((step) => (
            <li
              key={step.step}
              className="-mt-[2px] border-2 border-dijk-900 bg-white p-6 first:mt-0 sm:p-7 lg:-ml-[2px] lg:mt-0 lg:first:ml-0"
            >
              <span className="grid h-12 w-12 place-items-center bg-oranje-500 font-archivo text-base text-dijk-950">
                <span className="sr-only">Stap </span>
                {step.step}
              </span>
              <h3 className="mt-5 font-archivo text-[1.25rem] leading-snug text-dijk-950">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-lei-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex max-w-4xl items-start gap-4 border-t-2 border-dijk-900/20 pt-8">
          <span aria-hidden="true" className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[3px] bg-dijk-900 text-oranje-300">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-archivo text-[1.05rem] leading-snug text-dijk-900 sm:text-[1.3rem]">{nlProcess.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Sectoren: manifeststroken met miniatuur */
export function NlIndustries() {
  return (
    <section id="sectoren" aria-labelledby="nl-industries-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="nl-kicker text-dijk-800">{nlIndustries.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="nl-industries-title" className={cn(nlH2, 'lg:col-span-7')}>
            {nlIndustries.title}
          </h2>
          <p className="text-lg leading-relaxed text-lei-600 lg:col-span-5">{nlIndustries.body}</p>
        </div>

        <ul className="mt-12 space-y-4">
          {nlIndustries.items.map((item, index) => {
            const shot = INDUSTRY_MEDIA[item.slug] ?? INDUSTRY_MEDIA['cross-border-ecommerce'];
            return (
              <li
                key={item.slug}
                className="group relative grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4 border-2 border-dijk-900/15 bg-getij-50 p-3 transition-colors hover:border-dijk-900 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6 sm:p-4"
              >
                <div className="overflow-hidden bg-dijk-900">
                  <Img
                    media={getMedia(shot.id)}
                    alt={shot.alt}
                    sizes="112px"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-dijk-800">
                    <span aria-hidden="true" className="h-2 w-2 bg-oranje-500" />
                    Sector {num(index)}
                  </p>
                  <h3 className="mt-2 font-archivo text-[1.25rem] leading-snug text-dijk-950 sm:text-[1.45rem]">
                    <Link
                      to={item.href}
                      hrefLang="en"
                      onClick={() => track('home_industry_click', { site: 'nl', industry: item.slug })}
                      className="outline-none after:absolute after:inset-0 group-hover:text-delfts-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-delfts-600"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-2 max-w-3xl text-base leading-relaxed text-lei-600">{item.copy}</p>
                  <span aria-hidden="true" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-delfts-700 sm:hidden">
                    {nlIndustries.detail_label}
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="mr-2 hidden h-12 w-12 place-items-center border-2 border-dijk-900/20 text-dijk-900 transition-colors group-hover:border-dijk-900 group-hover:bg-dijk-900 group-hover:text-oranje-300 sm:grid"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Bronnen */
export function NlResources() {
  return (
    <section id="bronnen" aria-labelledby="nl-resources-title" className="bg-getij-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="nl-kicker text-dijk-800">{nlResources.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="nl-resources-title" className={nlH2}>
              {nlResources.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-lei-600">{nlResources.body}</p>
            <p className="mt-6 border-2 border-dijk-900/20 border-l-4 border-l-oranje-500 bg-white px-5 py-4 text-[15px] leading-relaxed text-dijk-900">
              {nlResources.note}
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="space-y-3">
              {nlResources.topics.map((topic, index) => (
                <li key={topic.href}>
                  <Link
                    to={topic.href}
                    hrefLang="en"
                    onClick={() => track('home_guides_click', { site: 'nl', target: 'topic', slug: topic.href.split('/').pop() })}
                    className="group flex min-h-14 items-center gap-4 border-2 border-dijk-900/15 bg-white px-4 py-3 text-[15.5px] font-bold text-dijk-950 transition-colors hover:border-dijk-900 hover:text-delfts-700 sm:px-5"
                  >
                    <span aria-hidden="true" className="font-archivo text-sm text-oranje-600">
                      {num(index)}
                    </span>
                    <span className="flex-1">{topic.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-delfts-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={nlResources.cta_url}
              hrefLang="en"
              onClick={() => track('home_guides_click', { site: 'nl', target: 'resource_center' })}
              className={cn(btnGhost, 'mt-8')}
            >
              {nlResources.cta_label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Veelgestelde vragen */
export function NlFaq() {
  return (
    <section id="vragen" aria-labelledby="nl-faq-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="nl-kicker text-dijk-800">{nlFaq.kicker}</p>
            <h2 id="nl-faq-title" className={cn(nlH2, 'mt-6')}>
              {nlFaq.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-lei-600">{nlFaq.aside_prompt}</p>
            <Link
              to={nlFaq.aside_link_url}
              className="mt-4 inline-flex items-center gap-2 font-bold text-delfts-700 underline decoration-delfts-700/40 decoration-2 underline-offset-4 hover:decoration-delfts-700"
            >
              {nlFaq.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {nlFaq.items.map((item) => (
            <details key={item.id} className="group border-2 border-dijk-900/15 bg-getij-50 open:border-dijk-900">
              <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 px-5 py-5 text-left font-archivo text-[1.1rem] leading-snug text-dijk-950 transition-colors hover:text-delfts-700 sm:px-6 sm:text-[1.2rem]">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border-2 border-dijk-900/30 text-dijk-900 transition-all group-open:rotate-45 group-open:border-dijk-900 group-open:bg-oranje-500"
                >
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl px-5 pb-6 text-[16.5px] leading-relaxed text-lei-600 sm:px-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Aanvraag: vrachtbriefkaart met hoekmerken */
export function NlEnquiry() {
  return (
    <section id="aanvraag" aria-labelledby="nl-enquiry-title" className="bg-haven-grid border-t border-getij-200 bg-getij-100 py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="nl-kicker text-dijk-800">{nlEnquiry.kicker}</p>
          <h2 id="nl-enquiry-title" className="mt-6 font-archivo text-[1.8rem] leading-[1.1] tracking-tight text-dijk-950 text-balance sm:text-[2.3rem]">
            {nlEnquiry.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-lei-600">{nlEnquiry.body}</p>
          <ul className="mt-10 space-y-4 border-t-2 border-dijk-900/15 pt-8">
            {nlEnquiry.reassurance.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-relaxed text-dijk-900">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[3px] bg-oranje-500 text-dijk-950">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <p className="mb-3 inline-flex items-center gap-2 border-2 border-dijk-900 bg-white px-3 py-1.5 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dijk-900">
            <span aria-hidden="true" className="h-2 w-2 bg-oranje-500" />
            {nlEnquiry.form_tag}
          </p>
          <div className="nl-ticks">
            <EnquiryForm
              idPrefix="nl-enquiry"
              placement="nl-home"
              copy={nlEnquiry.copy}
              strings={NL_STRINGS}
              privacyUrl="/nl/privacy"
              theme={NL_FORM_THEME}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
