import { TopicPage } from '../components/topic/TopicPage';
import { CheckList, CtaBand, PageHero } from '../components/layout/PageParts';
import { ArrowRight } from '../components/ui/Icons';
import { Img } from '../components/ui/Img';
import { industriesSection } from '../content/en-global/home';
import { INDUSTRIES } from '../content/en-global/industries';
import { getIndustryTopic } from '../content/en-global/topics';
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

/** English industry topic pages (/industries/:slug) — full v2 template. */
export function IndustryPage({ slug }: { slug: string }) {
  const topic = getIndustryTopic(slug);
  return topic ? <TopicPage content={topic} /> : <NotFoundPage path={`/industries/${slug}`} />;
}
