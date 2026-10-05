import { useRef, useState, type KeyboardEvent } from 'react';
import {
  esCoverage,
  esEnquiry,
  esFaq,
  esHero,
  esIndustries,
  esOperation,
  esProcess,
  esResources,
  esServices,
  esServicesSection,
} from '../../content/es/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { ES_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const ES_FORM_THEME: FormTheme = {
  accentText: 'text-azul-700',
  accentSolid: 'bg-azul-700',
  accentButton:
    'rounded-xl border-2 border-carbon-900 bg-sol-400 text-carbon-900 hover:bg-sol-300',
  radius: 'rounded-2xl',
};

/** Chunky grotesque headline — the Spanish template's typographic signature. */
const esH2 = 'font-bricolage text-[2rem] font-extrabold leading-[1.05] tracking-tight text-carbon-900 sm:text-[2.7rem]';

const btnPrimary =
  'btn w-full rounded-xl border-2 border-carbon-900 bg-sol-400 px-6 text-base text-carbon-900 hover:bg-sol-300 sm:w-auto';
const btnGhost =
  'btn w-full rounded-xl border-2 border-carbon-900 px-6 text-base text-carbon-900 hover:bg-carbon-900 hover:text-arena-50 sm:w-auto';

const num = (index: number) => String(index + 1).padStart(2, '0');

/** Glazed-tile swatches shared by the coverage rail, industries and resources. */
const SWATCH = [
  'bg-azul-700',
  'bg-sol-400',
  'bg-terra-600',
  'bg-olivo-700',
  'bg-granada-700',
  'bg-cielo-200 ring-1 ring-carbon-900/25',
];

/** Route tiles, one glaze per stop. */
const ROUTE_TONES = [
  'bg-azul-700 text-white',
  'bg-sol-400 text-carbon-900',
  'bg-terra-600 text-white',
  'bg-olivo-700 text-white',
];

/* ------------------------------------------------------------------ Héroe
   Arch-shaped photograph inside a tile frame, left-aligned headline, and the route
   rendered as four glazed tiles. Nothing here is shared with the EN / DE / FR layouts. */
