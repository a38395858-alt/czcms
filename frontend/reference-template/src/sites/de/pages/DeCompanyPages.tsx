import type { ReactNode } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { SITE_META, hasDirectContact, siteConfig } from '../../../config/site';
import { DE_ANCHORS, enquiryDe, operationDe, processDe } from '../../../content/de/home';
import { getMedia } from '../../../content/media';
import { openConsentSettings, useConsent } from '../../../lib/analytics';
import { deStrings } from '../../../lib/enquiry-i18n';
import { Link } from '../../../lib/router';
import { useDocumentMeta } from '../../../lib/seo';
import { cn } from '../../../utils/cn';
import { DeCheckList, DeCtaBand, DePageHero } from '../components/DeParts';

const DE = { ogLocale: 'de_DE' };

/* ------------------------------------------------------------------ Über uns */
export function DeAboutPage() {
  useDocumentMeta({
    title: 'Über FreightVanta',
    description:
      'FreightVanta macht aus verstreuten Beschaffungs- und Frachtübergaben einen praktikablen Sendungsplan – für Importeure, E-Commerce-Betreiber, Produktteams, Distributoren und wachsende Marken.',
    path: '/de/ueber-uns',
    ...DE,
  });
  const audiences = ['Importeure', 'E-Commerce-Betreiber', 'Produktteams', 'Distributoren', 'Wachsende Marken'];
  const confirmations = [
    'Laufzeiten, Preise und Leistungsumfang werden im Sendungsplan bestätigt – nie vorab versprochen.',
    'Zollzuständigkeiten, Zolldienstleister und Umfang der Abfertigung werden vor jeder Zusage festgelegt.',
    'Der Umfang von Lagerhaltung und Fulfillment wird bestätigt, bevor Bestände bewegt werden.',
    'Ändert sich eine Annahme, zeigt der Plan die Änderung.',
  ];

  return (
    <>
      <DePageHero
        breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Über FreightVanta' }]}
        eyebrow="Über FreightVanta"
        title="Ein praktikabler Sendungsplan."
        lead="FreightVanta macht aus verstreuten Beschaffungs- und Frachtübergaben einen Sendungsplan, mit dem Ihr Team arbeiten kann."
        media={getMedia('de-about-speicherstadt')}
        mediaAlt="Backsteinlagerhaus in der Hamburger Speicherstadt."
      />
      <section aria-labelledby="de-about-who" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="de-about-who" className="de-h2 text-anthrazit-900">
              Mit wem wir arbeiten
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-anthrazit-600">
              Wachsende Unternehmen, die in China einkaufen und an Kunden in Deutschland und der EU liefern – und bei denen der
              zusammenhängende Weg von der Produktbeschaffung bis zur Übergabe an den Empfänger nachvollziehbar bleiben muss.
            </p>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {audiences.map((audience) => (
              <li key={audience} className="flex items-center gap-3 border-b border-anthrazit-900/15 py-4 font-de-display text-2xl font-bold text-anthrazit-900">
                <span aria-hidden="true" className="h-2 w-2 bg-enzian-700" />
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="de-about-how" className="bg-anthrazit-900 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell">
          <h2 id="de-about-how" className="de-h2 max-w-3xl text-white">
            So arbeiten wir
          </h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {operationDe.items.map((item) => (
              <li key={item.title} className="border-t border-white/20 pt-6">
                <h3 className="font-de-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-anthrazit-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="de-about-confirm" className="bg-papier py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="de-about-confirm" className="de-h2 text-anthrazit-900">
              Was wir klären, bevor wir zusagen
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-anthrazit-600">{processDe.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <DeCheckList items={confirmations} />
          </div>
        </div>
      </section>
      <DeCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Kontakt */
export function DeContactPage() {
  useDocumentMeta({ title: 'Kontakt | Sendungsplan anfragen | FreightVanta', description: enquiryDe.body, path: '/de/kontakt', ...DE });
  const { email, phone, address } = siteConfig.contact;

  return (
    <>
      <DePageHero breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: 'Kontakt' }]} eyebrow="Kontakt" title="Kontakt zu FreightVanta" lead={enquiryDe.body} />
      <section aria-labelledby="de-contact-form-title" className="bg-kiesel-100 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="de-contact-form-title" className="font-de-display text-[2rem] font-bold leading-tight text-anthrazit-900">
              Sendungsplan anfragen
            </h2>
            {hasDirectContact && (
              <ul className="mt-6 space-y-3 text-[16px] text-anthrazit-700">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="de-link">
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="de-link">
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
            <h3 className="de-eyebrow mt-10 text-anthrazit-500">Hilfreiche Angaben</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-anthrazit-700">{processDe.items[0].copy}</p>
            <DeCheckList items={enquiryDe.settings.reassurance} className="mt-6" />
            <p className="mt-8 text-sm leading-relaxed text-anthrazit-600">
              Hinweis zur Datenverarbeitung: Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Details finden Sie in der{' '}
              <Link to={siteConfig.legalDe.datenschutz} className="de-link">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm
              idPrefix="de-kontakt"
              placement="contact"
              copy={enquiryDe.settings}
              strings={deStrings}
              theme="hanse"
              privacyUrl={siteConfig.legalDe.datenschutz}
              siteId={SITE_META.de.siteId}
              locale={SITE_META.de.locale}
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Rechtliches */
const PLACEHOLDER = 'Angabe folgt – vor Veröffentlichung durch den Betreiber zu ergänzen';

function Value({ value, multiline = false }: { value: string | string[]; multiline?: boolean }) {
  const lines = Array.isArray(value) ? value : [value];
  const filled = lines.some((line) => line.trim() !== '');
  if (!filled) return <span className="border border-dashed border-ziegel-600 bg-ziegel-100 px-2 py-0.5 text-[14px] text-ziegel-700">[{PLACEHOLDER}]</span>;
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
      <DePageHero breadcrumbs={[{ label: 'Startseite', to: '/de/' }, { label: breadcrumb }]} eyebrow="Rechtliches" title={title} lead={lead} />
      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10 text-anthrazit-700">{children}</div>
      </section>
    </>
  );
}

function LegalBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="border-t border-anthrazit-900/20 pt-6">
      <h2 className="font-de-display text-2xl font-bold text-anthrazit-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}

function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border border-anthrazit-900 border-l-4 border-l-ziegel-600 bg-papier px-5 py-4 text-[15px] leading-relaxed text-anthrazit-700">
      <span className="de-eyebrow mr-2 text-ziegel-700">Entwurf</span>
      {children}
    </p>
  );
}

const DE_LEGAL_SLUGS = ['impressum', 'datenschutz', 'agb', 'cookies'] as const;
export type DeLegalSlug = (typeof DE_LEGAL_SLUGS)[number];
export const isDeLegalSlug = (slug: string): slug is DeLegalSlug => (DE_LEGAL_SLUGS as readonly string[]).includes(slug);

export function DeLegalPage({ slug }: { slug: DeLegalSlug }) {
  switch (slug) {
    case 'impressum':
      return <ImpressumPage />;
    case 'datenschutz':
      return <DatenschutzPage />;
    case 'agb':
      return <AgbPage />;
    default:
      return <CookiePage />;
  }
}

function ImpressumPage() {
  useDocumentMeta({ title: 'Impressum | FreightVanta', description: 'Anbieterkennzeichnung gemäß § 5 DDG und § 18 Abs. 2 MStV.', path: '/de/impressum', ...DE });
  const i = siteConfig.impressum;
  const { email, phone } = siteConfig.contact;
  const complete = Boolean(i.company && i.addressLines.length && i.representatives && email && i.registerCourt && i.registerNumber && i.vatId && i.contentResponsible);

  return (
    <LegalShell title="Impressum" lead="Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV)." breadcrumb="Impressum">
      {!complete && (
        <DraftNotice>
          Die Pflichtangaben werden über die Site-Konfiguration gepflegt und sind vor Veröffentlichung durch den Betreiber zu ergänzen. Diese Vorlage erfindet keine Firmen-, Register- oder Kontaktdaten.
        </DraftNotice>
      )}
      <LegalBlock heading="Anbieter">
        <p className="font-semibold text-anthrazit-900">
          <Value value={[i.company, i.legalForm].filter(Boolean).join(' ')} />
        </p>
        <p>
          <Value value={i.addressLines} multiline />
        </p>
      </LegalBlock>
      <LegalBlock heading="Vertreten durch">
        <p>
          <Value value={i.representatives} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Kontakt">
        <p>
          Telefon: {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="de-link">{phone}</a> : <Value value="" />}
        </p>
        <p>
          E-Mail: {email ? <a href={`mailto:${email}`} className="de-link">{email}</a> : <Value value="" />}
        </p>
      </LegalBlock>
      <LegalBlock heading="Registereintrag">
        <p>
          Registergericht: <Value value={i.registerCourt} />
        </p>
        <p>
          Registernummer: <Value value={i.registerNumber} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Umsatzsteuer-Identifikationsnummer">
        <p>
          USt-IdNr. gemäß § 27a Umsatzsteuergesetz: <Value value={i.vatId} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          <Value value={i.contentResponsible} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG). Unsere Leistungen richten sich an Unternehmen.
        </p>
      </LegalBlock>
      <LegalBlock heading="Haftung für Inhalte und Links">
        <p>
          Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr. Für Inhalte verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </LegalBlock>
      <LegalBlock heading="Bildnachweise">
        <p>Fotografien: Pexels (u. a. Wolfgang Weiser, Tiger Lily, RDNE Stock project, Tima Miroshnichenko) unter der Pexels-Lizenz.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function DatenschutzPage() {
  useDocumentMeta({ title: 'Datenschutzerklärung | FreightVanta', description: 'Informationen zur Verarbeitung personenbezogener Daten gemäß Art. 13 DSGVO.', path: '/de/datenschutz', ...DE });
  const i = siteConfig.impressum;
  const { consent } = useConsent();
  const { email } = siteConfig.contact;

  return (
    <LegalShell title="Datenschutzerklärung" lead="Informationen zur Verarbeitung personenbezogener Daten auf dieser Website gemäß Art. 13 DSGVO." breadcrumb="Datenschutzerklärung">
      <DraftNotice>
        Diese Datenschutzerklärung beschreibt die tatsächlichen Funktionen dieser Vorlage (Anfrageformular, lokale Einwilligungsspeicherung, optionale First-Party-Statistik, lokal eingebundene Schriften). Sie ist vor Veröffentlichung durch den Betreiber zu prüfen und um Hosting-Anbieter, Speicherfristen und weitere Verarbeitungen zu ergänzen.
      </DraftNotice>
      <LegalBlock heading="1. Verantwortlicher">
        <p>
          <Value value={[i.company, i.legalForm].filter(Boolean).join(' ')} />
          <br />
          <Value value={i.addressLines} multiline />
        </p>
        <p>E-Mail: {email ? <a href={`mailto:${email}`} className="de-link">{email}</a> : <Value value="" />}</p>
        {i.dataProtectionOfficer && <p>Datenschutzbeauftragte:r: {i.dataProtectionOfficer}</p>}
      </LegalBlock>
      <LegalBlock heading="2. Bereitstellung der Website und Server-Logfiles">
        <p>
          Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch notwendige Daten (u. a. IP-Adresse, Zeitpunkt, aufgerufene Seite, Browsertyp), um die Website auszuliefern und ihre Sicherheit zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und stabilen Betrieb).
        </p>
        <p>
          Hosting-Anbieter, Serverstandort und Speicherfrist der Logfiles: <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="3. Anfrageformular (Sendungsplan)">
        <p>
          Wenn Sie einen Sendungsplan anfragen, verarbeiten wir die von Ihnen angegebenen Daten (Name, geschäftliche E-Mail-Adresse, Unternehmen, optional Telefon, Abhol- und Zielort, Ausgangspunkt, Waren- und Kontextangaben) ausschließlich zur Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie – soweit Sie im Formular eingewilligt haben – Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Zum Schutz vor missbräuchlichen Eingaben werden ein verstecktes Formularfeld und der Zeitpunkt des Formularbeginns geprüft; Anfragen werden mit einer technischen Vorgangsnummer protokolliert.
        </p>
        <p>
          Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Speicherfrist und empfangende Systeme (z. B. CRM): <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="4. Einwilligungsverwaltung und Nutzungsstatistik">
        <p>
          Ihre Auswahl zur Nutzungsstatistik wird lokal in Ihrem Browser gespeichert (Local Storage, Schlüssel „fv.analytics-consent.v1“). Diese Speicherung ist technisch notwendig, um Ihre Entscheidung zu respektieren (§ 25 Abs. 2 Nr. 2 TDDDG).
        </p>
        <p>
          Nur mit Ihrer Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO) erfassen wir Interaktionsereignisse – etwa Tab-Wechsel, Link-Klicks oder den Start des Anfrageformulars – zusammen mit Seite, Sprache und Zeitpunkt. Formulareingaben werden dabei nie übermittelt. Die Auswertung erfolgt als First-Party-Analyse ohne Drittanbieter. Empfangendes System und Speicherfrist: <Value value="" />
        </p>
        <p>
          Aktuelle Auswahl: {consent === 'granted' ? 'Statistik zugelassen' : consent === 'denied' ? 'abgelehnt' : 'noch nicht getroffen'}.{' '}
          <button type="button" onClick={openConsentSettings} className="de-link">
            Cookie-Einstellungen ändern
          </button>
        </p>
      </LegalBlock>
      <LegalBlock heading="5. Schriftarten und Bilder">
        <p>
          Schriftarten (Fira Sans, Fira Sans Condensed, Fira Mono) sind lokal in die Website eingebunden; es wird keine Verbindung zu Servern von Schriftanbietern (z. B. Google Fonts) aufgebaut. Beim Laden von Fotografien kann eine Verbindung zum Bild-CDN des Anbieters Pexels hergestellt werden, wobei Ihre IP-Adresse übermittelt wird. Für den produktiven Betrieb empfehlen wir, alle Bilder auf eigenen Servern zu hosten.
        </p>
      </LegalBlock>
      <LegalBlock heading="6. Ihre Rechte">
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde zu (Art. 77 DSGVO).
        </p>
      </LegalBlock>
      <LegalBlock heading="7. Stand">
        <p>Stand dieser Datenschutzerklärung: September 2026.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function AgbPage() {
  useDocumentMeta({ title: 'Allgemeine Geschäftsbedingungen | FreightVanta', description: 'Hinweise zur Nutzung der Website und zum Zustandekommen von Leistungen.', path: '/de/agb', ...DE });
  return (
    <LegalShell title="Allgemeine Geschäftsbedingungen" lead="Hinweise zur Nutzung dieser Website und zum Zustandekommen von Leistungen." breadcrumb="AGB">
      <DraftNotice>
        Die vollständigen AGB (einschließlich der Entscheidung, ob die Allgemeinen Deutschen Spediteurbedingungen – ADSp – einbezogen werden) sind vor Veröffentlichung durch den Betreiber und dessen Rechtsberatung festzulegen.
      </DraftNotice>
      <LegalBlock heading="Geltungsbereich">
        <p>Dieses Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB. Inhalte dieser Website stellen kein Angebot im Rechtssinne dar.</p>
      </LegalBlock>
      <LegalBlock heading="Zustandekommen von Leistungen">
        <p>
          Leistungsumfang, Zuständigkeiten, Preise, Termine und Haftung werden ausschließlich im schriftlichen Sendungsplan bzw. Angebot vereinbart. Aussagen auf dieser Website begründen keine Zusage zu Laufzeiten, Preisen oder Verzollungsergebnissen.
        </p>
      </LegalBlock>
      <LegalBlock heading="Ratgeberinhalte">
        <p>Ratgeber und Seiteninhalte sind allgemeine Planungsinformationen und ersetzen keine Rechts-, Zoll- oder Steuerberatung.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function CookiePage() {
  useDocumentMeta({ title: 'Cookie-Richtlinie | FreightVanta', description: 'Was diese Website in Ihrem Browser speichert – und warum.', path: '/de/cookies', ...DE });
  const { consent } = useConsent();
  return (
    <LegalShell title="Cookie-Richtlinie" lead="Was diese Website in Ihrem Browser speichert – und warum." breadcrumb="Cookie-Richtlinie">
      <LegalBlock heading="Technisch notwendige Speicherung">
        <p>Ihre Auswahl zur Nutzungsstatistik wird lokal im Browser gespeichert, damit die Website Ihre Entscheidung bei künftigen Besuchen respektieren kann. Es werden keine Tracking-Cookies von Drittanbietern gesetzt.</p>
      </LegalBlock>
      <LegalBlock heading="Optionale Nutzungsstatistik">
        <p>Mit Ihrer Einwilligung erfasst die Website Interaktionsereignisse wie Tab-Wechsel und Link-Klicks, um zu verstehen, welche Abschnitte Besuchern bei der Sendungsplanung helfen. Formulareingaben werden nie erfasst.</p>
      </LegalBlock>
      <div className="border border-anthrazit-900 bg-papier p-6">
        <p className="font-semibold text-anthrazit-900">
          Aktuelle Auswahl: {consent === 'granted' ? 'Statistik zugelassen' : consent === 'denied' ? 'abgelehnt' : 'noch nicht getroffen'}
        </p>
        <button type="button" onClick={openConsentSettings} className="de-link mt-3">
          Cookie-Einstellungen ändern
        </button>
      </div>
      <Link to="/de/kontakt" className="de-link">
        Kontakt zu FreightVanta
        <ArrowRight className="h-4 w-4" />
      </Link>
    </LegalShell>
  );
}

/* ------------------------------------------------------------------ 404 */
export function DeNotFoundPage({ path }: { path: string }) {
  useDocumentMeta({ title: 'Seite nicht gefunden | FreightVanta', description: 'Die gesuchte Seite konnte nicht gefunden werden.', path, ...DE });
  return (
    <section className={cn('relative isolate overflow-hidden border-b border-anthrazit-900 bg-papier py-24 text-anthrazit-900 sm:py-32')}>
      <div aria-hidden="true" className="de-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="shell max-w-3xl">
        <p className="de-eyebrow text-ziegel-700">Route nicht gefunden</p>
        <h1 className="mt-5 font-de-display text-5xl font-bold leading-tight">Diese Übergabe führt ins Leere.</h1>
        <p className="mt-5 text-lg text-anthrazit-600">
          Die Seite <span className="font-de-mono text-base text-anthrazit-800">{path}</span> ist nicht verfügbar. Wählen Sie einen nächsten Schritt.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/de/" className="de-btn de-btn-primary">
            Zur Startseite
          </Link>
          <Link to={DE_ANCHORS.services} className="de-btn de-btn-outline">
            Leistungen ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
