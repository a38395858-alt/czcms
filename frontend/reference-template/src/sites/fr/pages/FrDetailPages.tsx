import { useMemo, useState } from 'react';
import { ArrowRight } from '../../../components/ui/Icons';
import { Img } from '../../../components/ui/Img';
import { siteConfig } from '../../../config/site';
import { getArticleFr, getPublishedArticlesFr, type ArticleFr } from '../../../content/fr/articles';
import { FR_ANCHORS, industriesFr, resourcesFr } from '../../../content/fr/home';
import { INDUSTRIES_FR, getIndustryFr, type IndustryContentFr } from '../../../content/fr/industries';
import { SERVICES_FR, getServiceFr, type ServiceContentFr } from '../../../content/fr/services';
import { getMedia } from '../../../content/media';
import { setPrefill } from '../../../lib/enquiry';
import { Link } from '../../../lib/router';
import { truncate, useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { cn } from '../../../utils/cn';
import { FrArticleCard, FrArticleMeta, FrBreadcrumbs, FrCheckList, FrCtaBand, FrPageHero, FrScopeNote } from '../components/FrParts';
import { FrNotFoundPage } from './FrCompanyPages';

const FR = { ogLocale: 'fr_FR' };

/* ------------------------------------------------------------------ Solutions */
export function FrServicePage({ slug }: { slug: string }) {
  const service = getServiceFr(slug);
  return service ? <ServiceDetail service={service} /> : <FrNotFoundPage path={`/fr/solutions/${slug}`} />;
}

function ServiceDetail({ service }: { service: ServiceContentFr }) {
  useDocumentMeta({ title: `${service.navLabel} | FreightVanta`, description: truncate(`${service.title} ${service.copy}`), path: `/fr/solutions/${service.slug}`, ...FR });
  const guides = service.relatedGuides.map(getArticleFr).filter((a): a is ArticleFr => a !== null);
  const others = SERVICES_FR.filter((item) => item.slug !== service.slug);
  const startPlan = () => {
    if (service.startingPoint) setPrefill(service.startingPoint);
  };

  return (
    <>
      <FrPageHero
        breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'Solutions', to: FR_ANCHORS.services }, { label: service.navLabel }]}
        eyebrow="Solutions"
        title={service.navLabel}
        lead={service.title}
        body={service.copy}
        media={getMedia(service.mediaId)}
        mediaAlt={service.mediaAlt}
        actions={
          <>
            <Link to={FR_ANCHORS.enquiry} onClick={startPlan} className="fr-btn fr-btn-primary w-full sm:w-auto">
              Demander un plan d’expédition
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={FR_ANCHORS.services} className="fr-btn fr-btn-outline w-full sm:w-auto">
              Comparer les parcours de prestations
            </Link>
          </>
        }
      />

      <section aria-labelledby="fr-service-scope" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 id="fr-service-scope" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
              Ce que couvre ce parcours
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-lin-300 px-3 py-1.5 text-[13px] font-semibold text-encre-700">
                  {tag}
                </li>
              ))}
            </ul>
            {service.scopeNote && (
              <div className="mt-8">
                <FrScopeNote>{service.scopeNote}</FrScopeNote>
              </div>
            )}
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:gap-10">
            <div className="border-t-2 border-encre-900 pt-6">
              <h3 className="font-fr-serif text-2xl font-semibold text-encre-900">Ce que vous partagez pour commencer</h3>
              <FrCheckList items={service.share} className="mt-5" />
            </div>
            <div className="border-t-2 border-outremer-700 pt-6">
              <h3 className="font-fr-serif text-2xl font-semibold text-encre-900">Ce que le plan d’expédition clarifie</h3>
              <FrCheckList items={service.clarify} className="mt-5" />
            </div>
          </div>
        </div>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="fr-service-guides" className="border-t border-encre-900/10 bg-ivoire py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="fr-service-guides" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
                Guides associés
              </h2>
              <Link to="/fr/guides" className="fr-link">
                Consulter les guides
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {guides.map((article) => (
                <li key={article.slug}>
                  <FrArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="fr-service-others" className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="fr-service-others" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
            Solutions connexes
          </h2>
          <ul className="mt-8 grid border-t border-encre-900 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug} className="border-b border-encre-900/10">
                <Link to={`/fr/solutions/${item.slug}`} className="group flex h-full items-start justify-between gap-4 py-5 pr-4 transition-colors hover:text-outremer-700">
                  <span>
                    <span className="block font-fr-serif text-[1.1rem] font-semibold text-encre-900 group-hover:text-outremer-700">{item.navLabel}</span>
                    <span className="mt-1 block text-sm text-encre-500">{item.menuLine}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-outremer-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FrCtaBand startingPoint={service.startingPoint} />
    </>
  );
}

/* ------------------------------------------------------------------ Secteurs */
export function FrIndustriesPage() {
  useDocumentMeta({ title: 'Solutions par secteur | FreightVanta', description: truncate(`${industriesFr.title} ${industriesFr.body}`), path: '/fr/secteurs', ...FR });
  return (
    <>
      <FrPageHero breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'Secteurs' }]} eyebrow="Secteurs" title="Solutions par secteur" lead={industriesFr.title} body={industriesFr.body} />
      <section aria-label="Secteurs" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell space-y-16 lg:space-y-24">
          {INDUSTRIES_FR.map((industry, index) => (
            <article key={industry.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn('lg:col-span-6', index % 2 === 1 && 'lg:order-2')}>
                <div className="overflow-hidden rounded-[14px] bg-lin-100 ring-1 ring-encre-900/10">
                  <Img media={getMedia(industry.mediaId)} alt={industry.mediaAlt} sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[3/2] w-full object-cover" />
                </div>
              </div>
              <div className="lg:col-span-6">
                <p className="fr-eyebrow text-outremer-700">{industry.menuLine}</p>
                <h2 className="mt-4 font-fr-serif text-[2.2rem] font-semibold leading-tight text-encre-900">{industry.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-encre-600">{industry.copy}</p>
                <FrCheckList items={industry.questions.slice(0, 2)} className="mt-6" />
                <Link to={`/fr/secteurs/${industry.slug}`} className="fr-btn fr-btn-dark mt-8 w-full sm:w-auto">
                  Voir la page {industry.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <FrCtaBand />
    </>
  );
}

export function FrIndustryPage({ slug }: { slug: string }) {
  const industry = getIndustryFr(slug);
  return industry ? <IndustryDetail industry={industry} /> : <FrNotFoundPage path={`/fr/secteurs/${slug}`} />;
}

function IndustryDetail({ industry }: { industry: IndustryContentFr }) {
  useDocumentMeta({ title: `${industry.navLabel} | FreightVanta`, description: truncate(industry.copy), path: `/fr/secteurs/${industry.slug}`, ...FR });
  const services = industry.relatedServices.map(getServiceFr).filter((s): s is ServiceContentFr => s !== null);
  const guides = industry.relatedGuides.map(getArticleFr).filter((a): a is ArticleFr => a !== null);

  return (
    <>
      <FrPageHero
        breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'Secteurs', to: '/fr/secteurs' }, { label: industry.navLabel }]}
        eyebrow="Solutions par secteur"
        title={industry.navLabel}
        lead={industry.copy}
        media={getMedia(industry.mediaId)}
        mediaAlt={industry.mediaAlt}
        actions={
          <>
            <Link to={FR_ANCHORS.enquiry} className="fr-btn fr-btn-primary w-full sm:w-auto">
              Demander un plan d’expédition
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/fr/secteurs" className="fr-btn fr-btn-outline w-full sm:w-auto">
              Toutes les solutions par secteur
            </Link>
          </>
        }
      />
      <section aria-labelledby="fr-industry-questions" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="fr-industry-questions" className="font-fr-serif text-[2.2rem] font-semibold leading-tight text-encre-900">
              Les questions que le plan règle en premier
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-encre-600">Le travail commence par la contrainte qui compte le plus pour votre activité. Voici les questions que nous clarifions avant tout mouvement de marchandise.</p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-[12px] border border-lin-300 bg-lin-300 lg:col-span-7">
            {industry.questions.map((question) => (
              <li key={question} className="flex gap-4 bg-white p-5 text-[17px] leading-relaxed text-encre-800 sm:p-6">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-outremer-700" />
                {question}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="fr-industry-services" className="border-t border-encre-900/10 bg-ivoire py-16 sm:py-20">
        <div className="shell">
          <h2 id="fr-industry-services" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
            Des solutions qui se combinent souvent
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/fr/solutions/${service.slug}`} className="group flex h-full flex-col rounded-[12px] border border-lin-300 bg-white p-5 transition-colors hover:border-outremer-700">
                  <span className="font-fr-serif text-[1.1rem] font-semibold text-encre-900 group-hover:text-outremer-700">{service.navLabel}</span>
                  <span className="mt-2 text-sm leading-relaxed text-encre-500">{service.title}</span>
                  <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-outremer-700">
                    Découvrir
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {guides.length > 0 && (
            <>
              <h2 className="mt-16 font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">Guides associés</h2>
              <ul className="mt-8 grid gap-10 md:grid-cols-2">
                {guides.map((article) => (
                  <li key={article.slug}>
                    <FrArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
      <FrCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Guides */
export function FrGuidesPage() {
  useDocumentMeta({ title: 'Guides et ressources de planification | FreightVanta', description: truncate(resourcesFr.body), path: '/fr/guides', ...FR });
  const articles = getPublishedArticlesFr();
  const categories = useMemo(() => Array.from(new Set(articles.map((article) => article.category))), [articles]);
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const [lead, ...rest] = visible;

  return (
    <>
      <FrPageHero breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'Guides' }]} eyebrow={resourcesFr.eyebrow} title={resourcesFr.title} body={resourcesFr.body} />
      <section aria-label="Guides" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 border-b border-encre-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filtrer les guides par sujet" className="flex flex-wrap gap-2">
              {[null, ...categories].map((item) => {
                const pressed = category === item;
                return (
                  <button
                    key={item ?? 'tous'}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-h-10 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                      pressed ? 'border-outremer-700 bg-outremer-700 text-white' : 'border-lin-300 text-encre-700 hover:border-encre-900 hover:text-encre-900',
                    )}
                  >
                    {item ?? 'Tous les sujets'}
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className="text-sm text-encre-500">
              {visible.length} {visible.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>

          {lead ? (
            <>
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-8">
                  <FrArticleCard article={lead} variant="feature" headingLevel={2} />
                </div>
                <div className="lg:col-span-4">
                  <div className="rounded-[14px] bg-encre-900 p-7 text-white">
                    <p className="fr-eyebrow text-outremer-300">Une expédition en préparation ?</p>
                    <p className="mt-4 font-fr-serif text-2xl font-semibold leading-snug">Transformez ce que vous venez de lire en un plan que votre équipe peut utiliser.</p>
                    <Link to={FR_ANCHORS.enquiry} className="fr-btn fr-btn-primary mt-6 w-full">
                      Demander un plan d’expédition
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <FrArticleCard article={article} variant="grid" headingLevel={2} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-12 rounded-[12px] border border-dashed border-lin-300 p-8 text-encre-600">Aucun guide publié sur ce sujet pour l’instant. Choisissez un autre sujet.</p>
          )}
        </div>
      </section>
      <FrCtaBand />
    </>
  );
}

export function FrArticlePage({ slug }: { slug: string }) {
  const article = getArticleFr(slug);
  return article ? <ArticleDetail article={article} /> : <FrNotFoundPage path={`/fr/guides/${slug}`} />;
}

function ArticleDetail({ article }: { article: ArticleFr }) {
  useDocumentMeta({ title: `${article.title} | FreightVanta`, description: truncate(article.excerpt), path: `/fr/guides/${article.slug}`, ...FR });
  useJsonLd('fv-fr-article-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: siteConfig.brand, url: `${siteConfig.siteUrl}/` },
    mainEntityOfPage: `${siteConfig.siteUrl}/fr/guides/${article.slug}`,
  });
  const services = article.relatedServices.map(getServiceFr).filter((s): s is ServiceContentFr => s !== null);
  const related = getPublishedArticlesFr().filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <article>
      <header className="relative isolate overflow-hidden border-b border-encre-900/10 bg-ivoire pb-40 pt-8 text-encre-900 sm:pb-48 sm:pt-10">
        <div aria-hidden="true" className="fr-chart-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="shell">
          <FrBreadcrumbs items={[{ label: 'Accueil', to: '/fr/' }, { label: 'Guides', to: '/fr/guides' }, { label: article.category }]} />
          <div className="mt-8 max-w-3xl">
            <FrArticleMeta article={article} />
            <h1 className="mt-5 font-fr-serif text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.3rem]">{article.title}</h1>
            <p className="mt-5 font-fr-serif text-lg leading-relaxed text-encre-600 sm:text-xl">{article.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="-mt-32 overflow-hidden rounded-[14px] bg-encre-900 shadow-[0_32px_64px_-32px_rgba(28,31,39,0.5)] ring-1 ring-encre-900/10 sm:-mt-40">
          {article.coverId && <Img media={getMedia(article.coverId)} alt={article.coverAlt} priority sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]" />}
        </div>

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="fr-prose space-y-12 lg:col-span-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, index) => {
                    if (block.type === 'p')
                      return (
                        <p key={index} className="text-[18px] leading-[1.75] text-encre-700">
                          {block.text}
                        </p>
                      );
                    if (block.type === 'note')
                      return (
                        <p key={index} className="rounded-[8px] border border-lin-300 border-l-4 border-l-outremer-700 bg-ivoire px-5 py-4 text-[16px] leading-relaxed text-encre-700">
                          {block.text}
                        </p>
                      );
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-encre-700">
                            <span aria-hidden="true" className="mt-[0.7rem] h-2 w-2 shrink-0 rounded-full bg-outremer-700" />
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
              <div className="rounded-[14px] bg-encre-900 p-7 text-white">
                <p className="fr-eyebrow text-outremer-300">Demander un plan d’expédition</p>
                <p className="mt-4 font-fr-serif text-2xl font-semibold leading-snug">Vous préparez une expédition de ce type ?</p>
                <p className="mt-3 text-[15px] leading-relaxed text-lin-200">Un lien produit, un brief d’expédition ou la route à planifier suffit pour commencer.</p>
                <Link to={FR_ANCHORS.enquiry} className="fr-btn fr-btn-primary mt-6 w-full">
                  Demander un plan d’expédition
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {services.length > 0 && (
                <div>
                  <h2 className="fr-eyebrow text-encre-500">Solutions associées</h2>
                  <ul className="mt-3 border-t border-encre-900">
                    {services.map((service) => (
                      <li key={service.slug} className="border-b border-encre-900/10">
                        <Link to={`/fr/solutions/${service.slug}`} className="group flex items-center justify-between gap-3 py-3.5 font-semibold text-encre-900 hover:text-outremer-700">
                          {service.navLabel}
                          <ArrowRight className="h-4 w-4 text-outremer-700 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
        <section aria-labelledby="fr-related-guides" className="border-t border-encre-900/10 bg-ivoire py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="fr-related-guides" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
                Poursuivre la lecture
              </h2>
              <Link to="/fr/guides" className="fr-link">
                Consulter les guides
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <FrArticleCard article={item} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <FrCtaBand />
    </article>
  );
}
