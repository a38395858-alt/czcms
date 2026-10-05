import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, CheckIcon, PlusIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { SITE_META, siteConfig } from '../../../config/site';
import { getLatestArticlesEs } from '../../../content/es/articles';
import { ES_ANCHORS, HERO_HIGHLIGHT_ES, HERO_ROUTE_ES } from '../../../content/es/home';
import { getMedia } from '../../../content/media';
import type {
  CoverageSection,
  EnquirySection,
  FaqSection,
  HeroSection,
  IndustriesSection,
  OperationSection,
  ProcessSection,
  ResourcesSection,
  ServicePathsSection,
} from '../../../content/types';
import { track } from '../../../lib/analytics';
import { setPrefill } from '../../../lib/enquiry';
import { esStrings } from '../../../lib/enquiry-i18n';
import { prefersReducedMotion, useMediaQuery } from '../../../lib/hooks';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';
import { EsArticleCard } from './EsParts';

function Highlighted({ text, phrase }: { text: string; phrase: string }) {
  const index = phrase ? text.indexOf(phrase) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="es-marker">{phrase}</span>
      {text.slice(index + phrase.length)}
    </>
  );
}

/* ------------------------------------------------------------------ Cabecera (hero) */
export function EsHero({ section }: { section: HeroSection }) {
  const media = getMedia(section.media_id);
  const labels = section.settings.route_labels;
  return (
    <section id="hero" aria-labelledby="es-hero-title" className="relative isolate overflow-hidden bg-cal text-carbon-900">
      <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[42%] bg-arena-100" />
      <div className="shell pt-10 sm:pt-14 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="es-eyebrow text-mar-700">{section.eyebrow}</p>
            <h1
              id="es-hero-title"
              className="mt-6 font-es text-[2.4rem] font-extrabold leading-[1.03] tracking-[-0.025em] text-balance sm:text-[3.25rem] lg:text-[3.5rem] xl:text-[4.1rem]"
            >
              <Highlighted text={section.title} phrase={HERO_HIGHLIGHT_ES} />
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="text-lg leading-relaxed text-carbon-600">{section.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to={section.cta_primary_url} onClick={() => track('home_hero_primary_click')} className="es-btn es-btn-primary w-full px-6 text-base sm:w-auto">
                {section.cta_primary_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={section.cta_secondary_url} onClick={() => track('home_hero_secondary_click')} className="es-btn es-btn-outline w-full px-6 text-base sm:w-auto">
                {section.cta_secondary_label}
              </Link>
            </div>
            <p className="mt-6 max-w-lg border-l-[3px] border-albero-400 pl-4 text-[15px] leading-relaxed text-carbon-600">{section.settings.microcopy}</p>
          </div>
        </div>
      </div>

      <div className="shell mt-10 pb-16 sm:mt-14 lg:pb-28">
        <figure className="relative">
          <div className="overflow-hidden bg-pino-900">
            <Img media={media} alt={section.media_alt} priority sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]" />
          </div>
          <figcaption className="relative bg-pino-900 px-5 py-5 text-white sm:px-8 lg:absolute lg:inset-x-10 lg:-bottom-14 lg:rounded-lg lg:shadow-[0_24px_48px_-24px_rgba(6,35,28,0.6)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
              <span className="es-eyebrow text-albero-300">Hoja de ruta</span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-pino-200">China → España · UE</span>
            </div>
            <ol className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
              <span aria-hidden="true" className="absolute left-[7px] right-[calc(25%_-_19px)] top-[7px] hidden border-t-2 border-dashed border-white/30 sm:block" />
              {labels.map((label, index) => (
                <li key={label} className="relative flex gap-3 sm:flex-col sm:gap-2.5">
                  <span aria-hidden="true" className="mt-1 block h-3.5 w-3.5 shrink-0 rotate-45 bg-almagre-500 ring-4 ring-pino-900 sm:mt-0" />
                  <span>
                    <span className="block text-[12px] font-extrabold tracking-[0.12em]">{label}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-pino-200">{HERO_ROUTE_ES[index]}</span>
                  </span>
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Ámbito */
export function EsCoverage({ section }: { section: CoverageSection }) {
  return (
    <section id="ambito" aria-labelledby="es-coverage-title" className="border-y border-carbon-900/10 bg-white">
      <h2 id="es-coverage-title" className="sr-only">
        {section.title}
      </h2>
      <div className="shell">
        <ul className="grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0 xl:py-0">
          {section.items.map((item, index) => (
            <li key={item.href} className={cn('xl:border-l xl:border-carbon-900/10', index === 0 && 'xl:border-l-0')}>
              <Link
                to={item.href}
                className="group flex min-h-12 items-center gap-2.5 py-2 text-[15px] font-semibold leading-snug text-carbon-800 transition-colors hover:text-mar-700 xl:min-h-[4.75rem] xl:justify-center xl:px-3 xl:text-center"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-albero-400 transition-transform group-hover:scale-125" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Recorridos de servicio (panel + índice) */
export function EsServicePaths({ section }: { section: ServicePathsSection }) {
  const items = section.items;
  const initialIndex = Math.max(0, items.findIndex((item) => item.id === section.settings.default_tab));
  const [active, setActive] = useState(initialIndex);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stripRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const baseId = useId();

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { service: items[index].id, method });
  };

  useEffect(() => {
    const strip = stripRef.current;
    const tab = tabRefs.current[active];
    if (!strip || !tab || isDesktop) return;
    const left = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active, isDesktop]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, 'keyboard');
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="soluciones" aria-labelledby="es-services-title" className="bg-cal py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="es-eyebrow text-mar-700">{section.eyebrow}</p>
            <h2 id="es-services-title" className="es-h2 mt-5 text-carbon-900">
              {section.title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-carbon-600 lg:col-span-5">{section.body}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:order-2 lg:col-span-4">
            <p className="es-eyebrow mb-3 hidden text-carbon-600 lg:inline-flex">Índice</p>
            <div
              ref={stripRef}
              role="tablist"
              aria-label="Recorridos de servicio"
              aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
              className="tab-strip -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-y-2 lg:border-carbon-900 lg:p-0"
            >
              {items.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(index, 'click')}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={cn(
                      'group shrink-0 snap-start whitespace-nowrap rounded-md border px-4 py-2.5 text-left text-[15px] font-semibold transition-colors',
                      'lg:flex lg:w-full lg:items-center lg:gap-4 lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-b lg:border-carbon-900/10 lg:px-5 lg:py-4 lg:last:border-b-0',
                      selected ? 'border-pino-900 bg-pino-900 text-white' : 'border-carbon-300 bg-white text-carbon-700 hover:border-pino-900 hover:text-pino-900 lg:hover:bg-arena-50',
                    )}
                  >
                    <span className={cn('hidden font-es text-[1.3rem] font-extrabold tabular-nums lg:inline', selected ? 'text-albero-300' : 'text-carbon-400')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="lg:flex-1">{item.label}</span>
                    <ArrowRight className={cn('hidden h-4 w-4 shrink-0 lg:block', selected ? 'text-albero-300' : 'text-transparent group-hover:text-carbon-400')} />
                  </button>
                );
              })}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -right-5 top-0 h-[calc(100%-0.75rem)] w-14 bg-linear-to-l from-cal to-transparent sm:-right-8 lg:hidden" />
          </div>

          <div className="grid lg:col-span-8">
            {items.map((item, index) => {
              const selected = index === active;
              const media = getMedia(item.media_id);
              return (
                <div
                  key={item.id}
                  role="tabpanel"
                  id={`${baseId}-panel-${item.id}`}
                  aria-labelledby={`${baseId}-tab-${item.id}`}
                  className={cn('col-start-1 row-start-1 flex flex-col', selected ? 'visible motion-safe:animate-panel-in' : 'invisible')}
                >
                  <div className="es-block-shadow relative mb-[14px] mr-[14px] overflow-hidden bg-pino-900">
                    <Img media={media} alt={item.media_alt} loading={index === initialIndex ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-[16/10] w-full object-cover" />
                    <span className="absolute left-4 top-4 bg-albero-300 px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-carbon-900">{item.label}</span>
                  </div>
                  <h3 className="mt-8 font-es text-[2rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-carbon-900 sm:text-[2.4rem]">{item.title}</h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-carbon-600">{item.copy}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="mr-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-carbon-600">Alcance</span>
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-arena-100 px-3 py-1.5 text-[13px] font-semibold text-carbon-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col gap-5 border-t border-carbon-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link to={item.link_url} onClick={() => track('home_service_link_click', { service: item.id, link: 'service_page' })} className="es-btn es-btn-dark w-full sm:w-auto">
                      {item.link_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={ES_ANCHORS.enquiry}
                      onClick={() => {
                        if (item.starting_point) setPrefill(item.starting_point);
                        track('home_service_link_click', { service: item.id, link: 'enquiry' });
                      }}
                      className="es-link"
                    >
                      {section.settings.panel_cta_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Operación conectada */
export function EsOperation({ section }: { section: OperationSection }) {
  return (
    <section id="operacion" aria-labelledby="es-operation-title" className="bg-pino-900 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="es-eyebrow text-albero-300">{section.eyebrow}</p>
            <h2 id="es-operation-title" className="es-h2 mt-5 text-white">
              {section.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="border-l-[3px] border-albero-400 pl-5 text-xl font-semibold leading-snug text-pino-100">{section.settings.pull_quote}</p>
            <Link to={section.cta_primary_url} className="mt-6 inline-flex items-center gap-2 font-semibold text-albero-300 underline decoration-albero-300/40 underline-offset-4 hover:decoration-albero-300">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <ol className="mt-14 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {section.items.map((item) => (
            <li key={item.title} className="bg-pino-900 p-7 sm:p-8">
              <span aria-hidden="true" className="block h-1 w-10 bg-albero-400" />
              <h3 className="mt-6 font-es text-2xl font-extrabold leading-tight tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-pino-200">{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Método */
export function EsProcess({ section }: { section: ProcessSection }) {
  const last = section.items.length - 1;
  return (
    <section id="metodo" aria-labelledby="es-process-title" className="bg-arena-50 py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-process-title" className="es-h2 text-carbon-900 lg:col-span-6">
            {section.title}
          </h2>
          <p className="text-lg leading-relaxed text-carbon-600 lg:col-span-5 lg:col-start-8">{section.body}</p>
        </div>

        <ol className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {section.items.map((step, index) => (
            <li key={step.step} className="relative pl-20 lg:pl-0 lg:pt-20">
              {index !== last && (
                <>
                  <span aria-hidden="true" className="absolute bottom-[-2.5rem] left-7 top-16 border-l-2 border-dashed border-carbon-300 lg:hidden" />
                  <span aria-hidden="true" className="absolute left-16 right-[-2rem] top-7 hidden border-t-2 border-dashed border-carbon-300 lg:block" />
                </>
              )}
              <span className="absolute left-0 top-0 grid h-14 w-14 place-items-center rounded-full bg-almagre-600 font-es text-lg font-extrabold text-white">
                <span className="sr-only">Paso </span>
                {step.step}
              </span>
              <h3 className="font-es text-2xl font-extrabold leading-tight tracking-[-0.015em] text-carbon-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-carbon-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 rounded-lg bg-white p-6 ring-1 ring-carbon-900/10 lg:mt-20">
          <span aria-hidden="true" className="mt-2 h-3 w-3 shrink-0 rotate-45 bg-albero-400" />
          <p className="text-xl font-semibold leading-snug text-carbon-800 sm:text-2xl">{section.settings.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Sectores */
export function EsIndustries({ section }: { section: IndustriesSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="sectores" aria-labelledby="es-industries-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="es-industries-title" className="es-h2 text-carbon-900">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-carbon-600">{section.body}</p>
        </div>
        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <ul className="border-t-2 border-carbon-900">
              {section.items.map((item) => (
                <li key={item.slug} className="group relative border-b border-carbon-900/10 py-7 transition-colors hover:bg-arena-50 sm:px-3">
                  <h3 className="font-es text-[1.55rem] font-extrabold leading-tight tracking-[-0.015em] text-carbon-900">
                    <Link
                      to={item.href}
                      onClick={() => track('home_industry_click', { industry: item.slug })}
                      className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-mar-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-mar-600"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-carbon-600">{item.copy}</p>
                  <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mar-700">
                    Ver la página del sector
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to={section.cta_primary_url} onClick={() => track('home_industry_click', { industry: 'all' })} className="es-btn es-btn-dark w-full sm:w-auto">
                {section.cta_primary_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <figure className="relative lg:col-span-7">
            <div className="es-block-shadow mb-[14px] mr-[14px] overflow-hidden bg-pino-900">
              <Img media={media} alt={section.media_alt} sizes="(min-width: 1024px) 56vw, 100vw" className="aspect-[4/3] w-full object-cover lg:aspect-[4/5] xl:aspect-[5/6]" />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-carbon-700 sm:absolute sm:left-4 sm:top-4 sm:mt-0 sm:bg-cal sm:px-3 sm:py-2">
              <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-almagre-500" />
              {section.settings.media_caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Guías */
export function EsResources({ section }: { section: ResourcesSection }) {
  const articles = getLatestArticlesEs(section.settings.article_limit);
  const [feature, ...supporting] = articles;
  const guideClick = (target: string, slug?: string) => track('home_guides_click', { target, slug });

  return (
    <section id="guias" aria-labelledby="es-resources-title" className="border-t border-carbon-900/10 bg-cal py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="es-eyebrow text-mar-700">{section.eyebrow}</p>
            <h2 id="es-resources-title" className="es-h2 mt-5 text-carbon-900">
              <Link to={section.settings.heading_url} onClick={() => guideClick('heading')} className="decoration-albero-400 decoration-4 underline-offset-[6px] hover:underline">
                {section.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-carbon-600">{section.body}</p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link to={section.cta_primary_url} onClick={() => guideClick('resource_center')} className="es-btn es-btn-outline w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {feature ? (
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className={supporting.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'}>
              <EsArticleCard article={feature} variant="feature" onNavigate={() => guideClick('article', feature.slug)} />
            </div>
            {supporting.length > 0 && (
              <div className="lg:col-span-5">
                <ul className="divide-y divide-carbon-900/10 border-y-2 border-carbon-900">
                  {supporting.map((article) => (
                    <li key={article.slug} className="py-7">
                      <EsArticleCard article={article} variant="compact" onNavigate={() => guideClick('article', article.slug)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="es-azulejo mt-12 rounded-lg bg-arena-100 p-8 sm:p-10">
            <p className="text-2xl font-extrabold text-carbon-900">Estamos preparando nuevas guías.</p>
            <p className="mt-2 max-w-xl text-carbon-700">Empiece por uno de los temas de abajo o consulte todas las guías.</p>
          </div>
        )}

        <nav aria-labelledby="es-resources-topics" className="mt-14 border-t border-carbon-900/10 pt-8">
          <p id="es-resources-topics" className="es-eyebrow text-carbon-600">
            {section.settings.topics_label}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((topic) => (
              <li key={topic.href}>
                <Link
                  to={topic.href}
                  onClick={() => guideClick('topic', topic.href.split('/').pop())}
                  className="group flex h-full min-h-14 items-center justify-between gap-3 rounded-md border-2 border-carbon-900/10 bg-white px-4 py-3 text-[15px] font-semibold text-carbon-900 transition-colors hover:border-mar-700 hover:text-mar-700"
                >
                  {topic.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-mar-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Preguntas frecuentes */
export function EsFaq({ section }: { section: FaqSection }) {
  return (
    <section id="faq" aria-labelledby="es-faq-title" className="bg-arena-50 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 id="es-faq-title" className="es-h2 text-carbon-900">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-carbon-600">{section.settings.aside_prompt}</p>
            <Link to={section.settings.aside_link_url} className="es-link mt-3">
              {section.settings.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {section.items.map((item) => (
            <details key={item.id} className="group rounded-lg bg-white ring-1 ring-carbon-900/10 transition-shadow open:ring-2 open:ring-pino-900/20">
              <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 rounded-lg px-5 py-5 text-left font-es text-[1.2rem] font-extrabold leading-snug tracking-[-0.01em] text-carbon-900 transition-colors hover:text-mar-700 sm:px-6 sm:text-[1.3rem]">
                <span>{item.question}</span>
                <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-arena-100 text-carbon-900 transition-all group-open:rotate-45 group-open:bg-pino-900 group-open:text-white">
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl px-5 pb-6 pr-14 text-[17px] leading-relaxed text-carbon-600 sm:px-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Solicitud */
/** "Información básica sobre protección de datos" — the layered first-level notice Spanish users expect under forms (art. 11 LOPDGDD). */
export function EsDataProtectionTable() {
  const company = siteConfig.avisoLegal.company;
  const rows: Array<{ term: string; detail: string | null }> = [
    { term: 'Responsable', detail: company || null },
    { term: 'Finalidad', detail: 'Gestionar su solicitud de plan de envío y ponernos en contacto con usted.' },
    { term: 'Legitimación', detail: 'Su consentimiento y la aplicación de medidas precontractuales a petición suya.' },
    { term: 'Destinatarios', detail: 'No se cederán datos a terceros, salvo obligación legal. Los proveedores que nos prestan servicios, como el alojamiento, actúan como encargados del tratamiento.' },
    { term: 'Derechos', detail: 'Acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, como se explica en la información adicional.' },
  ];

  return (
    <section aria-labelledby="es-rgpd-title" className="mt-6 rounded-lg border border-carbon-900/10 bg-white/85 p-5 text-[13px] leading-relaxed text-carbon-700 sm:p-6">
      <h3 id="es-rgpd-title" className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-carbon-900">
        Información básica sobre protección de datos
      </h3>
      <dl className="mt-3 divide-y divide-carbon-900/10">
        {rows.map((row) => (
          <div key={row.term} className="grid gap-1 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
            <dt className="font-semibold text-carbon-900">{row.term}</dt>
            <dd>
              {row.detail ?? (
                <span className="rounded border border-dashed border-almagre-600 bg-almagre-100 px-1.5 text-almagre-700">[A completar por el titular antes de la publicación]</span>
              )}
            </dd>
          </div>
        ))}
        <div className="grid gap-1 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
          <dt className="font-semibold text-carbon-900">Información adicional</dt>
          <dd>
            Consulte la{' '}
            <Link to={siteConfig.legalEs.privacidad} className="es-link text-[13px]">
              política de privacidad
            </Link>
            .
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function EsEnquirySection({ section }: { section: EnquirySection }) {
  return (
    <section id="solicitud" aria-labelledby="es-enquiry-title" className="relative isolate border-t-[3px] border-albero-400 bg-arena-100 py-20 sm:py-24 lg:py-32">
      <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="es-eyebrow text-mar-700">{section.eyebrow}</p>
          <h2 id="es-enquiry-title" className="mt-5 font-es text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-carbon-900 text-balance sm:text-[2.5rem]">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-carbon-700">{section.body}</p>
          <ul className="mt-10 space-y-4 border-t border-carbon-900/15 pt-8">
            {section.settings.reassurance.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-relaxed text-carbon-800">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-pino-900 text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm
            idPrefix="es-solicitud"
            placement="home"
            copy={section.settings}
            strings={esStrings}
            theme="mediterraneo"
            privacyUrl={siteConfig.legalEs.privacidad}
            siteId={SITE_META.es.siteId}
            locale={SITE_META.es.locale}
          />
          <EsDataProtectionTable />
        </div>
      </div>
    </section>
  );
}
