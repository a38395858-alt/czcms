import {
  FrCoverage,
  FrEnquiry,
  FrFaq,
  FrHero,
  FrIndustries,
  FrOperation,
  FrProcess,
  FrResources,
  FrServices,
} from '../components/fr/FrenchHome';
import { ArrowRight, MailIcon, PhoneIcon } from '../components/ui/Icons';
import { siteConfig } from '../config/site';
import { FR_META, frFaq } from '../content/fr/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type FrLegalSlug } from '../lib/router';
import { useDocumentMeta, useJsonLd } from '../lib/seo';

export function FrenchHomePage() {
  useDocumentMeta(FR_META);
  useJsonLd('fv-fr-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'fr-FR',
    mainEntity: frFaq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return (
    <>
      <FrHero />
      <FrCoverage />
      <FrServices />
      <FrOperation />
      <FrProcess />
      <FrIndustries />
      <FrResources />
      <FrFaq />
      <FrEnquiry />
    </>
  );
}

/* ------------------------------------------------------------------ Pages légales */
interface LegalSection {
  heading: string;
  body: string;
}

const FR_LEGAL: Record<FrLegalSlug, { title: string; lead: string; sections: LegalSection[] }> = {
  'mentions-legales': {
    title: 'Mentions légales',
    lead: 'Identification de l’éditeur du site français de FreightVanta.',
    sections: [],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    lead: 'Comment ce site traite les informations que vous partagez avec FreightVanta.',
    sections: [
      {
        heading: 'Demandes de plan d’expédition',
        body: 'Le formulaire recueille votre nom, votre e-mail professionnel, votre entreprise, un téléphone facultatif, l’origine, la destination, le point de départ choisi, ainsi que les précisions sur la marchandise que vous décidez de partager. Ces informations servent uniquement à examiner votre demande et à vous recontacter.',
      },
      {
        heading: 'Mesure d’audience (soumise à consentement)',
        body: 'La mesure d’audience interne ne s’exécute qu’après votre autorisation. Elle enregistre quelles parties de la page sont utilisées — jamais les valeurs saisies dans le formulaire. Votre choix est conservé localement dans votre navigateur.',
      },
      {
        heading: 'Vos droits',
        body: 'Conformément au RGPD et à la loi Informatique et Libertés, vous disposez notamment de droits d’accès, de rectification, d’effacement, de limitation, de portabilité et d’opposition. Vous pouvez également saisir la CNIL. Pour exercer vos droits, utilisez les coordonnées indiquées dans les mentions légales.',
      },
    ],
  },
};

function OwnerNotice({ children }: { children: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dotted border-encre-900/40 bg-creme-50 px-5 py-4 text-[15px] leading-relaxed text-encre-700">
      <p className="font-poster text-[11px] font-semibold uppercase tracking-[0.2em] text-safran-600">À compléter</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export function FrenchLegalPage({ slug }: { slug: FrLegalSlug }) {
  const page = FR_LEGAL[slug];
  const { consent } = useConsent();
  const { email, phone, address } = siteConfig.contact;
  const hasProviderDetails = Boolean(siteConfig.legalEntity || address || email || phone);

  useDocumentMeta({
    title: `${page.title} | FreightVanta`,
    description: page.lead,
    path: `/fr/${slug}`,
    lang: 'fr-FR',
  });

  return (
    <>
      <section className="border-b border-sable-200 bg-creme-25">
        <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12">
          <nav aria-label="Fil d’Ariane">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-encre-500">
              <li>
                <Link to="/fr" className="underline decoration-encre-400/40 underline-offset-4 hover:text-encre-900">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-encre-900">
                {page.title}
              </li>
            </ol>
          </nav>
          <p className="fr-kicker fr-kicker--left mt-8 text-safran-600">Informations légales</p>
          <h1 className="mt-5 max-w-3xl font-poster text-[2.4rem] font-bold leading-[1.08] text-encre-900 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-encre-500">{page.lead}</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {slug === 'mentions-legales' && (
            <div className="space-y-8">
              <div className="border-t-2 border-dotted border-encre-900/25 pt-6">
                <h2 className="font-poster text-2xl font-bold text-encre-900">Éditeur du site</h2>
                {hasProviderDetails ? (
                  <dl className="mt-4 space-y-3 text-[17px] leading-relaxed text-encre-700">
                    {siteConfig.legalEntity && (
                      <div>
                        <dt className="font-semibold text-encre-900">Éditeur</dt>
                        <dd>{siteConfig.legalEntity}</dd>
                      </div>
                    )}
                    {address && (
                      <div>
                        <dt className="font-semibold text-encre-900">Adresse</dt>
                        <dd>{address}</dd>
                      </div>
                    )}
                    {(email || phone) && (
                      <div>
                        <dt className="font-semibold text-encre-900">Contact</dt>
                        <dd className="flex flex-col gap-1">
                          {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-bleufr-700 underline underline-offset-4">
                              <MailIcon className="h-4 w-4" />
                              {email}
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-bleufr-700 underline underline-offset-4">
                              <PhoneIcon className="h-4 w-4" />
                              {phone}
                            </a>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="mt-4">
                    <OwnerNotice>
                      Les mentions complètes exigées par la loi pour la confiance dans l’économie numérique (LCEN) —
                      dénomination sociale, forme juridique, capital, siège, RCS, n° TVA, directeur de la publication et
                      hébergeur — seront ajoutées et vérifiées par l’exploitant avant publication. Ce gabarit n’invente
                      aucune donnée.
                    </OwnerNotice>
                  </div>
                )}
              </div>
              <OwnerNotice>
                Les responsabilités de dédouanement, les sites d’entreposage et le périmètre des prestations sont
                confirmés dans chaque plan d’expédition. Le contenu de ce site constitue une information générale et non
                un conseil juridique, douanier ou fiscal.
              </OwnerNotice>
            </div>
          )}

          {page.sections.map((section) => (
            <div key={section.heading} className="border-t-2 border-dotted border-encre-900/25 pt-6">
              <h2 className="font-poster text-2xl font-bold text-encre-900">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-encre-700">{section.body}</p>
            </div>
          ))}

          {slug === 'confidentialite' && (
            <>
              <OwnerNotice>
                Ce résumé décrit le comportement du gabarit de site. La politique de confidentialité complète et
                juridiquement validée (responsable de traitement, bases légales, durées de conservation, délégué à la
                protection des données le cas échéant) sera ajoutée par l’exploitant avant publication.
              </OwnerNotice>
              <div className="rounded-[1.25rem] bg-creme-50 p-6">
                <p className="font-semibold text-encre-900">
                  Mesure d’audience{'\u202f'}:{' '}
                  {consent === 'granted' ? 'autorisée' : consent === 'denied' ? 'refusée' : 'pas encore choisie'}
                </p>
                <button
                  type="button"
                  onClick={openConsentSettings}
                  className="mt-3 inline-flex items-center gap-2 font-semibold text-bleufr-700 underline decoration-2 underline-offset-4"
                >
                  Modifier les préférences cookies
                </button>
              </div>
            </>
          )}

          <Link
            to="/fr"
            className="inline-flex items-center gap-2 font-semibold text-bleufr-700 underline decoration-bleufr-700/40 decoration-2 underline-offset-4 hover:decoration-bleufr-700"
          >
            Retour à l’accueil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
