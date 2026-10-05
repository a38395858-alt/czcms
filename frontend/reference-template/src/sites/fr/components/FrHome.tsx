import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, CheckIcon, PlusIcon, RouteChangeIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { SITE_META, siteConfig } from '../../../config/site';
import { getLatestArticlesFr } from '../../../content/fr/articles';
import { FR_ANCHORS, HERO_LEDGER_FR } from '../../../content/fr/home';
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
import { frStrings } from '../../../lib/enquiry-i18n';
import { prefersReducedMotion, useMediaQuery } from '../../../lib/hooks';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';
import { FrArticleCard } from './FrParts';

/* ------------------------------------------------------------------ En-tête (hero) */
export function FrHero({ section }: { section: HeroSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="hero" aria-labelledby="fr-hero-title" className="relative isolate overflow-hidden border-b border-encre-900/10 bg-ivoire text-encre-900">
      <div aria-hidden="true" className="fr-chart-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell grid gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl lg:col-span-6 lg:pr-4">
          <p className="fr-eyebrow text-outremer-700">{section.eyebrow}</p>
          <h1 id="fr-hero-title" className="mt-6 font-fr-serif text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.012em] text-balance sm:text-[3.2rem] xl:text-[3.75rem]">
            {section.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-encre-600 sm:text-[1.15rem] sm:leading-relaxed">{section.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={section.cta_primary_url} onClick={() => track('home_hero_primary_click')} className="fr-btn fr-btn-primary w-full px-6 text-base sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={section.cta_secondary_url} onClick={() => track('home_hero_secondary_click')} className="fr-btn fr-btn-outline w-full px-6 text-base sm:w-auto">
              {section.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-8 max-w-lg border-l-2 border-sienne-600/60 pl-4 font-fr-serif text-[16px] italic leading-relaxed text-encre-600">{section.settings.microcopy}</p>
        </div>

        <div className="lg:col-span-6">
          <figure className="overflow-hidden rounded-[14px] bg-lin-100 ring-1 ring-encre-900/10">
            <Img media={media} alt={section.media_alt} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]" />
          </figure>
          <Ledger labels={section.settings.route_labels} />
        </div>
      </div>
    </section>
  );
}

/** "Carnet d’escales" — a numbered ledger beneath the hero image, with the four-stop route line. */
function Ledger({ labels }: { labels: string[] }) {
  return (
    <div className="mt-5 rounded-[12px] border border-lin-300 bg-white/85 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-lin-200 px-5 py-2.5">
        <span className="fr-eyebrow text-encre-900">Carnet d’escales</span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-encre-500">Chine → France · UE</span>
      </div>
      <ol className="divide-y divide-lin-200 px-5">
        {HERO_LEDGER_FR.map((row) => (
          <li key={row.step} className="grid grid-cols-[2rem_6rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 text-[14px] sm:grid-cols-[2rem_7rem_minmax(0,1fr)]">
            <span className="font-fr-serif text-[15px] font-semibold text-sienne-600">{row.step}</span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-encre-500">{row.term}</span>
            <span className="text-encre-800">{row.detail}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-b-[12px] border-t border-lin-200 bg-lin-50 px-5 pb-4 pt-4">
        <span className="sr-only">Chaîne des relais : {labels.map((label) => label.toLowerCase()).join(', puis ')}.</span>
        <ol aria-hidden="true" className="relative grid grid-cols-4">
          <span className="absolute left-[12.5%] right-[12.5%] top-[6px] h-px bg-encre-900/25" />
          {labels.map((label) => (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              <span className="block h-[13px] w-[13px] rounded-full bg-sienne-600 ring-4 ring-lin-50" />
              <span className="text-[10px] font-semibold tracking-[0.1em] text-encre-800 sm:text-[11px]">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Bandeau des domaines */
export function FrCoverage({ section }: { section: CoverageSection }) {
  return (
    <section id="domaines" aria-labelledby="fr-coverage-title" className="border-b border-encre-900/10 bg-white">
      <h2 id="fr-coverage-title" className="sr-only">
        {section.title}
      </h2>
      <div className="shell">
        <ul className="grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0 xl:py-0">
          {section.items.map((item, index) => (
            <li key={item.href} className={cn('xl:border-l xl:border-encre-900/10', index === 0 && 'xl:border-l-0')}>
              <Link
                to={item.href}
                className="group flex min-h-12 items-center gap-2.5 py-2 text-[15px] font-semibold leading-snug text-encre-800 transition-colors hover:text-outremer-700 xl:min-h-[4.5rem] xl:justify-center xl:px-3 xl:text-center"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-outremer-700 transition-transform group-hover:scale-125" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Parcours de prestations (sommaire + panneau) */
export function FrServicePaths({ section }: { section: ServicePathsSection }) {
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
    <section id="solutions" aria-labelledby="fr-services-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="fr-eyebrow text-outremer-700">{section.eyebrow}</p>
            <h2 id="fr-services-title" className="fr-h2 mt-5 text-encre-900">
              {section.title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-encre-600 lg:col-span-5">{section.body}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-4">
            <p className="fr-eyebrow mb-3 hidden text-encre-500 lg:inline-flex">Sommaire</p>
            <div
              ref={stripRef}
              role="tablist"
              aria-label="Parcours de prestations"
              aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
              className="tab-strip -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-encre-900 lg:p-0"
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
                      'group shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-left text-[15px] font-semibold transition-colors',
                      'lg:flex lg:w-full lg:items-baseline lg:gap-4 lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-b lg:border-encre-900/15 lg:px-1 lg:py-4 lg:text-[1.05rem]',
                      selected
                        ? 'border-encre-900 bg-encre-900 text-white lg:bg-transparent lg:text-encre-900'
                        : 'border-lin-300 text-encre-600 hover:border-encre-900 hover:text-encre-900 lg:hover:bg-lin-50/70',
                    )}
                  >
                    <span className={cn('hidden font-fr-serif text-[15px] lg:inline', selected ? 'text-sienne-600' : 'text-encre-400')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('lg:flex-1', selected && 'lg:underline lg:decoration-outremer-600 lg:decoration-2 lg:underline-offset-[6px]')}>{item.label}</span>
                    <ArrowRight className={cn('hidden h-4 w-4 shrink-0 self-center lg:block', selected ? 'text-outremer-700' : 'text-transparent group-hover:text-encre-300')} />
                  </button>
                );
              })}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -right-5 top-0 h-[calc(100%-0.75rem)] w-14 bg-linear-to-l from-white to-transparent sm:-right-8 lg:hidden" />
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
                  <div className="relative overflow-hidden rounded-[14px] bg-lin-100 ring-1 ring-encre-900/10">
                    <Img media={media} alt={item.media_alt} loading={index === initialIndex ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-[16/9] w-full object-cover" />
                    <span className="absolute left-4 top-4 rounded-full bg-encre-900/90 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white">{item.label}</span>
                  </div>
                  <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10">
                    <div>
                      <h3 className="font-fr-serif text-[2rem] font-semibold leading-[1.1] text-encre-900 sm:text-[2.3rem]">{item.title}</h3>
                      <p className="mt-4 text-[17px] leading-relaxed text-encre-600">{item.copy}</p>
                    </div>
                    <ul aria-label={`Périmètre : ${item.label}`} className="flex flex-wrap content-start gap-2 xl:flex-col xl:items-start xl:border-l xl:border-lin-300 xl:pl-6">
                      {item.tags.map((tag) => (
                        <li key={tag} className="rounded-full border border-lin-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-encre-700">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 flex flex-col gap-5 border-t border-lin-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link to={item.link_url} onClick={() => track('home_service_link_click', { service: item.id, link: 'service_page' })} className="fr-btn fr-btn-dark w-full sm:w-auto">
                      {item.link_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={FR_ANCHORS.enquiry}
                      onClick={() => {
                        if (item.starting_point) setPrefill(item.starting_point);
                        track('home_service_link_click', { service: item.id, link: 'enquiry' });
                      }}
                      className="fr-link"
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

/* ------------------------------------------------------------------ Opération d’un seul tenant */
export function FrOperation({ section }: { section: OperationSection }) {
  return (
    <section id="operation" aria-labelledby="fr-operation-title" className="bg-encre-900 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="fr-eyebrow text-outremer-300">{section.eyebrow}</p>
            <h2 id="fr-operation-title" className="fr-h2 mt-5 text-white">
              {section.title}
            </h2>
            <p className="mt-8 max-w-md border-l-2 border-sienne-500 pl-5 font-fr-serif text-xl italic leading-snug text-lin-100 sm:text-2xl">« {section.settings.pull_quote} »</p>
            <Link to={section.cta_primary_url} className="mt-10 inline-flex items-center gap-2 font-semibold text-outremer-300 underline decoration-outremer-300/40 underline-offset-4 hover:decoration-outremer-300">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {section.items.map((item, index) => (
            <li key={item.title} className="border-t border-white/20 pt-6">
              <span className="font-fr-serif text-[15px] font-semibold text-sienne-500">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-fr-serif text-2xl font-semibold leading-tight text-white">{item.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-lin-200">{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Méthode */
export function FrProcess({ section }: { section: ProcessSection }) {
  return (
    <section id="methode" aria-labelledby="fr-process-title" className="bg-ivoire py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="fr-process-title" className="fr-h2 text-encre-900 lg:col-span-6">
            {section.title}
          </h2>
          <p className="text-lg leading-relaxed text-encre-600 lg:col-span-5 lg:col-start-8">{section.body}</p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-lin-300 bg-lin-300 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {section.items.map((step) => (
            <li key={step.step} className="relative flex flex-col bg-white p-7 sm:p-8">
              <span className="font-fr-serif text-[2.6rem] font-semibold leading-none text-sienne-600">
                <span className="sr-only">Étape </span>
                {step.step}
              </span>
              <h3 className="mt-6 font-fr-serif text-2xl font-semibold leading-tight text-encre-900 sm:text-[1.6rem]">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-encre-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex max-w-4xl items-start gap-4 lg:mt-16">
          <span aria-hidden="true" className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-outremer-700 text-outremer-700">
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-fr-serif text-xl leading-snug text-encre-800 sm:text-2xl">{section.settings.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Secteurs */
export function FrIndustries({ section }: { section: IndustriesSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="secteurs" aria-labelledby="fr-industries-title" className="border-y border-encre-900/10 bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h2 id="fr-industries-title" className="fr-h2 text-encre-900">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-encre-600">{section.body}</p>
          <figure className="relative mt-10 lg:mt-14">
            <div className="overflow-hidden rounded-[14px] bg-lin-100 ring-1 ring-encre-900/10">
              <Img media={media} alt={section.media_alt} sizes="(min-width: 1024px) 56vw, 100vw" className="aspect-[4/3] w-full object-cover lg:aspect-[16/11]" />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-encre-600 sm:absolute sm:bottom-4 sm:left-4 sm:mt-0 sm:rounded-full sm:bg-encre-900/90 sm:px-4 sm:py-2 sm:text-lin-100">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sienne-500" />
              {section.settings.media_caption}
            </figcaption>
          </figure>
        </div>
        <div className="flex flex-col lg:col-span-5 lg:pt-2">
          <ul className="border-t border-encre-900">
            {section.items.map((item) => (
              <li key={item.slug} className="group relative border-b border-encre-900/15 py-7 transition-colors hover:bg-lin-50/70 sm:px-3">
                <h3 className="font-fr-serif text-[1.6rem] font-semibold leading-tight text-encre-900">
                  <Link
                    to={item.href}
                    onClick={() => track('home_industry_click', { industry: item.slug })}
                    className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-outremer-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-outremer-500"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-encre-600">{item.copy}</p>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-outremer-700">
                  Voir la page du secteur
                  <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link to={section.cta_primary_url} onClick={() => track('home_industry_click', { industry: 'all' })} className="fr-btn fr-btn-dark w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Guides */
export function FrResources({ section }: { section: ResourcesSection }) {
  const articles = getLatestArticlesFr(section.settings.article_limit);
  const [feature, ...supporting] = articles;
  const guideClick = (target: string, slug?: string) => track('home_guides_click', { target, slug });

  return (
    <section id="guides" aria-labelledby="fr-resources-title" className="bg-ivoire py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="fr-eyebrow text-outremer-700">{section.eyebrow}</p>
            <h2 id="fr-resources-title" className="fr-h2 mt-5 text-encre-900">
              <Link to={section.settings.heading_url} onClick={() => guideClick('heading')} className="decoration-outremer-600/50 decoration-2 underline-offset-[6px] hover:underline">
                {section.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-encre-600">{section.body}</p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link to={section.cta_primary_url} onClick={() => guideClick('resource_center')} className="fr-btn fr-btn-outline w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {feature ? (
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className={supporting.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'}>
              <FrArticleCard article={feature} variant="feature" onNavigate={() => guideClick('article', feature.slug)} />
            </div>
            {supporting.length > 0 && (
              <div className="lg:col-span-5">
                <ul className="divide-y divide-lin-300 border-y border-lin-300">
                  {supporting.map((article) => (
                    <li key={article.slug} className="py-7">
                      <FrArticleCard article={article} variant="compact" onNavigate={() => guideClick('article', article.slug)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 rounded-[12px] border border-dashed border-lin-300 bg-white p-8 sm:p-10">
            <p className="font-fr-serif text-2xl font-semibold text-encre-900">De nouveaux guides arrivent.</p>
            <p className="mt-2 max-w-xl text-encre-600">Commencez par l’un des sujets ci-dessous ou consultez l’ensemble des guides.</p>
          </div>
        )}

        <nav aria-labelledby="fr-resources-topics" className="mt-14 border-t border-encre-900 pt-8">
          <p id="fr-resources-topics" className="fr-eyebrow text-encre-500">
            {section.settings.topics_label}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((topic) => (
              <li key={topic.href}>
                <Link
                  to={topic.href}
                  onClick={() => guideClick('topic', topic.href.split('/').pop())}
                  className="group flex h-full min-h-14 items-center justify-between gap-3 rounded-[10px] border border-lin-300 bg-white px-4 py-3 text-[15px] font-semibold text-encre-900 transition-colors hover:border-outremer-700 hover:text-outremer-700"
                >
                  {topic.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-outremer-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
export function FrFaq({ section }: { section: FaqSection }) {
  return (
    <section id="faq" aria-labelledby="fr-faq-title" className="border-t border-encre-900/10 bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 id="fr-faq-title" className="fr-h2 text-encre-900">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-encre-600">{section.settings.aside_prompt}</p>
            <Link to={section.settings.aside_link_url} className="fr-link mt-3">
              {section.settings.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t border-encre-900">
            {section.items.map((item) => (
              <details key={item.id} className="group border-b border-encre-900/15">
                <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 py-6 text-left font-fr-serif text-[1.3rem] font-semibold leading-snug text-encre-900 transition-colors hover:text-outremer-700 sm:text-[1.45rem]">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-encre-900 text-encre-900 transition-all group-open:rotate-45 group-open:border-outremer-700 group-open:bg-outremer-700 group-open:text-white">
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[17px] leading-relaxed text-encre-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Demande */
export function FrEnquirySection({ section }: { section: EnquirySection }) {
  return (
    <section id="demande" aria-labelledby="fr-enquiry-title" className="border-t border-encre-900/10 bg-lin-100 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="fr-eyebrow text-outremer-700">{section.eyebrow}</p>
          <h2 id="fr-enquiry-title" className="mt-5 font-fr-serif text-[2rem] font-semibold leading-[1.1] text-encre-900 text-balance sm:text-[2.5rem]">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-encre-600">{section.body}</p>
          <ul className="mt-10 space-y-4 border-t border-encre-900/15 pt-8">
            {section.settings.reassurance.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-relaxed text-encre-700">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-outremer-700 ring-1 ring-lin-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-encre-600">
            Information sur le traitement de vos données : vos réponses servent uniquement à traiter votre demande. Les détails, ainsi que vos droits d’accès, de rectification et d’opposition, figurent dans la{' '}
            <Link to={siteConfig.legalFr.confidentialite} className="fr-link">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm
            idPrefix="fr-demande"
            placement="home"
            copy={section.settings}
            strings={frStrings}
            theme="atelier"
            privacyUrl={siteConfig.legalFr.confidentialite}
            siteId={SITE_META.fr.siteId}
            locale={SITE_META.fr.locale}
          />
        </div>
      </div>
    </section>
  );
}
