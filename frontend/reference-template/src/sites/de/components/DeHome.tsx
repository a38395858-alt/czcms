import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { SITE_META, siteConfig } from '../../../config/site';
import { getLatestArticlesDe } from '../../../content/de/articles';
import { HERO_SPEC_DE } from '../../../content/de/home';
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
import { deStrings } from '../../../lib/enquiry-i18n';
import { prefersReducedMotion, useMediaQuery } from '../../../lib/hooks';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';
import { DeArticleCard } from './DeParts';

/* ------------------------------------------------------------------ Hero */
export function DeHero({ section }: { section: HeroSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="hero" aria-labelledby="de-hero-title" className="relative isolate overflow-hidden border-b border-anthrazit-900 bg-papier text-anthrazit-900">
      <div aria-hidden="true" className="de-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell grid gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-start lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="max-w-2xl lg:col-span-6 lg:pr-6">
          <p className="de-eyebrow text-enzian-700">{section.eyebrow}</p>
          <h1 id="de-hero-title" className="mt-6 font-de-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.3rem] xl:text-[3.9rem]">
            {section.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-anthrazit-600 sm:text-[1.15rem] sm:leading-relaxed">{section.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={section.cta_primary_url} onClick={() => track('home_hero_primary_click')} className="de-btn de-btn-primary w-full px-6 text-base sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={section.cta_secondary_url} onClick={() => track('home_hero_secondary_click')} className="de-btn de-btn-outline w-full px-6 text-base sm:w-auto">
              {section.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-8 max-w-lg border-l-2 border-anthrazit-900/20 pl-4 text-[15px] leading-relaxed text-anthrazit-600">{section.settings.microcopy}</p>
        </div>

        <div className="relative lg:col-span-6">
          <figure className="overflow-hidden border border-anthrazit-900 bg-kiesel-100">
            <Img media={media} alt={section.media_alt} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-[4/3]" />
          </figure>
          <SpecPanel labels={section.settings.route_labels} />
        </div>
      </div>
    </section>
  );
}

function SpecPanel({ labels }: { labels: string[] }) {
  return (
    <div className="mt-5 border border-anthrazit-900 bg-white text-anthrazit-900 shadow-[0_24px_48px_-32px_rgba(20,23,26,0.45)] lg:absolute lg:-bottom-12 lg:-left-10 lg:mt-0 lg:w-[26rem] xl:-left-12">
      <div className="flex items-center justify-between border-b border-anthrazit-900 px-5 py-2.5">
        <span className="de-eyebrow text-anthrazit-900">Sendungsübersicht</span>
        <span className="font-de-mono text-[11px] uppercase tracking-[0.14em] text-anthrazit-500">CN → DE · EU</span>
      </div>
      <dl className="divide-y divide-anthrazit-900/10 px-5">
        {HERO_SPEC_DE.map((row) => (
          <div key={row.term} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5 text-[14px]">
            <dt className="font-de-mono text-[12px] uppercase tracking-[0.08em] text-anthrazit-500">{row.term}</dt>
            <dd className="font-medium text-anthrazit-800">{row.detail}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-anthrazit-900 bg-kiesel-50 px-5 pb-4 pt-4">
        <span className="sr-only">Übergabekette: {labels.map((label) => label.toLowerCase()).join(', dann ')}.</span>
        <ol aria-hidden="true" className="relative grid grid-cols-4">
          <span className="absolute left-[12.5%] right-[12.5%] top-[6px] h-px bg-anthrazit-900/30" />
          {labels.map((label) => (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              <span className="block h-[13px] w-[13px] bg-ziegel-600 ring-4 ring-kiesel-50" />
              <span className="font-de-mono text-[10px] font-medium tracking-[0.08em] text-anthrazit-800 sm:text-[11px]">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Leistungsleiste */
export function DeCoverage({ section }: { section: CoverageSection }) {
  return (
    <section id="leistungsumfang" aria-labelledby="de-coverage-title" className="border-b border-anthrazit-900/15 bg-kiesel-50">
      <h2 id="de-coverage-title" className="sr-only">
        {section.title}
      </h2>
      <div className="shell">
        <ul className="grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0 xl:py-0">
          {section.items.map((item, index) => (
            <li key={item.href} className={cn('xl:border-l xl:border-anthrazit-900/15', index === 0 && 'xl:border-l-0')}>
              <Link
                to={item.href}
                className="group flex min-h-12 items-center gap-2.5 py-2 text-[15px] font-medium leading-snug text-anthrazit-800 transition-colors hover:text-enzian-700 xl:min-h-[4.5rem] xl:justify-center xl:px-4"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-enzian-700 transition-transform group-hover:scale-125" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Leistungspfade (Karteireiter) */
export function DeServicePaths({ section }: { section: ServicePathsSection }) {
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
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
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
    <section id="leistungen" aria-labelledby="de-services-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="de-eyebrow text-enzian-700">{section.eyebrow}</p>
            <h2 id="de-services-title" className="de-h2 mt-5 text-anthrazit-900">
              {section.title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-anthrazit-600 lg:col-span-5">{section.body}</p>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <div
            ref={stripRef}
            role="tablist"
            aria-label="Leistungspfade"
            aria-orientation="horizontal"
            className="tab-strip -mx-5 flex snap-x gap-1 overflow-x-auto border-b border-anthrazit-900 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-0"
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
                    'relative -mb-px shrink-0 snap-start whitespace-nowrap border border-b-0 px-4 py-3 text-left text-[15px] font-medium transition-colors lg:flex-1 lg:whitespace-normal lg:px-5 lg:py-4',
                    selected
                      ? 'border-anthrazit-900 bg-white text-anthrazit-900 font-semibold after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white'
                      : 'border-transparent bg-kiesel-50 text-anthrazit-600 hover:bg-kiesel-100 hover:text-anthrazit-900',
                  )}
                >
                  <span className={cn('mr-2 inline-block h-2 w-2 align-middle', selected ? 'bg-ziegel-600' : 'bg-anthrazit-300')} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-5 top-0 h-12 w-14 bg-linear-to-l from-white to-transparent sm:-right-8 lg:hidden" />

          <div className="grid border border-t-0 border-anthrazit-900">
            {items.map((item, index) => {
              const selected = index === active;
              const media = getMedia(item.media_id);
              return (
                <div
                  key={item.id}
                  role="tabpanel"
                  id={`${baseId}-panel-${item.id}`}
                  aria-labelledby={`${baseId}-tab-${item.id}`}
                  className={cn('col-start-1 row-start-1 grid lg:grid-cols-12', selected ? 'visible motion-safe:animate-panel-in' : 'invisible')}
                >
                  <div className="relative border-b border-anthrazit-900 bg-kiesel-100 lg:col-span-5 lg:border-b-0 lg:border-r">
                    <Img
                      media={media}
                      alt={item.media_alt}
                      loading={index === initialIndex ? 'eager' : 'lazy'}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto lg:min-h-[26rem]"
                    />
                    <span className="absolute left-4 top-4 bg-anthrazit-900 px-2.5 py-1.5 font-de-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex flex-col p-6 sm:p-8 lg:col-span-7 lg:p-10">
                    <h3 className="font-de-display text-[2rem] font-bold leading-[1.08] text-anthrazit-900 sm:text-[2.35rem]">{item.title}</h3>
                    <p className="mt-4 text-[17px] leading-relaxed text-anthrazit-600">{item.copy}</p>
                    <dl className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1 border-t border-anthrazit-900/15 pt-4">
                      <dt className="font-de-mono text-[12px] uppercase tracking-[0.1em] text-anthrazit-500">Umfang</dt>
                      <dd className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="border border-anthrazit-300 bg-white px-2.5 py-1 text-[13px] font-medium text-anthrazit-700">
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </dl>
                    <div className="mt-auto flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        to={item.link_url}
                        onClick={() => track('home_service_link_click', { service: item.id, link: 'service_page' })}
                        className="de-btn de-btn-dark w-full sm:w-auto"
                      >
                        {item.link_label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/de/#anfrage"
                        onClick={() => {
                          if (item.starting_point) setPrefill(item.starting_point);
                          track('home_service_link_click', { service: item.id, link: 'enquiry' });
                        }}
                        className="de-link"
                      >
                        {section.settings.panel_cta_label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
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

/* ------------------------------------------------------------------ Verbundene Abwicklung */
export function DeOperation({ section }: { section: OperationSection }) {
  return (
    <section id="abwicklung" aria-labelledby="de-operation-title" className="bg-anthrazit-900 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="de-eyebrow text-enzian-300">{section.eyebrow}</p>
            <h2 id="de-operation-title" className="de-h2 mt-5 text-white">
              {section.title}
            </h2>
            <p className="mt-8 max-w-md border-l-4 border-ziegel-500 pl-5 text-xl font-semibold leading-snug text-anthrazit-100 sm:text-2xl">
              {section.settings.pull_quote}
            </p>
            <Link to={section.cta_primary_url} className="mt-10 inline-flex items-center gap-2 font-semibold text-enzian-300 underline decoration-enzian-300/40 underline-offset-4 hover:decoration-enzian-300">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <ol className="divide-y divide-white/15 border-y border-white/15 lg:col-span-6 lg:col-start-7">
          {section.items.map((item) => (
            <li key={item.title} className="grid gap-4 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span aria-hidden="true" className="mt-2 block h-3 w-3 bg-ziegel-500" />
              <div>
                <h3 className="font-de-display text-2xl font-bold leading-tight text-white sm:text-[1.7rem]">{item.title}</h3>
                <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-anthrazit-200">{item.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Ablauf */
export function DeProcess({ section }: { section: ProcessSection }) {
  const last = section.items.length - 1;
  return (
    <section id="ablauf" aria-labelledby="de-process-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="de-process-title" className="de-h2 text-anthrazit-900 lg:col-span-6">
            {section.title}
          </h2>
          <p className="text-lg leading-relaxed text-anthrazit-600 lg:col-span-5 lg:col-start-8">{section.body}</p>
        </div>

        <ol className="mt-14 grid lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {section.items.map((step, index) => (
            <li
              key={step.step}
              className={cn(
                'relative pb-12 pl-16 lg:pb-0 lg:pl-0 lg:pt-14',
                index !== last && 'before:absolute before:bottom-0 before:left-[1.25rem] before:top-12 before:w-px before:bg-anthrazit-200 lg:before:hidden',
                index !== last && 'lg:after:absolute lg:after:left-12 lg:after:right-[-2rem] lg:after:top-5 lg:after:h-px lg:after:bg-anthrazit-200',
              )}
            >
              <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center border border-anthrazit-900 bg-white font-de-mono text-sm font-medium text-anthrazit-900 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-ziegel-600">
                <span className="sr-only">Schritt </span>
                {step.step}
              </span>
              <h3 className="font-de-display text-2xl font-bold leading-tight text-anthrazit-900 sm:text-[1.65rem]">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-anthrazit-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 border-t border-anthrazit-900 pt-8 lg:mt-20">
          <span aria-hidden="true" className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-enzian-700 text-enzian-700">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="text-xl font-semibold leading-snug text-anthrazit-800 sm:text-2xl">{section.settings.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Branchen */
export function DeIndustries({ section }: { section: IndustriesSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="branchen" aria-labelledby="de-industries-title" className="border-y border-anthrazit-900/15 bg-kiesel-50 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h2 id="de-industries-title" className="de-h2 text-anthrazit-900">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-anthrazit-600">{section.body}</p>
          <figure className="relative mt-10 lg:mt-14">
            <div className="overflow-hidden border border-anthrazit-900 bg-kiesel-100">
              <Img media={media} alt={section.media_alt} sizes="(min-width: 1024px) 56vw, 100vw" className="aspect-[4/3] w-full object-cover lg:aspect-[16/11]" />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 font-de-mono text-[12px] font-medium uppercase tracking-[0.1em] text-anthrazit-600 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:bg-anthrazit-900 sm:px-4 sm:py-3 sm:text-anthrazit-100">
              <span aria-hidden="true" className="h-2 w-2 bg-ziegel-500" />
              {section.settings.media_caption}
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:pt-2">
          <ul className="border-t border-anthrazit-900">
            {section.items.map((item) => (
              <li key={item.slug} className="group relative border-b border-anthrazit-900/20 py-7 transition-colors hover:bg-white/70 sm:px-3">
                <h3 className="font-de-display text-[1.6rem] font-bold leading-tight text-anthrazit-900">
                  <Link
                    to={item.href}
                    onClick={() => track('home_industry_click', { industry: item.slug })}
                    className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-enzian-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-enzian-500"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-anthrazit-600">{item.copy}</p>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-enzian-700">
                  Zur Branchenseite
                  <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link to={section.cta_primary_url} onClick={() => track('home_industry_click', { industry: 'all' })} className="de-btn de-btn-dark w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Ratgeber */
export function DeResources({ section }: { section: ResourcesSection }) {
  const articles = getLatestArticlesDe(section.settings.article_limit);
  const [feature, ...supporting] = articles;
  const guideClick = (target: string, slug?: string) => track('home_guides_click', { target, slug });

  return (
    <section id="ratgeber" aria-labelledby="de-resources-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="de-eyebrow text-enzian-700">{section.eyebrow}</p>
            <h2 id="de-resources-title" className="de-h2 mt-5 text-anthrazit-900">
              <Link to={section.settings.heading_url} onClick={() => guideClick('heading')} className="decoration-enzian-600/50 decoration-2 underline-offset-[6px] hover:underline">
                {section.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-anthrazit-600">{section.body}</p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link to={section.cta_primary_url} onClick={() => guideClick('resource_center')} className="de-btn de-btn-outline w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {feature ? (
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className={supporting.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'}>
              <DeArticleCard article={feature} variant="feature" onNavigate={() => guideClick('article', feature.slug)} />
            </div>
            {supporting.length > 0 && (
              <div className="lg:col-span-5">
                <ul className="divide-y divide-anthrazit-900/15 border-y border-anthrazit-900/15">
                  {supporting.map((article) => (
                    <li key={article.slug} className="py-7">
                      <DeArticleCard article={article} variant="compact" onNavigate={() => guideClick('article', article.slug)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 border border-dashed border-anthrazit-300 bg-papier p-8 sm:p-10">
            <p className="font-de-display text-2xl font-bold text-anthrazit-900">Neue Ratgeber sind in Arbeit.</p>
            <p className="mt-2 max-w-xl text-anthrazit-600">Beginnen Sie mit einem der Themen unten oder besuchen Sie den Ratgeber für die gesamte Bibliothek.</p>
          </div>
        )}

        <nav aria-labelledby="de-resources-topics" className="mt-14 border-t border-anthrazit-900 pt-8">
          <p id="de-resources-topics" className="de-eyebrow text-anthrazit-500">
            {section.settings.topics_label}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((topic) => (
              <li key={topic.href}>
                <Link
                  to={topic.href}
                  onClick={() => guideClick('topic', topic.href.split('/').pop())}
                  className="group flex h-full min-h-14 items-center justify-between gap-3 border border-anthrazit-300 bg-white px-4 py-3 text-[15px] font-semibold text-anthrazit-900 transition-colors hover:border-enzian-700 hover:text-enzian-700"
                >
                  {topic.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-enzian-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */
export function DeFaq({ section }: { section: FaqSection }) {
  return (
    <section id="faq" aria-labelledby="de-faq-title" className="border-t border-anthrazit-900/15 bg-papier py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 id="de-faq-title" className="de-h2 text-anthrazit-900">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-anthrazit-600">{section.settings.aside_prompt}</p>
            <Link to={section.settings.aside_link_url} className="de-link mt-3">
              {section.settings.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t border-anthrazit-900">
            {section.items.map((item) => (
              <details key={item.id} className="group border-b border-anthrazit-900/20">
                <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 py-6 text-left font-de-display text-[1.3rem] font-bold leading-snug text-anthrazit-900 transition-colors hover:text-enzian-700 sm:text-[1.45rem]">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-anthrazit-900 text-anthrazit-900 transition-all group-open:rotate-45 group-open:border-enzian-700 group-open:bg-enzian-700 group-open:text-white">
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[17px] leading-relaxed text-anthrazit-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Anfrage */
export function DeEnquirySection({ section }: { section: EnquirySection }) {
  return (
    <section id="anfrage" aria-labelledby="de-enquiry-title" className="border-t border-anthrazit-900 bg-kiesel-100 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="de-eyebrow text-enzian-700">{section.eyebrow}</p>
          <h2 id="de-enquiry-title" className="mt-5 font-de-display text-[2rem] font-bold leading-[1.08] text-anthrazit-900 text-balance sm:text-[2.6rem]">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-anthrazit-600">{section.body}</p>
          <ul className="mt-10 space-y-4 border-t border-anthrazit-900/20 pt-8">
            {section.settings.reassurance.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-relaxed text-anthrazit-700">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-anthrazit-900 bg-white text-enzian-700">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-anthrazit-600">
            Hinweis zur Datenverarbeitung: Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Details finden Sie in der{' '}
            <Link to={siteConfig.legalDe.datenschutz} className="de-link">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm
            idPrefix="de-anfrage"
            placement="home"
            copy={section.settings}
            strings={deStrings}
            theme="hanse"
            privacyUrl={siteConfig.legalDe.datenschutz}
            siteId={SITE_META.de.siteId}
            locale={SITE_META.de.locale}
          />
        </div>
      </div>
    </section>
  );
}
