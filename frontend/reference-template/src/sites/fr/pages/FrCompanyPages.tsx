import type { ReactNode } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { SITE_META, hasDirectContact, siteConfig } from '../../../config/site';
import { FR_ANCHORS, enquiryFr, operationFr, processFr } from '../../../content/fr/home';
import { getMedia } from '../../../content/media';
import { openConsentSettings, useConsent } from '../../../lib/analytics';
import { frStrings } from '../../../lib/enquiry-i18n';
import { Link } from '../../../lib/router';
import { useDocumentMeta } from '../../../lib/seo';
import { FrCheckList, FrCtaBand, FrPageHero } from '../components/FrParts';

const FR = { ogLocale: 'fr_FR' };

/* ------------------------------------------------------------------ À propos */
export function FrAboutPage() {
  useDocumentMeta({
    title: 'À propos de FreightVanta',
    description:
      'FreightVanta transforme des relais de sourcing et de fret dispersés en un plan d’expédition concret, pour les importateurs, les e-commerçants, les équipes produit, les distributeurs et les marques en croissance.',
    path: '/fr/a-propos',
    ...FR,
  });
  const audiences = ['Importateurs', 'E-commerçants', 'Équipes produit', 'Distributeurs', 'Marques en croissance'];
  const confirmations = [
    'Délais, tarifs et périmètre sont confirmés dans le plan d’expédition, jamais promis à l’avance.',
    'Responsabilités douanières, représentant en douane et étendue du dédouanement sont définis avant tout engagement.',
    'Le périmètre d’entreposage et de logistique e-commerce est confirmé avant tout mouvement de stock.',
    'Si une hypothèse change, le plan montre le changement.',
  ];

  return (
    <>
      <FrPageHero
        breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'À propos' }]}
        eyebrow="À propos de FreightVanta"
        title="Un plan d’expédition concret."
        lead="FreightVanta transforme des relais de sourcing et de fret dispersés en un plan d’expédition que votre équipe peut utiliser."
        media={getMedia('fr-about-havre')}
        mediaAlt="Sculpture en conteneurs colorés devant le front de mer du Havre par temps clair."
      />
      <section aria-labelledby="fr-about-who" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="fr-about-who" className="fr-h2 text-encre-900">
              Avec qui nous travaillons
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-encre-600">
              Des entreprises en croissance qui achètent en Chine et livrent des clients en France et dans l’Union européenne, et pour qui le parcours continu, du sourcing produit jusqu’à la remise au destinataire, doit rester lisible.
            </p>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {audiences.map((audience) => (
              <li key={audience} className="flex items-center gap-3 border-b border-encre-900/10 py-4 font-fr-serif text-2xl font-semibold text-encre-900">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-outremer-700" />
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="fr-about-how" className="bg-encre-900 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell">
          <h2 id="fr-about-how" className="fr-h2 max-w-3xl text-white">
            Notre façon de travailler
          </h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {operationFr.items.map((item) => (
              <li key={item.title} className="border-t border-white/20 pt-6">
                <h3 className="font-fr-serif text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-lin-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="fr-about-confirm" className="bg-ivoire py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="fr-about-confirm" className="fr-h2 text-encre-900">
              Ce que nous vérifions avant de nous engager
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-encre-600">{processFr.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <FrCheckList items={confirmations} />
          </div>
        </div>
      </section>
      <FrCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Contact */
export function FrContactPage() {
  useDocumentMeta({ title: 'Contact | Demander un plan d’expédition | FreightVanta', description: enquiryFr.body, path: '/fr/contact', ...FR });
  const { email, phone, address } = siteConfig.contact;

  return (
    <>
      <FrPageHero breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: 'Contact' }]} eyebrow="Contact" title="Contacter FreightVanta" lead={enquiryFr.body} />
      <section aria-labelledby="fr-contact-form-title" className="bg-lin-100 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="fr-contact-form-title" className="font-fr-serif text-[2rem] font-semibold leading-tight text-encre-900">
              Demander un plan d’expédition
            </h2>
            {hasDirectContact && (
              <ul className="mt-6 space-y-3 text-[16px] text-encre-700">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="fr-link">
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="fr-link">
                      <PhoneIcon className="h-4 w-4" />
                      {phone}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex gap-2">
                    <PinIcon className="mt-1 h-4 w-4 shrink-0" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            )}
            <h3 className="fr-eyebrow mt-10 text-encre-500">Utile à préciser</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-encre-700">{processFr.items[0].copy}</p>
            <FrCheckList items={enquiryFr.settings.reassurance} className="mt-6" />
            <p className="mt-8 text-sm leading-relaxed text-encre-600">
              Information sur le traitement de vos données : vos réponses servent uniquement à traiter votre demande. Les détails figurent dans la{' '}
              <Link to={siteConfig.legalFr.confidentialite} className="fr-link">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm
              idPrefix="fr-contact"
              placement="contact"
              copy={enquiryFr.settings}
              strings={frStrings}
              theme="atelier"
              privacyUrl={siteConfig.legalFr.confidentialite}
              siteId={SITE_META.fr.siteId}
              locale={SITE_META.fr.locale}
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Pages légales */
const PLACEHOLDER = 'À compléter par l’éditeur avant publication';

function Value({ value, multiline = false }: { value: string | string[]; multiline?: boolean }) {
  const lines = Array.isArray(value) ? value : [value];
  const filled = lines.some((line) => line.trim() !== '');
  if (!filled) return <span className="rounded-[4px] border border-dashed border-sienne-600 bg-sienne-100 px-2 py-0.5 text-[14px] text-sienne-700">[{PLACEHOLDER}]</span>;
  if (!multiline) return <span>{lines.join(' ')}</span>;
  return (
    <span className="block">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

function LegalShell({ title, lead, children, breadcrumb }: { title: string; lead: string; children: ReactNode; breadcrumb: string }) {
  return (
    <>
      <FrPageHero breadcrumbs={[{ label: 'Accueil', to: '/fr/' }, { label: breadcrumb }]} eyebrow="Informations légales" title={title} lead={lead} />
      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10 text-encre-700">{children}</div>
      </section>
    </>
  );
}

function LegalBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="border-t border-encre-900/15 pt-6">
      <h2 className="font-fr-serif text-2xl font-semibold text-encre-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}

function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[8px] border border-lin-300 border-l-4 border-l-sienne-600 bg-ivoire px-5 py-4 text-[15px] leading-relaxed text-encre-700">
      <span className="fr-eyebrow mr-2 text-sienne-700">Projet</span>
      {children}
    </p>
  );
}

const FR_LEGAL_SLUGS = ['mentions-legales', 'confidentialite', 'cgv', 'cookies'] as const;
export type FrLegalSlug = (typeof FR_LEGAL_SLUGS)[number];
export const isFrLegalSlug = (slug: string): slug is FrLegalSlug => (FR_LEGAL_SLUGS as readonly string[]).includes(slug);

export function FrLegalPage({ slug }: { slug: FrLegalSlug }) {
  switch (slug) {
    case 'mentions-legales':
      return <MentionsLegalesPage />;
    case 'confidentialite':
      return <ConfidentialitePage />;
    case 'cgv':
      return <CgvPage />;
    default:
      return <CookiesPage />;
  }
}

function MentionsLegalesPage() {
  useDocumentMeta({ title: 'Mentions légales | FreightVanta', description: 'Informations légales de l’éditeur du site conformément à l’article 6-III de la LCEN.', path: '/fr/mentions-legales', ...FR });
  const m = siteConfig.mentionsLegales;
  const { email, phone } = siteConfig.contact;
  const complete = Boolean(m.company && m.addressLines.length && m.rcs && m.vatId && m.publicationDirector && m.host && email);

  return (
    <LegalShell title="Mentions légales" lead="Informations prévues par l’article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN)." breadcrumb="Mentions légales">
      {!complete && (
        <DraftNotice>
          Les mentions obligatoires sont gérées dans la configuration du site et doivent être complétées par l’éditeur avant publication. Ce gabarit n’invente ni raison sociale, ni immatriculation, ni coordonnées.
        </DraftNotice>
      )}
      <LegalBlock heading="Éditeur du site">
        <p className="font-semibold text-encre-900">
          <Value value={[m.company, m.legalForm].filter(Boolean).join(', ')} />
          {m.capital && <span> au capital de {m.capital}</span>}
        </p>
        <p>
          Siège social : <Value value={m.addressLines} multiline />
        </p>
        <p>
          Immatriculation : <Value value={m.rcs} />
        </p>
        <p>
          SIRET : <Value value={m.siret} />
        </p>
        <p>
          N° de TVA intracommunautaire : <Value value={m.vatId} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Contact">
        <p>Téléphone : {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="fr-link">{phone}</a> : <Value value="" />}</p>
        <p>Adresse électronique : {email ? <a href={`mailto:${email}`} className="fr-link">{email}</a> : <Value value="" />}</p>
      </LegalBlock>
      <LegalBlock heading="Directeur ou directrice de la publication">
        <p>
          <Value value={m.publicationDirector} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Hébergeur">
        <p>
          <Value value={m.host} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Propriété intellectuelle">
        <p>L’ensemble des contenus de ce site (textes, structure, illustrations) est protégé par le droit d’auteur. Toute reproduction non autorisée est interdite.</p>
      </LegalBlock>
      <LegalBlock heading="Crédits photographiques">
        <p>Photographies : Pexels (notamment Thomas Parker, Janez Temlin, Tiger Lily, ELEVATE, RDNE Stock project, Jan van der Wolf, Wolfgang Vrede) sous licence Pexels.</p>
      </LegalBlock>
      <LegalBlock heading="Médiation et litiges">
        <p>Nos prestations s’adressent aux professionnels. Le dispositif de médiation de la consommation ne s’applique pas aux relations entre professionnels.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function ConfidentialitePage() {
  useDocumentMeta({ title: 'Politique de confidentialité | FreightVanta', description: 'Information sur le traitement des données personnelles conformément aux articles 13 et 14 du RGPD.', path: '/fr/confidentialite', ...FR });
  const m = siteConfig.mentionsLegales;
  const { consent } = useConsent();
  const { email } = siteConfig.contact;

  return (
    <LegalShell title="Politique de confidentialité" lead="Information sur le traitement de vos données personnelles sur ce site, conformément à l’article 13 du RGPD et à la loi Informatique et Libertés." breadcrumb="Politique de confidentialité">
      <DraftNotice>
        Cette politique décrit les fonctions réelles de ce gabarit (formulaire de demande, stockage local du consentement, mesure d’audience interne facultative, polices hébergées localement). Elle doit être relue par l’éditeur avant publication et complétée avec l’hébergeur, les durées de conservation et les autres traitements éventuels.
      </DraftNotice>
      <LegalBlock heading="1. Responsable du traitement">
        <p>
          <Value value={[m.company, m.legalForm].filter(Boolean).join(', ')} />
          <br />
          <Value value={m.addressLines} multiline />
        </p>
        <p>Adresse électronique : {email ? <a href={`mailto:${email}`} className="fr-link">{email}</a> : <Value value="" />}</p>
        {m.dpoContact && <p>Délégué(e) à la protection des données : {m.dpoContact}</p>}
      </LegalBlock>
      <LegalBlock heading="2. Consultation du site et journaux du serveur">
        <p>
          Lors de la consultation du site, l’hébergeur traite des données techniquement nécessaires (adresse IP, horodatage, page consultée, type de navigateur) pour délivrer le site et en assurer la sécurité. Base légale : intérêt légitime (art. 6-1-f du RGPD) à un fonctionnement sûr et stable.
        </p>
        <p>
          Hébergeur, localisation des serveurs et durée de conservation des journaux : <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="3. Formulaire de demande de plan d’expédition">
        <p>
          Lorsque vous demandez un plan d’expédition, nous traitons les données que vous indiquez (nom et prénom, adresse e-mail professionnelle, entreprise, téléphone facultatif, origine et destination, point de départ, détails de la marchandise et informations complémentaires) uniquement pour étudier votre demande et vous recontacter.
        </p>
        <p>
          Base légale : mesures précontractuelles prises à votre demande (art. 6-1-b du RGPD) et, pour la case cochée dans le formulaire, votre consentement (art. 6-1-a), que vous pouvez retirer à tout moment. Pour lutter contre les envois automatisés, un champ masqué et l’heure de début de saisie sont vérifiés ; chaque demande est journalisée avec un identifiant technique.
        </p>
        <p>
          Les données sont supprimées lorsqu’elles ne sont plus nécessaires au traitement de la demande, sous réserve des obligations légales de conservation. Durée de conservation et systèmes destinataires (CRM, par exemple) : <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="4. Gestion du consentement et mesure d’audience">
        <p>
          Votre choix concernant la mesure d’audience est enregistré localement dans votre navigateur (stockage local, clé « fv.analytics-consent.v1 »). Ce stockage est strictement nécessaire pour respecter votre décision et est exempté de consentement (art. 82 de la loi Informatique et Libertés).
        </p>
        <p>
          Uniquement avec votre consentement (art. 82 de la loi Informatique et Libertés, art. 6-1-a du RGPD), nous enregistrons des événements d’interaction — changement d’onglet, clic sur un lien, début de saisie du formulaire — avec la page, la langue et l’horodatage. Vos saisies de formulaire ne sont jamais transmises. La mesure est réalisée en interne, sans prestataire tiers. Système destinataire et durée de conservation : <Value value="" />
        </p>
        <p>
          Choix actuel : {consent === 'granted' ? 'mesure d’audience acceptée' : consent === 'denied' ? 'refusée' : 'pas encore exprimé'}.{' '}
          <button type="button" onClick={openConsentSettings} className="fr-link">
            Gérer les cookies
          </button>
        </p>
      </LegalBlock>
      <LegalBlock heading="5. Polices de caractères et images">
        <p>
          Les polices (Source Serif 4, Source Sans 3) sont intégrées localement au site ; aucune connexion n’est établie vers un service de polices tiers. Le chargement des photographies peut établir une connexion vers le réseau de diffusion du fournisseur Pexels, ce qui transmet votre adresse IP. Pour l’exploitation en production, nous recommandons d’héberger toutes les images sur vos propres serveurs.
        </p>
      </LegalBlock>
      <LegalBlock heading="6. Vos droits">
        <p>
          Vous disposez d’un droit d’accès (art. 15 du RGPD), de rectification (art. 16), d’effacement (art. 17), de limitation (art. 18), de portabilité (art. 20) et d’opposition (art. 21). Vous pouvez retirer votre consentement à tout moment (art. 7-3). Vous pouvez également définir des directives relatives au sort de vos données après votre décès (art. 85 de la loi Informatique et Libertés) et introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>
      </LegalBlock>
      <LegalBlock heading="7. Mise à jour">
        <p>Dernière mise à jour de cette politique : septembre 2026.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function CgvPage() {
  useDocumentMeta({ title: 'Conditions générales | FreightVanta', description: 'Conditions d’utilisation du site et cadre de formation des prestations.', path: '/fr/cgv', ...FR });
  return (
    <LegalShell title="Conditions générales" lead="Conditions d’utilisation de ce site et cadre de formation des prestations." breadcrumb="Conditions générales">
      <DraftNotice>
        Les conditions générales complètes — y compris le choix d’y intégrer ou non les conditions générales de vente de la profession (contrat type de commission de transport, conditions TLF) et la limitation de responsabilité applicable — doivent être arrêtées par l’éditeur et son conseil avant publication.
      </DraftNotice>
      <LegalBlock heading="Champ d’application">
        <p>Cette offre s’adresse exclusivement aux professionnels. Les contenus de ce site ne constituent pas une offre au sens juridique.</p>
      </LegalBlock>
      <LegalBlock heading="Formation des prestations">
        <p>
          Périmètre, responsabilités, prix, délais et responsabilité sont convenus exclusivement dans le plan d’expédition écrit ou le devis. Les informations de ce site ne constituent aucun engagement de délai, de prix ou de résultat de dédouanement.
        </p>
      </LegalBlock>
      <LegalBlock heading="Contenus des guides">
        <p>Les guides et contenus du site sont des informations générales de planification et ne remplacent pas un conseil juridique, douanier ou fiscal.</p>
      </LegalBlock>
      <LegalBlock heading="Droit applicable">
        <p>Les présentes sont soumises au droit français, sous réserve des dispositions impératives applicables.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function CookiesPage() {
  useDocumentMeta({ title: 'Politique de cookies | FreightVanta', description: 'Ce que ce site enregistre dans votre navigateur, et pourquoi.', path: '/fr/cookies', ...FR });
  const { consent } = useConsent();
  return (
    <LegalShell title="Politique de cookies" lead="Ce que ce site enregistre dans votre navigateur, et pourquoi." breadcrumb="Politique de cookies">
      <LegalBlock heading="Stockage strictement nécessaire">
        <p>Votre choix concernant la mesure d’audience est enregistré localement dans votre navigateur afin que le site respecte votre décision lors de vos prochaines visites. Aucun cookie de suivi tiers n’est déposé.</p>
      </LegalBlock>
      <LegalBlock heading="Mesure d’audience facultative">
        <p>Avec votre consentement, le site enregistre des événements d’interaction, comme les changements d’onglet et les clics sur des liens, pour comprendre quelles sections aident les visiteurs à préparer une expédition. Les saisies de formulaire ne sont jamais collectées.</p>
      </LegalBlock>
      <div className="rounded-[12px] border border-lin-300 bg-ivoire p-6">
        <p className="font-semibold text-encre-900">Choix actuel : {consent === 'granted' ? 'mesure d’audience acceptée' : consent === 'denied' ? 'refusée' : 'pas encore exprimé'}</p>
        <button type="button" onClick={openConsentSettings} className="fr-link mt-3">
          Gérer les cookies
        </button>
      </div>
      <Link to="/fr/contact" className="fr-link">
        Contacter FreightVanta
        <ArrowRight className="h-4 w-4" />
      </Link>
    </LegalShell>
  );
}

/* ------------------------------------------------------------------ 404 */
export function FrNotFoundPage({ path }: { path: string }) {
  useDocumentMeta({ title: 'Page introuvable | FreightVanta', description: 'La page demandée est introuvable.', path, ...FR });
  return (
    <section className="relative isolate overflow-hidden border-b border-encre-900/10 bg-ivoire py-24 text-encre-900 sm:py-32">
      <div aria-hidden="true" className="fr-chart-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell max-w-3xl">
        <p className="fr-eyebrow text-sienne-700">Route introuvable</p>
        <h1 className="mt-5 font-fr-serif text-5xl font-semibold leading-tight">Ce relais ne mène nulle part.</h1>
        <p className="mt-5 text-lg text-encre-600">
          La page <span className="font-mono text-base text-encre-800">{path}</span> n’est pas disponible. Choisissez une prochaine étape.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/fr/" className="fr-btn fr-btn-primary">
            Retour à l’accueil
          </Link>
          <Link to={FR_ANCHORS.services} className="fr-btn fr-btn-outline">
            Découvrir nos solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
