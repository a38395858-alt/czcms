import { orderedTopicSections } from './composition';
import { EnquiryForm, type EnquiryPlacement } from '../enquiry/EnquiryForm';
import { Breadcrumbs, CheckList, ScopeNote } from '../layout/PageParts';
import { ArrowRight, CheckIcon, PlusIcon } from '../ui/Icons';
import { Img } from '../ui/Img';
import { siteConfig } from '../../config/site';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { Link } from '../../lib/router';
import { useDocumentMeta, useHreflang, useJsonLd } from '../../lib/seo';
import { topicCounterpartForPath } from '../../lib/topic-i18n';
import { cn } from '../../utils/cn';
import {
  TOPIC_ENQUIRY_COPY,
  type TopicBrief,
  type TopicChecklist,
  type TopicCheckpoints,
  type TopicComparison,
  type TopicControls,
  type TopicDecision,
  type TopicFaq,
  type TopicPageContent,
  type TopicRailItem,
  type TopicScenarios,
  type TopicScopeTable,
  type TopicSection,
  type TopicTone,
  type TopicWorkflow,
} from '../../content/en-global/topics/types';
import { getTopicLayout, type TopicLayoutVariant } from './variants';

/**
 * Unified English topic-page template (v2 doc).
 * Copy is identical across pages — composition differs per page via
 * `variants.ts`, while every block stays inside the Pacific Operations
 * vocabulary (navy / mist / signal / safety-orange, Barlow + Plex).
 * In-page CTAs scroll directly so the hash router never mistakes them
 * for homepage anchors.
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
  tone === 'navy' ? 'bg-navy-950 text-white' : tone === 'mist' ? 'bg-mist-50' : 'bg-white';

function Kicker({ children, dark }: { children: string; dark?: boolean }) {
  return <p className={cn('eyebrow', dark ? 'text-signal-300' : 'text-signal-700')}>{children}</p>;
}

export function TopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({
    title: content.meta.title,
    description: content.meta.description,
    path: content.route,
    keywords: content.meta.keywords,
  });
  const counterpart = topicCounterpartForPath(content.route);
  useHreflang(
    counterpart
      ? [
          { lang: 'en', path: counterpart.en },
          { lang: 'de', path: counterpart.de },
        ]
      : [],
  );

  const faqSection = content.sections.find((section) => section.type === 'faq');
  const faqItems = faqSection?.type === 'faq' ? faqSection.content.items : [];

  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      name: content.hero.title,
      description: content.hero.body,
      url: `${root}${content.route}`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${root}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: content.breadcrumbParent.label,
          item:
            content.breadcrumbParent.href === '#services'
              ? `${root}/#services`
              : `${root}${content.breadcrumbParent.href}`,
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
  useJsonLd(`fv-topic-${content.id}-jsonld`, { '@context': 'https://schema.org', '@graph': graph });

  const variant = getTopicLayout(content.id);

  const requestPlan = () => {
    if (content.startingPoint) setPrefill(content.startingPoint);
    track('home_hero_primary_click', { placement: content.id });
    scrollToSection('topic-enquiry');
  };

  const seeWorkflow = () => {
    track('home_hero_secondary_click', { placement: content.id });
    scrollToSection('workflow');
  };

  const midRequest = () => {
    if (content.startingPoint) setPrefill(content.startingPoint);
    track('home_service_link_click', { service: content.id, link: 'enquiry' });
    scrollToSection('topic-enquiry');
  };

  return (
    <>
      <TopicHero content={content} variant={variant} onPrimary={requestPlan} onSecondary={seeWorkflow} />
      {orderedTopicSections(content.route, content.sections).map(({ section, index }) => (
        <TopicSectionBlock
          key={`${section.type}-${index}`}
          section={section}
          index={index}
          variant={variant}
          formButton={content.formButton}
          onMidRequest={midRequest}
        />
      ))}
      <TopicRelated content={content} variant={variant} />
      <TopicEnquiry content={content} variant={variant} />
    </>
  );
}

/* ------------------------------------------------------------------ Hero */

