import type { ReactNode } from 'react';
import { ArrowRight, CheckIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { formatDateFr, type ArticleFr } from '../../../content/fr/articles';
import { FR_ANCHORS } from '../../../content/fr/home';
import { getMedia, type MediaAsset } from '../../../content/media';
import type { StartingPointValue } from '../../../content/types';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function FrBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-encre-500">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">›</span>}
            {item.to ? (
              <Link to={item.to} className="underline decoration-encre-300 underline-offset-4 hover:text-encre-900 hover:decoration-encre-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-encre-900">
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

/** Ivory, serif-led page header with nautical-chart contours. */
export function FrPageHero({ breadcrumbs, eyebrow, title, lead, body, media, mediaAlt = '', actions }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-encre-900/10 bg-ivoire text-encre-900">
      <div aria-hidden="true" className="fr-chart-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
        <FrBreadcrumbs items={breadcrumbs} />
        <div className={cn('mt-8 grid gap-10 lg:mt-10', media && 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14')}>
          <div className={cn(!media && 'max-w-3xl')}>
            {eyebrow && <p className="fr-eyebrow text-outremer-700">{eyebrow}</p>}
            <h1 className="mt-5 font-fr-serif text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.5rem]">{title}</h1>
            {lead && <p className="mt-5 font-fr-serif text-xl leading-snug text-encre-700 sm:text-2xl">{lead}</p>}
            {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-encre-600">{body}</p>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {media && (
            <div className="overflow-hidden rounded-[12px] bg-lin-100 ring-1 ring-encre-900/10">
              <Img media={media} alt={mediaAlt} priority sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function FrCheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-encre-700">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-outremer-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FrScopeNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-lin-300 border-l-4 border-l-outremer-700 bg-white px-5 py-4 text-[15px] leading-relaxed text-encre-700">
      <p className="fr-eyebrow text-outremer-700">Périmètre</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

interface CtaBandProps {
  title?: string;
  body?: string;
  startingPoint?: StartingPointValue | null;
}

export function FrCtaBand({
  title = 'Dites-nous ce qui doit voyager.',
  body = 'Partagez liens produits, quantités, origine, destination, date visée et toute exigence d’emballage ou de conformité.',
  startingPoint = null,
}: CtaBandProps) {
  return (
    <section aria-label="Demander un plan d’expédition" className="border-t border-encre-900/10 bg-lin-100">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="fr-eyebrow text-outremer-700">Demander un plan d’expédition</p>
          <h2 className="mt-4 font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900 sm:text-[2.5rem]">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-encre-600">{body}</p>
        </div>
        <Link
          to={FR_ANCHORS.enquiry}
          onClick={() => {
            if (startingPoint) setPrefill(startingPoint);
          }}
          className="fr-btn fr-btn-primary w-full shrink-0 sm:w-auto"
        >
          Demander un plan d’expédition
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Cartes de guides */
const stretched =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-outremer-500';

export function FrArticleMeta({ article, className }: { article: ArticleFr; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-encre-500', className)}>
      <span className="text-outremer-700">{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt} className="normal-case tracking-normal">
        {formatDateFr(article.publishedAt)}
      </time>
      <span aria-hidden="true">·</span>
      <span className="normal-case tracking-normal">{article.readMinutes} min de lecture</span>
    </p>
  );
}

function Cover({ article, className, sizes }: { article: ArticleFr; className: string; sizes: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[10px] bg-encre-900 ring-1 ring-encre-900/10', className)}>
      {article.coverId ? (
        <Img media={getMedia(article.coverId)} alt={article.coverAlt} sizes={sizes} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full w-full items-end bg-lin-100 p-4">
          <span className="fr-eyebrow text-encre-500">{article.category}</span>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: ArticleFr;
  variant: 'feature' | 'compact' | 'grid';
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

export function FrArticleCard({ article, variant, headingLevel = 3, onNavigate }: ArticleCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const to = `/fr/guides/${article.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative">
        <Cover article={article} className="aspect-[16/10]" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="mt-6">
          <FrArticleMeta article={article} />
          <Heading className="mt-3 font-fr-serif text-[1.9rem] font-semibold leading-[1.12] text-encre-900 sm:text-[2.25rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-encre-600">{article.excerpt}</p>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-outremer-700">
            Lire le guide
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
          <FrArticleMeta article={article} className="text-[11px]" />
          <Heading className="mt-2 font-fr-serif text-xl font-semibold leading-snug text-encre-900 sm:text-[1.4rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-encre-600 max-sm:hidden">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Cover article={article} className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      <div className="mt-5 flex flex-1 flex-col">
        <FrArticleMeta article={article} />
        <Heading className="mt-3 font-fr-serif text-[1.45rem] font-semibold leading-snug text-encre-900">
          <Link to={to} onClick={onNavigate} className={stretched}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-encre-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
