import { useMemo, useState } from 'react';
import { ArrowRight } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { siteConfig } from '../../../config/site';
import { getArticleIt, getPublishedArticlesIt, type ArticleIt } from '../../../content/it/articles';
import { IT_ANCHORS, industriesIt, resourcesIt } from '../../../content/it/home';
import { INDUSTRIES_IT, getIndustryIt, type IndustryContentIt } from '../../../content/it/industries';
import { SERVICES_IT, getServiceIt, type ServiceContentIt } from '../../../content/it/services';
import { getMedia } from '../../../content/media';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { cn } from '../../../utils/cn';
import { ItArticleCard, ItArticleMeta, ItBreadcrumbs, ItCheckList, ItCtaBand, ItPageHero, ItScopeNote } from '../components/ItParts';
import { ItNotFoundPage } from './ItCompanyPages';

const IT = { ogLocale: 'it_IT' };

/* ------------------------------------------------------------------ Servizi */
export function ItServicePage({ slug }: { slug: string }) {
  const service = getServiceIt(slug);
  return service ? <ServiceDetail service={service} /> : <ItNotFoundPage path={`/it/servizi/${slug}`} />;
}

function ServiceDetail({ service }: { service: ServiceContentIt }) {
  useDocumentMeta({ title: `${service.navLabel} | FreightVanta`, description: truncate(`${service.title} ${service.copy}`), path: `/it/servizi/${service.slug}`, ...IT });
  const guides = service.relatedGuides.map(getArticleIt).filter((a): a is ArticleIt => a !== null);
  const others = SERVICES_IT.filter((item) => item.slug !== service.slug);
  const startPlan = () => {
    if (service.startingPoint) setPrefill(service.startingPoint);
  };

  return (
    <>
      <ItPageHero
        breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Servizi', to: IT_ANCHORS.services }, { label: service.navLabel }]}
        eyebrow="Servizi"
        title={service.navLabel}
        lead={service.title}
        body={service.copy}
        media={getMedia(service.mediaId)}
        mediaAlt={service.mediaAlt}
        actions={
          <>
            <Link to={IT_ANCHORS.enquiry} onClick={startPlan} className="it-btn it-btn-primary w-full sm:w-auto">
              Richiedi un piano di spedizione
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={IT_ANCHORS.services} className="it-btn it-btn-outline w-full sm:w-auto">
              Confronta i percorsi di servizio
            </Link>
          </>
        }
      />

      <section aria-labelledby="it-service-scope" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="it-service-scope" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
              Che cosa copre questo percorso
            </h2>
            <ul className="mt-6 border-t border-grafite-200">
              {service.tags.map((tag) => (
                <li key={tag} className="border-b border-grafite-200 py-2.5 text-[15px] font-semibold text-grafite-800">
                  {tag}
                </li>
              ))}
            </ul>
            {service.scopeNote && (
              <div className="mt-8">
                <ItScopeNote>{service.scopeNote}</ItScopeNote>
              </div>
            )}
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:gap-10">
            <div className="border-t-2 border-grafite-900 pt-6">
              <h3 className="font-it-display text-2xl font-semibold text-grafite-900">Che cosa condividere per iniziare</h3>
              <ItCheckList items={service.share} className="mt-5" />
            </div>
            <div className="border-t-2 border-rosso-600 pt-6">
              <h3 className="font-it-display text-2xl font-semibold text-grafite-900">Che cosa chiarisce il piano</h3>
              <ItCheckList items={service.clarify} className="mt-5" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="it-service-guides" className="border-t border-grafite-900 bg-nebbia-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="it-service-guides" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
                Guide collegate
              </h2>
              <Link to="/it/guide" className="it-link">
                Vedi tutte le guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {guides.map((article) => (
                <li key={article.slug}>
                  <ItArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="it-service-others" className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="it-service-others" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
            Servizi collegati
          </h2>
          <ul className="mt-8 grid border-t-2 border-grafite-900 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-grafite-200">
                <Link to={`/it/servizi/${item.slug}`} className="group flex h-full items-start justify-between gap-4 py-5 pr-4 transition-colors hover:text-ottanio-700">
                  <span>
                    <span className="block font-it-display text-[1.1rem] font-semibold text-grafite-900 group-hover:text-ottanio-700">{item.navLabel}</span>
                    <span className="mt-1 block text-sm text-grafite-500">{item.menuLine}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ottanio-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ItCtaBand startingPoint={service.startingPoint} />
    </>
  );
}

/* ------------------------------------------------------------------ Settori */
export function ItIndustriesPage() {
  useDocumentMeta({ title: 'Soluzioni per settore | FreightVanta', description: truncate(`${industriesIt.title} ${industriesIt.body}`), path: '/it/settori', ...IT });
  return (
    <>
      <ItPageHero breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Settori' }]} eyebrow="Settori" title="Soluzioni per settore" lead={industriesIt.title} body={industriesIt.body} />
      <section aria-label="Settori" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell space-y-16 lg:space-y-24">
          {INDUSTRIES_IT.map((industry, index) => (
            <article key={industry.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn('lg:col-span-6', index % 2 === 1 && 'lg:order-2')}>
                <div className="border border-grafite-900 bg-nebbia-100 p-2">
                  <Img media={getMedia(industry.mediaId)} alt={industry.mediaAlt} sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[3/2] w-full object-cover" />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="it-eyebrow text-ottanio-700">{industry.menuLine}</p>
                <h2 className="mt-4 font-it-display text-[2.2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">{industry.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-grafite-600">{industry.copy}</p>
                <ItCheckList items={industry.questions.slice(0, 2)} className="mt-6" />
                <Link to={`/it/settori/${industry.slug}`} className="it-btn it-btn-dark mt-8 w-full sm:w-auto">
                  Vai a {industry.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ItCtaBand />
    </>
  );
}

export function ItIndustryPage({ slug }: { slug: string }) {
  const industry = getIndustryIt(slug);
  return industry ? <IndustryDetail industry={industry} /> : <ItNotFoundPage path={`/it/settori/${slug}`} />;
}

function IndustryDetail({ industry }: { industry: IndustryContentIt }) {
  useDocumentMeta({ title: `${industry.navLabel} | FreightVanta`, description: truncate(industry.copy), path: `/it/settori/${industry.slug}`, ...IT });
  const services = industry.relatedServices.map(getServiceIt).filter((s): s is ServiceContentIt => s !== null);
  const guides = industry.relatedGuides.map(getArticleIt).filter((a): a is ArticleIt => a !== null);

  return (
    <>
      <ItPageHero
        breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Settori', to: '/it/settori' }, { label: industry.navLabel }]}
        eyebrow="Soluzioni per settore"
        title={industry.navLabel}
        lead={industry.copy}
        media={getMedia(industry.mediaId)}
        mediaAlt={industry.mediaAlt}
        actions={
          <>
            <Link to={IT_ANCHORS.enquiry} className="it-btn it-btn-primary w-full sm:w-auto">
              Richiedi un piano di spedizione
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/it/settori" className="it-btn it-btn-outline w-full sm:w-auto">
              Tutte le soluzioni per settore
            </Link>
          </>
        }
      />
      <section aria-labelledby="it-industry-questions" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="it-industry-questions" className="font-it-display text-[2.2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
              Le domande a cui il piano risponde per prime
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-grafite-600">Il lavoro parte dal vincolo che conta di più per la sua operatività. Queste sono le domande che chiariamo prima di muovere la merce.</p>
          </div>
          <ol className="border-t-2 border-grafite-900 lg:col-span-7">
            {industry.questions.map((question, index) => (
              <li key={question} className="flex gap-4 border-b border-grafite-200 py-5 text-[17px] leading-relaxed text-grafite-800">
                <span aria-hidden="true" className="it-folio">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {question}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="it-industry-services" className="border-t border-grafite-900 bg-nebbia-50 py-16 sm:py-20">
        <div className="shell">
          <h2 id="it-industry-services" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
            Servizi che spesso si combinano
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/it/servizi/${service.slug}`} className="group flex h-full flex-col border border-grafite-900 bg-white p-5 transition-colors hover:bg-nebbia-100">
                  <span className="font-it-display text-[1.1rem] font-semibold text-grafite-900 group-hover:text-ottanio-700">{service.navLabel}</span>
                  <span className="mt-2 text-sm leading-relaxed text-grafite-500">{service.title}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ottanio-700">
                    Vedi
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {guides.length > 0 && (
            <>
              <h2 className="mt-16 font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">Guide collegate</h2>
              <ul className="mt-8 grid gap-10 md:grid-cols-2">
                {guides.map((article) => (
                  <li key={article.slug}>
                    <ItArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
      <ItCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Guide */
export function ItGuidesPage() {
  useDocumentMeta({ title: 'Guide e risorse di pianificazione | FreightVanta', description: truncate(resourcesIt.body), path: '/it/guide', ...IT });
  const articles = getPublishedArticlesIt();
  const categories = useMemo(() => Array.from(new Set(articles.map((article) => article.category))), [articles]);
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const [lead, ...rest] = visible;

  return (
    <>
      <ItPageHero breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Guide' }]} eyebrow={resourcesIt.eyebrow} title={resourcesIt.title} body={resourcesIt.body} />
      <section aria-label="Guide" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 border-b-2 border-grafite-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filtra le guide per argomento" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => {
                const pressed = category === item;
                return (
                  <button
                    key={item ?? 'tutte'}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-h-10 border px-3.5 py-2 text-sm font-semibold transition-colors',
                      pressed ? 'border-grafite-900 bg-grafite-900 text-white' : 'border-grafite-200 text-grafite-700 hover:border-grafite-900 hover:text-grafite-900',
                    )}
                  >
                    {item ?? 'Tutti gli argomenti'}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm font-semibold text-grafite-500">
              {visible.length} {visible.length === 1 ? 'guida' : 'guide'}
            </p>
          </div>

          {lead ? (
            <>
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <ItArticleCard article={lead} variant="feature" headingLevel={2} />
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-grafite-900 p-7 text-white">
                    <p className="it-eyebrow text-ottanio-300">Sta preparando una spedizione?</p>
                    <p className="mt-4 font-it-display text-2xl font-semibold leading-snug">Trasformi quello che ha appena letto in un piano con cui il suo team può lavorare.</p>
                    <Link to={IT_ANCHORS.enquiry} className="it-btn it-btn-primary mt-6 w-full">
                      Richiedi un piano di spedizione
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <ItArticleCard article={article} variant="grid" headingLevel={2} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-12 border border-dashed border-grafite-300 p-8 text-grafite-600">Non ci sono ancora guide pubblicate su questo argomento. Scelga un altro argomento.</p>
          )}
        </div>
      </section>
      <ItCtaBand />
    </>
  );
}

export function ItArticlePage({ slug }: { slug: string }) {
  const article = getArticleIt(slug);
  return article ? <ArticleDetail article={article} /> : <ItNotFoundPage path={`/it/guide/${slug}`} />;
}

function ArticleDetail({ article }: { article: ArticleIt }) {
  useDocumentMeta({ title: `${article.title} | FreightVanta`, description: truncate(article.excerpt), path: `/it/guide/${article.slug}`, ...IT });
  useJsonLd('fv-it-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    inLanguage: 'it-IT',
    publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${siteConfig.siteUrl}/` },
    mainEntityOfPage: `${siteConfig.siteUrl}/it/guide/${article.slug}`,
  });
  const services = article.relatedServices.map(getServiceIt).filter((s): s is ServiceContentIt => s !== null);
  const related = getPublishedArticlesIt().filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <article>
      <header className="border-b border-grafite-900 bg-white pb-12 pt-8 text-grafite-900 sm:pt-10">
        <div className="shell">
          <ItBreadcrumbs items={[{ label: 'Home', to: '/it/' }, { label: 'Guide', to: '/it/guide' }, { label: article.category }]} />
          <div className="mt-8 max-w-3xl">
            <ItArticleMeta article={article} />
            <h1 className="mt-5 font-it-display text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.02em] text-balance sm:text-5xl lg:text-[3.4rem]">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-grafite-600 sm:text-xl">{article.excerpt}</p>
          </div>
        </div>
      </header>

      {article.coverId && (
        <div className="border-b border-grafite-900">
          <Img media={getMedia(article.coverId)} alt={article.coverAlt} priority sizes="100vw" className="aspect-[16/9] w-full object-cover lg:aspect-[3/1]" />
        </div>
      )}

      <div className="shell">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="it-prose space-y-12 lg:col-span-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, index) => {
                    if (block.type === 'p')
                      return (
                        <p key={index} className="text-[18px] leading-[1.75] text-grafite-700">
                          {block.text}
                        </p>
                      );
                    if (block.type === 'note')
                      return (
                        <p key={index} className="border-l-2 border-ottanio-700 bg-ottanio-100 px-5 py-4 text-[16px] leading-relaxed text-grafite-800">
                          {block.text}
                        </p>
                      );
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-grafite-700">
                            <span aria-hidden="true" className="mt-[0.7rem] h-px w-4 shrink-0 bg-rosso-600" />
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
              <div className="bg-grafite-900 p-7 text-white">
                <p className="it-eyebrow text-ottanio-300">Richiedi un piano</p>
                <p className="mt-4 font-it-display text-2xl font-semibold leading-snug">Sta preparando una spedizione come questa?</p>
                <p className="mt-3 text-[15px] leading-relaxed text-grafite-300">Un link al prodotto, una descrizione della spedizione o la rotta da pianificare bastano per iniziare.</p>
                <Link to={IT_ANCHORS.enquiry} className="it-btn it-btn-primary mt-6 w-full">
                  Richiedi un piano di spedizione
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {services.length > 0 && (
                <div>
                  <h2 className="it-eyebrow text-grafite-500">Servizi collegati</h2>
                  <ul className="mt-3 border-t-2 border-grafite-900">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-grafite-200">
                        <Link to={`/it/servizi/${service.slug}`} className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-grafite-900 hover:text-ottanio-700">
                          {service.navLabel}
                          <ArrowRight className="h-4 w-4 text-ottanio-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
        <section aria-labelledby="it-related-guides" className="border-t border-grafite-900 bg-nebbia-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="it-related-guides" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
                Continua a leggere
              </h2>
              <Link to="/it/guide" className="it-link">
                Vedi tutte le guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <ItArticleCard article={item} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <ItCtaBand />
    </article>
  );
}
