import { useMemo, useState } from 'react';
import { NewsCard, NewsMeta } from '../components/news/NewsCard';
import { Breadcrumbs, CtaBand, PageHero } from '../components/layout/PageParts';
import { ArrowRight, CheckIcon } from '../components/ui/Icons';
import { Img } from '../components/ui/Img';
import { siteConfig } from '../config/site';
import { getArticle, type Article } from '../content/en-global/articles';
import {
  NEWS_CATEGORIES,
  formatNewsDate,
  formatNewsMonth,
  getAdjacentNews,
  getFeaturedNews,
  getNewsBySlug,
  getPublishedNews,
  getRelatedNews,
  slugifyHeading,
  type NewsCategory,
  type NewsItem,
} from '../content/en-global/news';
import { getMedia } from '../content/media';
import { getService, type ServiceContent } from '../content/en-global/services';
import { track } from '../lib/analytics';
import { Link } from '../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../lib/seo';
import { cn } from '../utils/cn';
import { NotFoundPage } from './CompanyPages';

/* ------------------------------------------------------------------ helpers */

const PAGE_SIZE = 6;

/** Detail-page tags hand a preset search to the listing via session storage. */
const PRESET_KEY = 'fv.news.preset';

function readPreset(): string {
  try {
    const value = window.sessionStorage.getItem(PRESET_KEY) ?? '';
    window.sessionStorage.removeItem(PRESET_KEY);
    return value;
  } catch {
    return '';
  }
}

function writePreset(value: string) {
  try {
    window.sessionStorage.setItem(PRESET_KEY, value);
  } catch {
    /* storage unavailable — the listing simply opens unfiltered */
  }
}

/* ------------------------------------------------------------------ listing */

/**
 * Newsroom listing (/news): featured story, filterable story grid,
 * month-by-month archive, and editorial standards.
 */
