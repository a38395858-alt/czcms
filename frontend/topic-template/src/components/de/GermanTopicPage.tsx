import { orderedTopicSections } from '../topic/composition';
import { getTopicLayout } from '../topic/variants';
import { EnquiryForm, type EnquiryPlacement, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';
import { Img } from '../ui/Img';
import { siteConfig } from '../../config/site';
import type { TopicPageContent } from '../../content/en-global/topics/types';
import type {
  TopicBrief,
  TopicChecklist,
  TopicCheckpoints,
  TopicComparison,
  TopicControls,
  TopicDecision,
  TopicFaq,
  TopicScenarios,
  TopicScopeTable,
  TopicSection,
  TopicTone,
  TopicWorkflow,
} from '../../content/en-global/topics/types';
import { DE_TOPIC_COUNTERPARTS } from '../../content/de/topics';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { DE_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { useDocumentMeta, useHreflang, useJsonLd } from '../../lib/seo';
import { cn } from '../../utils/cn';

const DE_FORM_THEME: FormTheme = {
  accentText: 'text-petrol-700',
  accentSolid: 'bg-petrol-700',
  accentButton: 'rounded-[2px] bg-brick-600 text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500',
  radius: 'rounded-[2px]',
};

const deH2 = 'font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]';
const num = (index: number) => String(index + 1).padStart(2, '0');

const sectionId = (section: TopicSection, index: number) => section.type === 'workflow' ? 'ablauf' : `de-topic-${section.type}-${index}`;

function TopicNavigation({ content }: { content: TopicPageContent }) {
  const groups = [
    { label: 'Überblick', types: ['decision'] },
    { label: 'Ablauf', types: ['workflow'] },
    { label: 'Leistungsumfang', types: ['scopeTable', 'controls'] },
    { label: 'Vorbereitung', types: ['checklist'] },
    { label: 'FAQ', types: ['faq'] },
  ];
  return <nav className="de-topic-navigation border-b border-line-200 bg-paper-25" aria-label="Auf dieser Seite">
    <div className="shell flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
      {groups.map(group => {
        const index = content.sections.findIndex(section => group.types.includes(section.type));
        return index < 0 ? null : <a key={group.label} href={`#${sectionId(content.sections[index], index)}`}>{group.label}</a>;
      })}
      <a href="#topic-anfrage" className="de-topic-navigation-cta">Anfrage <ArrowRight className="h-4 w-4" /></a>
    </div>
  </nav>;
}

/**
 * Deutsche Themenseiten-Vorlage (§0: einheitliche Struktur, Speicherstadt-Gestaltung).
 * Inhalt kommt zu 100 % aus den DE-Themendateien; CTAs scrollen direkt,
 * damit der Hash-Router sie nie mit Startseiten-Ankern verwechselt.
 */
function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  const heading = target.querySelector<HTMLElement>('h1, h2');
  if (heading) {
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
      heading.style.outline = 'none';
    }
    window.setTimeout(() => heading.focus({ preventScroll: true }), reduced ? 0 : 450);
  }
}

const toneClass = (tone: TopicTone) =>
  tone === 'navy' ? 'bg-graphite-900 text-white' : tone === 'mist' ? 'bg-paper-50' : 'bg-white';

function Kicker({ children, dark }: { children: string; dark?: boolean }) {
  return <p className={cn('de-kicker', dark ? 'text-petrol-300' : 'text-brick-600')}>{children}</p>;
}

function counterpartKey(content: TopicPageContent): string {
  if (content.id === 'de-product-sourcing') return 'product-sourcing';
  return `${content.kind}:${content.id.replace(/^de-(service-|industry-)?/, '')}`;
}

