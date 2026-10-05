import type { ReactNode } from 'react';
import { ArrowRight, CheckIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { formatDateDe, type ArticleDe } from '../../../content/de/articles';
import { DE_ANCHORS } from '../../../content/de/home';
import { getMedia, type MediaAsset } from '../../../content/media';
import type { StartingPointValue } from '../../../content/types';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function DeBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Brotkrumen">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-de-mono text-[12px] uppercase tracking-[0.08em] text-anthrazit-500">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="underline decoration-anthrazit-300 underline-offset-4 hover:text-anthrazit-900 hover:decoration-anthrazit-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-anthrazit-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeroProps {
  breadcrumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  body?: string;
  media?: MediaAsset;
  mediaAlt?: string;
  actions?: ReactNode;
}

/** Light, paper-and-hairline page header — the opposite of the English navy hero. */
export function DePageHero({ breadcrumbs, eyebrow, title, lead, body, media, mediaAlt = '', actions }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-anthrazit-900 bg-papier text-anthrazit-900">
      <div aria-hidden="true" className="de-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
        <DeBreadcrumbs items={breadcrumbs} />
        <div className={cn('mt-8 grid gap-10 lg:mt-10', media && 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14')}>
          <div className={cn(!media && 'max-w-3xl')}>
            {eyebrow && <p className="de-eyebrow text-enzian-700">{eyebrow}</p>}
            <h1 className="mt-5 font-de-display text-[2.5rem] font-bold leading-[1.03] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.6rem]">
              {title}
            </h1>
            {lead && <p className="mt-5 text-xl font-semibold leading-snug text-anthrazit-800 sm:text-2xl">{lead}</p>}
            {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-anthrazit-600">{body}</p>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {media && (
            <div className="overflow-hidden border border-anthrazit-900 bg-kiesel-100">
              <Img media={media} alt={mediaAlt} priority sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function DeCheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-anthrazit-700">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-enzian-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DeScopeNote({ children }: { children: ReactNode }) {
  return (
    <div className="border border-anthrazit-900 border-l-4 border-l-enzian-700 bg-white px-5 py-4 text-[15px] leading-relaxed text-anthrazit-700">
      <p className="de-eyebrow text-enzian-700">Leistungsabgrenzung</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

interface CtaBandProps {
  title?: string;
  body?: string;
  startingPoint?: StartingPointValue | null;
}

export function DeCtaBand({
  title = 'Sagen Sie uns, was bewegt wird.',
  body = 'Teilen Sie Produktlinks, Mengen, Abhol- und Zielort, Wunschtermin sowie Verpackungs- oder Compliance-Anforderungen.',
  startingPoint = null,
}: CtaBandProps) {
  return (
    <section aria-label="Sendungsplan anfragen" className="border-t border-anthrazit-900 bg-kiesel-100">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="de-eyebrow text-enzian-700">Sendungsplan anfragen</p>
          <h2 className="mt-4 font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900 sm:text-[2.5rem]">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-anthrazit-600">{body}</p>
        </div>
        <Link
          to={DE_ANCHORS.enquiry}
          onClick={() => {
            if (startingPoint) setPrefill(startingPoint);
          }}
          className="de-btn de-btn-primary w-full shrink-0 sm:w-auto"
        >
          Sendungsplan anfragen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Ratgeber-Karten */
const stretched =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-enzian-500';

export function DeArticleMeta({ article, className }: { article: ArticleDe; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 font-de-mono text-[12px] font-medium uppercase tracking-[0.08em] text-anthrazit-500', className)}>
      <span className="text-enzian-700">{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{formatDateDe(article.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readMinutes} Min. Lesezeit</span>
    </p>
  );
}

function Cover({ article, className, sizes }: { article: ArticleDe; className: string; sizes: string }) {
  return (
    <div className={cn('relative overflow-hidden border border-anthrazit-900 bg-anthrazit-900', className)}>
      {article.coverId ? (
        <Img
          media={getMedia(article.coverId)}
          alt={article.coverAlt}
          sizes={sizes}
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-end bg-kiesel-100 p-4">
          <span className="de-eyebrow text-anthrazit-500">{article.category}</span>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: ArticleDe;
  variant: 'feature' | 'compact' | 'grid';
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

export function DeArticleCard({ article, variant, headingLevel = 3, onNavigate }: ArticleCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const to = `/de/ratgeber/${article.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative">
        <Cover article={article} className="aspect-[16/10]" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="mt-6">
          <DeArticleMeta article={article} />
          <Heading className="mt-3 font-de-display text-[1.9rem] font-bold leading-[1.1] text-anthrazit-900 sm:text-[2.25rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-anthrazit-600">{article.excerpt}</p>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-enzian-700">
            Ratgeber lesen
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group relative grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <Cover article={article} className="aspect-[4/3]" sizes="(min-width: 640px) 160px, 104px" />
        <div className="min-w-0">
          <DeArticleMeta article={article} className="text-[11px]" />
          <Heading className="mt-2 font-de-display text-xl font-bold leading-snug text-anthrazit-900 sm:text-[1.4rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-anthrazit-600 max-sm:hidden">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Cover article={article} className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      <div className="mt-5 flex flex-1 flex-col">
        <DeArticleMeta article={article} />
        <Heading className="mt-3 font-de-display text-[1.45rem] font-bold leading-snug text-anthrazit-900">
          <Link to={to} onClick={onNavigate} className={stretched}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-anthrazit-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
