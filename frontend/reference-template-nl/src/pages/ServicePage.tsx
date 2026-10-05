import { ArticleCard } from '../components/guides/ArticleCard';
import { CheckList, CtaBand, PageHero, ScopeNote } from '../components/layout/PageParts';
import { ArrowRight } from '../components/ui/Icons';
import { getArticle, type Article } from '../content/en-global/articles';
import { SERVICES, getService, type ServiceContent } from '../content/en-global/services';
import { getMedia } from '../content/media';
import { setPrefill } from '../lib/enquiry';
import { Link } from '../lib/router';
import { truncate, useDocumentMeta } from '../lib/seo';
import { NotFoundPage } from './CompanyPages';

export function ServicePage({ slug }: { slug: string }) {
  const service = getService(slug);
  return service ? <ServiceDetail service={service} /> : <NotFoundPage path={`/solutions/${slug}`} />;
}

function ServiceDetail({ service }: { service: ServiceContent }) {
  useDocumentMeta({
    title: `${service.navLabel} | FreightVanta`,
    description: truncate(`${service.title} ${service.copy}`),
    path: `/solutions/${service.slug}`,
  });

  const guides = service.relatedGuides.map(getArticle).filter((article): article is Article => article !== null);
  const others = SERVICES.filter((item) => item.slug !== service.slug);
  const startPlan = () => {
    if (service.startingPoint) setPrefill(service.startingPoint);
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Solutions', to: '#services' }, { label: service.navLabel }]}
        eyebrow="Solutions"
        title={service.navLabel}
        lead={service.title}
        body={service.copy}
        media={getMedia(service.mediaId)}
        mediaAlt={service.mediaAlt}
        actions={
          <>
            <Link to="#enquiry" onClick={startPlan} className="btn btn-primary w-full sm:w-auto">
              Get a shipment plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="#services" className="btn btn-ghost-light w-full sm:w-auto">
              Compare service paths
            </Link>
          </>
        }
      />

      <section aria-labelledby="service-scope" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="service-scope" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
              What this path covers
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li key={tag} className="rounded-[2px] border border-mist-300 px-3 py-1.5 font-mono text-[13px] font-medium text-navy-700">
                  {tag}
                </li>
              ))}
            </ul>
            {service.scopeNote && (
              <div className="mt-8">
                <ScopeNote>{service.scopeNote}</ScopeNote>
              </div>
            )}
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:gap-10">
            <div className="border-t-2 border-navy-900 pt-6">
              <h3 className="font-display text-2xl font-semibold text-navy-900">What to share to get started</h3>
              <CheckList items={service.share} className="mt-5" />
            </div>
            <div className="border-t-2 border-signal-600 pt-6">
              <h3 className="font-display text-2xl font-semibold text-navy-900">What the shipment plan makes clear</h3>
              <CheckList items={service.clarify} className="mt-5" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="service-guides" className="bg-mist-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="service-guides" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
                Related planning guides
              </h2>
              <Link to="/guides" className="text-link">
                Visit the resource center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {guides.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="service-others" className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="service-others" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
            Connected solutions
          </h2>
          <ul className="mt-8 grid border-t border-mist-200 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-mist-200">
                <Link
                  to={`/solutions/${item.slug}`}
                  className="group flex h-full items-start justify-between gap-4 py-5 pr-4 transition-colors hover:text-signal-700"
                >
                  <span>
                    <span className="block font-semibold text-navy-900 group-hover:text-signal-700">{item.navLabel}</span>
                    <span className="mt-1 block text-sm text-navy-500">{item.menuLine}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-signal-600 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand startingPoint={service.startingPoint} />
    </>
  );
}
