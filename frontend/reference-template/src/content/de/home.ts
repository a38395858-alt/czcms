/**
 * Deutsche Startseite — lokalisierte Sektionsdatensätze.
 * Struktur folgt dem gemeinsamen Sektionsvertrag (../types.ts); die Texte gehören dieser Site.
 */
import { SITE_META } from '../../config/site';
import type {
  AnnouncementSection,
  CoverageSection,
  EnquirySection,
  FaqSection,
  FooterSection,
  HeroSection,
  HomeSection,
  IndustriesSection,
  OperationSection,
  ProcessSection,
  ResourcesSection,
  ServicePathsSection,
} from '../types';
import { INDUSTRIES_DE } from './industries';
import { SERVICES_DE } from './services';

const base = {
  site_id: SITE_META.de.siteId,
  locale: SITE_META.de.locale,
  enabled: true,
  eyebrow: '',
  title: '',
  body: '',
  cta_primary_label: '',
  cta_primary_url: '',
  cta_secondary_label: '',
  cta_secondary_url: '',
  media_id: '',
  media_alt: '',
  draft_version: 1,
  published_version: 1,
};

export const DE_ANCHORS = {
  enquiry: '/de/#anfrage',
  services: '/de/#leistungen',
  process: '/de/#ablauf',
};

export const announcementDe: AnnouncementSection = {
  ...base,
  section_key: 'announcement',
  sort_order: 10,
  body: 'Waren aus China nach Deutschland oder in die EU? Fordern Sie einen Sendungsplan von einem Logistikspezialisten an.',
  cta_primary_label: 'Sendungsplan anfragen',
  cta_primary_url: DE_ANCHORS.enquiry,
  items: [],
  settings: {},
};

export const heroDe: HeroSection = {
  ...base,
  section_key: 'hero',
  sort_order: 20,
  eyebrow: 'INTERNATIONALE LOGISTIK, KLAR GEFÜHRT',
  title: 'Fracht zwischen. Klar. Sicher. Pünktlich geplant.',
  body: 'FreightVanta koordiniert Beschaffung, Seefracht, Luftfracht, Zollinformationen, Lager und Fulfillment für internationale Lieferketten. Sie sehen, welche Entscheidung als Nächstes ansteht und wer sie verantwortet.',
  cta_primary_label: 'Transport planen',
  cta_primary_url: DE_ANCHORS.enquiry,
  cta_secondary_label: 'Leistungen ansehen',
  cta_secondary_url: DE_ANCHORS.services,
  media_id: 'de-hero-hamburg',
  media_alt: 'Containerschiffe und Containerbrücken am Hamburger Containerterminal beim Güterumschlag.',
  items: [],
  settings: {
    microcopy:
      'Produkt, Menge, Start, Ziel und gewünschter Termin genügen für eine erste Einschätzung.',
    route_labels: ['WERK', 'HAFEN', 'LAGER', 'EMPFÄNGER'],
  },
};

/** Technical "Sendungsübersicht" panel rows shown beside the hero image. */
export const HERO_SPEC_DE: Array<{ term: string; detail: string }> = [
  { term: 'Ursprung', detail: 'Lieferant oder Werk in China' },
  { term: 'Verkehrsträger', detail: 'See, Luft oder Bahn – je Sendung verglichen' },
  { term: 'Übergaben', detail: 'Zollunterlagen, Lager, Fulfillment, Zustellung' },
  { term: 'Ergebnis', detail: 'Ein Sendungsplan mit klaren Zuständigkeiten' },
];

export const coverageDe: CoverageSection = {
  ...base,
  section_key: 'coverage',
  sort_order: 30,
  title: 'Leistungen im Überblick',
  items: [
    { label: 'Beschaffung in China', href: '/de/loesungen/beschaffung-in-china' },
    { label: 'Seefracht', href: '/de/loesungen/seefracht' },
    { label: 'Luftfracht', href: '/de/loesungen/luftfracht' },
    { label: 'Zollkoordination', href: '/de/loesungen/zollkoordination' },
    { label: 'Lager & Fulfillment', href: '/de/loesungen/lager-und-fulfillment' },
    { label: 'Zustellung auf der letzten Meile', href: '/de/loesungen/landtransport-und-zustellung' },
  ],
  settings: {},
};

export const servicePathsDe: ServicePathsSection = {
  ...base,
  section_key: 'service_paths',
  sort_order: 40,
  eyebrow: 'Was wir koordinieren',
  title: 'Eine Lieferkette. Ein nachvollziehbarer Arbeitsstand.',
  body: 'Von der Anfrage bis zur Zustellung werden Informationen, Dokumente und Übergaben in einem abgestimmten Ablauf geführt.',
  items: SERVICES_DE.filter((service) => service.inSelector).map((service) => ({
    id: service.slug,
    label: service.label,
    title: service.title,
    copy: service.copy,
    tags: service.tags,
    link_label: service.linkLabel,
    link_url: `/de/loesungen/${service.slug}`,
    media_id: service.mediaId,
    media_alt: service.mediaAlt,
    starting_point: service.startingPoint,
  })),
  settings: {
    panel_cta_label: 'So passt diese Leistung in Ihre Sendung',
    default_tab: 'beschaffung-in-china',
  },
};