export function EsHero() {
  const media = getMedia(esHero.media_id);
  return (
    <section id="inicio" aria-labelledby="es-hero-title" className="relative overflow-hidden bg-arena-50">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-sol-300/40 blur-3xl" />
      <div className="shell relative grid items-center gap-12 pb-12 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-16">
        <div className="lg:col-span-7">
          <p className="es-kicker text-terra-600">{esHero.eyebrow}</p>
          <h1
            id="es-hero-title"
            className="mt-6 font-bricolage text-[2.4rem] font-extrabold leading-[1.02] tracking-tight text-carbon-900 text-balance sm:text-[3.3rem] xl:text-[4rem]"
          >
            {esHero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-carbon-600 sm:text-[1.15rem]">{esHero.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={esHero.cta_primary_url} onClick={() => track('home_hero_primary_click', { site: 'es' })} className={btnPrimary}>
              {esHero.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={esHero.cta_secondary_url} onClick={() => track('home_hero_secondary_click', { site: 'es' })} className={btnGhost}>
              {esHero.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-8 max-w-lg border-l-4 border-sol-400 pl-4 text-[15px] leading-relaxed text-carbon-600">
            {esHero.microcopy}
          </p>
        </div>

        <figure className="mx-auto w-full max-w-md lg:col-span-5 lg:ml-auto lg:mr-0">
          <div className="rounded-t-[999px] bg-azul-700 p-2.5 sm:p-3">
            <div className="overflow-hidden rounded-t-[999px] bg-azul-800">
              <Img
                media={media}
                alt={esHero.media_alt}
                priority
                sizes="(min-width: 1024px) 420px, 90vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <figcaption className="mt-3 flex items-center justify-between gap-3 text-[13px] font-medium text-carbon-600">
            <span>{esHero.media_caption}</span>
            <span aria-hidden="true" className="font-bricolage font-bold text-terra-600">
              FV·ES
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="shell relative pb-16 lg:pb-20">
        <ol aria-label="Ruta del envío" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {esHero.route_labels.map((label, index) => (
            <li
              key={label}
              className={cn(
                'flex min-h-[6.5rem] flex-col justify-between rounded-2xl p-4 sm:min-h-[8rem] sm:p-5',
                ROUTE_TONES[index],
              )}
            >
              <span aria-hidden="true" className="font-bricolage text-sm font-bold">
                {num(index)}
                {index < esHero.route_labels.length - 1 && ' →'}
              </span>
              <span className="font-bricolage text-lg font-extrabold tracking-[0.06em] sm:text-xl">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Cobertura */
export function EsCoverage() {
  return (
    <section aria-label="Panorama de servicios" className="border-b border-arena-200 bg-white">
      <ul className="shell grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {esCoverage.map((label, index) => (
          <li key={label} className={cn('xl:border-l xl:border-arena-200', index === 0 && 'xl:border-l-0')}>
            <Link
              to="/es/servicios"
              className="flex min-h-12 items-center gap-3 py-2 text-[14.5px] font-semibold leading-snug text-carbon-800 transition-colors hover:text-azul-700 xl:min-h-[4.75rem] xl:px-4"
            >
              <span aria-hidden="true" className={cn('h-3 w-3 shrink-0 rounded-[3px]', SWATCH[index % SWATCH.length])} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Servicios: mosaico de azulejos (tabs accesibles) */
interface Tone {
  tabActive: string;
  panel: string;
  chip: string;
  link: string;
  numeral: string;
  btn: string;
  focus: string;
}

const TONES: Tone[] = [
  {
    tabActive: 'border-azul-700 bg-azul-700 text-white',
    panel: 'bg-azul-700 text-white',
    chip: 'border-white/60 text-white',
    link: 'text-white decoration-white/60 hover:decoration-white',
    numeral: 'text-white/[0.12]',
    btn: 'bg-arena-50 text-carbon-900 hover:bg-white',
    focus: '[&_a:focus-visible]:outline-white',
  },
  {
    tabActive: 'border-sol-400 bg-sol-400 text-carbon-900',
    panel: 'bg-sol-400 text-carbon-900',
    chip: 'border-carbon-900/60 text-carbon-900',
    link: 'text-carbon-900 decoration-carbon-900/50 hover:decoration-carbon-900',
    numeral: 'text-carbon-900/10',
    btn: 'bg-carbon-900 text-arena-50 hover:bg-carbon-800',
    focus: '[&_a:focus-visible]:outline-carbon-900',
  },
  {
    tabActive: 'border-terra-600 bg-terra-600 text-white',
    panel: 'bg-terra-600 text-white',
    chip: 'border-white/60 text-white',
    link: 'text-white decoration-white/60 hover:decoration-white',
    numeral: 'text-white/[0.12]',
    btn: 'bg-arena-50 text-carbon-900 hover:bg-white',
    focus: '[&_a:focus-visible]:outline-white',
  },
  {
    tabActive: 'border-olivo-700 bg-olivo-700 text-white',
    panel: 'bg-olivo-700 text-white',
    chip: 'border-white/60 text-white',
    link: 'text-white decoration-white/60 hover:decoration-white',
    numeral: 'text-white/[0.12]',
    btn: 'bg-arena-50 text-carbon-900 hover:bg-white',
    focus: '[&_a:focus-visible]:outline-white',
  },
  {
    tabActive: 'border-granada-700 bg-granada-700 text-white',
    panel: 'bg-granada-700 text-white',
    chip: 'border-white/60 text-white',
    link: 'text-white decoration-white/60 hover:decoration-white',
    numeral: 'text-white/[0.12]',
    btn: 'bg-arena-50 text-carbon-900 hover:bg-white',
    focus: '[&_a:focus-visible]:outline-white',
  },
  {
    tabActive: 'border-cielo-200 bg-cielo-200 text-carbon-900',
    panel: 'bg-cielo-200 text-carbon-900',
    chip: 'border-carbon-900/60 text-carbon-900',
    link: 'text-carbon-900 decoration-carbon-900/50 hover:decoration-carbon-900',
    numeral: 'text-carbon-900/[0.08]',
    btn: 'bg-carbon-900 text-arena-50 hover:bg-carbon-800',
    focus: '[&_a:focus-visible]:outline-carbon-900',
  },
];

export function EsServices() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const service = esServices[active];
  const tone = TONES[active % TONES.length];

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { site: 'es', service: esServices[index].id, method });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = esServices.length;
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
    <section id="servicios" aria-labelledby="es-services-title" className="bg-arena-50 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="es-kicker text-terra-600">{esServicesSection.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-services-title" className={cn(esH2, 'lg:col-span-7')}>
            {esServicesSection.title}
          </h2>
          <p className="text-lg leading-relaxed text-carbon-600 lg:col-span-5">{esServicesSection.body}</p>
        </div>

        <div
          role="tablist"
          aria-label="Servicios"
          className="tab-strip -mx-5 mt-10 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6"
        >
          {esServices.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`es-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="es-service-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index, 'click')}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'flex min-h-[5.75rem] min-w-[9.75rem] shrink-0 snap-start flex-col justify-between rounded-2xl border-2 px-4 py-3 text-left transition-colors sm:min-w-0',
                  selected
                    ? TONES[index % TONES.length].tabActive
                    : 'border-carbon-900/15 bg-white text-carbon-900 hover:border-carbon-900',
                )}
              >
                <span aria-hidden="true" className="flex items-center justify-between">
                  <span className={cn('h-3 w-3 rounded-[3px]', selected ? 'bg-current' : SWATCH[index % SWATCH.length])} />
                  <span className="font-bricolage text-sm font-bold">{num(index)}</span>
                </span>
                <span className="mt-4 font-bricolage text-[1.02rem] font-bold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div
          key={service.id}
          role="tabpanel"
          id="es-service-panel"
          aria-labelledby={`es-tab-${service.id}`}
          className={cn(
            'relative mt-5 overflow-hidden rounded-3xl p-6 motion-safe:animate-panel-in sm:p-10 lg:p-12',
            tone.panel,
            tone.focus,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -right-2 -top-8 font-bricolage text-[9rem] font-extrabold leading-none sm:text-[12rem]',
              tone.numeral,
            )}
          >
            {num(active)}
          </span>
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
            <div>
              <h3 className="font-bricolage text-[1.8rem] font-extrabold leading-tight sm:text-[2.2rem]">{service.title}</h3>
              <p className="mt-4 max-w-3xl text-[17px] leading-relaxed">{service.copy}</p>
              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link
                  to="/es/solicitud"
                  onClick={() => {
                    if (service.starting_point) setPrefill(service.starting_point);
                    track('home_service_link_click', { site: 'es', service: service.id, link: 'enquiry' });
                  }}
                  className={cn('btn w-full rounded-xl px-6 sm:w-auto', tone.btn)}
                >
                  {esServicesSection.panel_cta_label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={service.detail_url}
                  hrefLang="en"
                  onClick={() => track('home_service_link_click', { site: 'es', service: service.id, link: 'service_page_en' })}
                  className={cn('inline-flex items-center gap-1.5 text-[15px] font-semibold underline decoration-2 underline-offset-4', tone.link)}
                >
                  {esServicesSection.detail_link_label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul aria-label={`${service.label}: capacidades`} className="flex flex-wrap content-start gap-2 lg:flex-col lg:items-start">
              {service.tags.map((tag) => (
                <li key={tag} className={cn('rounded-lg border-2 px-3.5 py-1.5 text-[13.5px] font-semibold', tone.chip)}>
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

/* ------------------------------------------------------------------ Operación: bloque terracota a sangre */
export function EsOperation() {
  return (
    <section id="operacion" aria-labelledby="es-operation-title" className="bg-terra-600 py-20 text-arena-50 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="es-kicker text-arena-50">{esOperation.kicker}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="es-operation-title" className="font-bricolage text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2.7rem]">
              {esOperation.title}
            </h2>
            <blockquote className="mt-8 max-w-md border-l-4 border-sol-400 pl-5">
              <p className="font-bricolage text-xl font-semibold leading-snug sm:text-[1.5rem]">{esOperation.pull_quote}</p>
            </blockquote>
          </div>
          <ol className="grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:col-span-7">
            {esOperation.items.map((item, index) => (
              <li key={item.title} className="border-t-2 border-arena-50/40 py-6">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-lg bg-sol-400 font-bricolage text-sm font-extrabold text-carbon-900"
                >
                  {num(index)}
                </span>
                <h3 className="mt-4 font-bricolage text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Proceso: cuatro azulejos numerados */
const STEP_TONES = [
  { bar: 'border-azul-700', badge: 'bg-azul-700 text-white' },
  { bar: 'border-sol-400', badge: 'bg-sol-400 text-carbon-900' },
  { bar: 'border-terra-600', badge: 'bg-terra-600 text-white' },
  { bar: 'border-olivo-700', badge: 'bg-olivo-700 text-white' },
];

export function EsProcess() {
  return (
    <section id="proceso" aria-labelledby="es-process-title" className="bg-arena-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="es-kicker text-terra-600">{esProcess.kicker}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-process-title" className={cn(esH2, 'lg:col-span-6')}>
            {esProcess.title}
          </h2>
          <p className="text-lg leading-relaxed text-carbon-600 lg:col-span-5 lg:col-start-8">{esProcess.body}</p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {esProcess.steps.map((step, index) => (
            <li key={step.step} className={cn('rounded-2xl border-t-8 bg-white p-6 sm:p-7', STEP_TONES[index].bar)}>
              <span
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-xl font-bricolage text-lg font-extrabold',
                  STEP_TONES[index].badge,
                )}
              >
                <span className="sr-only">Paso </span>
                {step.step}
              </span>
              <h3 className="mt-5 font-bricolage text-[1.35rem] font-bold leading-snug text-carbon-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-carbon-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex max-w-4xl items-start gap-4 border-t-2 border-carbon-900/15 pt-8 lg:mt-16">
          <span aria-hidden="true" className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-carbon-900 text-sol-400">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-bricolage text-xl font-semibold leading-snug text-carbon-800 sm:text-[1.5rem]">{esProcess.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Sectores: foto en arco + lista asimétrica */
export function EsIndustries() {
  const media = getMedia(esIndustries.media_id);
  return (
    <section id="sectores" aria-labelledby="es-industries-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="es-kicker text-terra-600">{esIndustries.kicker}</p>
          <h2 id="es-industries-title" className={cn(esH2, 'mt-6')}>
            {esIndustries.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-carbon-600">{esIndustries.body}</p>

          <figure className="mt-10 max-w-sm">
            <div className="rounded-t-[999px] bg-terra-600 p-2.5">
              <div className="overflow-hidden rounded-t-[999px] bg-arena-100">
                <Img
                  media={media}
                  alt={esIndustries.media_alt}
                  sizes="(min-width: 1024px) 380px, 90vw"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </div>
            <figcaption className="mt-3 text-[13px] font-medium text-carbon-600">{esIndustries.media_caption}</figcaption>
          </figure>
        </div>

        <ul className="space-y-4 lg:col-span-7 lg:pt-3">
          {esIndustries.items.map((item, index) => (
            <li
              key={item.slug}
              className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 rounded-2xl border-2 border-carbon-900/15 bg-arena-50 p-5 transition-colors hover:border-carbon-900 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:p-7"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-xl font-bricolage text-sm font-extrabold sm:h-14 sm:w-14',
                  index === 1 ? 'text-carbon-900' : 'text-white',
                  SWATCH[index % SWATCH.length],
                )}
              >
                {num(index)}
              </span>
              <div>
                <h3 className="font-bricolage text-[1.5rem] font-bold leading-tight text-carbon-900">
                  <Link
                    to={item.href}
                    hrefLang="en"
                    onClick={() => track('home_industry_click', { site: 'es', industry: item.slug })}
                    className="outline-none after:absolute after:inset-0 after:rounded-2xl group-hover:text-azul-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-azul-600"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-carbon-600">{item.copy}</p>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-azul-700">
                  {esIndustries.detail_label}
                  <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Recursos */
export function EsResources() {
  return (
    <section id="recursos" aria-labelledby="es-resources-title" className="bg-arena-100 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <p className="es-kicker text-terra-600">{esResources.kicker}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="es-resources-title" className={esH2}>
              {esResources.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-carbon-600">{esResources.body}</p>
            <p className="mt-6 rounded-2xl border-2 border-dashed border-carbon-900/30 bg-white px-5 py-4 text-[15px] leading-relaxed text-carbon-800">
              {esResources.note}
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="space-y-3">
              {esResources.topics.map((topic, index) => (
                <li key={topic.href}>
                  <Link
                    to={topic.href}
                    hrefLang="en"
                    onClick={() => track('home_guides_click', { site: 'es', target: 'topic', slug: topic.href.split('/').pop() })}
                    className="group flex min-h-14 items-center gap-4 rounded-2xl border-2 border-carbon-900/15 bg-white px-4 py-3 text-[15.5px] font-semibold text-carbon-900 transition-colors hover:border-carbon-900 hover:text-azul-700 sm:px-5"
                  >
                    <span aria-hidden="true" className={cn('h-4 w-4 shrink-0 rounded-[4px]', SWATCH[index % SWATCH.length])} />
                    <span className="flex-1">{topic.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-azul-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={esResources.cta_url}
              hrefLang="en"
              onClick={() => track('home_guides_click', { site: 'es', target: 'resource_center' })}
              className={cn(btnGhost, 'mt-8')}
            >
              {esResources.cta_label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Preguntas frecuentes */
export function EsFaq() {
  return (
    <section id="preguntas" aria-labelledby="es-faq-title" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="es-kicker text-terra-600">{esFaq.kicker}</p>
            <h2 id="es-faq-title" className={cn(esH2, 'mt-6')}>
              {esFaq.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-carbon-600">{esFaq.aside_prompt}</p>
            <Link
              to={esFaq.aside_link_url}
              className="mt-4 inline-flex items-center gap-2 font-bold text-azul-700 underline decoration-azul-700/40 decoration-2 underline-offset-4 hover:decoration-azul-700"
            >
              {esFaq.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {esFaq.items.map((item) => (
            <details key={item.id} className="group rounded-2xl border-2 border-carbon-900/15 bg-arena-50 open:border-carbon-900">
              <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 rounded-2xl px-5 py-5 text-left font-bricolage text-[1.2rem] font-bold leading-snug text-carbon-900 transition-colors hover:text-azul-700 sm:px-7 sm:text-[1.3rem]">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-carbon-900/30 text-carbon-900 transition-all group-open:rotate-45 group-open:border-carbon-900 group-open:bg-sol-400"
                >
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl px-5 pb-6 text-[16.5px] leading-relaxed text-carbon-600 sm:px-7">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Solicitud: ficha con cenefa de azulejos */
export function EsEnquiry() {
  return (
    <section id="solicitud" aria-labelledby="es-enquiry-title" className="bg-arena-200 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="overflow-hidden rounded-3xl border-2 border-carbon-900 bg-arena-50">
          <div aria-hidden="true" className="azulejo-strip" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-azul-700 px-5 py-3 text-white sm:px-8">
            <p className="font-bricolage text-[12.5px] font-bold uppercase tracking-[0.18em]">{esEnquiry.form_tag}</p>
            <p aria-hidden="true" className="hidden font-bricolage text-[12.5px] font-bold uppercase tracking-[0.18em] text-sol-300 sm:block">
              {esEnquiry.kicker}
            </p>
          </div>

          <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <h2 id="es-enquiry-title" className="font-bricolage text-[1.8rem] font-extrabold leading-[1.1] tracking-tight text-carbon-900 text-balance sm:text-[2.25rem]">
                {esEnquiry.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-carbon-600">{esEnquiry.body}</p>
              <ul className="mt-10 space-y-4 border-t-2 border-carbon-900/15 pt-8">
                {esEnquiry.reassurance.map((line) => (
                  <li key={line} className="flex gap-3 text-base leading-relaxed text-carbon-800">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-azul-700 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <EnquiryForm
                idPrefix="es-enquiry"
                placement="es-home"
                copy={esEnquiry.copy}
                strings={ES_STRINGS}
                privacyUrl="/es/privacidad"
                theme={ES_FORM_THEME}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
