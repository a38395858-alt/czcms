import {
  NlCoverage,
  NlEnquiry,
  NlFaq,
  NlHero,
  NlIndustries,
  NlOperation,
  NlProcess,
  NlResources,
  NlServices,
} from '../components/nl/DutchHome';
import { ArrowRight, MailIcon, PhoneIcon } from '../components/ui/Icons';
import { siteConfig } from '../config/site';
import { NL_META, nlFaq } from '../content/nl/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type NlLegalSlug } from '../lib/router';
import { useDocumentMeta, useJsonLd } from '../lib/seo';

export function DutchHomePage() {
  useDocumentMeta(NL_META);
  useJsonLd('fv-nl-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'nl-NL',
    mainEntity: nlFaq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return (
    <>
      <NlHero />
      <NlCoverage />
      <NlServices />
      <NlOperation />
      <NlProcess />
      <NlIndustries />
      <NlResources />
      <NlFaq />
      <NlEnquiry />
    </>
  );
}

/* ------------------------------------------------------------------ Juridische pagina's */
interface LegalSection {
  heading: string;
  body: string;
}

const NL_LEGAL: Record<NlLegalSlug, { title: string; lead: string; sections: LegalSection[] }> = {
  juridisch: {
    title: 'Juridische informatie',
    lead: 'Identificatie van de exploitant van de Nederlandse website van FreightVanta.',
    sections: [],
  },
  privacy: {
    title: 'Privacyverklaring',
    lead: 'Hoe deze website omgaat met de informatie die u met FreightVanta deelt.',
    sections: [
      {
        heading: 'Aanvragen voor een verzendplan',
        body: 'Het formulier verzamelt uw naam, zakelijke e-mail, bedrijf, een optioneel telefoonnummer, herkomst, bestemming, startpunt en de details over de lading die u besluit te delen. Deze gegevens dienen uitsluitend om uw aanvraag te beoordelen en contact met u op te nemen.',
      },
      {
        heading: 'Analyse (met toestemming)',
        body: 'Eigen analyse wordt alleen uitgevoerd na uw toestemming. Er wordt vastgelegd welke delen van de pagina worden gebruikt, nooit de waarden die u in het formulier invult. Uw keuze wordt lokaal in uw browser bewaard.',
      },
      {
        heading: 'Uw rechten',
        body: 'Op grond van de Algemene verordening gegevensbescherming (AVG) hebt u onder meer recht op inzage, rectificatie, wissing, beperking, overdraagbaarheid en bezwaar. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens. Gebruik voor het uitoefenen van uw rechten de contactgegevens uit de juridische informatie.',
      },
    ],
  },
  cookies: {
    title: 'Cookieverklaring',
    lead: 'Wat deze website in uw browser bewaart en waarom.',
    sections: [
      {
        heading: 'Essentiële opslag',
        body: 'Uw voorkeur voor analyse wordt lokaal in uw browser bewaard, zodat de site deze bij latere bezoeken kan respecteren.',
      },
      {
        heading: 'Eigen analyse (optioneel)',
        body: 'Met uw toestemming registreert de site interactiegebeurtenissen, zoals het wisselen van dienst of klikken op links, om te begrijpen welke onderdelen bezoekers helpen. Formuliergegevens worden nooit meegenomen. Accepteren en weigeren wegen even zwaar in de melding.',
      },
      {
        heading: 'Uw keuze wijzigen',
        body: 'U kunt uw voorkeur op elk moment wijzigen via de link “Cookievoorkeuren” in de voettekst of via de knop op deze pagina.',
      },
    ],
  },
};

function OwnerNotice({ children }: { children: string }) {
  return (
    <div className="border-2 border-dijk-900/20 border-l-4 border-l-oranje-500 bg-getij-50 px-5 py-4 text-[15px] leading-relaxed text-dijk-900">
      <p className="font-archivo text-[11.5px] uppercase tracking-[0.18em] text-oranje-600">Nog aan te vullen</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export function DutchLegalPage({ slug }: { slug: NlLegalSlug }) {
  const page = NL_LEGAL[slug];
  const { consent } = useConsent();
  const { email, phone, address } = siteConfig.contact;
  const hasProviderDetails = Boolean(siteConfig.legalEntity || address || email || phone);

  useDocumentMeta({
    title: `${page.title} | FreightVanta`,
    description: page.lead,
    path: `/nl/${slug}`,
    lang: 'nl-NL',
  });

  return (
    <>
      <section className="bg-haven-grid border-b-[3px] border-oranje-500 bg-getij-50">
        <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12">
          <nav aria-label="Kruimelpad">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-lei-600">
              <li>
                <Link to="/nl" className="underline decoration-dijk-900/30 underline-offset-4 hover:text-dijk-900">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-dijk-950">
                {page.title}
              </li>
            </ol>
          </nav>
          <p className="nl-kicker mt-8 text-dijk-800">Juridische informatie</p>
          <h1 className="mt-5 max-w-3xl font-archivo text-[2.3rem] leading-[1.05] tracking-tight text-dijk-950 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-lei-600">{page.lead}</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {slug === 'juridisch' && (
            <div className="space-y-8">
              <div className="border-t-2 border-dijk-900/15 pt-6">
                <h2 className="font-archivo text-[1.6rem] leading-snug text-dijk-950">Exploitant van de website</h2>
                {hasProviderDetails ? (
                  <dl className="mt-4 space-y-3 text-[17px] leading-relaxed text-dijk-900">
                    {siteConfig.legalEntity && (
                      <div>
                        <dt className="font-bold text-dijk-950">Exploitant</dt>
                        <dd>{siteConfig.legalEntity}</dd>
                      </div>
                    )}
                    {address && (
                      <div>
                        <dt className="font-bold text-dijk-950">Adres</dt>
                        <dd>{address}</dd>
                      </div>
                    )}
                    {(email || phone) && (
                      <div>
                        <dt className="font-bold text-dijk-950">Contact</dt>
                        <dd className="flex flex-col gap-1">
                          {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-delfts-700 underline underline-offset-4">
                              <MailIcon className="h-4 w-4" />
                              {email}
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-delfts-700 underline underline-offset-4">
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
                      De gegevens die de Nederlandse wet voor online dienstverlening eist — statutaire naam, KvK-nummer,
                      btw-nummer, adres en e-mail — worden vóór publicatie door de exploitant aangevuld en gecontroleerd.
                      Dit sjabloon verzint geen gegevens.
                    </OwnerNotice>
                  </div>
                )}
              </div>
              <OwnerNotice>
                Verantwoordelijkheden voor douaneafhandeling, magazijnlocaties en het bereik van diensten worden in elk
                verzendplan bevestigd. De inhoud van deze website is algemene informatie en geen juridisch, douane- of
                fiscaal advies.
              </OwnerNotice>
            </div>
          )}

          {page.sections.map((section) => (
            <div key={section.heading} className="border-t-2 border-dijk-900/15 pt-6">
              <h2 className="font-archivo text-[1.6rem] leading-snug text-dijk-950">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-dijk-900">{section.body}</p>
            </div>
          ))}

          {slug === 'privacy' && (
            <OwnerNotice>
              Deze samenvatting beschrijft het gedrag van het websitesjabloon. De volledige, juridisch getoetste
              privacyverklaring (verwerkingsverantwoordelijke, grondslagen, bewaartermijnen en eventueel een
              functionaris voor gegevensbescherming) wordt vóór publicatie door de exploitant toegevoegd.
            </OwnerNotice>
          )}

          {slug !== 'juridisch' && (
            <div className="bg-getij-100 p-6">
              <p className="font-bold text-dijk-950">
                Voorkeur voor analyse:{' '}
                {consent === 'granted' ? 'geaccepteerd' : consent === 'denied' ? 'geweigerd' : 'nog niet gekozen'}
              </p>
              <button
                type="button"
                onClick={openConsentSettings}
                className="mt-3 inline-flex items-center gap-2 font-bold text-delfts-700 underline decoration-2 underline-offset-4"
              >
                Wijzig de cookievoorkeuren
              </button>
            </div>
          )}

          <Link
            to="/nl"
            className="inline-flex items-center gap-2 font-bold text-delfts-700 underline decoration-delfts-700/40 decoration-2 underline-offset-4 hover:decoration-delfts-700"
          >
            Terug naar de homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
