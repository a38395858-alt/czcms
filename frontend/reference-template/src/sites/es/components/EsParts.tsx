import type { ReactNode } from 'react';
import { ArrowRight, CheckIcon } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { formatDateEs, type ArticleEs } from '../../../content/es/articles';
import { ES_ANCHORS } from '../../../content/es/home';
import { getMedia, type MediaAsset } from '../../../content/media';
import type { StartingPointValue } from '../../../content/types';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { cn } from '../../../utils/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function EsBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-carbon-600">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-albero-500">
                /
              </span>
            )}
            {item.to ? (
              <Link to={item.to} className="underline decoration-carbon-300 underline-offset-4 hover:text-pino-900 hover:decoration-pino-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-carbon-900">
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

/** Sand header with an azulejo band, heavy Archivo headline and a colour-block image. */
export function EsPageHero({ breadcrumbs, eyebrow, title, lead, body, media, mediaAlt = '', actions }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-arena-50 text-carbon-900">
      <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/2 [mask-image:linear-gradient(to_left,#000,transparent)]" />
      <div className="shell pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-20">
        <EsBreadcrumbs items={breadcrumbs} />
        <div className={cn('mt-8 grid gap-10 lg:mt-10', media && 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14')}>
          <div className={cn(!media && 'max-w-3xl')}>
            {eyebrow && <p className="es-eyebrow text-mar-700">{eyebrow}</p>}
            <h1 className="mt-5 font-es text-[2.45rem] font-extrabold leading-[1.02] tracking-[-0.025em] text-balance sm:text-5xl lg:text-[3.5rem]">{title}</h1>
            {lead && <p className="mt-5 text-xl font-semibold leading-snug text-carbon-800 sm:text-2xl">{lead}</p>}
            {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-carbon-600">{body}</p>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {media && (
            <div className="es-block-shadow mb-[14px] mr-[14px] overflow-hidden bg-pino-900">
              <Img media={media} alt={mediaAlt} priority sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function EsCheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-carbon-700">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-pino-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EsScopeNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-mar-700 bg-mar-100 px-5 py-4 text-[15px] leading-relaxed text-carbon-800">
      <p className="es-eyebrow text-mar-800">Alcance</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

interface CtaBandProps {
  title?: string;
  body?: string;
  startingPoint?: StartingPointValue | null;
}

/** Albero colour-block band that routes to the homepage form (never a modal). */
export function EsCtaBand({
  title = 'Cuéntenos qué hay que mover.',
  body = 'Comparta enlaces de producto, cantidades, origen, destino, fecha objetivo y cualquier requisito de embalaje o normativo.',
  startingPoint = null,
}: CtaBandProps) {
  return (
    <section aria-label="Solicitar plan de envío" className="bg-albero-300 text-carbon-900">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-pino-900">Solicitar plan de envío</p>
          <h2 className="mt-4 font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[2.5rem]">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-carbon-800">{body}</p>
        </div>
        <Link
          to={ES_ANCHORS.enquiry}
          onClick={() => {
            if (startingPoint) setPrefill(startingPoint);
          }}
          className="es-btn es-btn-primary w-full shrink-0 sm:w-auto"
        >
          Solicitar plan de envío
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Tarjetas de guías */
const stretched =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-mar-600';

export function EsArticleMeta({ article, className }: { article: ArticleEs; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] font-semibold text-carbon-600', className)}>
      <span className="uppercase tracking-[0.08em] text-mar-700">{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{formatDateEs(article.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readMinutes} min de lectura</span>
    </p>
  );
}

function Cover({ article, className, sizes }: { article: ArticleEs; className: string; sizes: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-pino-900', className)}>
      {article.coverId ? (
        <Img media={getMedia(article.coverId)} alt={article.coverAlt} sizes={sizes} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
      ) : (
        <div className="es-azulejo flex h-full w-full items-end bg-arena-100 p-4">
          <span className="es-eyebrow text-carbon-700">{article.category}</span>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: ArticleEs;
  variant: 'feature' | 'compact' | 'grid';
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

export function EsArticleCard({ article, variant, headingLevel = 3, onNavigate }: ArticleCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const to = `/es/guias/${article.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative">
        <Cover article={article} className="es-block-shadow mb-[14px] mr-[14px] aspect-[16/10]" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="mt-6">
          <EsArticleMeta article={article} />
          <Heading className="mt-3 font-es text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-carbon-900 sm:text-[2.2rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-carbon-600">{article.excerpt}</p>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-mar-700">
            Leer la guía
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
          <EsArticleMeta article={article} className="text-[12px]" />
          <Heading className="mt-2 font-es text-xl font-extrabold leading-snug tracking-[-0.01em] text-carbon-900 sm:text-[1.35rem]">
            <Link to={to} onClick={onNavigate} className={stretched}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-carbon-600 max-sm:hidden">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Cover article={article} className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      <div className="mt-5 flex flex-1 flex-col">
        <EsArticleMeta article={article} />
        <Heading className="mt-3 font-es text-[1.4rem] font-extrabold leading-snug tracking-[-0.01em] text-carbon-900">
          <Link to={to} onClick={onNavigate} className={stretched}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-carbon-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
