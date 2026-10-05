import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, CheckIcon, PlusIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { SITE_META, siteConfig } from '../../../config/site';
import { getLatestArticlesIt } from '../../../content/it/articles';
import { HERO_SCHEDA_IT, IT_ANCHORS } from '../../../content/it/home';
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
import { itStrings } from '../../../lib/enquiry-i18n';
import { prefersReducedMotion, useMediaQuery } from '../../../lib/hooks';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';
import { ItArticleCard } from './ItParts';

/* ------------------------------------------------------------------ Testata (hero) */
export function ItHero({ section }: { section: HeroSection }) {
  const media = getMedia(section.media_id);
  const labels = section.settings.route_labels;
  return (
    <section id="hero" aria-labelledby="it-hero-title" className="border-b border-grafite-900 bg-white text-grafite-900">
      <div className="shell grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-x-12 lg:pb-20 lg:pt-16">
        <div className="lg:col-span-7">
          <p className="it-eyebrow text-ottanio-700">{section.eyebrow}</p>
          <h1 id="it-hero-title" className="mt-6 font-it-display text-[2.6rem] font-semibold leading-[1.0] tracking-[-0.025em] text-balance sm:text-[3.5rem] xl:text-[4.4rem]">
            {section.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-grafite-600">{section.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={section.cta_primary_url} onClick={() => track('home_hero_primary_click')} className="it-btn it-btn-primary w-full px-6 text-base sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={section.cta_secondary_url} onClick={() => track('home_hero_secondary_click')} className="it-btn it-btn-outline w-full px-6 text-base sm:w-auto">
              {section.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-8 max-w-lg border-t border-grafite-200 pt-4 text-[15px] leading-relaxed text-grafite-600">{section.settings.microcopy}</p>
        </div>

        <div className="lg:col-span-5">
          {/* Scheda spedizione: an index card set in Bodoni, the editorial counterpart to the photo. */}
          <dl className="border-y border-grafite-900">
            {HERO_SCHEDA_IT.map((row, index) => (
              <div key={row.term} className={cn('grid grid-cols-[2.5rem_5.5rem_minmax(0,1fr)] items-baseline gap-3 py-3', index > 0 && 'border-t border-grafite-200')}>
                <dt className="it-folio">{String(index + 1).padStart(2, '0')}</dt>
                <dd className="text-[12px] font-semibold uppercase tracking-[0.1em] text-grafite-500">{row.term}</dd>
                <dd className="text-[15px] text-grafite-800">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <figure className="border-t border-grafite-900">
        <Img media={media} alt={section.media_alt} priority sizes="100vw" className="aspect-[16/10] w-full object-cover sm:aspect-[21/9] lg:aspect-[3/1]" />
        <figcaption className="border-t border-grafite-900 bg-white">
          <div className="shell py-5">
            <span className="sr-only">Catena dei passaggi: {labels.map((label) => label.toLowerCase()).join(', poi ')}.</span>
            <ol aria-hidden="true" className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {labels.map((label, index) => (
                <li key={label} className={cn('flex items-baseline gap-3 sm:border-l sm:border-grafite-200 sm:pl-4', index === 0 && 'sm:border-l-0 sm:pl-0')}>
                  <span className="it-folio">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-grafite-800">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}

/* ------------------------------------------------------------------ Ambito */
export function ItCoverage({ section }: { section: CoverageSection }) {
  return (
    <section id="ambito" aria-labelledby="it-coverage-title" className="border-b border-grafite-900 bg-nebbia-50">
      <h2 id="it-coverage-title" className="sr-only">
        {section.title}
      </h2>
      <div className="shell">
        <ul className="grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0 xl:py-0">
          {section.items.map((item, index) => (
            <li key={item.href} className={cn('xl:border-l xl:border-grafite-200', index === 0 && 'xl:border-l-0')}>
              <Link
                to={item.href}
                className="group flex min-h-12 items-baseline gap-2.5 py-2 text-[15px] font-semibold leading-snug text-grafite-800 transition-colors hover:text-ottanio-700 xl:min-h-[4.5rem] xl:items-center xl:px-4"
              >
                <span aria-hidden="true" className="it-folio text-[13px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Percorsi di servizio */
export function ItServicePaths({ section }: { section: ServicePathsSection }) {
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
    <section id="servizi" aria-labelledby="it-services-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 border-b border-grafite-900 pb-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="it-eyebrow text-ottanio-700">{section.eyebrow}</p>
            <h2 id="it-services-title" className="it-h2 mt-5 text-grafite-900">
              {section.title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-grafite-600 lg:col-span-5">{section.body}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-4">
            <div
              ref={stripRef}
              role="tablist"
              aria-label="Percorsi di servizio"
              aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
              className="tab-strip -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:p-0"
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
                      'group shrink-0 snap-start whitespace-nowrap border px-4 py-2.5 text-left text-[15px] font-semibold transition-colors',
                      'lg:flex lg:w-full lg:items-baseline lg:gap-4 lg:whitespace-normal lg:border-0 lg:border-b lg:border-grafite-200 lg:px-1 lg:py-4 lg:text-[1.05rem]',
                      selected ? 'border-grafite-900 bg-grafite-900 text-white lg:bg-transparent lg:text-grafite-900' : 'border-grafite-200 text-grafite-600 hover:border-grafite-900 hover:text-grafite-900',
                    )}
                  >
                    <span aria-hidden="true" className={cn('hidden lg:inline', selected ? 'it-folio' : 'font-it-display text-[0.95rem] text-grafite-400')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('lg:flex-1', selected && 'lg:underline lg:decoration-rosso-600 lg:decoration-2 lg:underline-offset-[6px]')}>{item.label}</span>
                    <ArrowRight className={cn('hidden h-4 w-4 shrink-0 self-center lg:block', selected ? 'text-rosso-600' : 'text-transparent group-hover:text-grafite-300')} />
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
                  <div className="border border-grafite-900 bg-nebbia-100 p-2">
                    <Img media={media} alt={item.media_alt} loading={index === initialIndex ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-[16/9] w-full object-cover" />
                  </div>
                  <h3 className="mt-8 font-it-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.02em] text-grafite-900 sm:text-[2.5rem]">{item.title}</h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-grafite-600">{item.copy}</p>
                  <dl className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-grafite-200 pt-4">
                    <dt className="it-eyebrow text-grafite-500">Perimetro</dt>
                    <dd className="flex flex-wrap gap-x-5 gap-y-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[14px] font-semibold text-grafite-800">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </dl>
                  <div className="mt-8 flex flex-col gap-5 border-t border-grafite-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link to={item.link_url} onClick={() => track('home_service_link_click', { service: item.id, link: 'service_page' })} className="it-btn it-btn-dark w-full sm:w-auto">
                      {item.link_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={IT_ANCHORS.enquiry}
                      onClick={() => {
                        if (item.starting_point) setPrefill(item.starting_point);
                        track('home_service_link_click', { service: item.id, link: 'enquiry' });
                      }}
                      className="it-link"
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

/* ------------------------------------------------------------------ Operazione collegata */
export function ItOperation({ section }: { section: OperationSection }) {
  return (
    <section id="operazione" aria-labelledby="it-operation-title" className="bg-grafite-900 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-10 border-b border-white/20 pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="it-eyebrow text-ottanio-300">{section.eyebrow}</p>
            <h2 id="it-operation-title" className="it-h2 mt-5 text-white">
              {section.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-it-display text-xl italic leading-snug text-grafite-200 sm:text-2xl">« {section.settings.pull_quote} »</p>
            <Link to={section.cta_primary_url} className="mt-6 inline-flex items-center gap-2 font-semibold text-ottanio-300 underline decoration-ottanio-300/40 underline-offset-4 hover:decoration-ottanio-300">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <li key={item.title} className={cn('border-b border-white/15 py-8 lg:border-b-0 lg:border-l lg:px-6 lg:py-10', index === 0 && 'lg:border-l-0 lg:pl-0')}>
              <span className="font-it-display text-[0.95rem] font-semibold text-rosso-500">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 font-it-display text-2xl font-semibold leading-tight">{item.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-grafite-300">{item.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Metodo */
export function ItProcess({ section }: { section: ProcessSection }) {
  return (
    <section id="metodo" aria-labelledby="it-process-title" className="bg-nebbia-50 py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="it-process-title" className="it-h2 text-grafite-900 lg:col-span-6">
            {section.title}
          </h2>
          <p className="text-lg leading-relaxed text-grafite-600 lg:col-span-5 lg:col-start-8">{section.body}</p>
        </div>

        <ol className="mt-14 grid lg:mt-20 lg:grid-cols-4">
          {section.items.map((step, index) => (
            <li key={step.step} className={cn('border-t-2 border-grafite-900 py-8 lg:px-6 lg:pb-0', index === 0 && 'lg:pl-0', index === section.items.length - 1 && 'lg:pr-0')}>
              <span className="font-it-display text-[3rem] font-semibold leading-none text-rosso-600">
                <span className="sr-only">Passo </span>
                {step.step}
              </span>
              <h3 className="mt-5 font-it-display text-2xl font-semibold leading-tight text-grafite-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-grafite-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <p className="mt-14 max-w-4xl border-l-2 border-rosso-600 pl-5 font-it-display text-xl leading-snug text-grafite-800 sm:text-2xl lg:mt-16">{section.settings.closing}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Settori */
export function ItIndustries({ section }: { section: IndustriesSection }) {
  const media = getMedia(section.media_id);
  return (
    <section id="settori" aria-labelledby="it-industries-title" className="border-y border-grafite-900 bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h2 id="it-industries-title" className="it-h2 text-grafite-900">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-grafite-600">{section.body}</p>
          <figure className="mt-10 lg:mt-14">
            <div className="border border-grafite-900 bg-nebbia-100 p-2">
              <Img media={media} alt={section.media_alt} sizes="(min-width: 1024px) 56vw, 100vw" className="aspect-[4/3] w-full object-cover lg:aspect-[16/11]" />
            </div>
            <figcaption className="mt-3 flex items-baseline gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-grafite-500">
              <span aria-hidden="true" className="it-folio">
                Fig.
              </span>
              {section.settings.media_caption}
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:pt-2">
          <ul className="border-t-2 border-grafite-900">
            {section.items.map((item, index) => (
              <li key={item.slug} className="group relative border-b border-grafite-200 py-7 transition-colors hover:bg-nebbia-50 sm:px-3">
                <span aria-hidden="true" className="it-folio">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-it-display text-[1.6rem] font-semibold leading-tight text-grafite-900">
                  <Link
                    to={item.href}
                    onClick={() => track('home_industry_click', { industry: item.slug })}
                    className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-ottanio-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-ottanio-600"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-grafite-600">{item.copy}</p>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ottanio-700">
                  Vai alla pagina del settore
                  <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link to={section.cta_primary_url} onClick={() => track('home_industry_click', { industry: 'all' })} className="it-btn it-btn-dark w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Guide */
export function ItResources({ section }: { section: ResourcesSection }) {
  const articles = getLatestArticlesIt(section.settings.article_limit);
  const [feature, ...supporting] = articles;
  const guideClick = (target: string, slug?: string) => track('home_guides_click', { target, slug });

  return (
    <section id="guide" aria-labelledby="it-resources-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="it-eyebrow text-ottanio-700">{section.eyebrow}</p>
            <h2 id="it-resources-title" className="it-h2 mt-5 text-grafite-900">
              <Link to={section.settings.heading_url} onClick={() => guideClick('heading')} className="decoration-rosso-600 decoration-2 underline-offset-[8px] hover:underline">
                {section.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-grafite-600">{section.body}</p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link to={section.cta_primary_url} onClick={() => guideClick('resource_center')} className="it-btn it-btn-outline w-full sm:w-auto">
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {feature ? (
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className={supporting.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'}>
              <ItArticleCard article={feature} variant="feature" onNavigate={() => guideClick('article', feature.slug)} />
            </div>
            {supporting.length > 0 && (
              <div className="lg:col-span-5">
                <ul className="divide-y divide-grafite-200 border-t-2 border-grafite-900">
                  {supporting.map((article) => (
                    <li key={article.slug} className="py-7">
                      <ItArticleCard article={article} variant="compact" onNavigate={() => guideClick('article', article.slug)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 border border-dashed border-grafite-300 bg-nebbia-50 p-8 sm:p-10">
            <p className="font-it-display text-2xl font-semibold text-grafite-900">Nuove guide sono in preparazione.</p>
            <p className="mt-2 max-w-xl text-grafite-600">Inizi da uno degli argomenti qui sotto oppure consulti tutte le guide.</p>
          </div>
        )}

        <nav aria-labelledby="it-resources-topics" className="mt-14 border-t border-grafite-900 pt-8">
          <p id="it-resources-topics" className="it-eyebrow text-grafite-500">
            {section.settings.topics_label}
          </p>
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((topic, index) => (
              <li key={topic.href} className="border-b border-grafite-200">
                <Link
                  to={topic.href}
                  onClick={() => guideClick('topic', topic.href.split('/').pop())}
                  className="group flex min-h-14 items-baseline gap-3 py-4 text-[15px] font-semibold text-grafite-900 transition-colors hover:text-ottanio-700"
                >
                  <span aria-hidden="true" className="it-folio text-[13px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{topic.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-ottanio-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Domande frequenti */
export function ItFaq({ section }: { section: FaqSection }) {
  return (
    <section id="faq" aria-labelledby="it-faq-title" className="bg-nebbia-50 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 id="it-faq-title" className="it-h2 text-grafite-900">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-grafite-600">{section.settings.aside_prompt}</p>
            <Link to={section.settings.aside_link_url} className="it-link mt-3">
              {section.settings.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="border-t-2 border-grafite-900">
            {section.items.map((item) => (
              <details key={item.id} className="group border-b border-grafite-200">
                <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 py-6 text-left font-it-display text-[1.3rem] font-semibold leading-snug text-grafite-900 transition-colors hover:text-ottanio-700 sm:text-[1.5rem]">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-grafite-900 text-grafite-900 transition-all group-open:rotate-45 group-open:bg-grafite-900 group-open:text-white">
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[17px] leading-relaxed text-grafite-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Richiesta */
/** Layered privacy notice under the form — the short first layer Italian users expect (art. 13 GDPR). */
export function ItPrivacyNotice() {
  const company = siteConfig.noteLegali.company;
  const rows: Array<{ term: string; detail: string | null }> = [
    { term: 'Titolare', detail: company || null },
    { term: 'Finalità', detail: 'Gestire la sua richiesta di piano di spedizione e ricontattarla.' },
    { term: 'Base giuridica', detail: 'Il suo consenso e le misure precontrattuali adottate su sua richiesta.' },
    { term: 'Destinatari', detail: 'Nessuna diffusione a terzi, salvo obblighi di legge. I fornitori che erogano servizi, come l’hosting, agiscono come responsabili del trattamento.' },
    { term: 'Diritti', detail: 'Accesso, rettifica, cancellazione, opposizione, limitazione e portabilità, come indicato nell’informativa completa.' },
  ];

  return (
    <section aria-labelledby="it-privacy-title" className="mt-6 border border-grafite-200 bg-nebbia-50 p-5 text-[13px] leading-relaxed text-grafite-700 sm:p-6">
      <h3 id="it-privacy-title" className="it-eyebrow text-grafite-900">
        Informativa privacy in breve
      </h3>
      <dl className="mt-3 divide-y divide-grafite-200">
        {rows.map((row) => (
          <div key={row.term} className="grid gap-1 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
            <dt className="font-semibold text-grafite-900">{row.term}</dt>
            <dd>{row.detail ?? <span className="border border-dashed border-rosso-600 bg-rosso-100 px-1.5 text-rosso-700">[Da completare dal titolare prima della pubblicazione]</span>}</dd>
          </div>
        ))}
        <div className="grid gap-1 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
          <dt className="font-semibold text-grafite-900">Informativa completa</dt>
          <dd>
            Consulti l’
            <Link to={siteConfig.legalIt.privacy} className="it-link text-[13px]">
              informativa privacy
            </Link>
            .
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function ItEnquirySection({ section }: { section: EnquirySection }) {
  return (
    <section id="richiesta" aria-labelledby="it-enquiry-title" className="border-t border-grafite-900 bg-nebbia-100 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="it-eyebrow text-ottanio-700">{section.eyebrow}</p>
          <h2 id="it-enquiry-title" className="mt-5 font-it-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.02em] text-grafite-900 text-balance sm:text-[2.6rem]">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-grafite-600">{section.body}</p>
          <ul className="mt-10 space-y-4 border-t border-grafite-900 pt-8">
            {section.settings.reassurance.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-relaxed text-grafite-700">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-ottanio-700" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm
            idPrefix="it-richiesta"
            placement="home"
            copy={section.settings}
            strings={itStrings}
            theme="grafica"
            privacyUrl={siteConfig.legalIt.privacy}
            siteId={SITE_META.it.siteId}
            locale={SITE_META.it.locale}
          />
          <ItPrivacyNotice />
        </div>
      </div>
    </section>
  );
}
