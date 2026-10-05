import { useMemo, useState } from 'react';
import { ArrowRight } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { siteConfig } from '../../../config/site';
import { getArticleDe, getPublishedArticlesDe, type ArticleDe } from '../../../content/de/articles';
import { DE_ANCHORS, industriesDe, resourcesDe } from '../../../content/de/home';
import { INDUSTRIES_DE, getIndustryDe, type IndustryContentDe } from '../../../content/de/industries';
import { SERVICES_DE, getServiceDe, type ServiceContentDe } from '../../../content/de/services';
import { getMedia } from '../../../content/media';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { cn } from '../../../utils/cn';
import { DeArticleCard, DeArticleMeta, DeBreadcrumbs, DeCheckList, DeCtaBand, DePageHero, DeScopeNote } from '../components/DeParts';
import { DeNotFoundPage } from './DeCompanyPages';

const DE = { ogLocale: 'de_DE' };

/* ------------------------------------------------------------------ Leistungen */
export function DeServicePage({ slug }: { slug: string }) {
  const service = getServiceDe(slug);
  return service ? <ServiceDetail service={service} /> : <DeNotFoundPage path={`/de/loesungen/${slug}`} />;
}

function ServiceDetail({ service }: { service: ServiceContentDe }) {
  useDocumentMeta({
    title: `${service.navLabel} | FreightVanta`,
    description: truncate(`${service.title} ${service.copy}`),
    path: `/de/loesungen/${service.slug}`,
    ...DE,
  });
  const guides = service.relatedGuides.map(getArticleDe).filter((a): a is ArticleDe => a !== null);
  const others = SERVICES_DE.filter((item) => item.slug !== service.slug);
  const startPlan = () => {
    if (service.startingPoint) setPrefill(service.startingPoint);
  };

  return (
    <>
      <DePageHero
        breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Leistungen', to: DE_ANCHORS.services }, { label: service.navLabel }]}
        eyebrow="Leistungen"
        title={service.navLabel}
        lead={service.title}
        body={service.copy}
        media={getMedia(service.mediaId)}
        mediaAlt={service.mediaAlt}
        actions={
          <>
            <Link to={DE_ANCHORS.enquiry} onClick={startPlan} className="de-btn de-btn-primary w-full sm:w-auto">
              Sendungsplan anfragen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={DE_ANCHORS.services} className="de-btn de-btn-outline w-full sm:w-auto">
              Leistungspfade vergleichen
            </Link>
          </>
        }
      />

      <section aria-labelledby="de-service-scope" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="de-service-scope" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
              Was dieser Leistungspfad umfasst
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li key={tag} className="border border-anthrazit-300 px-3 py-1.5 text-[13px] font-medium text-anthrazit-700">
                  {tag}
                </li>
              ))}
            </ul>
            {service.scopeNote && (
              <div className="mt-8">
                <DeScopeNote>{service.scopeNote}</DeScopeNote>
              </div>
            )}
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:gap-10">
            <div className="border-t-2 border-anthrazit-900 pt-6">
              <h3 className="font-de-display text-2xl font-bold text-anthrazit-900">Was Sie zum Start teilen</h3>
              <DeCheckList items={service.share} className="mt-5" />
            </div>
            <div className="border-t-2 border-enzian-700 pt-6">
              <h3 className="font-de-display text-2xl font-bold text-anthrazit-900">Was der Sendungsplan klärt</h3>
              <DeCheckList items={service.clarify} className="mt-5" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="de-service-guides" className="border-t border-anthrazit-900/15 bg-papier py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="de-service-guides" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
                Passende Ratgeber
              </h2>
              <Link to="/de/ratgeber" className="de-link">
                Zum Ratgeber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {guides.map((article) => (
                <li key={article.slug}>
                  <DeArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="de-service-others" className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="de-service-others" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
            Verbundene Leistungen
          </h2>
          <ul className="mt-8 grid border-t border-anthrazit-900 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-anthrazit-900/15">
                <Link to={`/de/loesungen/${item.slug}`} className="group flex h-full items-start justify-between gap-4 py-5 pr-4 transition-colors hover:text-enzian-700">
                  <span>
                    <span className="block font-semibold text-anthrazit-900 group-hover:text-enzian-700">{item.navLabel}</span>
                    <span className="mt-1 block text-sm text-anthrazit-500">{item.menuLine}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-enzian-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DeCtaBand startingPoint={service.startingPoint} />
    </>
  );
}

/* ------------------------------------------------------------------ Branchen */
export function DeIndustriesPage() {
  useDocumentMeta({
    title: 'Branchenlösungen | FreightVanta',
    description: truncate(`${industriesDe.title} ${industriesDe.body}`),
    path: '/de/branchen',
    ...DE,
  });
  return (
    <>
      <DePageHero breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Branchen' }]} eyebrow="Branchen" title="Branchenlösungen" lead={industriesDe.title} body={industriesDe.body} />
      <section aria-label="Branchen" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell space-y-16 lg:space-y-24">
          {INDUSTRIES_DE.map((industry, index) => (
            <article key={industry.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn('lg:col-span-6', index % 2 === 1 && 'lg:order-2')}>
                <div className="overflow-hidden border border-anthrazit-900 bg-kiesel-100">
                  <Img media={getMedia(industry.mediaId)} alt={industry.mediaAlt} sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[3/2] w-full object-cover" />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="de-eyebrow text-enzian-700">{industry.menuLine}</p>
                <h2 className="mt-4 font-de-display text-[2.2rem] font-bold leading-tight text-anthrazit-900">{industry.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-anthrazit-600">{industry.copy}</p>
                <DeCheckList items={industry.questions.slice(0, 2)} className="mt-6" />
                <Link to={`/de/branchen/${industry.slug}`} className="de-btn de-btn-dark mt-8 w-full sm:w-auto">
                  Zur Seite {industry.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <DeCtaBand />
    </>
  );
}

export function DeIndustryPage({ slug }: { slug: string }) {
  const industry = getIndustryDe(slug);
  return industry ? <IndustryDetail industry={industry} /> : <DeNotFoundPage path={`/de/branchen/${slug}`} />;
}

function IndustryDetail({ industry }: { industry: IndustryContentDe }) {
  useDocumentMeta({ title: `${industry.navLabel} | FreightVanta`, description: truncate(industry.copy), path: `/de/branchen/${industry.slug}`, ...DE });
  const services = industry.relatedServices.map(getServiceDe).filter((s): s is ServiceContentDe => s !== null);
  const guides = industry.relatedGuides.map(getArticleDe).filter((a): a is ArticleDe => a !== null);

  return (
    <>
      <DePageHero
        breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Branchen', to: '/de/branchen' }, { label: industry.navLabel }]}
        eyebrow="Branchenlösungen"
        title={industry.navLabel}
        lead={industry.copy}
        media={getMedia(industry.mediaId)}
        mediaAlt={industry.mediaAlt}
        actions={
          <>
            <Link to={DE_ANCHORS.enquiry} className="de-btn de-btn-primary w-full sm:w-auto">
              Sendungsplan anfragen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/de/branchen" className="de-btn de-btn-outline w-full sm:w-auto">
              Alle Branchenlösungen
            </Link>
          </>
        }
      />
      <section aria-labelledby="de-industry-questions" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="de-industry-questions" className="font-de-display text-[2.2rem] font-bold leading-tight text-anthrazit-900">
              Fragen, die der Plan zuerst beantwortet
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-anthrazit-600">
              Die Arbeit beginnt bei der Anforderung, die für Ihren Betrieb am meisten zählt. Diese Fragen klären wir, bevor Ware bewegt wird.
            </p>
          </div>
          <ol className="grid gap-px border border-anthrazit-900 bg-anthrazit-900/15 lg:col-span-7">
            {industry.questions.map((question) => (
              <li key={question} className="flex gap-4 bg-white p-5 text-[17px] leading-relaxed text-anthrazit-800 sm:p-6">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-enzian-700" />
                {question}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="de-industry-services" className="border-t border-anthrazit-900/15 bg-papier py-16 sm:py-20">
        <div className="shell">
          <h2 id="de-industry-services" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
            Leistungen, die häufig zusammenspielen
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/de/loesungen/${service.slug}`} className="group flex h-full flex-col border border-anthrazit-300 bg-white p-5 transition-colors hover:border-enzian-700">
                  <span className="font-semibold text-anthrazit-900 group-hover:text-enzian-700">{service.navLabel}</span>
                  <span className="mt-2 text-sm leading-relaxed text-anthrazit-500">{service.title}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-enzian-700">
                    Ansehen
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {guides.length > 0 && (
            <>
              <h2 className="mt-16 font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">Passende Ratgeber</h2>
              <ul className="mt-8 grid gap-10 md:grid-cols-2">
                {guides.map((article) => (
                  <li key={article.slug}>
                    <DeArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
      <DeCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Ratgeber */
export function DeGuidesPage() {
  useDocumentMeta({ title: 'Ratgeber & Planungswissen | FreightVanta', description: truncate(resourcesDe.body), path: '/de/ratgeber', ...DE });
  const articles = getPublishedArticlesDe();
  const categories = useMemo(() => Array.from(new Set(articles.map((article) => article.category))), [articles]);
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const [lead, ...rest] = visible;

  return (
    <>
      <DePageHero breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Ratgeber' }]} eyebrow={resourcesDe.eyebrow} title={resourcesDe.title} body={resourcesDe.body} />
      <section aria-label="Ratgeber" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 border-b border-anthrazit-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Ratgeber nach Thema filtern" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => {
                const pressed = category === item;
                return (
                  <button
                    key={item ?? 'alle'}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-h-10 border px-3.5 py-2 text-sm font-medium transition-colors',
                      pressed ? 'border-enzian-700 bg-enzian-700 text-white' : 'border-anthrazit-300 text-anthrazit-700 hover:border-anthrazit-900 hover:text-anthrazit-900',
                    )}
                  >
                    {item ?? 'Alle Themen'}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm text-anthrazit-500">
              {visible.length} {visible.length === 1 ? 'Beitrag' : 'Beiträge'}
            </p>
          </div>

          {lead ? (
            <>
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <DeArticleCard article={lead} variant="feature" headingLevel={2} />
                </div>
                <div className="lg:col-span-4">
                  <div className="border border-anthrazit-900 bg-anthrazit-900 p-7 text-white">
                    <p className="de-eyebrow text-enzian-300">Sendung in Planung?</p>
                    <p className="mt-4 font-de-display text-2xl font-bold leading-snug">Machen Sie aus dem Gelesenen einen Plan, mit dem Ihr Team arbeiten kann.</p>
                    <Link to={DE_ANCHORS.enquiry} className="de-btn de-btn-primary mt-6 w-full">
                      Sendungsplan anfragen
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <DeArticleCard article={article} variant="grid" headingLevel={2} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-12 border border-dashed border-anthrazit-300 p-8 text-anthrazit-600">Zu diesem Thema gibt es noch keine veröffentlichten Beiträge. Wählen Sie ein anderes Thema.</p>
          )}
        </div>
      </section>
      <DeCtaBand />
    </>
  );
}

export function DeArticlePage({ slug }: { slug: string }) {
  const article = getArticleDe(slug);
  return article ? <ArticleDetail article={article} /> : <DeNotFoundPage path={`/de/ratgeber/${slug}`} />;
}

function ArticleDetail({ article }: { article: ArticleDe }) {
  useDocumentMeta({ title: `${article.title} | FreightVanta`, description: truncate(article.excerpt), path: `/de/ratgeber/${article.slug}`, ...DE });
  useJsonLd('fv-de-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    inLanguage: 'de-DE',
    publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${siteConfig.siteUrl}/` },
    mainEntityOfPage: `${siteConfig.siteUrl}/de/ratgeber/${article.slug}`,
  });
  const services = article.relatedServices.map(getServiceDe).filter((s): s is ServiceContentDe => s !== null);
  const related = getPublishedArticlesDe().filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <article>
      <header className="relative isolate overflow-hidden border-b border-anthrazit-900 bg-papier pb-40 pt-8 text-anthrazit-900 sm:pb-48 sm:pt-10">
        <div aria-hidden="true" className="de-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="shell">
          <DeBreadcrumbs items={[{ label: 'Startseite', to: '/de/' }, { label: 'Ratgeber', to: '/de/ratgeber' }, { label: article.category }]} />
          <div className="mt-8 max-w-3xl">
            <DeArticleMeta article={article} />
            <h1 className="mt-5 font-de-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.4rem]">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-anthrazit-600 sm:text-xl">{article.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="-mt-32 overflow-hidden border border-anthrazit-900 bg-anthrazit-900 shadow-[0_32px_64px_-32px_rgba(20,23,26,0.5)] sm:-mt-40">
          {article.coverId && (
            <Img media={getMedia(article.coverId)} alt={article.coverAlt} priority sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]" />
          )}
        </div>

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="de-prose space-y-12 lg:col-span-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, index) => {
                    if (block.type === 'p')
                      return (
                        <p key={index} className="text-[18px] leading-[1.75] text-anthrazit-700">
                          {block.text}
                        </p>
                      );
                    if (block.type === 'note')
                      return (
                        <p key={index} className="border border-anthrazit-900 border-l-4 border-l-enzian-700 bg-papier px-5 py-4 text-[16px] leading-relaxed text-anthrazit-700">
                          {block.text}
                        </p>
                      );
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-anthrazit-700">
                            <span aria-hidden="true" className="mt-[0.7rem] h-2 w-2 shrink-0 bg-enzian-700" />
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
              <div className="border border-anthrazit-900 bg-anthrazit-900 p-7 text-white">
                <p className="de-eyebrow text-enzian-300">Sendungsplan anfragen</p>
                <p className="mt-4 font-de-display text-2xl font-bold leading-snug">Planen Sie eine solche Sendung?</p>
                <p className="mt-3 text-[15px] leading-relaxed text-anthrazit-200">Ein Produktlink, ein Sendungsbriefing oder die zu planende Route genügt für den Anfang.</p>
                <Link to={DE_ANCHORS.enquiry} className="de-btn de-btn-primary mt-6 w-full">
                  Sendungsplan anfragen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {services.length > 0 && (
                <div>
                  <h2 className="de-eyebrow text-anthrazit-500">Passende Leistungen</h2>
                  <ul className="mt-3 border-t border-anthrazit-900">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-anthrazit-900/15">
                        <Link to={`/de/loesungen/${service.slug}`} className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-anthrazit-900 hover:text-enzian-700">
                          {service.navLabel}
                          <ArrowRight className="h-4 w-4 text-enzian-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
        <section aria-labelledby="de-related-guides" className="border-t border-anthrazit-900/15 bg-papier py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="de-related-guides" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
                Weiterlesen
              </h2>
              <Link to="/de/ratgeber" className="de-link">
                Zum Ratgeber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <DeArticleCard article={item} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <DeCtaBand />
    </article>
  );
}
