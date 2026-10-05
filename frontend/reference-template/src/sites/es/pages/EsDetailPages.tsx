import { useMemo, useState } from 'react';
import { ArrowRight } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { siteConfig } from '../../../config/site';
import { getArticleEs, getPublishedArticlesEs, type ArticleEs } from '../../../content/es/articles';
import { ES_ANCHORS, industriesEs, resourcesEs } from '../../../content/es/home';
import { INDUSTRIES_ES, getIndustryEs, type IndustryContentEs } from '../../../content/es/industries';
import { SERVICES_ES, getServiceEs, type ServiceContentEs } from '../../../content/es/services';
import { getMedia } from '../../../content/media';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { cn } from '../../../utils/cn';
import { EsArticleCard, EsArticleMeta, EsBreadcrumbs, EsCheckList, EsCtaBand, EsPageHero, EsScopeNote } from '../components/EsParts';
import { EsNotFoundPage } from './EsCompanyPages';

const ES = { ogLocale: 'es_ES' };

/* ------------------------------------------------------------------ Soluciones */
export function EsServicePage({ slug }: { slug: string }) {
  const service = getServiceEs(slug);
  return service ? <ServiceDetail service={service} /> : <EsNotFoundPage path={`/es/soluciones/${slug}`} />;
}

