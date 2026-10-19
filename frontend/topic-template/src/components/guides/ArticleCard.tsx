import { formatArticleDate, type Article } from '../../content/en-global/articles';
import { getMedia } from '../../content/media';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight } from '../ui/Icons';
import { Img } from '../ui/Img';

const stretchedLink =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal-500';

export function ArticleMeta({ article, className }: { article: Article; className?: string }) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-navy-500',
        className,
      )}
    >
      <span className="text-signal-700">{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readMinutes} min read</span>
    </p>
  );
}

function Cover({ article, className, sizes }: { article: Article; className: string; sizes: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[4px] bg-navy-900', className)}>
      {article.coverId ? (
        <Img
          media={getMedia(article.coverId)}
          alt={article.coverAlt}
          sizes={sizes}
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="bg-route-grid flex h-full w-full items-end p-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-300">{article.category}</span>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: Article;
  variant: 'feature' | 'compact' | 'grid';
  headingLevel?: 2 | 3;
  onNavigate?: () => void;
}

export function ArticleCard({ article, variant, headingLevel = 3, onNavigate }: ArticleCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const to = `/guides/${article.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative">
        <Cover article={article} className="aspect-[16/10]" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="mt-6">
          <ArticleMeta article={article} />
          <Heading className="mt-3 font-display text-[1.9rem] font-semibold leading-[1.1] text-navy-900 sm:text-[2.25rem]">
            <Link to={to} onClick={onNavigate} className={stretchedLink}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-navy-600">{article.excerpt}</p>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-signal-700">
            Read the guide
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
          <ArticleMeta article={article} className="text-[11px]" />
          <Heading className="mt-2 font-display text-xl font-semibold leading-snug text-navy-900 sm:text-[1.4rem]">
            <Link to={to} onClick={onNavigate} className={stretchedLink}>
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-navy-600 max-sm:hidden">{article.excerpt}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Cover article={article} className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      <div className="mt-5 flex flex-1 flex-col">
        <ArticleMeta article={article} />
        <Heading className="mt-3 font-display text-[1.45rem] font-semibold leading-snug text-navy-900">
          <Link to={to} onClick={onNavigate} className={stretchedLink}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{article.excerpt}</p>
      </div>
    </article>
  );
}
