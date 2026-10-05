import { useMemo, useState } from 'react';
import { ArticleCard, ArticleMeta } from '../components/guides/ArticleCard';
import { Breadcrumbs, CtaBand, PageHero } from '../components/layout/PageParts';
import { ArrowRight } from '../components/ui/Icons';
import { Img } from '../components/ui/Img';
import { getArticle, getPublishedArticles, type Article } from '../content/en-global/articles';
import { resourcesSection } from '../content/en-global/home';
import { getService, type ServiceContent } from '../content/en-global/services';
import { getMedia } from '../content/media';
import { Link } from '../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../lib/seo';
import { siteConfig } from '../config/site';
import { cn } from '../utils/cn';
import { NotFoundPage } from './CompanyPages';

export function GuidesPage() {
  useDocumentMeta({
    title: 'Guides & Planning Resources | FreightVanta',
    description: truncate(resourcesSection.body),
    path: '/guides',
  });

  const articles = getPublishedArticles();
  const categories = useMemo(() => Array.from(new Set(articles.map((article) => article.category))), [articles]);
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const [lead, ...rest] = visible;

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Guides' }]}
        eyebrow={resourcesSection.eyebrow}
        title={resourcesSection.title}
        body={resourcesSection.body}
      />
      <section aria-label="Guides" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 border-b border-mist-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filter guides by topic" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => {
                const pressed = category === item;
                return (
                  <button
                    key={item ?? 'all'}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-h-10 rounded-[3px] border px-3.5 py-2 text-sm font-medium transition-colors',
                      pressed
                        ? 'border-signal-600 bg-signal-600 text-white'
                        : 'border-mist-300 text-navy-700 hover:border-navy-400 hover:text-navy-900',
                    )}
                  >
                    {item ?? 'All topics'}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm text-navy-500">
              {visible.length} {visible.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>

          {lead ? (
            <>
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <ArticleCard article={lead} variant="feature" headingLevel={2} />
                </div>
                <div className="lg:col-span-4">
                  <div className="rounded-[4px] bg-navy-900 p-7 text-white">
                    <p className="eyebrow text-signal-300">Planning a shipment?</p>
                    <p className="mt-4 font-display text-2xl font-semibold leading-snug">
                      Turn what you have learned into a plan your team can use.
                    </p>
                    <Link to="#enquiry" className="btn btn-primary mt-6 w-full">
                      Get a shipment plan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <ArticleCard article={article} variant="grid" headingLevel={2} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-12 rounded-[4px] border border-dashed border-mist-300 p-8 text-navy-600">
              No published guides in this topic yet. Choose another topic to keep reading.
            </p>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const article = getArticle(slug);
  return article ? <ArticleDetail article={article} /> : <NotFoundPage path={`/guides/${slug}`} />;
}

function ArticleDetail({ article }: { article: Article }) {
  useDocumentMeta({
    title: `${article.title} | FreightVanta`,
    description: truncate(article.excerpt),
    path: `/guides/${article.slug}`,
  });
  useJsonLd('fv-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    inLanguage: siteConfig.locale,
    publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${siteConfig.siteUrl}/` },
    mainEntityOfPage: `${siteConfig.siteUrl}/guides/${article.slug}`,
  });

  const services = article.relatedServices.map(getService).filter((s): s is ServiceContent => s !== null);
  const related = getPublishedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-navy-900 pb-40 pt-10 text-white sm:pb-48 sm:pt-12">
        <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Guides', to: '/guides' }, { label: article.category }]} />
          <div className="mt-8 max-w-3xl">
            <ArticleMeta article={article} className="text-navy-200 [&>span:first-child]:text-signal-300" />
            <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.4rem]">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200 sm:text-xl">{article.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="-mt-32 overflow-hidden rounded-[4px] bg-navy-800 shadow-[0_32px_64px_-32px_rgba(5,15,31,0.6)] sm:-mt-40">
          {article.coverId && (
            <Img
              media={getMedia(article.coverId)}
              alt={article.coverAlt}
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]"
            />
          )}
        </div>

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="prose-guide space-y-12 lg:col-span-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
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
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-navy-700">
                            <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 bg-signal-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              <div className="rounded-[4px] bg-navy-900 p-7 text-white">
                <p className="eyebrow text-signal-300">Request a shipment plan</p>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug">Planning a shipment like this?</p>
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
                  <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">Related solutions</h2>
                  <ul className="mt-3 border-t border-mist-200">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-mist-200">
                        <Link
                          to={`/solutions/${service.slug}`}
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
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-guides" className="border-t border-mist-200 bg-mist-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-guides" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
                Keep planning
              </h2>
              <Link to="/guides" className="text-link">
                Visit the resource center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <ArticleCard article={item} variant="compact" />
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