export const operationDe: OperationSection = {
  ...base,
  section_key: 'operation',
  sort_order: 50,
  eyebrow: 'Eine verbundene Abwicklung',
  title: 'Verlässlichkeit entsteht durch dokumentierte Details.',
  cta_primary_label: 'So läuft die Zusammenarbeit ab',
  cta_primary_url: DE_ANCHORS.process,
  items: [
    {
      title: 'Fester Ansprechpartner',
      copy: 'Fragen, Lieferantenantworten und Versandnotizen bleiben in einem Vorgang.',
    },
    {
      title: 'Qualitätsprüfung vor Versand',
      copy: 'Zustand, Menge und vereinbarte Verpackung werden vor dem nächsten Übergang geprüft.',
    },
    {
      title: 'Klare Verantwortlichkeiten',
      copy: 'Jede Übergabe erhält einen Status, eine zuständige Person und den nächsten Schritt.',
    },
    {
      title: 'Ausnahmen früh melden',
      copy: 'Änderungen werden markiert, damit Einkauf und Vertrieb reagieren können.',
    },
  ],
  settings: {
    pull_quote:
      'Ein klarer Gesamtüberblick – von der ersten Produkt- oder Lieferantenentscheidung bis zur Übergabe an den Empfänger.',
  },
};

export const processDe: ProcessSection = {
  ...base,
  section_key: 'process',
  sort_order: 60,
  title: 'Vier Schritte, die Entscheidungen leichter machen.',
  body: 'Ändert sich eine Annahme, soll der Plan die Änderung zeigen – statt sie in einer langen E-Mail-Kette zu verstecken.',
  items: [
    {
      step: '01',
      title: 'Anforderungen aufnehmen',
      copy: 'Produkt, Menge, Ziel, Termin, Dokumente und Verpackungswünsche.',
    },
    {
      step: '02',
      title: 'Vorgehen festlegen',
      copy: 'Leistungsumfang, offene Fragen und Zuständigkeiten bestätigen.',
    },
    {
      step: '03',
      title: 'Übergaben koordinieren',
      copy: 'Beschaffung, Prüfung, Verpackung, Transport und Zustellung fortlaufend dokumentieren.',
    },
    {
      step: '04',
      title: 'Ankunft vorbereiten',
      copy: 'Tracking und Ausnahmehinweise so übergeben, dass Ihr Team planen kann.',
    },
  ],
  settings: {
    closing: '',
  },
};

export const industriesDe: IndustriesSection = {
  ...base,
  section_key: 'industries',
  sort_order: 70,
  title: 'Für Waren, bei denen Genauigkeit zählt.',
  body: 'Unterschiedliche Waren brauchen unterschiedliche Prüfungen, Unterlagen und Zustellgespräche. Die Arbeit beginnt bei der Anforderung, die für Ihren Betrieb am meisten zählt.',
  cta_primary_label: 'Branchenlösungen ansehen',
  cta_primary_url: '/de/branchen',
  media_id: 'de-industry-featured',
  media_alt: 'Ein Mitarbeiter trägt einen Karton entlang eines gut organisierten Lagerregals.',
  items: INDUSTRIES_DE.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    copy: industry.copy,
    href: `/de/branchen/${industry.slug}`,
  })),
  settings: {
    media_caption: 'Wareneingang & Prüfung',
  },
};

export const resourcesDe: ResourcesSection = {
  ...base,
  section_key: 'resources',
  sort_order: 80,
  eyebrow: 'Planungswissen',
  title: 'Logistikwissen für sichere Entscheidungen.',
  body: 'Verständliche Leitfäden zu Importvorbereitung, Incoterms, Lieferantenbriefing, Seefracht oder Luftfracht und zur Prüfung von Packdaten.',
  cta_primary_label: 'Zum Ratgeber',
  cta_primary_url: '/de/ratgeber',
  items: [
    { label: 'Import-Checkliste', href: '/de/ratgeber/import-checkliste-deutschland' },
    { label: 'Seefracht oder Luftfracht?', href: '/de/ratgeber/seefracht-luftfracht-oder-bahn' },
    { label: 'Lieferantenbriefing', href: '/de/ratgeber/sourcing-briefing-china' },
    { label: 'Verpackung für den Direktversand', href: '/de/ratgeber/verpackung-und-beilagen' },
  ],
  settings: {
    heading_url: '/de/ratgeber',
    article_limit: 3,
    topics_label: 'Mit einem Thema beginnen',
  },
};

