import { getLatestArticles } from '../../content/en-global/articles';
import type { ResourcesSection } from '../../content/types';
import { track } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArticleCard } from '../guides/ArticleCard';
import { ArrowRight } from '../ui/Icons';

/** Populated from the three newest published English articles, with an empty-state fallback. */
export function Resources({ section }: { section: ResourcesSection }) {
  const articles = getLatestArticles(section.settings.article_limit);
  const [feature, ...supporting] = articles;
  const guideClick = (target: string, slug?: string) => track('home_guides_click', { target, slug });

  return (
    <section id="resources" aria-labelledby="resources-title" className="bg-mist-50 py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="eyebrow text-signal-700">{section.eyebrow}</p>
            <h2 id="resources-title" className="h2 mt-5 text-navy-900">
              <Link
                to={section.settings.heading_url}
                onClick={() => guideClick('heading')}
                className="decoration-signal-600/50 decoration-2 underline-offset-[6px] hover:underline"
              >
                {section.title}
              </Link>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">{section.body}</p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link
              to={section.cta_primary_url}
              onClick={() => guideClick('resource_center')}
              className="btn btn-outline w-full sm:w-auto"
            >
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {feature ? (
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <div className={supporting.length > 0 ? 'lg:col-span-7' : 'lg:col-span-8'}>
              <ArticleCard article={feature} variant="feature" onNavigate={() => guideClick('article', feature.slug)} />
            </div>
            {supporting.length > 0 && (
              <div className="lg:col-span-5">
                <ul className="divide-y divide-mist-300 border-y border-mist-300">
                  {supporting.map((article) => (
                    <li key={article.slug} className="py-7">
                      <ArticleCard
                        article={article}
                        variant="compact"
                        onNavigate={() => guideClick('article', article.slug)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 rounded-[4px] border border-dashed border-mist-300 bg-white p-8 sm:p-10">
            <p className="font-display text-2xl font-semibold text-navy-900">New planning guides are on the way.</p>
            <p className="mt-2 max-w-xl text-navy-600">
              Start with one of the topics below, or visit the resource center for the full library.
            </p>
          </div>
        )}

        <nav aria-labelledby="resources-topics" className="mt-14 border-t border-mist-300 pt-8">
          <p id="resources-topics" className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-navy-500">
            {section.settings.topics_label}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((topic) => (
              <li key={topic.href}>
                <Link
                  to={topic.href}
                  onClick={() => guideClick('topic', topic.href.split('/').pop())}
                  className="group flex h-full min-h-14 items-center justify-between gap-3 rounded-[3px] border border-mist-300 bg-white px-4 py-3 text-[15px] font-semibold text-navy-900 transition-colors hover:border-signal-600 hover:text-signal-700"
                >
                  {topic.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-signal-600 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
