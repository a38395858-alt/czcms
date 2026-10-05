import type { ReactNode } from 'react';
import { ArrowRight, CheckIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { formatDateIt, type ArticleIt } from '../../../content/it/articles';
import { IT_ANCHORS } from '../../../content/it/home';
import { getMedia, type MediaAsset } from '../../../content/media';
import type { StartingPointValue } from '../../../content/types';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function ItBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Percorso di navigazione">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-grafite-500">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="underline decoration-grafite-300 underline-offset-4 hover:text-grafite-900 hover:decoration-grafite-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-grafite-900">
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

/** White editorial header: hairline rule, Bodoni headline, optional framed image. */
export function ItPageHero({ breadcrumbs, eyebrow, title, lead, body, media, mediaAlt = '', actions }: PageHeroProps) {
  return (
    <section className="border-b border-grafite-900 bg-white text-grafite-900">
      <div className="shell pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
        <ItBreadcrumbs items={breadcrumbs} />
        <div className={cn('mt-8 grid gap-10 lg:mt-10', media && 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14')}>
          <div className={cn(!media && 'max-w-3xl')}>
            {eyebrow && <p className="it-eyebrow text-ottanio-700">{eyebrow}</p>}
            <h1 className="mt-5 font-it-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.02em] text-balance sm:text-5xl lg:text-[3.6rem]">{title}</h1>
            {lead && <p className="mt-5 text-xl leading-snug text-grafite-700 sm:text-2xl">{lead}</p>}
            {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-grafite-600">{body}</p>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {media && (
            <div className="border border-grafite-900 bg-nebbia-100 p-2">
              <Img media={media} alt={mediaAlt} priority sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ItCheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-grafite-700">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-ottanio-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ItScopeNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-ottanio-700 bg-ottanio-100 px-5 py-4 text-[15px] leading-relaxed text-grafite-800">
      <p className="it-eyebrow text-ottanio-800">Perimetro</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

interface CtaBandProps {
  title?: string;
  body?: string;
  startingPoint?: StartingPointValue | null;
}

export function ItCtaBand({
  title = 'Ci dica che cosa deve viaggiare.',
  body = 'Condivida link ai prodotti, quantità, origine, destinazione, data obiettivo e ogni requisito di imballaggio o conformità.',
  startingPoint = null,
}: CtaBandProps) {
  return (
    <section aria-label="Richiedi un piano di spedizione" className="bg-grafite-900 text-white">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="it-eyebrow text-ottanio-300">Richiedi un piano di spedizione</p>
          <h2 className="mt-4 font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] sm:text-[2.6rem]">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-grafite-200">{body}</p>
        </div>
        <Link
          to={IT_ANCHORS.enquiry}
          onClick={() => {
            if (startingPoint) setPrefill(startingPoint);
          }}
          className="it-btn it-btn-primary w-full shrink-0 sm:w-auto"
        >
          Richiedi un piano di spedizione
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Schede guide */
const stretched =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-ottanio-600';

export function ItArticleMeta({ article, className }: { article: ArticleIt; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-grafite-500', className)}>
      <span className="text-ottanio-700">{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt} className="normal-case tracking-normal">
        {formatDateIt(article.publishedAt)}
      </time>
      <span aria-hidden="true">·</span>
      <span className="normal-case tracking-normal">{article.readMinutes} min di lettura</span>
    </p>
  );
}

function Cover({ article, className, sizes }: { article: ArticleIt; className: string; sizes: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-grafite-900', className)}>
      {article.coverId ? (
        <Img media={getMedia(article.coverId)} alt={article.coverAlt} sizes={sizes} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full w-full items-end bg-nebbia-100 p-4">
          <span className="it-eyebrow text-grafite-500">{article.category}</span>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: ArticleIt;
  variant: 'feature' | 'compact' | 'grid';
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

export function ItArticleCard({ article, variant, headingLevel = 3, onNavigate }: ArticleCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const to = `/it/guide/${article.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative">
        <Cover article={article} className="aspect-[16/10]" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="mt-6 border-t border-grafite-900 pt-5">
          <ItArticleMeta article={article} />
          <Heading className="mt-3 font-it-display text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.015em] text-grafite-900 sm:text-[2.3rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-grafite-600">{article.excerpt}</p>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-ottanio-700">
            Leggi la guida
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
          <ItArticleMeta article={article} className="text-[11px]" />
          <Heading className="mt-2 font-it-display text-xl font-semibold leading-snug tracking-[-0.01em] text-grafite-900 sm:text-[1.4rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-grafite-600 max-sm:hidden">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Cover article={article} className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      <div className="mt-5 flex flex-1 flex-col border-t border-grafite-900 pt-4">
        <ItArticleMeta article={article} />
        <Heading className="mt-3 font-it-display text-[1.45rem] font-semibold leading-snug tracking-[-0.01em] text-grafite-900">
          <Link to={to} onClick={onNavigate} className={stretched}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-grafite-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