export const faqDe: FaqSection = {
  ...base,
  section_key: 'faq',
  sort_order: 90,
  title: 'Fragen vor dem Versand?',
  items: [
    {
      id: 'produktlink',
      question: 'Kann ich mit einem Produktlink starten?',
      answer:
        'Ja. Link, Foto oder Spezifikation reichen für die erste Anfrage.',
    },
    {
      id: 'beschaffung-fulfillment',
      question: 'Planen Sie auch einzelne Leistungen?',
      answer:
        'Ja. Das Formular lässt Beschaffung, Transport, Lager, Verpackung, Fulfillment oder eine Kombination auswählen.',
    },
    {
      id: 'see-luft',
      question: 'Übernehmen Sie die Zollabfertigung?',
      answer:
        'Wir koordinieren Angaben und Übergaben; die zuständige Abfertigungsstelle muss je Sendung bestätigt werden.',
    },
    {
      id: 'zoll',
      question: 'Welche Angaben beschleunigen die Antwort?',
      answer:
        'Start, Ziel, Menge, gewünschter Termin, Produktart und vorhandene Dokumente.',
    },
    {
      id: 'lager-deutschland',
      question: 'Unterstützen Sie Lagerhaltung und Fulfillment in Deutschland?',
      answer:
        'Nennen Sie uns Ihre Anforderungen an Wareneingang, Lagerung, Vorbereitung und Freigabe. Der verfügbare Leistungsumfang wird im Plan bestätigt, bevor Bestände bewegt werden.',
    },
    {
      id: 'einzelleistung',
      question: 'Kann ich auch nur eine einzelne Leistung anfragen?',
      answer:
        'Ja. Sie können mit Beschaffung, Transport, Lagerung, Verpackung, Fulfillment oder einem kombinierten Plan beginnen. Im Formular wählen Sie den Ausgangspunkt.',
    },
  ],
  settings: {
    aside_prompt: 'Ihre Frage ist nicht dabei? Beginnen Sie mit dem, was Sie wissen – eine Fachperson hilft beim Rest.',
    aside_link_label: 'Sagen Sie uns, was bewegt wird',
    aside_link_url: DE_ANCHORS.enquiry,
  },
};

export const enquiryDe: EnquirySection = {
  ...base,
  section_key: 'enquiry',
  sort_order: 100,
  eyebrow: 'Transport planen',
  title: 'Beschreiben Sie Ihre Sendung. Wir ordnen die nächsten Schritte.',
  body: 'Beginnen Sie mit Produkt, Menge, Start, Ziel und gewünschtem Termin. Eine Fachperson von FreightVanta prüft die Angaben und meldet sich mit dem passenden nächsten Schritt.',
  items: [],
  settings: {
    button: 'Angebot anfordern',
    loading: 'Ihre Anfrage wird gesendet …',
    success_title: 'Vielen Dank – Ihre Anfrage ist unterwegs.',
    success_body: 'Eine Fachperson von FreightVanta prüft die Angaben und meldet sich mit dem passenden nächsten Schritt.',
    error:
      'Die Anfrage konnte noch nicht gesendet werden. Bitte prüfen Sie die markierten Felder und versuchen Sie es erneut – oder kontaktieren Sie uns über die unten stehenden Angaben.',
    reassurance: [
      'Wir fragen nur ab, was für einen ersten Sendungsplan nötig ist – Pflichtfelder sind mit * gekennzeichnet.',
      'Ein Produktlink, ein Foto oder eine kurze Spezifikation reicht für ein erstes Beschaffungsgespräch.',
      'Sie können mit einer einzelnen Leistung oder einem kombinierten Plan beginnen; der endgültige Umfang wird im Sendungsplan bestätigt.',
    ],
    consent_prefix:
      'Ich habe die Datenschutzerklärung zur Kenntnis genommen und bin einverstanden, dass FreightVanta meine Angaben zur Bearbeitung meiner Anfrage und zur Kontaktaufnahme verarbeitet. Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen. Zur',
    consent_link_label: 'Datenschutzerklärung',
    consent_suffix: '.',
  },
};

export const footerDe: FooterSection = {
  ...base,
  section_key: 'footer',
  sort_order: 110,
  body: 'Kurzprofil · Leistungen · Branchen · Wissen · Kontakt · Datenschutz · Impressum.',
  cta_primary_label: 'Angebot anfordern',
  cta_primary_url: DE_ANCHORS.enquiry,
  items: [
    { key: 'brand', title: 'FreightVanta' },
    { key: 'solutions', title: 'Leistungen' },
    { key: 'industries', title: 'Branchen & Ratgeber' },
    { key: 'contact', title: 'Kontakt & Rechtliches' },
  ],
  settings: {},
};

export const HOME_SECTIONS_DE: HomeSection[] = [
  announcementDe,
  heroDe,
  coverageDe,
  servicePathsDe,
  operationDe,
  processDe,
  industriesDe,
  resourcesDe,
  faqDe,
  enquiryDe,
  footerDe,
];

export function getPublishedHomeSectionsDe(): HomeSection[] {
  return HOME_SECTIONS_DE.filter((section) => section.enabled && section.published_version > 0).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}

export const HOME_META_DE = {
  title: 'FreightVanta Deutschland | Internationale Fracht und Fulfillment',
  description:
    'FreightVanta koordiniert Beschaffung, See- und Luftfracht, Zollinformationen, Lager und Fulfillment für klare internationale Lieferketten.',
  path: '/de/',
};