function ServiceDetail({ service }: { service: ServiceContentEs }) {
  useDocumentMeta({ title: `${service.navLabel} | FreightVanta`, description: truncate(`${service.title} ${service.copy}`), path: `/es/soluciones/${service.slug}`, ...ES });
  const guides = service.relatedGuides.map(getArticleEs).filter((a): a is ArticleEs => a !== null);
  const others = SERVICES_ES.filter((item) => item.slug !== service.slug);
  const startPlan = () => {
    if (service.startingPoint) setPrefill(service.startingPoint);
  };

  return (
    <>
      <EsPageHero
        breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Soluciones', to: ES_ANCHORS.services }, { label: service.navLabel }]}
        eyebrow="Soluciones"
        title={service.navLabel}
        lead={service.title}
        body={service.copy}
        media={getMedia(service.mediaId)}
        mediaAlt={service.mediaAlt}
        actions={
          <>
            <Link to={ES_ANCHORS.enquiry} onClick={startPlan} className="es-btn es-btn-primary w-full sm:w-auto">
              Solicitar plan de envío
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={ES_ANCHORS.services} className="es-btn es-btn-outline w-full sm:w-auto">
              Comparar recorridos de servicio
            </Link>
          </>
        }
      />

      <section aria-labelledby="es-service-scope" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="es-service-scope" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
              Qué cubre este recorrido
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-arena-100 px-3 py-1.5 text-[13px] font-semibold text-carbon-800">
                  {tag}
                </li>
              ))}
            </ul>
            {service.scopeNote && (
              <div className="mt-8">
                <EsScopeNote>{service.scopeNote}</EsScopeNote>
              </div>
            )}
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:gap-10">
            <div className="border-t-[3px] border-pino-900 pt-6">
              <h3 className="font-es text-2xl font-extrabold tracking-[-0.015em] text-carbon-900">Qué compartir para empezar</h3>
              <EsCheckList items={service.share} className="mt-5" />
            </div>
            <div className="border-t-[3px] border-albero-400 pt-6">
              <h3 className="font-es text-2xl font-extrabold tracking-[-0.015em] text-carbon-900">Qué aclara el plan de envío</h3>
              <EsCheckList items={service.clarify} className="mt-5" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="es-service-guides" className="bg-arena-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="es-service-guides" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
                Guías relacionadas
              </h2>
              <Link to="/es/guias" className="es-link">
                Ver todas las guías
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {guides.map((article) => (
                <li key={article.slug}>
                  <EsArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="es-service-others" className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="es-service-others" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
            Soluciones relacionadas
          </h2>
          <ul className="mt-8 grid border-t-2 border-carbon-900 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-carbon-900/10">
                <Link to={`/es/soluciones/${item.slug}`} className="group flex h-full items-start justify-between gap-4 py-5 pr-4 transition-colors hover:text-mar-700">
                  <span>
                    <span className="block font-extrabold tracking-[-0.01em] text-carbon-900 group-hover:text-mar-700">{item.navLabel}</span>
                    <span className="mt-1 block text-sm text-carbon-600">{item.menuLine}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-mar-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EsCtaBand startingPoint={service.startingPoint} />
    </>
  );
}

/* ------------------------------------------------------------------ Sectores */
export function EsIndustriesPage() {
  useDocumentMeta({ title: 'Soluciones por sector | FreightVanta', description: truncate(`${industriesEs.title} ${industriesEs.body}`), path: '/es/sectores', ...ES });
  return (
    <>
      <EsPageHero breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Sectores' }]} eyebrow="Sectores" title="Soluciones por sector" lead={industriesEs.title} body={industriesEs.body} />
      <section aria-label="Sectores" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell space-y-16 lg:space-y-24">
          {INDUSTRIES_ES.map((industry, index) => (
            <article key={industry.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn('lg:col-span-6', index % 2 === 1 && 'lg:order-2')}>
                <div className="es-block-shadow mb-[14px] mr-[14px] overflow-hidden bg-pino-900">
                  <Img media={getMedia(industry.mediaId)} alt={industry.mediaAlt} sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[3/2] w-full object-cover" />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="es-eyebrow text-mar-700">{industry.menuLine}</p>
                <h2 className="mt-4 font-es text-[2.2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">{industry.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-carbon-600">{industry.copy}</p>
                <EsCheckList items={industry.questions.slice(0, 2)} className="mt-6" />
                <Link to={`/es/sectores/${industry.slug}`} className="es-btn es-btn-dark mt-8 w-full sm:w-auto">
                  Ver {industry.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <EsCtaBand />
    </>
  );
}

export function EsIndustryPage({ slug }: { slug: string }) {
  const industry = getIndustryEs(slug);
  return industry ? <IndustryDetail industry={industry} /> : <EsNotFoundPage path={`/es/sectores/${slug}`} />;
}

function IndustryDetail({ industry }: { industry: IndustryContentEs }) {
  useDocumentMeta({ title: `${industry.navLabel} | FreightVanta`, description: truncate(industry.copy), path: `/es/sectores/${industry.slug}`, ...ES });
  const services = industry.relatedServices.map(getServiceEs).filter((s): s is ServiceContentEs => s !== null);
  const guides = industry.relatedGuides.map(getArticleEs).filter((a): a is ArticleEs => a !== null);

  return (
    <>
      <EsPageHero
        breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Sectores', to: '/es/sectores' }, { label: industry.navLabel }]}
        eyebrow="Soluciones por sector"
        title={industry.navLabel}
        lead={industry.copy}
        media={getMedia(industry.mediaId)}
        mediaAlt={industry.mediaAlt}
        actions={
          <>
            <Link to={ES_ANCHORS.enquiry} className="es-btn es-btn-primary w-full sm:w-auto">
              Solicitar plan de envío
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/es/sectores" className="es-btn es-btn-outline w-full sm:w-auto">
              Todas las soluciones por sector
            </Link>
          </>
        }
      />
      <section aria-labelledby="es-industry-questions" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="es-industry-questions" className="font-es text-[2.2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
              Las preguntas que el plan resuelve primero
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-carbon-600">El trabajo empieza por la restricción que más importa a su operación. Estas son las preguntas que aclaramos antes de mover la mercancía.</p>
          </div>
          <ol className="grid gap-3 lg:col-span-7">
            {industry.questions.map((question, index) => (
              <li key={question} className="flex gap-4 rounded-lg bg-arena-50 p-5 text-[17px] leading-relaxed text-carbon-800 ring-1 ring-carbon-900/5 sm:p-6">
                <span aria-hidden="true" className="font-es text-lg font-extrabold text-almagre-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {question}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="es-industry-services" className="bg-arena-50 py-16 sm:py-20">
        <div className="shell">
          <h2 id="es-industry-services" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
            Soluciones que suelen combinarse
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/es/soluciones/${service.slug}`} className="group flex h-full flex-col rounded-lg border-2 border-carbon-900/10 bg-white p-5 transition-colors hover:border-mar-700">
                  <span className="font-extrabold tracking-[-0.01em] text-carbon-900 group-hover:text-mar-700">{service.navLabel}</span>
                  <span className="mt-2 text-sm leading-relaxed text-carbon-600">{service.title}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-mar-700">
                    Ver
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {guides.length > 0 && (
            <>
              <h2 className="mt-16 font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">Guías relacionadas</h2>
              <ul className="mt-8 grid gap-10 md:grid-cols-2">
                {guides.map((article) => (
                  <li key={article.slug}>
                    <EsArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
      <EsCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Guías */
export function EsGuidesPage() {
  useDocumentMeta({ title: 'Guías y recursos de planificación | FreightVanta', description: truncate(resourcesEs.body), path: '/es/guias', ...ES });
  const articles = getPublishedArticlesEs();
  const categories = useMemo(() => Array.from(new Set(articles.map((article) => article.category))), [articles]);
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const [lead, ...rest] = visible;

  return (
    <>
      <EsPageHero breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Guías' }]} eyebrow={resourcesEs.eyebrow} title={resourcesEs.title} body={resourcesEs.body} />
      <section aria-label="Guías" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 border-b-2 border-carbon-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filtrar las guías por tema" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => {
                const pressed = category === item;
                return (
                  <button
                    key={item ?? 'todas'}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-h-10 rounded-md border-2 px-3.5 py-2 text-sm font-semibold transition-colors',
                      pressed ? 'border-pino-900 bg-pino-900 text-white' : 'border-carbon-900/10 text-carbon-700 hover:border-pino-900 hover:text-pino-900',
                    )}
                  >
                    {item ?? 'Todos los temas'}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm font-semibold text-carbon-600">
              {visible.length} {visible.length === 1 ? 'guía' : 'guías'}
            </p>
          </div>

          {lead ? (
            <>
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <EsArticleCard article={lead} variant="feature" headingLevel={2} />
                </div>
                <div className="lg:col-span-4">
                  <div className="rounded-lg bg-pino-900 p-7 text-white">
                    <p className="es-eyebrow text-albero-300">¿Prepara un envío?</p>
                    <p className="mt-4 font-es text-2xl font-extrabold leading-snug tracking-[-0.015em]">Convierta lo que acaba de leer en un plan con el que su equipo pueda trabajar.</p>
                    <Link to={ES_ANCHORS.enquiry} className="es-btn es-btn-primary mt-6 w-full">
                      Solicitar plan de envío
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <EsArticleCard article={article} variant="grid" headingLevel={2} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-12 rounded-lg bg-arena-50 p-8 text-carbon-700">Todavía no hay guías publicadas sobre este tema. Elija otro tema.</p>
          )}
        </div>
      </section>
      <EsCtaBand />
    </>
  );
}

export function EsArticlePage({ slug }: { slug: string }) {
  const article = getArticleEs(slug);
  return article ? <ArticleDetail article={article} /> : <EsNotFoundPage path={`/es/guias/${slug}`} />;
}

function ArticleDetail({ article }: { article: ArticleEs }) {
  useDocumentMeta({ title: `${article.title} | FreightVanta`, description: truncate(article.excerpt), path: `/es/guias/${article.slug}`, ...ES });
  useJsonLd('fv-es-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    inLanguage: 'es-ES',
    publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${siteConfig.siteUrl}/` },
    mainEntityOfPage: `${siteConfig.siteUrl}/es/guias/${article.slug}`,
  });
  const services = article.relatedServices.map(getServiceEs).filter((s): s is ServiceContentEs => s !== null);
  const related = getPublishedArticlesEs().filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-arena-50 pb-40 pt-8 text-carbon-900 sm:pb-48 sm:pt-10">
        <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/2 [mask-image:linear-gradient(to_left,#000,transparent)]" />
        <div className="shell">
          <EsBreadcrumbs items={[{ label: 'Inicio', to: '/es/' }, { label: 'Guías', to: '/es/guias' }, { label: article.category }]} />
          <div className="mt-8 max-w-3xl">
            <EsArticleMeta article={article} />
            <h1 className="mt-5 font-es text-[2.35rem] font-extrabold leading-[1.04] tracking-[-0.025em] text-balance sm:text-5xl lg:text-[3.25rem]">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-carbon-600 sm:text-xl">{article.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="es-block-shadow -mt-32 mb-[14px] mr-[14px] overflow-hidden bg-pino-900 sm:-mt-40">
          {article.coverId && <Img media={getMedia(article.coverId)} alt={article.coverAlt} priority sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]" />}
        </div>

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="es-prose space-y-12 lg:col-span-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, index) => {
                    if (block.type === 'p')
                      return (
                        <p key={index} className="text-[18px] leading-[1.75] text-carbon-700">
                          {block.text}
                        </p>
                      );
                    if (block.type === 'note')
                      return (
                        <p key={index} className="rounded-lg border-l-4 border-mar-700 bg-mar-100 px-5 py-4 text-[16px] leading-relaxed text-carbon-800">
                          {block.text}
                        </p>
                      );
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-carbon-700">
                            <span aria-hidden="true" className="mt-[0.65rem] h-2 w-2 shrink-0 rotate-45 bg-albero-400" />
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
              <div className="rounded-lg bg-pino-900 p-7 text-white">
                <p className="es-eyebrow text-albero-300">Solicitar plan de envío</p>
                <p className="mt-4 font-es text-2xl font-extrabold leading-snug tracking-[-0.015em]">¿Prepara un envío como este?</p>
                <p className="mt-3 text-[15px] leading-relaxed text-pino-200">Un enlace de producto, un resumen del envío o la ruta que quiere planificar bastan para empezar.</p>
                <Link to={ES_ANCHORS.enquiry} className="es-btn es-btn-primary mt-6 w-full">
                  Solicitar plan de envío
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {services.length > 0 && (
                <div>
                  <h2 className="es-eyebrow text-carbon-600">Soluciones relacionadas</h2>
                  <ul className="mt-3 border-t-2 border-carbon-900">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-carbon-900/10">
                        <Link to={`/es/soluciones/${service.slug}`} className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-carbon-900 hover:text-mar-700">
                          {service.navLabel}
                          <ArrowRight className="h-4 w-4 text-mar-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
        <section aria-labelledby="es-related-guides" className="bg-arena-50 py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="es-related-guides" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
                Seguir leyendo
              </h2>
              <Link to="/es/guias" className="es-link">
                Ver todas las guías
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <EsArticleCard article={item} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <EsCtaBand />
    </article>
  );
}