function TopicHero({
  content,
  variant,
  onPrimary,
  onSecondary,
}: {
  content: TopicPageContent;
  variant: TopicLayoutVariant;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  if (variant.hero === 'mirror') return <HeroMirror content={content} onPrimary={onPrimary} onSecondary={onSecondary} />;
  if (variant.hero === 'stacked')
    return <HeroStacked content={content} onPrimary={onPrimary} onSecondary={onSecondary} />;
  if (variant.hero === 'band') return <HeroBand content={content} onPrimary={onPrimary} onSecondary={onSecondary} />;
  return <HeroSplit content={content} onPrimary={onPrimary} onSecondary={onSecondary} />;
}

function HeroCtas({
  content,
  onPrimary,
  onSecondary,
  centered,
}: {
  content: TopicPageContent;
  onPrimary: () => void;
  onSecondary: () => void;
  centered?: boolean;
}) {
  return (
    <div className={cn('mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap', centered && 'sm:justify-center')}>
      <button type="button" onClick={onPrimary} className="btn btn-primary w-full px-6 text-base sm:w-auto">
        {content.hero.primaryCta}
        <ArrowRight className="h-4 w-4" />
      </button>
      <button type="button" onClick={onSecondary} className="btn btn-ghost-light w-full px-6 text-base sm:w-auto">
        {content.hero.secondaryCta}
      </button>
    </div>
  );
}

function HeroFigure({ content, sizes }: { content: TopicPageContent; sizes: string }) {
  const { hero } = content;
  return (
    <figure>
      <div className="relative overflow-hidden rounded-t-[4px] bg-navy-800 ring-1 ring-white/10">
        <Img media={getMedia(hero.mediaId)} alt={hero.mediaAlt} priority sizes={sizes} className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-[5/4] xl:aspect-[4/3]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-navy-950/70 to-transparent"
        />
      </div>
      <figcaption className="rounded-b-[4px] border border-t-0 border-white/10 bg-navy-950/90 px-2 pb-4 pt-5 sm:px-6">
        <span className="sr-only">Page flow: {hero.rail.map((item) => item.label.toLowerCase()).join(', then ')}.</span>
        <RailStrip rail={hero.rail} />
      </figcaption>
    </figure>
  );
}

/** Split: homepage proportions, text left, image right. */
function HeroSplit({
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
    <section aria-labelledby="topic-hero-title" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-56 -top-56 -z-10 h-[40rem] w-[40rem] rounded-full bg-signal-500/[0.14] blur-3xl"
      />
      <div className="shell pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: content.breadcrumbParent.label, to: content.breadcrumbParent.href },
            { label: content.pageLabel },
          ]}
        />
        <div className="mt-8 grid items-center gap-12 lg:mt-10 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:gap-12 xl:gap-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-signal-300">{hero.kicker}</p>
            <h1
              id="topic-hero-title"
              className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.4rem] lg:text-[3.5rem] xl:text-[4rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-200 sm:text-[1.2rem] sm:leading-relaxed">{hero.body}</p>
            <HeroCtas content={content} onPrimary={onPrimary} onSecondary={onSecondary} />
          </div>
          <HeroFigure content={content} sizes="(min-width: 1024px) 54vw, 100vw" />
        </div>
      </div>
    </section>
  );
}

/** Mirror: image left, text right on desktop; text first on mobile. */
function HeroMirror({
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
    <section aria-labelledby="topic-hero-title" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-56 -top-56 -z-10 h-[40rem] w-[40rem] rounded-full bg-signal-500/[0.14] blur-3xl"
      />
      <div className="shell pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: content.breadcrumbParent.label, to: content.breadcrumbParent.href },
            { label: content.pageLabel },
          ]}
        />
        <div className="mt-8 grid items-center gap-12 lg:mt-10 lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)] lg:gap-12 xl:gap-16">
          <div className="order-1 lg:order-2 lg:max-w-2xl">
            <p className="eyebrow text-signal-300">{hero.kicker}</p>
            <h1
              id="topic-hero-title"
              className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.4rem] lg:text-[3.3rem] xl:text-[3.7rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-200 sm:text-[1.15rem] sm:leading-relaxed">{hero.body}</p>
            <HeroCtas content={content} onPrimary={onPrimary} onSecondary={onSecondary} />
          </div>
          <div className="order-2 lg:order-1">
            <HeroFigure content={content} sizes="(min-width: 1024px) 54vw, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Stacked: centered statement, panoramic image below. */
function HeroStacked({
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
    <section aria-labelledby="topic-hero-title" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="shell pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-20">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: content.breadcrumbParent.label, to: content.breadcrumbParent.href },
            { label: content.pageLabel },
          ]}
        />
        <div className="mx-auto mt-10 max-w-4xl text-center">
          <div className="flex justify-center">
            <p className="eyebrow text-signal-300">{hero.kicker}</p>
          </div>
          <h1
            id="topic-hero-title"
            className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.4rem] lg:text-[3.8rem]"
          >
            {hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-navy-200 sm:text-[1.15rem] sm:leading-relaxed">
            {hero.body}
          </p>
          <HeroCtas content={content} onPrimary={onPrimary} onSecondary={onSecondary} centered />
        </div>
        <figure className="mx-auto mt-12 max-w-6xl">
          <div className="relative overflow-hidden rounded-t-[4px] bg-navy-800 ring-1 ring-white/10">
            <Img
              media={getMedia(hero.mediaId)}
              alt={hero.mediaAlt}
              priority
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="aspect-[16/10] w-full object-cover lg:aspect-[21/9]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-navy-950/70 to-transparent"
            />
          </div>
          <figcaption className="rounded-b-[4px] border border-t-0 border-white/10 bg-navy-950/90 px-4 py-5 sm:px-8">
            <span className="sr-only">Page flow: {hero.rail.map((item) => item.label.toLowerCase()).join(', then ')}.</span>
            <RailStrip rail={hero.rail} wide />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Band: statement left, vertical flow card right, panorama below. */
function HeroBand({
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
    <section aria-labelledby="topic-hero-title" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="shell pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-20">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: content.breadcrumbParent.label, to: content.breadcrumbParent.href },
            { label: content.pageLabel },
          ]}
        />
        <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal-300">{hero.kicker}</p>
            <h1
              id="topic-hero-title"
              className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.4rem] lg:text-[3.3rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200 sm:text-[1.15rem] sm:leading-relaxed">
              {hero.body}
            </p>
            <HeroCtas content={content} onPrimary={onPrimary} onSecondary={onSecondary} />
          </div>
          <div className="lg:col-span-5">
            <RailVertical rail={hero.rail} />
          </div>
        </div>
        <div className="mt-12 overflow-hidden rounded-[4px] bg-navy-800 ring-1 ring-white/10">
          <Img
            media={getMedia(hero.mediaId)}
            alt={hero.mediaAlt}
            priority
            sizes="(min-width: 1024px) 90vw, 100vw"
            className="aspect-[16/10] w-full object-cover lg:aspect-[21/8]"
          />
        </div>
      </div>
    </section>
  );
}