export function GermanTopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({
    title: content.meta.title,
    description: content.meta.description,
    path: content.route,
    lang: 'de-DE',
    keywords: content.meta.keywords,
  });

  const counterpart = DE_TOPIC_COUNTERPARTS[counterpartKey(content)];
  useHreflang(
    counterpart
      ? [
          { lang: 'de', path: counterpart.de },
          { lang: 'en', path: counterpart.en },
        ]
      : [],
  );

  const faqSection = content.sections.find((section) => section.type === 'faq');
  const faqItems = faqSection?.type === 'faq' ? faqSection.content.items : [];

  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: siteConfig.brand,
      url: `${root}/de/`,
    },
    {
      '@type': 'WebPage',
      name: content.hero.title,
      description: content.hero.body,
      inLanguage: 'de-DE',
      url: `${root}${content.route}`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${root}/de/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: content.breadcrumbParent.label,
          item: `${root}${content.breadcrumbParent.href}`,
        },
        { '@type': 'ListItem', position: 3, name: content.pageLabel },
      ],
    },
  ];
  if (content.serviceName) {
    graph.push({
      '@type': 'Service',
      name: content.serviceName,
      serviceType: content.serviceName,
      description: content.hero.body,
      provider: { '@id': orgId },
      url: `${root}${content.route}`,
    });
  }
  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }
  useJsonLd(`fv-de-topic-${content.id}-jsonld`, { '@context': 'https://schema.org', '@graph': graph });

  const requestPlan = () => {
    if (content.startingPoint) setPrefill(content.startingPoint);
    track('home_hero_primary_click', { site: 'de', placement: content.id });
    scrollToSection('topic-anfrage');
  };

  const seeWorkflow = () => {
    track('home_hero_secondary_click', { site: 'de', placement: content.id });
    scrollToSection('ablauf');
  };

  return (
    <>
      <TopicHero content={content} onPrimary={requestPlan} onSecondary={seeWorkflow} />
      <TopicNavigation content={content} />
      {orderedTopicSections(content.route, content.sections).map(({ section, index }) => (
        <TopicSectionBlock key={`${section.type}-${index}`} section={section} index={index} route={content.route} />
      ))}
      <TopicRelated content={content} />
      <TopicEnquiry content={content} />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */

function TopicHero({
  content,
  onPrimary,
  onSecondary,
}: {
  content: TopicPageContent;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const { hero } = content;
  return (
    <section aria-labelledby="de-topic-hero-title" className="de-topic-hero topic-hero bg-din-grid border-b border-line-200 bg-paper-25">
      <div className="shell pb-16 pt-10 sm:pt-12 lg:pb-20">
        <nav aria-label="Brotkrümelnavigation">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite-500">
            <li>
              <Link to="/de" className="underline decoration-graphite-400/40 underline-offset-4 hover:text-graphite-900">
                Startseite
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={content.breadcrumbParent.href}
                className="underline decoration-graphite-400/40 underline-offset-4 hover:text-graphite-900"
              >
                {content.breadcrumbParent.label}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-graphite-900">
              {content.pageLabel}
            </li>
          </ol>
        </nav>

        <div className="de-topic-hero-columns topic-hero-columns mt-8 grid gap-9 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h1
          id="de-topic-hero-title"
          className="mt-6 max-w-5xl font-serif text-[2.35rem] font-bold leading-[1.1] text-graphite-900 text-balance sm:text-[3.1rem] xl:text-[3.6rem]"
        >
          {hero.title}
        </h1>
            <p className="text-lg leading-relaxed text-graphite-500 sm:text-[1.15rem]">{hero.body}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onPrimary}
                className="btn w-full rounded-[2px] bg-brick-600 px-6 text-base text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500 sm:w-auto"
              >
                {hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onSecondary}
                className="btn w-full rounded-[2px] border border-graphite-900/30 px-6 text-base text-graphite-900 hover:border-graphite-900 sm:w-auto"
              >
                {hero.secondaryCta}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <figure className="de-topic-hero-image border border-line-300 bg-white p-2 sm:p-3">
              <Img
                media={getMedia(hero.mediaId)}
                alt={hero.mediaAlt}
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="aspect-[3/2] w-full object-cover"
              />
              <figcaption className="flex items-baseline justify-between gap-3 px-1 pb-1 pt-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-graphite-500">
                <span>
                  Abb. 01 · {content.pageLabel}
                </span>
                <span aria-hidden="true">FV·DE</span>
              </figcaption>
            </figure>
          </div>
            <ol
              aria-label="Seitenablauf"
              className="de-topic-rail topic-hero-rail grid grid-cols-2 gap-px border border-line-300 bg-line-300 sm:grid-cols-5 lg:col-span-12"
            >
              {hero.rail.map((item, index) => (
                <li key={item.label} className="bg-white px-3 py-3">
                  <span aria-hidden="true" className="font-mono text-[12px] font-medium text-petrol-700">
                    {item.step ?? num(index)}
                    {index < hero.rail.length - 1 && <span className="ml-1.5 text-graphite-400">→</span>}
                  </span>
                  <span className="mt-1 block text-[13px] font-semibold tracking-[0.04em] text-graphite-900">
                    {item.label}
                  </span>
                  {item.note && (
                    <span className="mt-1 hidden text-[12.5px] leading-snug text-graphite-500 sm:block">{item.note}</span>
                  )}
                </li>
              ))}
            </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Sections */

function TopicSectionBlock({ section, index, route }: { section: TopicSection; index: number; route: string }) {
  const headingId = `de-topic-s${index}`;
  const dark = section.tone === 'navy';

  return (
    <section
      id={sectionId(section, index)}
      tabIndex={-1}
      data-section-type={section.type} data-layout={getTopicLayout(route)[section.type as keyof ReturnType<typeof getTopicLayout>]}
      aria-labelledby={headingId}
      className={cn('de-topic-section relative py-20 sm:py-24 lg:py-28', toneClass(section.tone), dark && 'isolate overflow-hidden')}
    >
      <div className="shell relative">
        {section.type === 'decision' && <DecisionBlock id={headingId} content={section.content} />}
        {section.type === 'scenarios' && <ScenariosBlock id={headingId} content={section.content} />}
        {section.type === 'checklist' && <ChecklistBlock id={headingId} content={section.content} />}
        {section.type === 'workflow' && <WorkflowBlock id={headingId} content={section.content} />}
        {section.type === 'brief' && <BriefBlock id={headingId} content={section.content} />}
        {section.type === 'comparison' && <ComparisonBlock id={headingId} content={section.content} />}
        {section.type === 'checkpoints' && <CheckpointsBlock id={headingId} content={section.content} />}
        {section.type === 'scopeTable' && <ScopeTableBlock id={headingId} content={section.content} />}
        {section.type === 'controls' && <ControlsBlock id={headingId} content={section.content} dark={dark} />}
        {section.type === 'faq' && <FaqBlock id={headingId} content={section.content} />}
      </div>
    </section>
  );
}

function DecisionBlock({ id, content }: { id: string; content: TopicDecision }) {
  return (
    <div className="max-w-4xl">
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <h2 id={id} className="mt-5 font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]">
        {content.heading}
      </h2>
      <div className="mt-6 max-w-3xl space-y-5">
        {content.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-graphite-500">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function ScenariosBlock({ id, content }: { id: string; content: TopicScenarios }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className={cn(deH2, 'lg:col-span-7')}>
          {content.heading}
        </h2>
        {content.intro && <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5">{content.intro}</p>}
      </div>
      <ol className="mt-12 border-t-2 border-graphite-900">
        {content.cards.map((card) => (
          <li
            key={card.title}
            className="grid gap-3 border-b border-line-300 py-7 lg:grid-cols-12 lg:gap-8"
          >
            <h3 className="font-sans text-[1.1rem] font-semibold leading-snug text-graphite-900 lg:col-span-5">
              {card.title}
            </h3>
            <p className="text-[16.5px] leading-relaxed text-graphite-500 lg:col-span-6 lg:col-start-7">{card.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChecklistBlock({ id, content }: { id: string; content: TopicChecklist }) {
  const header = (
    <>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <h2 id={id} className="mt-5 font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]">
        {content.heading}
      </h2>
      {content.body && <p className="mt-5 text-lg leading-relaxed text-graphite-500">{content.body}</p>}
    </>
  );

  if (!content.items || content.items.length === 0) {
    return <div className="max-w-3xl">{header}</div>;
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">{header}</div>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <ul className="space-y-0 border-t-2 border-graphite-900">
          {content.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 border-b border-line-300 py-4 text-[16.5px] leading-relaxed text-graphite-700"
            >
              <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center border border-line-300 bg-white text-petrol-700">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkflowBlock({ id, content }: { id: string; content: TopicWorkflow }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="mt-5 font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]">
            {content.heading}
          </h2>
          {content.intro && <p className="mt-5 text-lg leading-relaxed text-graphite-500">{content.intro}</p>}
        </div>
      </div>
      <div className="lg:col-span-7 lg:col-start-6">
        <ol className="border-t-2 border-graphite-900">
          {content.steps.map((step, index) => {
            const number = step.step ?? num(index);
            return (
              <li key={`${number}-${index}`} className="grid gap-2 border-b border-line-300 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-4">
                <p aria-hidden="true" className="font-mono text-sm font-medium text-brick-600">
                  {number}
                </p>
                <div>
                  {step.title ? (
                    <>
                      <h3 className="font-serif text-[1.4rem] font-bold leading-snug text-graphite-900">{step.title}</h3>
                      <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-graphite-500">{step.copy}</p>
                    </>
                  ) : (
                    <h3 className="max-w-2xl font-serif text-[1.35rem] font-bold leading-snug text-graphite-900">
                      {step.copy}
                    </h3>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function BriefBlock({ id, content }: { id: string; content: TopicBrief }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker dark>{content.kicker}</Kicker>}
          <h2 id={id} className="mt-5 font-serif text-[1.95rem] font-bold leading-[1.12] text-white sm:text-[2.5rem]">
            {content.heading}
          </h2>
          <div className="mt-6 space-y-5">
            {content.paragraphs.map((paragraph, index) => (
              <p key={index} className="max-w-xl text-[17px] leading-relaxed text-graphite-200">
                {paragraph}
              </p>
            ))}
          </div>
          {content.mediaId && content.mediaAlt && (
            <figure className="mt-8 max-w-xl border border-white/20 bg-white/[0.04] p-2">
              <Img
                media={getMedia(content.mediaId)}
                alt={content.mediaAlt}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[3/2] w-full object-cover"
              />
            </figure>
          )}
        </div>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <ol className="border-t-2 border-white/70">
          {content.points.map((point, index) => (
            <li key={point.lead} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-white/15 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
              <p aria-hidden="true" className="font-mono text-sm text-petrol-300">
                {num(index)}
              </p>
              <div>
                <h3 className="font-serif text-[1.4rem] font-bold leading-snug text-white">{point.lead}</h3>
                <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-graphite-200">{point.rest}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ComparisonBlock({ id, content }: { id: string; content: TopicComparison }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className={cn(deH2, 'lg:col-span-7')}>
          {content.heading}
        </h2>
        {content.body && <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5">{content.body}</p>}
      </div>
      {content.mediaId && content.mediaAlt && (
        <figure className="mt-10 border border-graphite-900/25 bg-white p-2 shadow-[6px_6px_0_rgba(22,24,28,0.08)] sm:p-3 lg:mt-14">
          <Img
            media={getMedia(content.mediaId)}
            alt={content.mediaAlt}
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]"
          />
        </figure>
      )}
      <ol className="mt-12 grid gap-x-10 border-t-2 border-graphite-900 pt-2 lg:grid-cols-2">
        {content.rows.map((row, index) => (
          <li key={row} className="flex gap-4 border-b border-line-300 py-5">
            <span aria-hidden="true" className="font-mono text-sm font-medium text-petrol-700">
              {num(index)}
            </span>
            <p className="text-[16.5px] leading-relaxed text-graphite-800">{row}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CheckpointsBlock({ id, content }: { id: string; content: TopicCheckpoints }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className={cn(deH2, 'lg:col-span-6')}>
          {content.heading}
        </h2>
        {content.body && (
          <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5 lg:col-start-8">{content.body}</p>
        )}
      </div>
      <ol className="mt-12 grid gap-px border border-graphite-900/25 bg-graphite-900/25 sm:grid-cols-2 lg:grid-cols-4">
        {content.cards.map((card, index) => (
          <li key={card.tag} className="bg-white p-6 sm:p-7">
            <p aria-hidden="true" className="font-mono text-sm font-medium text-brick-600">
              {num(index)}
            </p>
            <p className="mt-3 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-graphite-900">
              {card.tag}
            </p>
            <p className="mt-3 text-[15.5px] leading-relaxed text-graphite-500">{card.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ScopeTableBlock({ id, content }: { id: string; content: TopicScopeTable }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className={cn(deH2, 'lg:col-span-7')}>
          {content.heading}
        </h2>
        {content.intro && <p className="text-lg leading-relaxed text-graphite-500 lg:col-span-5">{content.intro}</p>}
      </div>
      <div className="mt-12 overflow-hidden border border-graphite-900/25">
        <table className="w-full border-collapse bg-white text-left">
          <caption className="sr-only">{content.heading}</caption>
          <thead className="hidden lg:table-header-group">
            <tr className="bg-graphite-900 text-white">
              {content.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-4 font-mono text-[12px] font-medium uppercase tracking-[0.14em]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row) => (
              <tr key={row.topic} className="block border-b border-line-300 last:border-b-0 lg:table-row">
                <th
                  scope="row"
                  className="block px-5 pt-5 font-serif text-[1.2rem] font-bold leading-snug text-graphite-900 lg:table-cell lg:w-[22%] lg:px-6 lg:py-5 lg:align-top"
                >
                  {row.topic}
                </th>
                <td className="block px-5 py-2 text-[15.5px] leading-relaxed text-graphite-700 lg:table-cell lg:px-6 lg:py-5 lg:align-top">
                  <span className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-graphite-500 lg:hidden">
                    {content.headers[1]}
                  </span>
                  {row.organize}
                </td>
                <td className="block px-5 pb-5 pt-1 text-[15.5px] leading-relaxed text-graphite-700 lg:table-cell lg:px-6 lg:py-5 lg:align-top">
                  <span className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-graphite-500 lg:hidden">
                    {content.headers[2]}
                  </span>
                  {row.confirm}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ControlsBlock({ id, content, dark }: { id: string; content: TopicControls; dark: boolean }) {
  return (
    <div>
      {content.kicker && <Kicker dark={dark}>{content.kicker}</Kicker>}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2
          id={id}
          className={cn(
            'font-serif text-[1.95rem] font-bold leading-[1.12] sm:text-[2.5rem] lg:col-span-7',
            dark ? 'text-white' : 'text-graphite-900',
          )}
        >
          {content.heading}
        </h2>
        {content.intro && (
          <p className={cn('text-lg leading-relaxed lg:col-span-5', dark ? 'text-graphite-200' : 'text-graphite-500')}>
            {content.intro}
          </p>
        )}
      </div>

      {content.groups && content.groups.length > 0 && (
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:gap-12">
          {content.groups.map((group, index) => (
            <div key={group.label} className={cn('pt-6', dark ? 'border-t border-white/25' : 'border-t-2 border-graphite-900')}>
              <h3
                className={cn(
                  'font-serif text-[1.5rem] font-bold leading-snug',
                  dark ? 'text-white' : 'text-graphite-900',
                )}
              >
                <span aria-hidden="true" className={cn('mr-3 font-mono text-sm font-medium', dark ? 'text-petrol-300' : index === 0 ? 'text-petrol-700' : 'text-brick-600')}>
                  {num(index)}
                </span>
                {group.label}
              </h3>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className={cn('flex gap-3 text-[16px] leading-relaxed', dark ? 'text-graphite-200' : 'text-graphite-700')}
                  >
                    {index === 0 ? <CheckIcon className={cn('mt-1 h-4 w-4 shrink-0', dark ? 'text-petrol-300' : 'text-petrol-700')} /> : <ArrowRight className={cn('mt-1 h-4 w-4 shrink-0', dark ? 'text-petrol-300' : 'text-brick-600')} />}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {content.paragraphs && content.paragraphs.length > 0 && (
        <div className={cn('max-w-3xl space-y-5', content.groups?.length ? 'mt-10' : 'mt-6')}>
          {content.paragraphs.map((paragraph, index) => (
            <p key={index} className={cn('text-lg leading-relaxed', dark ? 'text-graphite-200' : 'text-graphite-500')}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {content.items && content.items.length > 0 && (
        <ul className="mt-12 border-t-2 border-graphite-900">
          {content.items.map((item, index) => (
            <li
              key={item}
              className={cn(
                'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)]',
                dark ? 'border-white/15' : 'border-line-300',
              )}
            >
              <span aria-hidden="true" className={cn('font-mono text-sm', dark ? 'text-petrol-300' : 'text-petrol-700')}>
                {num(index)}
              </span>
              <span className={cn('text-[16.5px] leading-relaxed', dark ? 'text-graphite-100' : 'text-graphite-800')}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqBlock({ id, content }: { id: string; content: TopicFaq }) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="mt-6 font-serif text-[1.95rem] font-bold leading-[1.12] text-graphite-900 sm:text-[2.5rem]">
            {content.heading}
          </h2>
          {content.guide && <p className="mt-5 text-[17px] leading-relaxed text-graphite-500">{content.guide}</p>}
        </div>
      </div>
      <div className="lg:col-span-8">
        <div className="border-t-2 border-graphite-900">
          {content.items.map((item, index) => (
            <details key={item.id} className="group border-b border-line-300">
              <summary className="grid min-h-[44px] cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-baseline gap-3 py-6 text-left transition-colors hover:text-brick-600 sm:grid-cols-[3.5rem_minmax(0,1fr)_2.5rem]">
                <span aria-hidden="true" className="font-mono text-sm font-normal text-graphite-400">
                  {num(index)}
                </span>
                <span className="font-serif text-[1.2rem] font-bold leading-snug text-graphite-900 group-hover:text-brick-600 sm:text-[1.3rem]">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center self-center border border-line-300 text-graphite-700 transition-all group-open:rotate-45 group-open:border-brick-600 group-open:bg-brick-600 group-open:text-white"
                >
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[16.5px] leading-relaxed text-graphite-500 sm:pl-[3.5rem]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Related */

function TopicRelated({ content }: { content: TopicPageContent }) {
  return (
    <section aria-labelledby="de-topic-related" className="border-t border-line-200 bg-paper-50 py-16 sm:py-20">
      <div className="shell">
        <RelatedRail
          id="de-topic-related"
          heading={content.related.heading}
          intro={content.related.intro}
          links={content.related.links}
          contentId={content.id}
        />
        {content.relatedIndustries && content.relatedIndustries.links.length > 0 && (
          <div className="mt-14">
            <RelatedRail
              id="de-topic-related-industries"
              heading={content.relatedIndustries.heading}
              intro={content.relatedIndustries.intro}
              links={content.relatedIndustries.links}
              contentId={content.id}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function RelatedRail({
  id,
  heading,
  intro,
  links,
  contentId,
}: {
  id: string;
  heading: string;
  intro?: string;
  links: { label: string; href: string; note: string }[];
  contentId: string;
}) {
  return (
    <div>
      <h2 id={id} className="font-serif text-[1.9rem] font-bold leading-tight text-graphite-900">
        {heading}
      </h2>
      {intro && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-graphite-500">{intro}</p>}
      <ul className="de-topic-related-links mt-8 grid gap-x-10 border-t-2 border-graphite-900 lg:grid-cols-2">
        {links.map((link, index) => (
          <li key={link.href} className="group relative border-b border-line-300 py-6 transition-colors hover:bg-white sm:px-3">
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
              <p aria-hidden="true" className="pt-1.5 font-mono text-sm text-graphite-400 group-hover:text-brick-600">
                {num(index)}
              </p>
              <div>
                <h3 className="font-serif text-[1.45rem] font-bold text-graphite-900">
                  <Link
                    to={link.href}
                    onClick={() =>
                      track('home_service_link_click', {
                        site: 'de',
                        service: contentId,
                        link: link.href.replace(/^\//, '').replace(/\//g, ':'),
                      })
                    }
                    className="outline-none after:absolute after:inset-0 group-hover:text-brick-600 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-petrol-700"
                  >
                    {link.label}
                  </Link>
                </h3>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-graphite-500">{link.note}</p>
                <span aria-hidden="true" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                  Seite öffnen
                  <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ Enquiry (Formblatt) */

function TopicEnquiry({ content }: { content: TopicPageContent }) {
  return (
    <section
      id="topic-anfrage"
      tabIndex={-1}
      aria-labelledby="de-topic-enquiry-title"
      className="bg-din-grid border-t border-line-300 bg-paper-100 py-20 sm:py-24 lg:py-28"
    >
      <div className="shell">
        <div className="border-2 border-graphite-900 bg-paper-25 shadow-[8px_8px_0_rgba(22,24,28,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-2 border-graphite-900 bg-graphite-900 px-5 py-3 sm:px-8">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-paper-50">
              Formblatt · {content.pageLabel}-Anfrage
            </p>
            <p aria-hidden="true" className="hidden font-mono text-[12px] text-graphite-400 sm:block">
              {content.enquiry.kicker}
            </p>
          </div>

          <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <h2
                id="de-topic-enquiry-title"
                className="font-serif text-[1.8rem] font-bold leading-[1.15] text-graphite-900 text-balance sm:text-[2.2rem]"
              >
                {content.enquiry.heading}
              </h2>
              {content.enquiry.body && (
                <p className="mt-5 text-lg leading-relaxed text-graphite-500">{content.enquiry.body}</p>
              )}
              {content.enquiry.reassurance.length > 0 && (
                <ul className="mt-10 space-y-4 border-t border-line-300 pt-8">
                  {content.enquiry.reassurance.map((line) => (
                    <li key={line} className="flex gap-3 text-base leading-relaxed text-graphite-700">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-line-300 bg-white text-petrol-700">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="lg:col-span-7">
              <EnquiryForm
                idPrefix={`${content.id}-anfrage`}
                placement={content.id as EnquiryPlacement}
                copy={{
                  button: content.formButton,
                  loading: 'Ihre Anfrage wird gesendet…',
                  success_title: 'Vielen Dank – Ihre Anfrage ist unterwegs.',
                  success_body:
                    'Ein FreightVanta-Spezialist prüft die Angaben und meldet sich mit dem passenden nächsten Schritt.',
                  error:
                    'Die Anfrage konnte noch nicht gesendet werden. Bitte prüfen Sie die markierten Felder und versuchen Sie es erneut – oder nutzen Sie die unten angegebenen Kontaktmöglichkeiten.',
                  reassurance: [],
                  consent_prefix:
                    'Ich willige ein, dass FreightVanta meine Angaben zur Bearbeitung meiner Anfrage und zur Kontaktaufnahme verwendet, wie in der',
                  consent_link_label: 'Datenschutzerklärung',
                  consent_suffix: ' beschrieben.',
                }}
                strings={DE_STRINGS}
                privacyUrl="/de/datenschutz"
                theme={DE_FORM_THEME}
                topicExtras={{
                  contextTitle: content.enquiry.contextTitle,
                  contextFields: content.enquiry.contextFields,
                  attachments: {
                    label: 'Referenzdateien',
                    hint: 'Produktfotos, Zeichnungen oder Referenzdokumente. Bilder, PDF oder DWG/DXF – bis zu 5 Dateien, je 10 MB.',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
