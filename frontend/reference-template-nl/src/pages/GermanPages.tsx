import {
  DeCoverage,
  DeEnquiry,
  DeFaq,
  DeHero,
  DeIndustries,
  DeOperation,
  DeProcess,
  DeResources,
  DeServices,
} from '../components/de/GermanHome';
import { ArrowRight, MailIcon, PhoneIcon } from '../components/ui/Icons';
import { siteConfig } from '../config/site';
import { DE_META, deFaq } from '../content/de/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type DeLegalSlug } from '../lib/router';
import { useDocumentMeta, useJsonLd } from '../lib/seo';

export function GermanHomePage() {
  useDocumentMeta(DE_META);
  useJsonLd('fv-de-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'de-DE',
    mainEntity: deFaq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return (
    <>
      <DeHero />
      <DeCoverage />
      <DeServices />
      <DeOperation />
      <DeProcess />
      <DeIndustries />
      <DeResources />
      <DeFaq />
      <DeEnquiry />
    </>
  );
}

/* ------------------------------------------------------------------ Rechtliches */
interface LegalSection {
  heading: string;
  body: string;
}

const DE_LEGAL: Record<DeLegalSlug, { title: string; lead: string; sections: LegalSection[] }> = {
  impressum: {
    title: 'Impressum',
    lead: 'Anbieterkennzeichnung für die deutsche Website von FreightVanta.',
    sections: [],
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    lead: 'Wie diese Website mit den Angaben umgeht, die Sie mit FreightVanta teilen.',
    sections: [
      {
        heading: 'Versandplan-Anfragen',
        body: 'Das Anfrageformular erfasst Name, geschäftliche E-Mail-Adresse, Unternehmen, optional Telefonnummer, Abgangsort, Zielort, Ausgangspunkt sowie die Angaben zur Ware, die Sie freiwillig mitteilen. Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme verwendet.',
      },
      {
        heading: 'Analyse (einwilligungsbasiert)',
        body: 'Eigene Analysen laufen nur, nachdem Sie sie erlaubt haben. Erfasst wird, welche Bereiche der Seite genutzt werden – niemals die Werte, die Sie in das Formular eingeben. Ihre Auswahl wird lokal in Ihrem Browser gespeichert.',
      },
      {
        heading: 'Ihre Rechte',
        body: 'Nach der DSGVO haben Sie insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Für Anfragen nutzen Sie bitte die im Impressum genannten Kontaktdaten.',
      },
    ],
  },
};

function OwnerNotice({ children }: { children: string }) {
  return (
    <div className="border-l-2 border-brick-600 bg-paper-50 px-5 py-4 text-[15px] leading-relaxed text-graphite-700">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brick-600">Hinweis</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export function GermanLegalPage({ slug }: { slug: DeLegalSlug }) {
  const page = DE_LEGAL[slug];
  const { consent } = useConsent();
  const { email, phone, address } = siteConfig.contact;
  const hasProviderDetails = Boolean(siteConfig.legalEntity || address || email || phone);

  useDocumentMeta({
    title: `${page.title} | FreightVanta`,
    description: page.lead,
    path: `/de/${slug}`,
    lang: 'de-DE',
  });

  return (
    <>
      <section className="bg-din-grid border-b border-line-200 bg-paper-25">
        <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12">
          <nav aria-label="Brotkrümelnavigation">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite-500">
              <li>
                <Link to="/de" className="underline decoration-graphite-400/40 underline-offset-4 hover:text-graphite-900">
                  Startseite
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-graphite-900">
                {page.title}
              </li>
            </ol>
          </nav>
          <p className="de-kicker mt-8 text-graphite-500">Rechtliches</p>
          <h1 className="mt-5 max-w-3xl font-serif text-[2.4rem] font-bold leading-[1.1] text-graphite-900 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-graphite-500">{page.lead}</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {slug === 'impressum' && (
            <div className="space-y-8">
              <div className="border-t border-line-300 pt-6">
                <h2 className="font-serif text-2xl font-bold text-graphite-900">Angaben gemäß § 5 DDG</h2>
                {hasProviderDetails ? (
                  <dl className="mt-4 space-y-3 text-[17px] leading-relaxed text-graphite-700">
                    {siteConfig.legalEntity && (
                      <div>
                        <dt className="font-semibold text-graphite-900">Anbieter</dt>
                        <dd>{siteConfig.legalEntity}</dd>
                      </div>
                    )}
                    {address && (
                      <div>
                        <dt className="font-semibold text-graphite-900">Anschrift</dt>
                        <dd>{address}</dd>
                      </div>
                    )}
                    {(email || phone) && (
                      <div>
                        <dt className="font-semibold text-graphite-900">Kontakt</dt>
                        <dd className="flex flex-col gap-1">
                          {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-petrol-700 underline underline-offset-4">
                              <MailIcon className="h-4 w-4" />
                              {email}
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-petrol-700 underline underline-offset-4">
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
                      Die vollständigen Anbieterangaben (Firma, Rechtsform, Anschrift, Vertretungsberechtigte, Kontakt,
                      Register- und Umsatzsteuerangaben) werden vor Veröffentlichung vom Betreiber ergänzt und geprüft.
                      Diese Vorlage erfindet keine Angaben.
                    </OwnerNotice>
                  </div>
                )}
              </div>
              <OwnerNotice>
                Verantwortlichkeiten für Zollabfertigung, Lagerstandorte und Leistungsumfang werden im jeweiligen
                Versandplan bestätigt. Inhalte dieser Website sind allgemeine Informationen und keine Rechts-, Zoll- oder
                Steuerberatung.
              </OwnerNotice>
            </div>
          )}

          {page.sections.map((section) => (
            <div key={section.heading} className="border-t border-line-300 pt-6">
              <h2 className="font-serif text-2xl font-bold text-graphite-900">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-graphite-700">{section.body}</p>
            </div>
          ))}

          {slug === 'datenschutz' && (
            <>
              <OwnerNotice>
                Diese Kurzfassung beschreibt das Verhalten der Website-Vorlage. Die vollständige, rechtlich geprüfte
                Datenschutzerklärung (inkl. Verantwortlichem, Rechtsgrundlagen, Speicherfristen und ggf.
                Datenschutzbeauftragtem) wird vor Veröffentlichung vom Betreiber ergänzt.
              </OwnerNotice>
              <div className="bg-paper-50 p-6">
                <p className="font-semibold text-graphite-900">
                  Analyse-Einstellung:{' '}
                  {consent === 'granted' ? 'erlaubt' : consent === 'denied' ? 'abgelehnt' : 'noch nicht gewählt'}
                </p>
                <button
                  type="button"
                  onClick={openConsentSettings}
                  className="mt-3 inline-flex items-center gap-2 font-semibold text-petrol-700 underline decoration-2 underline-offset-4"
                >
                  Cookie-Einstellungen ändern
                </button>
              </div>
            </>
          )}

          <Link
            to="/de"
            className="inline-flex items-center gap-2 font-semibold text-brick-600 underline decoration-brick-600/40 decoration-2 underline-offset-4 hover:decoration-brick-600"
          >
            Zurück zur Startseite
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
