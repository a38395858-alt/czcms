import { formatNewsDate, type NewsItem } from '../../content/en-global/news';
import { getMedia } from '../../content/media';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight } from '../ui/Icons';
import { Img } from '../ui/Img';

const stretchedLink =
  'outline-none after:absolute after:inset-0 hover:underline decoration-2 underline-offset-4 focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal-500';

export function NewsMeta({ item, className }: { item: NewsItem; className?: string }) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-navy-500',
        className,
      )}
    >
      <span className="text-signal-700">{item.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{item.readMinutes} min read</span>
    </p>
  );
}

function NewsCover({
  item,
  className,
  sizes,
  priority,
}: {
  item: NewsItem;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-[4px] bg-navy-900', className)}>
      {item.coverId ? (
        <Img
          media={getMedia(item.coverId)}
          alt={item.coverAlt}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="bg-route-grid flex h-full w-full items-end p-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-300">{item.category}</span>
        </div>
      )}
    </div>
  );
}

interface NewsCardProps {
  item: NewsItem;
  variant: 'lead' | 'standard' | 'row';
  headingLevel?: 2 | 3;
  priority?: boolean;
  onNavigate?: () => void;
}

/** Lead: large horizontal card for the top story. */
function LeadCard({ item, headingLevel, priority, onNavigate }: Omit<NewsCardProps, 'variant'>) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="group relative grid gap-6 lg:grid-cols-2 lg:gap-10">
      <NewsCover
        item={item}
        priority={priority}
        className="aspect-[16/10]"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="flex min-w-0 flex-col justify-center">
        <p className="inline-flex items-center gap-2">
          <span className="inline-flex items-center bg-safety-500 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-navy-950">
            Latest
          </span>
        </p>
        <div className="mt-4">
          <NewsMeta item={item} />
        </div>
        <Heading className="mt-3 font-display text-[2rem] font-semibold leading-[1.08] text-navy-900 sm:text-[2.5rem]">
          <Link to={`/news/${item.slug}`} onClick={onNavigate} className={stretchedLink}>
            {item.title}
          </Link>
        </Heading>
        <p className="mt-4 text-[17px] leading-relaxed text-navy-600">{item.excerpt}</p>
        <span aria-hidden="true" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-signal-700">
          Read the story
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/** Standard: vertical card for the main grid. */
function StandardCard({ item, headingLevel, onNavigate }: Omit<NewsCardProps, 'variant' | 'priority'>) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="group relative flex h-full flex-col">
      <NewsCover
        item={item}
        className="aspect-[3/2]"
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
      />
      <div className="mt-5 flex flex-1 flex-col">
        <NewsMeta item={item} />
        <Heading className="mt-3 font-display text-[1.45rem] font-semibold leading-snug text-navy-900">
          <Link to={`/news/${item.slug}`} onClick={onNavigate} className={stretchedLink}>
            {item.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-navy-600">{item.excerpt}</p>
      </div>
    </article>
  );
}

/** Row: compact horizontal card for latest lists and archive rails. */
function RowCard({ item, headingLevel, onNavigate }: Omit<NewsCardProps, 'variant' | 'priority'>) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="group relative grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-5">
      <NewsCover item={item} className="aspect-[4/3]" sizes="(min-width: 640px) 136px, 88px" />
      <div className="min-w-0">
        <NewsMeta item={item} className="text-[11px]" />
        <Heading className="mt-2 font-display text-[1.15rem] font-semibold leading-snug text-navy-900 sm:text-[1.3rem]">
          <Link to={`/news/${item.slug}`} onClick={onNavigate} className={stretchedLink}>
            {item.title}
          </Link>
        </Heading>
      </div>
    </article>
  );
}

export function NewsCard({ item, variant, headingLevel = 3, priority, onNavigate }: NewsCardProps) {
  if (variant === 'lead') return <LeadCard item={item} headingLevel={headingLevel} priority={priority} onNavigate={onNavigate} />;
  if (variant === 'row') return <RowCard item={item} headingLevel={headingLevel} onNavigate={onNavigate} />;
  return <StandardCard item={item} headingLevel={headingLevel} onNavigate={onNavigate} />;
}
