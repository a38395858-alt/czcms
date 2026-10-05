import { ArticleCard } from '../components/guides/ArticleCard';
import { CheckList, CtaBand, PageHero } from '../components/layout/PageParts';
import { ArrowRight } from '../components/ui/Icons';
import { Img } from '../components/ui/Img';
import { getArticle, type Article } from '../content/en-global/articles';
import { industriesSection } from '../content/en-global/home';
import { INDUSTRIES, getIndustry, type IndustryContent } from '../content/en-global/industries';
import { getService, type ServiceContent } from '../content/en-global/services';
import { getMedia } from '../content/media';
import { Link } from '../lib/router';
import { truncate, useDocumentMeta } from '../lib/seo';
import { cn } from '../utils/cn';
import { NotFoundPage } from './CompanyPages';

export function IndustriesPage() {
  useDocumentMeta({
    title: 'Industry Solutions | FreightVanta',
    description: truncate(`${industriesSection.title} ${industriesSection.body}`),
    path: '/industries',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Industries' }]}
        eyebrow="Industries"
        title="Industry solutions"
        lead={industriesSection.title}
        body={industriesSection.body}
      />
      <section aria-label="Industries" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell space-y-16 lg:space-y-24">
          {INDUSTRIES.map((industry, index) => (
            <article key={industry.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn('lg:col-span-6', index % 2 === 1 && 'lg:order-2')}>
                <div className="overflow-hidden rounded-[4px] bg-mist-100">
                  <Img
                    media={getMedia(industry.mediaId)}
                    alt={industry.mediaAlt}
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="aspect-[3/2] w-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="eyebrow text-signal-700">{industry.menuLine}</p>
                <h2 className="mt-4 font-display text-[2.2rem] font-semibold leading-tight text-navy-900">{industry.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-navy-600">{industry.copy}</p>
                <CheckList items={industry.questions.slice(0, 2)} className="mt-6" />
                <Link to={`/industries/${industry.slug}`} className="btn btn-dark mt-8 w-full sm:w-auto">
                  View the {industry.name.toLowerCase()} page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function IndustryPage({ slug }: { slug: string }) {
  const industry = getIndustry(slug);
  return industry ? <IndustryDetail industry={industry} /> : <NotFoundPage path={`/industries/${slug}`} />;
}

function IndustryDetail({ industry }: { industry: IndustryContent }) {
  useDocumentMeta({
    title: `${industry.navLabel} | FreightVanta`,
    description: truncate(industry.copy),
    path: `/industries/${industry.slug}`,
  });

  const services = industry.relatedServices.map(getService).filter((s): s is ServiceContent => s !== null);
  const guides = industry.relatedGuides.map(getArticle).filter((a): a is Article => a !== null);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Industries', to: '/industries' }, { label: industry.navLabel }]}
        eyebrow="Industry solutions"
        title={industry.navLabel}
        lead={industry.copy}
        media={getMedia(industry.mediaId)}
        mediaAlt={industry.mediaAlt}
        actions={
          <>
            <Link to="#enquiry" className="btn btn-primary w-full sm:w-auto">
              Get a shipment plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/industries" className="btn btn-ghost-light w-full sm:w-auto">
              All industry solutions
            </Link>
          </>
        }
      />

      <section aria-labelledby="industry-questions" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="industry-questions" className="font-display text-[2.2rem] font-semibold leading-tight text-navy-900">
              Questions the plan answers first
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              The work starts with the constraint that matters most to your operation. These are the questions we clarify
              before cargo moves.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-[4px] bg-mist-200 lg:col-span-7">
            {industry.questions.map((question) => (
              <li key={question} className="flex gap-4 bg-white p-5 text-[17px] leading-relaxed text-navy-800 sm:p-6">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-signal-600" />
                {question}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="industry-services" className="bg-mist-50 py-16 sm:py-20">
        <div className="shell">
          <h2 id="industry-services" className="font-display text-[2rem] font-semibold leading-tight text-navy-900">
            Solutions that often connect
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  to={`/solutions/${service.slug}`}
                  className="group flex h-full flex-col rounded-[4px] border border-mist-300 bg-white p-5 transition-colors hover:border-signal-600"
                >
                  <span className="font-semibold text-navy-900 group-hover:text-signal-700">{service.navLabel}</span>
                  <span className="mt-2 text-sm leading-relaxed text-navy-500">{service.title}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-signal-700">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {guides.length > 0 && (
            <>
              <h2 className="mt-16 font-display text-[2rem] font-semibold leading-tight text-navy-900">Related planning guides</h2>
              <ul className="mt-8 grid gap-10 md:grid-cols-2">
                {guides.map((article) => (
                  <li key={article.slug}>
                    <ArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
