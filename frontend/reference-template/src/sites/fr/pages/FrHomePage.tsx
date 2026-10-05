import { siteConfig } from '../../../config/site';
import { HOME_META_FR, getPublishedHomeSectionsFr } from '../../../content/fr/home';
import type { FaqSection, HomeSection, ServicePathsSection } from '../../../content/types';
import { useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { FrCoverage, FrEnquirySection, FrFaq, FrHero, FrIndustries, FrOperation, FrProcess, FrResources, FrServicePaths } from '../components/FrHome';

function renderSection(section: HomeSection) {
  switch (section.section_key) {
    case 'hero':
      return <FrHero key={section.section_key} section={section} />;
    case 'coverage':
      return <FrCoverage key={section.section_key} section={section} />;
    case 'service_paths':
      return <FrServicePaths key={section.section_key} section={section} />;
    case 'operation':
      return <FrOperation key={section.section_key} section={section} />;
    case 'process':
      return <FrProcess key={section.section_key} section={section} />;
    case 'industries':
      return <FrIndustries key={section.section_key} section={section} />;
    case 'resources':
      return <FrResources key={section.section_key} section={section} />;
    case 'faq':
      return <FrFaq key={section.section_key} section={section} />;
    case 'enquiry':
      return <FrEnquirySection key={section.section_key} section={section} />;
    default:
      return null; // annonce + pied de page rendus par le gabarit du site
  }
}

/** JSON-LD uniquement à partir de contenus visibles et vérifiés : Organization, WebSite, Service, FAQPage. */
function buildJsonLd(services: ServicePathsSection | undefined, faq: FaqSection | undefined) {
  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.brand,
    url: `${root}/`,
    description: HOME_META_FR.description,
  };
  if (siteConfig.mentionsLegales.company) organization.legalName = siteConfig.mentionsLegales.company;
  if (siteConfig.contact.email) organization.email = siteConfig.contact.email;
  if (siteConfig.contact.phone) organization.telephone = siteConfig.contact.phone;
  if (siteConfig.mentionsLegales.vatId) organization.vatID = siteConfig.mentionsLegales.vatId;
  if (siteConfig.social.length > 0) organization.sameAs = siteConfig.social.map((profile) => profile.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${root}/fr/#website`,
        name: `${siteConfig.brand} France`,
        url: `${root}/fr/`,
        inLanguage: 'fr-FR',
        publisher: { '@id': orgId },
      },
      ...(services?.items ?? []).map((service) => ({
        '@type': 'Service',
        name: service.label,
        serviceType: service.label,
        description: `${service.title} ${service.copy}`,
        provider: { '@id': orgId },
        url: `${root}${service.link_url}`,
        inLanguage: 'fr-FR',
      })),
      {
        '@type': 'FAQPage',
        inLanguage: 'fr-FR',
        mainEntity: (faq?.items ?? []).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function FrHomePage() {
  const sections = getPublishedHomeSectionsFr();
  const services = sections.find((s): s is ServicePathsSection => s.section_key === 'service_paths');
  const faq = sections.find((s): s is FaqSection => s.section_key === 'faq');

  useDocumentMeta({ ...HOME_META_FR, ogLocale: 'fr_FR' });
  useJsonLd('fv-fr-home-jsonld', buildJsonLd(services, faq));

  return <>{sections.map(renderSection)}</>;
}