/** Homepage RouteStrip vocabulary: animated line, safety-orange nodes, mono labels. */
function RailStrip({ rail, wide }: { rail: TopicRailItem[]; wide?: boolean }) {
  const count = rail.length;
  const edge = `${100 / (count * 2)}%`;
  return (
    <div aria-hidden="true" className="relative">
      <div
        className="absolute top-[7px] hidden h-px overflow-hidden bg-white/25 lg:block"
        style={{ left: edge, right: edge }}
      >
        <span className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-signal-300 to-transparent motion-safe:animate-route-flow" />
      </div>
      <ol
        className={cn(
          'relative grid grid-cols-2 gap-x-4 gap-y-6',
          wide ? 'sm:grid-cols-3 lg:grid-cols-5' : count >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4',
        )}
      >
        {rail.map((item, index) => (
          <li key={item.label} className="relative flex flex-col items-center gap-2.5 text-center">
            <span className="block h-[15px] w-[15px] rounded-full bg-safety-500 ring-4 ring-navy-950" />
            <span className="font-mono text-[11px] font-medium tracking-[0.02em] text-navy-100 sm:text-xs sm:tracking-[0.1em]">
              {item.step ? `${item.step} / ` : ''}
              {item.label}
            </span>
            {item.note && <span className="max-w-[11rem] text-[12.5px] leading-snug text-navy-300">{item.note}</span>}
            {index < count - 1 && (
              <span className="absolute -right-[5px] top-[2px] hidden text-[10px] leading-none text-navy-300 lg:block">›</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Vertical flow card for the band hero: same nodes, reading top to bottom. */
function RailVertical({ rail }: { rail: TopicRailItem[] }) {
  return (
    <div className="rounded-[4px] border border-white/10 bg-navy-950/90 p-6 sm:p-7">
      <span className="sr-only">Page flow: {rail.map((item) => item.label.toLowerCase()).join(', then ')}.</span>
      <p aria-hidden="true" className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-navy-300">
        Page flow
      </p>
      <ol aria-hidden="true" className="relative mt-5 before:absolute before:bottom-4 before:left-[7px] before:top-3 before:w-px before:bg-white/20">
        {rail.map((item, index) => (
          <li key={item.label} className="relative pb-6 pl-10 last:pb-0">
            <span className="absolute left-0 top-[3px] block h-[15px] w-[15px] rounded-full bg-safety-500 ring-4 ring-navy-950" />
            <p className="font-mono text-[12px] font-medium tracking-[0.1em] text-navy-100">
              {item.step ? `${item.step} / ` : `${String(index + 1).padStart(2, '0')} / `}
              {item.label}
            </p>
            {item.note && <p className="mt-1 text-[13.5px] leading-snug text-navy-300">{item.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ Sections */

function TopicSectionBlock({
  section,
  index,
  variant,
  formButton,
  onMidRequest,
}: {
  section: TopicSection;
  index: number;
  variant: TopicLayoutVariant;
  formButton: string;
  onMidRequest: () => void;
}) {
  const headingId = `topic-s${index}`;
  const dark = section.tone === 'navy';

  return (
    <section
      id={section.type === 'workflow' ? 'workflow' : undefined}
      aria-labelledby={headingId}
      className={cn('relative py-20 sm:py-24 lg:py-32', toneClass(section.tone), dark && 'isolate overflow-hidden')}
    >
      {dark && <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 opacity-80" />}
      <div className="shell relative">
        {section.type === 'decision' &&
          (variant.decision === 'split' ? (
            <DecisionSplit id={headingId} content={section.content} />
          ) : (
            <DecisionStacked id={headingId} content={section.content} />
          ))}
        {section.type === 'scenarios' && (
          <ScenariosBlock id={headingId} content={section.content} tone={section.tone} variant={variant} />
        )}
        {section.type === 'checklist' && (
          <ChecklistBlock
            id={headingId}
            content={section.content}
            formButton={formButton}
            onMidRequest={onMidRequest}
            variant={variant}
          />
        )}
        {section.type === 'workflow' && (
          <WorkflowBlock id={headingId} content={section.content} tone={section.tone} variant={variant} />
        )}
        {section.type === 'brief' && <BriefBlock id={headingId} content={section.content} />}
        {section.type === 'comparison' && <ComparisonBlock id={headingId} content={section.content} />}
        {section.type === 'checkpoints' && (
          <CheckpointsBlock id={headingId} content={section.content} tone={section.tone} />
        )}
        {section.type === 'scopeTable' && <ScopeTableBlock id={headingId} content={section.content} />}
        {section.type === 'controls' && (
          <ControlsBlock id={headingId} content={section.content} dark={dark} variant={variant} />
        )}
        {section.type === 'faq' && (
          <FaqBlock id={headingId} content={section.content} tone={section.tone} variant={variant} />
        )}
      </div>
    </section>
  );
}

function DecisionStacked({ id, content }: { id: string; content: TopicDecision }) {
  return (
    <div className="max-w-4xl">
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <h2 id={id} className="h2 mt-5 text-navy-900">
        {content.heading}
      </h2>
      <div className="mt-6 max-w-3xl space-y-5">
        {content.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-navy-600">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function DecisionSplit({ id, content }: { id: string; content: TopicDecision }) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
        </div>
      </div>
      <div className="space-y-5 lg:col-span-6 lg:col-start-7 lg:pt-2">
        {content.paragraphs.map((paragraph, index) => (
          <p key={index} className="border-l-2 border-mist-300 pl-5 text-lg leading-relaxed text-navy-600">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function ScenariosBlock({
  id,
  content,
  tone,
  variant,
}: {
  id: string;
  content: TopicScenarios;
  tone: TopicTone;
  variant: TopicLayoutVariant;
}) {
  if (variant.scenarios === 'grid') return <ScenariosGrid id={id} content={content} tone={tone} />;
  if (variant.scenarios === 'split') return <ScenariosSplit id={id} content={content} />;
  return <ScenariosRows id={id} content={content} />;
}

/** Industries-style editorial rows: number + title + copy, no card grid. */
function ScenariosRows({ id, content }: { id: string; content: TopicScenarios }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className="h2 text-navy-900 lg:col-span-7">
          {content.heading}
        </h2>
        {content.intro && <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5">{content.intro}</p>}
      </div>
      <ol className="mt-12 border-t border-mist-200 lg:mt-16">
        {content.cards.map((card, index) => (
          <li key={card.title} className="grid gap-3 border-b border-mist-200 py-8 lg:grid-cols-12 lg:gap-8">
            <p aria-hidden="true" className="font-mono text-sm font-medium text-navy-300 lg:col-span-1">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="font-display text-[1.55rem] font-semibold leading-snug text-navy-900 text-balance sm:text-[1.7rem] lg:col-span-4">
              {card.title}
            </h3>
            <p className="text-[17px] leading-relaxed text-navy-600 lg:col-span-6 lg:col-start-7">{card.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Ruled cards in a grid: same copy, denser commercial rhythm. */
function ScenariosGrid({ id, content, tone }: { id: string; content: TopicScenarios; tone: TopicTone }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className="h2 text-navy-900 lg:col-span-7">
          {content.heading}
        </h2>
        {content.intro && <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5">{content.intro}</p>}
      </div>
      <ul
        className={cn(
          'mt-12 grid gap-5 lg:mt-16',
          content.cards.length > 3 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3',
        )}
      >
        {content.cards.map((card, index) => (
          <li
            key={card.title}
            className={cn(
              'flex h-full flex-col rounded-[4px] border p-6 sm:p-7',
              tone === 'mist' ? 'border-mist-300 bg-white' : 'border-mist-200 bg-mist-50',
            )}
          >
            <p aria-hidden="true" className="font-mono text-sm font-medium text-signal-700">
              {String(index + 1).padStart(2, '0')}
            </p>
            {card.tag && (
              <p className="mt-3 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                {card.tag}
              </p>
            )}
            <h3 className="mt-3 font-display text-[1.4rem] font-semibold leading-snug text-navy-900">{card.title}</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-navy-600">{card.copy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Split ledger: sticky heading left, stacked entries right. */
function ScenariosSplit({ id, content }: { id: string; content: TopicScenarios }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
          {content.intro && <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.intro}</p>}
        </div>
      </div>
      <div className="lg:col-span-8">
        <ol className="border-t border-mist-200">
          {content.cards.map((card, index) => (
            <li key={card.title} className="grid gap-2 border-b border-mist-200 py-7 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-4">
              <p aria-hidden="true" className="font-mono text-sm font-medium text-signal-700">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div>
                <h3 className="font-display text-[1.5rem] font-semibold leading-snug text-navy-900">{card.title}</h3>
                <p className="mt-2 max-w-2xl text-[16.5px] leading-relaxed text-navy-600">{card.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ChecklistBlock({
  id,
  content,
  formButton,
  onMidRequest,
  variant,
}: {
  id: string;
  content: TopicChecklist;
  formButton: string;
  onMidRequest: () => void;
  variant: TopicLayoutVariant;
}) {
  if (variant.checklist === 'centered')
    return <ChecklistCentered id={id} content={content} formButton={formButton} onMidRequest={onMidRequest} />;

  const header = (
    <>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <h2 id={id} className="h2 mt-5 text-navy-900">
        {content.heading}
      </h2>
      {content.body && <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.body}</p>}
      {content.midCta && (
        <button type="button" onClick={onMidRequest} className="btn btn-dark mt-8 w-full sm:w-auto">
          {formButton}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
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
        <CheckList items={content.items} className="border-t-2 border-navy-900 pt-8 [&>li]:text-[17px]" />
      </div>
    </div>
  );
}

/** Centered checklist: heading on top, two-column checks below. */
function ChecklistCentered({
  id,
  content,
  formButton,
  onMidRequest,
}: {
  id: string;
  content: TopicChecklist;
  formButton: string;
  onMidRequest: () => void;
}) {
  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        {content.kicker && (
          <div className="flex justify-center">
            <Kicker>{content.kicker}</Kicker>
          </div>
        )}
        <h2 id={id} className="h2 mt-5 text-navy-900">
          {content.heading}
        </h2>
        {content.body && <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.body}</p>}
        {content.midCta && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={onMidRequest} className="btn btn-dark w-full sm:w-auto">
              {formButton}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {content.items && content.items.length > 0 && (
        <ul className="mx-auto mt-12 grid max-w-5xl gap-x-10 gap-y-4 border-t-2 border-navy-900 pt-8 sm:grid-cols-2">
          {content.items.map((item) => (
            <li key={item} className="flex gap-3 text-[16.5px] leading-relaxed text-navy-700">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-signal-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkflowBlock({
  id,
  content,
  tone,
  variant,
}: {
  id: string;
  content: TopicWorkflow;
  tone: TopicTone;
  variant: TopicLayoutVariant;
}) {
  if (variant.workflow === 'horizontal') return <WorkflowHorizontal id={id} content={content} tone={tone} />;
  if (variant.workflow === 'steps-grid') return <WorkflowStepsGrid id={id} content={content} tone={tone} />;
  return <WorkflowTimeline id={id} content={content} tone={tone} />;
}

/** Vertical route timeline with sticky intro. */
function WorkflowTimeline({ id, content, tone }: { id: string; content: TopicWorkflow; tone: TopicTone }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
          {content.intro && <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.intro}</p>}
          {content.scopeNote && (
            <div className="mt-8">
              <ScopeNote>{content.scopeNote}</ScopeNote>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-7 lg:col-start-6">
        <ol className="relative space-y-2 before:absolute before:bottom-6 before:left-[7px] before:top-3 before:w-px before:bg-navy-200">
          {content.steps.map((step, index) => {
            const number = step.step ?? String(index + 1).padStart(2, '0');
            return (
              <li key={`${number}-${index}`} className="relative pb-10 pl-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-[0.45rem] h-[15px] w-[15px] rounded-full bg-safety-500 ring-[5px]',
                    tone === 'mist' ? 'ring-mist-50' : 'ring-white',
                  )}
                />
                <p className="font-mono text-sm font-medium tracking-[0.08em] text-signal-700">
                  <span className="sr-only">Step </span>
                  {number}
                </p>
                {step.title ? (
                  <>
                    <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[1.65rem]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-navy-600">{step.copy}</p>
                  </>
                ) : (
                  <h3 className="mt-3 max-w-2xl font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[1.65rem]">
                    {step.copy}
                  </h3>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** Homepage Process vocabulary: route milestones across, timeline on mobile. */
function WorkflowHorizontal({ id, content, tone }: { id: string; content: TopicWorkflow; tone: TopicTone }) {
  const last = content.steps.length - 1;
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-6">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          {content.intro && <p className="text-lg leading-relaxed text-navy-600">{content.intro}</p>}
          {content.scopeNote && (
            <div className="mt-6">
              <ScopeNote>{content.scopeNote}</ScopeNote>
            </div>
          )}
        </div>
      </div>
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
        {content.steps.map((step, index) => {
          const number = step.step ?? String(index + 1).padStart(2, '0');
          const inRow = index % 3 !== 2 && index !== last;
          return (
            <li
              key={`${number}-${index}`}
              className={cn(
                'relative pb-2 pl-12 lg:pb-0 lg:pl-0 lg:pt-12',
                index !== last &&
                  'before:absolute before:bottom-0 before:left-[7px] before:top-6 before:w-px before:bg-navy-200 lg:before:hidden',
                inRow &&
                  'lg:after:absolute lg:after:left-6 lg:after:right-[-2rem] lg:after:top-[7px] lg:after:h-px lg:after:bg-navy-200',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-safety-500 ring-[5px] lg:top-0',
                  tone === 'mist' ? 'ring-mist-50' : 'ring-white',
                )}
              />
              <p className="font-mono text-sm font-medium tracking-[0.08em] text-signal-700">
                <span className="sr-only">Step </span>
                {number}
              </p>
              {step.title ? (
                <>
                  <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[1.65rem]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-navy-600">{step.copy}</p>
                </>
              ) : (
                <h3 className="mt-3 font-display text-[1.35rem] font-semibold leading-snug text-navy-900">{step.copy}</h3>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Numbered blocks: large ghost numerals, no connecting line. */
function WorkflowStepsGrid({ id, content, tone }: { id: string; content: TopicWorkflow; tone: TopicTone }) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-6">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          {content.intro && <p className="text-lg leading-relaxed text-navy-600">{content.intro}</p>}
          {content.scopeNote && (
            <div className="mt-6">
              <ScopeNote>{content.scopeNote}</ScopeNote>
            </div>
          )}
        </div>
      </div>
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16">
        {content.steps.map((step, index) => {
          const number = step.step ?? String(index + 1).padStart(2, '0');
          return (
            <li
              key={`${number}-${index}`}
              className={cn(
                'flex gap-5 rounded-[4px] border p-6 sm:p-7',
                tone === 'mist' ? 'border-mist-300 bg-white' : 'border-mist-200 bg-mist-50',
              )}
            >
              <span aria-hidden="true" className="font-display text-[2.4rem] font-semibold leading-none text-signal-600/35">
                {number}
              </span>
              <div>
                {step.title ? (
                  <>
                    <h3 className="font-display text-[1.45rem] font-semibold leading-snug text-navy-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-navy-600">{step.copy}</p>
                  </>
                ) : (
                  <h3 className="font-display text-[1.3rem] font-semibold leading-snug text-navy-900">{step.copy}</h3>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Homepage Operation vocabulary: sticky statement + ringed-node timeline on navy. */
function BriefBlock({ id, content }: { id: string; content: TopicBrief }) {
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker dark>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-white">
            {content.heading}
          </h2>
          <div className="mt-6 space-y-5">
            {content.paragraphs.map((paragraph, index) => (
              <p key={index} className="max-w-xl text-lg leading-relaxed text-navy-200">
                {paragraph}
              </p>
            ))}
          </div>
          {content.mediaId && content.mediaAlt && (
            <figure className="mt-8 max-w-xl">
              <div className="overflow-hidden rounded-[4px] ring-1 ring-white/10">
                <Img
                  media={getMedia(content.mediaId)}
                  alt={content.mediaAlt}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
            </figure>
          )}
        </div>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <ul className="relative before:absolute before:bottom-4 before:left-[7px] before:top-3 before:w-px before:bg-linear-to-b before:from-white/30 before:via-white/15 before:to-white/0">
          {content.points.map((point) => (
            <li key={point.lead} className="relative pb-12 pl-12 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[0.45rem] h-[15px] w-[15px] rounded-full border-[3px] border-safety-500 bg-navy-950"
              />
              <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-[1.75rem]">{point.lead}</h3>
              <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-navy-200">{point.rest}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Numbered ledger rows with rules, not a card grid. */
function ComparisonBlock({ id, content }: { id: string; content: TopicComparison }) {
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className="h2 text-navy-900 lg:col-span-7">
          {content.heading}
        </h2>
        {content.body && <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5">{content.body}</p>}
      </div>
      {content.mediaId && content.mediaAlt && (
        <figure className="mt-10 lg:mt-14">
          <div className="overflow-hidden rounded-[4px] bg-mist-100">
            <Img
              media={getMedia(content.mediaId)}
              alt={content.mediaAlt}
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]"
            />
          </div>
        </figure>
      )}
      <ol className="mt-12 grid gap-x-10 border-t-2 border-navy-900 pt-2 lg:mt-16 lg:grid-cols-2">
        {content.rows.map((row, index) => (
          <li key={row} className="flex gap-4 border-b border-mist-200 py-5">
            <span aria-hidden="true" className="font-mono text-sm font-medium text-signal-700">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="text-[17px] leading-relaxed text-navy-800">{row}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Homepage Process vocabulary: route milestones, vertical on mobile. */
function CheckpointsBlock({
  id,
  content,
  tone,
}: {
  id: string;
  content: TopicCheckpoints;
  tone: TopicTone;
}) {
  const last = content.cards.length - 1;
  return (
    <div>
      {content.kicker && <Kicker>{content.kicker}</Kicker>}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className="h2 text-navy-900 lg:col-span-6">
          {content.heading}
        </h2>
        {content.body && <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5 lg:col-start-8">{content.body}</p>}
      </div>
      <ol className="mt-14 grid sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
        {content.cards.map((card, index) => (
          <li
            key={card.tag}
            className={cn(
              'relative pb-12 pl-12 sm:pb-10 lg:pb-0 lg:pl-0 lg:pt-12',
              index !== last &&
                'before:absolute before:bottom-0 before:left-[7px] before:top-6 before:w-px before:bg-navy-200 lg:before:hidden',
              index !== last &&
                'lg:after:absolute lg:after:left-6 lg:after:right-[-2rem] lg:after:top-[7px] lg:after:h-px lg:after:bg-navy-200',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-safety-500 ring-[5px] lg:top-0',
                tone === 'mist' ? 'ring-mist-50' : 'ring-white',
              )}
            />
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-signal-700">{card.tag}</p>
            <p className="mt-3 text-base leading-relaxed text-navy-600">{card.copy}</p>
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
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className="h2 text-navy-900 lg:col-span-7">
          {content.heading}
        </h2>
        {content.intro && <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5">{content.intro}</p>}
      </div>
      <div className="mt-12 overflow-hidden rounded-[4px] border border-mist-300 lg:mt-16">
        <table className="w-full border-collapse bg-white text-left">
          <caption className="sr-only">{content.heading}</caption>
          <thead className="hidden lg:table-header-group">
            <tr className="bg-navy-900 text-white">
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
              <tr key={row.topic} className="block border-b border-mist-200 last:border-b-0 lg:table-row">
                <th
                  scope="row"
                  className="block px-5 pt-5 font-display text-[1.2rem] font-semibold leading-snug text-navy-900 lg:table-cell lg:w-[22%] lg:px-6 lg:py-5 lg:align-top"
                >
                  {row.topic}
                </th>
                <td className="block px-5 py-2 text-[15.5px] leading-relaxed text-navy-700 lg:table-cell lg:px-6 lg:py-5 lg:align-top">
                  <span className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-navy-500 lg:hidden">
                    {content.headers[1]}
                  </span>
                  {row.organize}
                </td>
                <td className="block px-5 pb-5 pt-1 text-[15.5px] leading-relaxed text-navy-700 lg:table-cell lg:px-6 lg:py-5 lg:align-top">
                  <span className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-navy-500 lg:hidden">
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

function ControlsBlock({
  id,
  content,
  dark,
  variant,
}: {
  id: string;
  content: TopicControls;
  dark: boolean;
  variant: TopicLayoutVariant;
}) {
  return (
    <div>
      {content.kicker && <Kicker dark={dark}>{content.kicker}</Kicker>}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={id} className={cn('h2', dark ? 'text-white' : 'text-navy-900', 'lg:col-span-7')}>
          {content.heading}
        </h2>
        {content.intro && (
          <p className={cn('text-lg leading-relaxed lg:col-span-5', dark ? 'text-navy-200' : 'text-navy-600')}>
            {content.intro}
          </p>
        )}
      </div>

      {content.groups && content.groups.length > 0 &&
        (variant.controls === 'ledger' ? (
          <ControlsLedgerGroups groups={content.groups} dark={dark} />
        ) : (
          <ControlsPanelsGroups groups={content.groups} dark={dark} />
        ))}

      {content.paragraphs && content.paragraphs.length > 0 && (
        <div className={cn('max-w-3xl space-y-5', content.groups?.length ? 'mt-10' : 'mt-6')}>
          {content.paragraphs.map((paragraph, index) => (
            <p key={index} className={cn('text-lg leading-relaxed', dark ? 'text-navy-200' : 'text-navy-600')}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {content.items && content.items.length > 0 && (
        <ul className={cn('mt-12 grid gap-px overflow-hidden rounded-[4px] lg:mt-16', dark ? 'bg-white/15' : 'bg-mist-200')}>
          {content.items.map((item) => (
            <li
              key={item}
              className={cn(
                'flex gap-4 p-5 text-[17px] leading-relaxed sm:p-6',
                dark ? 'bg-navy-950 text-navy-100' : 'bg-white text-navy-800',
              )}
            >
              <span aria-hidden="true" className={cn('mt-2 h-2 w-2 shrink-0', dark ? 'bg-signal-300' : 'bg-signal-600')} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Editorial top-ruled panels. */
function ControlsPanelsGroups({
  groups,
  dark,
}: {
  groups: { label: string; items: string[] }[];
  dark: boolean;
}) {
  return (
    <div className="mt-12 grid gap-10 md:grid-cols-2 lg:mt-16 lg:gap-12">
      {groups.map((group, index) => (
        <div
          key={group.label}
          className={cn(
            'pt-6',
            dark ? 'border-t border-white/15' : index === 0 ? 'border-t-2 border-navy-900' : 'border-t-2 border-signal-600',
          )}
        >
          <h3 className={cn('font-display text-2xl font-semibold', dark ? 'text-white' : 'text-navy-900')}>{group.label}</h3>
          {dark ? (
            <ul className="mt-5 space-y-3">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-navy-100">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-signal-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <CheckList items={group.items} className="mt-5" />
          )}
        </div>
      ))}
    </div>
  );
}

/** Ledger rows: label left, items in two columns right. */
function ControlsLedgerGroups({
  groups,
  dark,
}: {
  groups: { label: string; items: string[] }[];
  dark: boolean;
}) {
  return (
    <div className={cn('mt-12 border-t lg:mt-16', dark ? 'border-white/15' : 'border-mist-200')}>
      {groups.map((group) => (
        <div
          key={group.label}
          className={cn(
            'grid gap-6 border-b py-8 lg:grid-cols-12 lg:gap-8',
            dark ? 'border-white/15' : 'border-mist-200',
          )}
        >
          <h3
            className={cn(
              'font-display text-[1.5rem] font-semibold leading-snug lg:col-span-4',
              dark ? 'text-white' : 'text-navy-900',
            )}
          >
            {group.label}
          </h3>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:col-span-8">
            {group.items.map((item) => (
              <li
                key={item}
                className={cn('flex gap-3 text-[15.5px] leading-relaxed', dark ? 'text-navy-100' : 'text-navy-700')}
              >
                <CheckIcon className={cn('mt-1 h-4 w-4 shrink-0', dark ? 'text-signal-300' : 'text-signal-600')} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FaqBlock({
  id,
  content,
  tone,
  variant,
}: {
  id: string;
  content: TopicFaq;
  tone: TopicTone;
  variant: TopicLayoutVariant;
}) {
  if (variant.faq === 'stacked') return <FaqStacked id={id} content={content} tone={tone} />;
  const border = tone === 'mist' ? 'border-mist-300' : 'border-mist-200';
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          {content.kicker && <Kicker>{content.kicker}</Kicker>}
          <h2 id={id} className="h2 mt-5 text-navy-900">
            {content.heading}
          </h2>
          {content.guide && <p className="mt-5 text-[17px] leading-relaxed text-navy-600">{content.guide}</p>}
        </div>
      </div>
      <div className="lg:col-span-8">
        <div className={cn('border-t', border)}>
          {content.items.map((item) => (
            <details key={item.id} className={cn('group border-b', border)}>
              <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 rounded-[2px] py-6 text-left font-display text-[1.3rem] font-semibold leading-snug text-navy-900 transition-colors hover:text-signal-700 sm:text-[1.45rem]">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-mist-300 bg-white text-navy-700 transition-all group-open:rotate-45 group-open:border-signal-600 group-open:bg-signal-600 group-open:text-white"
                >
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pr-12 text-[17px] leading-relaxed text-navy-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Stacked FAQ: heading on top, numbered questions below. */
function FaqStacked({ id, content, tone }: { id: string; content: TopicFaq; tone: TopicTone }) {
  const border = tone === 'mist' ? 'border-mist-300' : 'border-mist-200';
  return (
    <div>
      <div className="max-w-3xl">
        {content.kicker && <Kicker>{content.kicker}</Kicker>}
        <h2 id={id} className="h2 mt-5 text-navy-900">
          {content.heading}
        </h2>
        {content.guide && <p className="mt-5 text-[17px] leading-relaxed text-navy-600">{content.guide}</p>}
      </div>
      <div className={cn('mt-10 max-w-4xl border-t', border)}>
        {content.items.map((item, index) => (
          <details key={item.id} className={cn('group border-b', border)}>
            <summary className="flex min-h-[44px] cursor-pointer items-start gap-4 rounded-[2px] py-6 text-left transition-colors sm:gap-6">
              <span aria-hidden="true" className="mt-1.5 font-mono text-sm font-medium text-signal-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 font-display text-[1.3rem] font-semibold leading-snug text-navy-900 transition-colors group-hover:text-signal-700 sm:text-[1.45rem]">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-mist-300 bg-white text-navy-700 transition-all group-open:rotate-45 group-open:border-signal-600 group-open:bg-signal-600 group-open:text-white"
              >
                <PlusIcon className="h-4 w-4" />
              </span>
            </summary>
            <p className="max-w-2xl pb-7 text-[17px] leading-relaxed text-navy-600 sm:pl-12">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Related */

function TopicRelated({ content, variant }: { content: TopicPageContent; variant: TopicLayoutVariant }) {
  const lastTone = content.sections[content.sections.length - 1]?.tone ?? 'white';
  const tone: TopicTone = lastTone === 'white' ? 'mist' : 'white';
  if (variant.related === 'grid') {
    return (
      <section aria-labelledby="topic-related" className={cn('border-t border-mist-200 py-16 sm:py-20', toneClass(tone))}>
        <div className="shell">
          <h2 id="topic-related" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
            {content.related.heading}
          </h2>
          {content.related.intro && (
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-navy-600">{content.related.intro}</p>
          )}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.related.links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() =>
                    track('home_service_link_click', {
                      service: content.id,
                      link: link.href.replace(/^\//, '').replace(/\//g, ':'),
                    })
                  }
                  className="group flex h-full flex-col rounded-[4px] border border-mist-300 bg-white p-6 transition-colors hover:border-signal-600"
                >
                  <span className="font-display text-[1.35rem] font-semibold leading-snug text-navy-900 group-hover:text-signal-700">
                    {link.label}
                  </span>
                  <span className="mt-2 text-[15px] leading-relaxed text-navy-600">{link.note}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-signal-700">
                    Open page
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="topic-related" className={cn('border-t border-mist-200 py-16 sm:py-20', toneClass(tone))}>
      <div className="shell">
        <h2 id="topic-related" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
          {content.related.heading}
        </h2>
        {content.related.intro && (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-navy-600">{content.related.intro}</p>
        )}
        <ul className="mt-8 border-t border-mist-200">
          {content.related.links.map((link) => (
            <li key={link.href} className="group relative border-b border-mist-200 py-6 transition-colors hover:bg-mist-50/70 sm:px-3">
              <h3 className="max-w-3xl font-display text-[1.45rem] font-semibold leading-tight text-navy-900">
                <Link
                  to={link.href}
                  onClick={() =>
                    track('home_service_link_click', {
                      service: content.id,
                      link: link.href.replace(/^\//, '').replace(/\//g, ':'),
                    })
                  }
                  className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-signal-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-signal-500"
                >
                  {link.label}
                </Link>
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-navy-600">{link.note}</p>
              <span aria-hidden="true" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-700">
                Open page
                <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Enquiry */

function TopicEnquiry({ content, variant }: { content: TopicPageContent; variant: TopicLayoutVariant }) {
  const form = (
    <EnquiryForm
      idPrefix={`${content.id}-enquiry`}
      placement={content.id as EnquiryPlacement}
      copy={{ ...TOPIC_ENQUIRY_COPY, button: content.formButton, reassurance: [] }}
      topicExtras={{
        contextTitle: content.enquiry.contextTitle,
        contextFields: content.enquiry.contextFields,
        attachments: {
          label: 'Reference files',
          hint: 'Product photos, drawings, or reference documents. Images, PDF, or DWG/DXF — up to 5 files, 10 MB each.',
        },
      }}
    />
  );

  if (variant.enquiry === 'centered') {
    return (
      <section
        id="topic-enquiry"
        aria-labelledby="topic-enquiry-title"
        className="relative overflow-hidden border-t border-mist-200 bg-mist-150 py-20 sm:py-24 lg:py-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-signal-500/40 to-transparent"
        />
        <div className="shell">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <p className="eyebrow text-signal-700">{content.enquiry.kicker}</p>
            </div>
            <h2
              id="topic-enquiry-title"
              className="mt-5 font-display text-[2rem] font-semibold leading-[1.08] text-navy-900 text-balance sm:text-[2.6rem]"
            >
              {content.enquiry.heading}
            </h2>
            {content.enquiry.body && (
              <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.enquiry.body}</p>
            )}
          </div>
          {content.enquiry.reassurance.length > 0 && (
            <ul className="mx-auto mt-10 grid max-w-5xl gap-4 border-t border-mist-300 pt-8 text-left sm:grid-cols-3">
              {content.enquiry.reassurance.map((line) => (
                <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-navy-700">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-signal-700 ring-1 ring-mist-300">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mx-auto mt-12 max-w-4xl">{form}</div>
        </div>
      </section>
    );
  }

  const copy = (
    <div>
      <p className="eyebrow text-signal-700">{content.enquiry.kicker}</p>
      <h2
        id="topic-enquiry-title"
        className="mt-5 font-display text-[2rem] font-semibold leading-[1.08] text-navy-900 text-balance sm:text-[2.6rem]"
      >
        {content.enquiry.heading}
      </h2>
      {content.enquiry.body && <p className="mt-5 text-lg leading-relaxed text-navy-600">{content.enquiry.body}</p>}
      {content.enquiry.reassurance.length > 0 && (
        <ul className="mt-10 space-y-4 border-t border-mist-300 pt-8">
          {content.enquiry.reassurance.map((line) => (
            <li key={line} className="flex gap-3 text-base leading-relaxed text-navy-700">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-signal-700 ring-1 ring-mist-300">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <section
      id="topic-enquiry"
      aria-labelledby="topic-enquiry-title"
      className="relative overflow-hidden border-t border-mist-200 bg-mist-150 py-20 sm:py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-signal-500/40 to-transparent"
      />
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        {variant.enquiry === 'mirror' ? (
          <>
            <div className="lg:col-span-7">{form}</div>
            <div className="lg:col-span-5">{copy}</div>
          </>
        ) : (
          <>
            <div className="lg:col-span-5">{copy}</div>
            <div className="lg:col-span-7">{form}</div>
          </>
        )}
      </div>
    </section>
  );
}
