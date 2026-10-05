/**
 * Deutsche Startseite — lokalisierte Sektionsdaten.
 * Struktur folgt dem gemeinsamen Sektionsvertrag (../types.ts); Inhalte gehören dieser Site.
 * Template-Persönlichkeit: „Speicherstadt Präzision“ — Papier, Graphit, Backsteinrot, Petrol.
 */
import type { StartingPointValue } from '../types';

export const DE_META = {
  title: 'China-Beschaffung, internationale Fracht & Fulfillment | FreightVanta',
  description:
    'FreightVanta koordiniert Produktbeschaffung in China, See- und Luftfracht, Versandvorbereitung, Lagerung, Fulfillment und die Zustellung nach Deutschland in einem praktikablen Versandplan.',
  path: '/de/',
  lang: 'de-DE',
};

export const deAnnouncement = {
  body: 'Fracht nach Deutschland oder in die EU? Fordern Sie einen Versandplan von einem Logistikspezialisten an.',
  cta_label: 'Versandplan anfordern',
  cta_url: '/de/anfrage',
};

export const deNav = [
  { label: 'Leistungen', href: '/de/leistungen' },
  { label: 'Ablauf', href: '/de/ablauf' },
  { label: 'Branchen', href: '/de/branchen' },
  { label: 'Wissen', href: '/de/wissen' },
  { label: 'FAQ', href: '/de/fragen' },
  { label: 'Kontakt', href: '/de/anfrage' },
];

export const deHero = {
  eyebrow: 'Beschaffung & Fracht, klar koordiniert',
  title: 'Von der Beschaffung in China bis zur Zustellung in Deutschland – jede Übergabe bleibt nachvollziehbar.',
  body: 'FreightVanta unterstützt wachsende Unternehmen dabei, Produktbeschaffung, Versandvorbereitung, See- und Luftfracht, Zollunterlagen, Lagerung, Fulfillment und die letzte Meile in einem praktikablen Betriebsplan zu koordinieren.',
  cta_primary_label: 'Versandplan anfordern',
  cta_primary_url: '/de/anfrage',
  cta_secondary_label: 'Leistungen ansehen',
  cta_secondary_url: '/de/leistungen',
  microcopy:
    'Beginnen Sie mit einem Produktlink, einem Versand-Briefing oder der Route, die Sie planen müssen. Wir helfen Ihnen, den nächsten sinnvollen Schritt zu bestimmen.',
  route_labels: ['HERKUNFT', 'HAFEN', 'LAGER', 'KUNDE'],
  media_id: 'de-hero-hafen',
  media_alt: 'Schwarz-Weiß-Aufnahme eines Umschlaghafens mit Containerbrücken und Frachtschiffen.',
};

export const deCoverage = [
  'Produktbeschaffung in China',
  'Seefracht',
  'Luftfracht',
  'Zollkoordination',
  'Lagerung & Fulfillment',
  'Letzte Meile',
];

export interface DeService {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  starting_point: StartingPointValue | null;
  /** Ausführliche englische Leistungsseite (deutsche Fassung folgt). */
  detail_url: string;
}