export function NewsPage() {
  useDocumentMeta({
    title: 'Freight News & Operations Updates | FreightVanta',
    description:
      'Timely, practical freight news from FreightVanta: ocean and air operations, customs documents, sourcing, warehousing, and fulfillment — written for your next shipment.',
    path: '/news',
  });

  const published = useMemo(() => getPublishedNews(), []);
  const featured = getFeaturedNews();
  const [query, setQuery] = useState(() => (typeof window === 'undefined' ? '' : readPreset()));
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const map = new Map<NewsCategory, number>();
    for (const item of published) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [published]);

  const isFiltering = query.trim() !== '' || category !== null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = published.filter((item) => {
      if (category && item.category !== category) return false;
      if (!q) return true;
      const haystack = `${item.title} ${item.excerpt} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
    return sort === 'oldest' ? [...list].reverse() : list;
  }, [published, query, category, sort]);

  const visible = filtered.slice(0, visibleCount);

  const archive = useMemo(() => {
    const groups = new Map<string, NewsItem[]>();
    for (const item of published) {
      const key = formatNewsMonth(item.publishedAt);
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [published]);

  useJsonLd('fv-news-list-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'FreightVanta newsroom',
    itemListElement: published.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteConfig.siteUrl}/news/${item.slug}`,
      name: item.title,
    })),
  });

  const pickCategory = (next: NewsCategory | null) => {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
    track('news_filter_change', { category: next ?? 'all' });
  };

  const onSearch = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
    if (value.trim().length >= 3) track('news_search', { length: value.trim().length });
  };

  const clearAll = () => {
    setQuery('');
    setCategory(null);
    setSort('newest');
    setVisibleCount(PAGE_SIZE);
  };

  const secondary = published.filter((item) => item.slug !== featured?.slug).slice(0, 3);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'News' }]}
        eyebrow="Newsroom"
        title="Freight news, written for your next shipment."
        body="Short operational briefings on ocean and air freight, customs documents, sourcing, and fulfillment — what changed, what to check, and who owns the next step. No invented rates, ETAs, or promises."
      />

      {/* Filter toolbar */}
      <section aria-label="Find a story" className="border-b border-mist-200 bg-white">
        <div className="shell py-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label htmlFor="news-search" className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                Search stories
              </label>
              <div className="relative mt-2 max-w-xl">
                <input
                  id="news-search"
                  type="search"
                  value={query}
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder="Try “peak season”, “customs”, or “samples”…"
                  autoComplete="off"
                  className="block w-full rounded-[3px] border border-mist-300 bg-white py-3 pl-4 pr-11 text-[15px] text-navy-900 placeholder:text-navy-400 hover:border-navy-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => onSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[3px] px-2 py-1 text-sm font-semibold text-signal-700 hover:bg-mist-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="news-sort" className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                Sort
              </label>
              <select
                id="news-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}
                className="min-h-11 rounded-[3px] border border-mist-300 bg-white px-3 py-2 text-sm font-medium text-navy-800 hover:border-navy-400"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <p aria-live="polite" className="text-sm text-navy-500">
                {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
          </div>
          <div role="group" aria-label="Filter stories by topic" className="mt-5 flex flex-wrap gap-2">
            <FilterPill pressed={category === null} onClick={() => pickCategory(null)} label="All topics" count={published.length} />
            {NEWS_CATEGORIES.map(({ name }) => (
              <FilterPill
                key={name}
                pressed={category === name}
                onClick={() => pickCategory(category === name ? null : name)}
                label={name}
                count={counts.get(name) ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured + latest (only when browsing unfiltered) */}
      {!isFiltering && featured && (
        <section aria-label="Top stories" className="bg-mist-50 py-14 sm:py-16 lg:py-20">
          <div className="shell grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <NewsCard
                item={featured}
                variant="lead"
                headingLevel={2}
                priority
                onNavigate={() => track('news_card_click', { slug: featured.slug, position: 'lead' })}
              />
            </div>
            <div className="lg:col-span-4">
              <h2 className="border-b-2 border-navy-900 pb-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-navy-700">
                The latest
              </h2>
              <ul className="mt-6 space-y-8">
                {secondary.map((item) => (
                  <li key={item.slug}>
                    <NewsCard
                      item={item}
                      variant="row"
                      onNavigate={() => track('news_card_click', { slug: item.slug, position: 'latest' })}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Results grid */}
      <section aria-label="All stories" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
              {isFiltering ? 'Matching stories' : 'All stories'}
            </h2>
            {isFiltering && (
              <button type="button" onClick={clearAll} className="text-link text-[15px]">
                Clear filters
              </button>
            )}
          </div>

          {visible.length > 0 ? (
            <>
              <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((item) => (
                  <li key={item.slug}>
                    <NewsCard
                      item={item}
                      variant="standard"
                      headingLevel={2}
                      onNavigate={() => track('news_card_click', { slug: item.slug, position: 'grid' })}
                    />
                  </li>
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="btn btn-dark"
                  >
                    Show more stories ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 rounded-[4px] border border-dashed border-mist-300 p-8 sm:p-10">
              <p className="font-display text-2xl font-semibold text-navy-900">No stories match that search.</p>
              <p className="mt-2 max-w-xl text-navy-600">
                Try a shorter term — “customs”, “peak”, “samples” — or browse a topic instead.
              </p>
              <button type="button" onClick={clearAll} className="text-link mt-5">
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Archive */}
      <section aria-labelledby="news-archive" className="border-t border-mist-200 bg-mist-50 py-14 sm:py-16 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="news-archive" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
              Archive
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-navy-600">
              Every published story, grouped by month. Drafts are never listed here.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
            {archive.map(([month, items]) => (
              <div key={month}>
                <h3 className="border-b-2 border-navy-900 pb-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-navy-700">
                  {month}
                </h3>
                <ul className="mt-2 divide-y divide-mist-200">
                  {items.map((item) => (
                    <li key={item.slug} className="py-3.5">
                      <p className="font-mono text-[12px] text-navy-500">
                        <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
                        <span aria-hidden="true"> · </span>
                        <span>{item.category}</span>
                      </p>
                      <Link
                        to={`/news/${item.slug}`}
                        onClick={() => track('news_card_click', { slug: item.slug, position: 'archive' })}
                        className="mt-1 block font-semibold leading-snug text-navy-900 underline decoration-signal-600/30 underline-offset-4 hover:text-signal-700 hover:decoration-signal-600"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial standards */}
      <section aria-labelledby="news-standards" className="bg-navy-950 py-14 text-white sm:py-16 lg:py-20">
        <div className="shell">
          <p className="eyebrow text-signal-300">How we publish</p>
          <h2 id="news-standards" className="mt-4 max-w-2xl font-display text-[2rem] font-semibold leading-tight sm:text-[2.5rem]">
            News you can plan from — not headlines you have to decode.
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'No invented numbers',
                copy: 'You will not find made-up transit times, rates, savings, or ETAs here. Timing and cost are confirmed per shipment, never assumed from a story.',
              },
              {
                title: 'Checks, not promises',
                copy: 'Each story ends in something you can verify: a document to prepare, a question to ask, or an owner to name before cargo moves.',
              },
              {
                title: 'Corrections stay visible',
                copy: 'When guidance changes, the story is updated with a new date — never silently rewritten. What you read is what we currently advise.',
              },
            ].map((principle) => (
              <li key={principle.title} className="border-t border-white/15 pt-6">
                <h3 className="flex items-center gap-2.5 font-display text-xl font-semibold">
                  <CheckIcon className="h-5 w-5 shrink-0 text-signal-300" />
                  {principle.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-navy-200">{principle.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Turn a headline into a plan."
        body="Bring the story that matches your situation — a specialist will map it to your product, route, and timing."
      />
    </>
  );
}

function FilterPill({
  pressed,
  onClick,
  label,
  count,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-[3px] border px-3.5 py-2 text-sm font-medium transition-colors',
        pressed
          ? 'border-signal-600 bg-signal-600 text-white'
          : 'border-mist-300 text-navy-700 hover:border-navy-400 hover:text-navy-900',
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          'rounded-full px-1.5 py-0.5 font-mono text-[11px] leading-none',
          pressed ? 'bg-white/20 text-white' : 'bg-mist-100 text-navy-500',
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ detail */

export function NewsDetailPage({ slug }: { slug: string }) {
  const item = getNewsBySlug(slug);
  return item ? <NewsDetail item={item} /> : <NotFoundPage path={`/news/${slug}`} />;
}

function NewsDetail({ item }: { item: NewsItem }) {
  useDocumentMeta({
    title: `${item.title} | FreightVanta News`,
    description: truncate(item.excerpt),
    path: `/news/${item.slug}`,
  });

  const root = siteConfig.siteUrl;
  useJsonLd('fv-news-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: item.title,
        description: item.excerpt,
        datePublished: item.publishedAt,
        ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
        inLanguage: siteConfig.locale,
        author: { '@type': 'Organization', name: `${siteConfig.brand} operations team` },
        publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${root}/` },
        mainEntityOfPage: `${root}/news/${item.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${root}/` },
          { '@type': 'ListItem', position: 2, name: 'News', item: `${root}/news` },
          { '@type': 'ListItem', position: 3, name: item.title },
        ],
      },
    ],
  });

  const services = item.relatedServices.map(getService).filter((s): s is ServiceContent => s !== null);
  const guides = item.relatedGuides.map(getArticle).filter((a): a is Article => a !== null);
  const related = getRelatedNews(item.slug, 3);
  const { newer, older } = getAdjacentNews(item.slug);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-navy-900 pb-40 pt-10 text-white sm:pb-48 sm:pt-12">
        <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'News', to: '/news' },
              { label: item.category },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <NewsMeta item={item} className="text-navy-200 [&>span:first-child]:text-signal-300" />
            <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.4rem]">
              {item.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200 sm:text-xl">{item.excerpt}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy-300">
              <span>By the FreightVanta operations team</span>
              {item.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={item.updatedAt}>{formatNewsDate(item.updatedAt)}</time>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="-mt-32 overflow-hidden rounded-[4px] bg-navy-800 shadow-[0_32px_64px_-32px_rgba(5,15,31,0.6)] sm:-mt-40">
          {item.coverId && (
            <Img
              media={getMedia(item.coverId)}
              alt={item.coverAlt}
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]"
            />
          )}
        </div>

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-8">
            {/* In brief */}
            <section aria-label="In brief" className="rounded-[4px] border border-mist-200 bg-mist-50 p-6 sm:p-7">
              <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-signal-700">
                In brief
              </h2>
              <ul className="mt-4 space-y-3">
                {item.keyPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-[16px] leading-relaxed text-navy-800">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-signal-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Body */}
            <div className="prose-guide mt-12 space-y-12">
              {item.sections.map((section) => (
                <section key={section.heading} aria-labelledby={slugifyHeading(section.heading)}>
                  <h2 id={slugifyHeading(section.heading)}>{section.heading}</h2>
                  <div className="mt-5 space-y-5">
                    {section.blocks.map((block, index) => {
                      if (block.type === 'p')
                        return (
                          <p key={index} className="text-[18px] leading-[1.75] text-navy-700">
                            {block.text}
                          </p>
                        );
                      if (block.type === 'note')
                        return (
                          <p key={index} className="border-l-2 border-signal-600 bg-mist-50 px-5 py-4 text-[16px] leading-relaxed text-navy-700">
                            {block.text}
                          </p>
                        );
                      return (
                        <ul key={index} className="space-y-3">
                          {block.items.map((listItem) => (
                            <li key={listItem} className="flex gap-3 text-[17px] leading-relaxed text-navy-700">
                              <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 bg-signal-600" />
                              <span>{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="mt-12 border-t border-mist-200 pt-8">
                <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                  Filed under
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        to="/news"
                        onClick={() => {
                          writePreset(tag);
                          track('news_filter_change', { category: 'tag', tag });
                        }}
                        className="inline-flex min-h-10 items-center rounded-[3px] border border-mist-300 px-3.5 py-2 text-sm font-medium text-navy-700 transition-colors hover:border-signal-600 hover:text-signal-700"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ShareRow item={item} />

            {/* Prev / next */}
            <nav aria-label="More stories" className="mt-12 grid gap-4 border-t border-mist-200 pt-8 sm:grid-cols-2">
              <PrevNextCard item={newer} label="Newer story" align="left" />
              <PrevNextCard item={older} label="Older story" align="right" />
            </nav>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              <nav aria-label="On this page" className="rounded-[4px] border border-mist-200 p-6">
                <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                  On this page
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {item.sections.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slugifyHeading(section.heading)}`}
                        className="block border-l-2 border-mist-200 pl-3 text-[15px] font-medium leading-snug text-navy-700 transition-colors hover:border-signal-600 hover:text-signal-700"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rounded-[4px] bg-navy-900 p-7 text-white">
                <p className="eyebrow text-signal-300">Request a shipment plan</p>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug">Facing this situation?</p>
                <p className="mt-3 text-[15px] leading-relaxed text-navy-200">
                  Start with a product link, a shipment brief, or the route you need to plan.
                </p>
                <Link to="#enquiry" className="btn btn-primary mt-6 w-full">
                  Get a shipment plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {services.length > 0 && (
                <div>
                  <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                    Related solutions
                  </h2>
                  <ul className="mt-3 border-t border-mist-200">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-mist-200">
                        <Link
                          to={service.slug === 'product-sourcing' ? '/product-sourcing' : `/solutions/${service.slug}`}
                          className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-navy-900 hover:text-signal-700"
                        >
                          {service.navLabel}
                          <ArrowRight className="h-4 w-4 text-signal-600 transition-transform motion-safe:group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {guides.length > 0 && (
                <div>
                  <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
                    Keep reading: guides
                  </h2>
                  <ul className="mt-3 border-t border-mist-200">
                    {guides.map((guide) => (
                      <li key={guide.slug} className="border-b border-mist-200">
                        <Link
                          to={`/guides/${guide.slug}`}
                          className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-navy-900 hover:text-signal-700"
                        >
                          {guide.title}
                          <ArrowRight className="h-4 w-4 text-signal-600 transition-transform motion-safe:group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-news" className="border-t border-mist-200 bg-mist-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-news" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
                Related stories
              </h2>
              <Link to="/news" className="text-link">
                Visit the newsroom
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((news) => (
                <li key={news.slug}>
                  <NewsCard
                    item={news}
                    variant="standard"
                    onNavigate={() => track('news_card_click', { slug: news.slug, position: 'related' })}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CtaBand />
    </article>
  );
}

function PrevNextCard({
  item,
  label,
  align,
}: {
  item: NewsItem | null;
  label: string;
  align: 'left' | 'right';
}) {
  if (!item) return <span aria-hidden="true" className={cn(align === 'right' && 'max-sm:hidden')} />;
  return (
    <Link
      to={`/news/${item.slug}`}
      onClick={() => track('news_card_click', { slug: item.slug, position: 'adjacent' })}
      className={cn(
        'group block rounded-[4px] border border-mist-300 p-5 transition-colors hover:border-signal-600',
        align === 'right' && 'text-right',
      )}
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-navy-500">{label}</span>
      <span className="mt-2 block font-display text-xl font-semibold leading-snug text-navy-900 group-hover:text-signal-700">
        {item.title}
      </span>
      <span className="mt-2 block font-mono text-[12px] text-navy-500">
        <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
      </span>
    </Link>
  );
}

function ShareRow({ item }: { item: NewsItem }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `${siteConfig.siteUrl}/news/${item.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const area = document.createElement('textarea');
      area.value = url;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch {
        /* clipboard unavailable */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    track('news_share', { channel: 'copy', slug: item.slug });
    window.setTimeout(() => setCopied(false), 2500);
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `${siteConfig.siteUrl}/news/${item.slug}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(item.title);
  const channels = [
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      channel: 'linkedin',
    },
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      channel: 'x',
    },
    {
      label: 'Share by email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      channel: 'email',
    },
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-mist-200 pt-8">
      <p className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">Share</p>
      <button
        type="button"
        onClick={copyLink}
        aria-live="polite"
        className="inline-flex min-h-10 items-center rounded-[3px] border border-mist-300 px-3.5 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-signal-600 hover:text-signal-700"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      {channels.map((channel) => (
        <a
          key={channel.channel}
          href={channel.href}
          target={channel.channel === 'email' ? undefined : '_blank'}
          rel={channel.channel === 'email' ? undefined : 'noopener noreferrer'}
          onClick={() => track('news_share', { channel: channel.channel, slug: item.slug })}
          className="inline-flex min-h-10 items-center rounded-[3px] border border-mist-300 px-3.5 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-signal-600 hover:text-signal-700"
        >
          {channel.label}
          {channel.channel !== 'email' && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      ))}
    </div>
  );
}