export const deServices: DeService[] = [
  {
    id: 'produktbeschaffung',
    label: 'Produktbeschaffung',
    title: 'Den richtigen Produktweg finden.',
    copy: 'Teilen Sie einen Produktlink, ein Foto, eine Spezifikation oder einen Zielpreis. Wir helfen dabei, Lieferantenfragen, Vergleichskriterien, Muster und Einkaufsdetails zu ordnen, die vor der nächsten Übergabe geklärt sein müssen.',
    tags: ['China-Beschaffung', 'Lieferanten-Briefing', 'Musterkoordination'],
    starting_point: 'product-sourcing',
    detail_url: '/solutions/product-sourcing',
  },
  {
    id: 'seefracht',
    label: 'Seefracht',
    title: 'Die wirtschaftliche Etappe planen.',
    copy: 'Bei Sammel- oder Containerfracht helfen wir, Versandbereitschaft, Exportdokumente, Hafenübergaben und den Zustellplan aufeinander abzustimmen. Das Briefing zeigt, was enthalten ist, welche Entscheidungen offen sind und wer den nächsten Schritt verantwortet.',
    tags: ['FCL', 'LCL', 'Hafen bis Haustür'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'luftfracht',
    label: 'Luftfracht',
    title: 'Die zeitkritische Etappe absichern.',
    copy: 'Wenn ein Launch, eine Nachbestellung oder ein dringender Auftrag nicht auf den nächsten Seefracht-Zyklus warten kann, vergleichen wir praktikable Luftfracht-Optionen und organisieren Abholung, Versanddokumente und Zustellübergaben.',
    tags: ['Express', 'Standard', 'Dringende Nachversorgung'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'zollkoordination',
    label: 'Zollkoordination',
    title: 'Dokumente früh bereitstellen.',
    copy: 'Wir helfen, Handelsrechnungen, Packlisten und Sendungsdaten zusammenzustellen, damit Fragen sichtbar werden, bevor die Ware den nächsten Kontrollpunkt erreicht. Verbindliche Tarifierung und Zollabfertigung verbleiben bei der zuständigen Behörde und dem verantwortlichen Zolldienstleister.',
    tags: ['Sendungsdaten', 'Dokumentenbereitschaft', 'Übergabe-Support'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'lagerung-fulfillment',
    label: 'Lagerung & Fulfillment',
    title: 'Annehmen, prüfen und gezielt versenden.',
    copy: 'Bestände können angenommen, geprüft, konsolidiert, gelagert und für das von Ihnen freigegebene Ziel vorbereitet werden. Das Briefing hält Produkt-, Verpackungs- und Freigabeanweisungen am Auftrag fest.',
    tags: ['Konsolidierung', 'Lagerung', 'Auftragsvorbereitung'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'verpackung-branding',
    label: 'Verpackung & Branding',
    title: 'Das Paket zu Ihrem Paket machen.',
    copy: 'Koordinieren Sie freigegebene Beileger, Aufkleber, Anhänger, Beutel, Kartons und weitere Markenelemente als Teil des Fulfillment-Briefings. Druckdaten, Mengen und Produktionsschritte werden vor dem Einsatz bestätigt.',
    tags: ['Beileger', 'Etiketten', 'Private-Label-Vorbereitung'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const deServicesSection = {
  kicker: '01 · Was wir koordinieren',
  title: 'Ein Gesamtbild vom Lieferanten bis zum Kunden.',
  body: 'Ihre Sendung folgt selten nur einem Schritt. Wir verbinden Beschaffung, Vorbereitung, Transport, Zollunterlagen, Lagerung und Zustellung zu einem Ablauf, dem Ihr Team folgen kann.',
  panel_cta_label: 'Diesen Baustein im Versandplan anfragen',
  detail_link_label: 'Ausführliche Seite (EN)',
};

export const deOperation = {
  kicker: '02 · Ein verbundener Betrieb',
  title: 'Zuverlässigkeit entsteht im Detail.',
  pull_quote: 'Ein klares Gesamtbild – von der ersten Produkt- oder Lieferantenentscheidung bis zur Zustellübergabe.',
  items: [
    {
      title: 'Feste Ansprechperson',
      copy: 'Eine Person hält Anfrage, Lieferantenfragen, Sendungsnotizen und den nächsten Schritt im selben Arbeitsfaden zusammen.',
    },
    {
      title: 'Prüfung vor Versand',
      copy: 'Produktzustand, Menge und vereinbarte Verpackungsanweisungen werden bestätigt, bevor die Ware das Lager verlässt.',
    },
    {
      title: 'Flexible Versandvorbereitung',
      copy: 'Aufträge werden konsolidiert, Ziele getrennt oder Bestände gehalten – gemäß dem Plan, den Ihr Team freigibt.',
    },
    {
      title: 'Nachvollziehbare Übergaben',
      copy: 'Carrier-Referenzen und Statusnotizen bleiben beieinander, damit Ihr Team sieht, was sich geändert hat und was als Nächstes passiert.',
    },
  ],
};

export const deProcess = {
  kicker: '03 · Ablauf',
  title: 'Ein praktikabler Ablauf für komplexe Fracht.',
  body: 'Es geht nicht darum, Logistik einfach aussehen zu lassen. Es geht darum, die nächste Entscheidung, das nächste Dokument und die nächste Übergabe sichtbar zu halten, bevor daraus eine Verzögerung wird.',
  steps: [
    {
      step: '01',
      title: 'Sagen Sie uns, was bewegt wird.',
      copy: 'Teilen Sie Produktlinks, Mengen, Abgangsort, Zielort, Termin sowie Verpackungs- oder Compliance-Anforderungen.',
    },
    {
      step: '02',
      title: 'Prüfen Sie den Plan.',
      copy: 'Wir klären den vorgeschlagenen Leistungsweg, offene Fragen, erforderliche Dokumente und Zuständigkeiten, bevor die Arbeit beginnt.',
    },
    {
      step: '03',
      title: 'Jede Übergabe wird koordiniert.',
      copy: 'Beschaffung, Einkauf, Prüfung, Vorbereitung, Fracht, Lagerung und Zustellung folgen einem gemeinsamen Arbeitsstand.',
    },
    {
      step: '04',
      title: 'Halten Sie Ihr Kundenversprechen.',
      copy: 'Sie erhalten die Tracking- und Ausnahme-Notizen, die Ihr Team für Bestands- und Kundenkommunikation braucht.',
    },
  ],
  closing: 'Wenn sich eine Annahme ändert, soll der Plan die Änderung zeigen – statt sie in einer langen E-Mail-Kette zu verstecken.',
};

export const deIndustries = {
  kicker: '04 · Branchen',
  title: 'Für Teams, die bei der Übergabe etwas zu verlieren haben.',
  body: 'Unterschiedliche Waren brauchen unterschiedliche Prüfungen, Dokumente und Liefergespräche. Die Arbeit beginnt bei der Anforderung, die für Ihren Betrieb am wichtigsten ist.',
  detail_label: 'Branchenseite (EN)',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'E-Commerce & Handel',
      copy: 'Nachversorgung, Bundles, Marktplatz-Vorbereitung und filialspezifische Verpackung bleiben vom Lieferanten bis zum Kunden geordnet.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Konsumgüter',
      copy: 'Produktdetails, Qualitätsprüfungen, Launch-Bereitschaft und Präsentation werden vom Lieferanten bis ins Regal oder an die Haustür koordiniert.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Industriekomponenten',
      copy: 'Gearbeitet wird nach Spezifikationen, Dokumentation, Warenannahme-Anforderungen und einem klaren Plan für die nächste Produktions- oder Serviceübergabe.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Zeitkritische Fracht',
      copy: 'Die nächste machbare Bewegung hat Priorität; Ausnahmen werden früh sichtbar gemacht, wenn der Termin nicht warten kann.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const deResources = {
  kicker: '05 · Wissen',
  title: 'Wissen für bessere Entscheidungen.',
  body: 'Praktische Leitfäden zu China-Beschaffung, internationaler Fracht, Importvorbereitung, Incoterms und Lieferantenkoordination – für die Entscheidungen zwischen „bestellt“ und „geliefert“.',
  note: 'Unsere Leitfäden erscheinen zuerst auf Englisch; deutsche Fassungen folgen. Die verlinkten Beiträge öffnen die englische Ausgabe.',
  topics: [
    { label: 'Checkliste für die Importplanung (EN)', href: '/guides/import-planning-checklist' },
    { label: 'Seefracht oder Luftfracht? (EN)', href: '/guides/ocean-or-air-freight' },
    { label: 'Ein China-Sourcing-Briefing vorbereiten (EN)', href: '/guides/china-sourcing-brief' },
    { label: 'Verpackungs- und Beileger-Leitfaden (EN)', href: '/guides/packaging-insert-guide' },
    { label: 'Incoterms verständlich erklärt (EN)', href: '/guides/incoterms-handoffs' },
  ],
  cta_label: 'Zum Ressourcen-Center (EN)',
  cta_url: '/guides',
};

export const deFaq = {
  kicker: '06 · FAQ',
  title: 'Fragen, bevor es losgeht?',
  aside_prompt: 'Ihre Frage ist nicht dabei? Beginnen Sie mit dem, was Sie wissen – ein Spezialist hilft beim Rest.',
  aside_link_label: 'Sagen Sie uns, was bewegt wird',
  aside_link_url: '/de/anfrage',
  items: [
    {
      id: 'produktlink',
      question: 'Kann ich nur mit einem Produktlink starten?',
      answer:
        'Ja. Ein Produktlink, ein Foto oder eine kurze Spezifikation reicht für ein erstes Beschaffungsgespräch. Mengen, Zielort und Termin können folgen, sobald der Plan klarer wird.',
    },
    {
      id: 'beschaffung-fulfillment',
      question: 'Können Sie Beschaffung und Fulfillment kombinieren?',
      answer:
        'Diese Seite zeigt Beschaffung, Vorbereitung, Fracht, Lagerung und Fulfillment als einen verbundenen Ablauf. Der endgültige Umfang wird im Versandplan bestätigt.',
    },
    {
      id: 'see-luft',
      question: 'Unterstützen Sie See- und Luftfracht?',
      answer:
        'Ja. Sagen Sie uns, was bewegt wird, wie schnell es ankommen muss und was für die Sendung am wichtigsten ist. Wir besprechen den praktikablen Leistungsweg und die nächste Übergabe.',
    },
    {
      id: 'zoll',
      question: 'Übernehmen Sie die Zollabfertigung?',
      answer:
        'Wir koordinieren Sendungsdaten und Dokumentenübergaben. Der verantwortliche Zolldienstleister, die Zuständigkeit, die Tarifierung und der formale Abfertigungsumfang müssen geklärt sein, bevor eine Abfertigungszusage möglich ist.',
    },
    {
      id: 'lager-deutschland',
      question: 'Unterstützen Sie Lagerung und Fulfillment in Deutschland?',
      answer:
        'Nennen Sie uns die Anforderungen an Warenannahme, Lagerung, Vorbereitung und Freigabe. Der verfügbare Leistungsumfang wird im Plan bestätigt, bevor Bestände bewegt werden.',
    },
    {
      id: 'einzelleistung',
      question: 'Kann ich auch nur eine einzelne Leistung anfragen?',
      answer:
        'Ja. Sie können mit Beschaffung, Transport, Lagerung, Verpackung, Fulfillment oder einem kombinierten Plan beginnen. Im Formular wählen Sie den Ausgangspunkt.',
    },
  ],
};

export const deEnquiry = {
  kicker: '07 · Versandplan anfordern',
  form_tag: 'Formblatt A · Versandplan-Anfrage',
  title: 'Sagen Sie uns, was Sie bewegen müssen. Wir machen aus den Einzelteilen einen Plan, mit dem Ihr Team arbeiten kann.',
  body: 'Beginnen Sie mit dem Produkt, der Route oder dem Lieferergebnis, das Sie brauchen. Ein FreightVanta-Spezialist prüft die Angaben und meldet sich mit dem passenden nächsten Schritt.',
  reassurance: [
    'Ein Produktlink, ein Foto oder eine kurze Spezifikation reicht für ein erstes Beschaffungsgespräch.',
    'Sie können mit Beschaffung, Transport, Lagerung, Verpackung, Fulfillment oder einem kombinierten Plan beginnen.',
    'Der endgültige Umfang wird im Versandplan bestätigt.',
  ],
  copy: {
    button: 'Versandplan anfordern',
    loading: 'Ihre Anfrage wird gesendet…',
    success_title: 'Vielen Dank – Ihre Anfrage ist unterwegs.',
    success_body: 'Ein FreightVanta-Spezialist prüft die Angaben und meldet sich mit dem passenden nächsten Schritt.',
    error:
      'Die Anfrage konnte noch nicht gesendet werden. Bitte prüfen Sie die markierten Felder und versuchen Sie es erneut – oder nutzen Sie die unten angegebenen Kontaktmöglichkeiten.',
    reassurance: [],
    consent_prefix:
      'Ich willige ein, dass FreightVanta meine Angaben zur Bearbeitung meiner Anfrage und zur Kontaktaufnahme verwendet, wie in der',
    consent_link_label: 'Datenschutzerklärung',
    consent_suffix: ' beschrieben.',
  },
};

export const deFooter = {
  tagline: 'Ein praktikabler Plan, klare Verantwortung und Updates, mit denen Ihr Team arbeiten kann.',
  cta_label: 'Versandplan anfordern',
  cta_url: '/de/anfrage',
  columns: {
    services: 'Leistungen',
    site: 'Navigation',
    legal: 'Kontakt & Rechtliches',
  },
  legal_links: [
    { label: 'Impressum', href: '/de/impressum' },
    { label: 'Datenschutzerklärung', href: '/de/datenschutz' },
  ],
  language_label: 'Sprache',
  cookie_settings: 'Cookie-Einstellungen',
  contact_label: 'Kontakt',
  rights: 'Alle Rechte vorbehalten.',
  locale_tag: 'Deutsch · Deutschland',
};
