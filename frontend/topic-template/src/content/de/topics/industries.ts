/**
 * Deutsche Branchen-Themenseiten (§2.1–2.4).
 * Wortlaut 1:1 aus dem DE-Dokument.
 */
import type { TopicPageContent } from '../../en-global/topics/types';
import { DE_INDUSTRY_RAIL, DE_RELATED_RAIL } from './rails';

const DE_INDUSTRY_CONTEXT_FIELDS = [
  { name: 'industry_context', label: 'Branchenkontext' },
  { name: 'business_consequence', label: 'Geschäftliche Konsequenz' },
  { name: 'receiving_owner', label: 'Empfangsverantwortung' },
  { name: 'route_concern', label: 'Routenproblem' },
];

const DE_INDUSTRY_RELATED = [
  { ...DE_RELATED_RAIL['product-sourcing'] },
  { ...DE_RELATED_RAIL['bulk-procurement'] },
  { ...DE_RELATED_RAIL['inventory-storage'] },
  { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
];

export const DE_CROSS_BORDER_ECOMMERCE_TOPIC: TopicPageContent = {
  id: 'de-industry-cross-border-ecommerce',
  kind: 'industry',
  route: '/de/industries/cross-border-ecommerce',
  pageLabel: 'Grenzüberschreitender E-Commerce',
  breadcrumbParent: { label: 'Branchen', href: '/de/branchen' },
  meta: {
    title: 'Logistik für grenzüberschreitenden E-Commerce aus China | FreightVanta',
    description:
      'Planen Sie den operativen Weg von der Beschaffung in China über Produktprüfung, Verpackung, Wareneingang und Freigabe bis zum kundenfertigen Auftrag.',
    keywords: [
      'Logistik grenzüberschreitender E-Commerce aus China',
      'Lieferkettenkoordination E-Commerce China',
      'Sourcing und Fulfillment aus China',
      'handelsfähiger E-Commerce-Bestand',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'E-Commerce-Übergabe planen',
  hero: {
    kicker: 'GRENZÜBERSCHREITENDER E-COMMERCE',
    title: 'Verbinden Sie die Beschaffungsentscheidung in China mit der Bestellung, die Ihr Kunde erhalten soll.',
    body: 'Grenzüberschreitender E-Commerce ist eine Kette verbundener Entscheidungen: Produktreferenz, Lieferantenfragen, Spezifikation, Verpackung, Wareneingang, Freigaberegel und Kundenauftrag. FreightVanta hilft, diese Kette sichtbar zu machen, damit das nächste Team mit demselben Produkt- und Packkontext arbeiten kann. Carrier-Abdeckung, Lieferzeit, Zoll, Plattformanbindung und Serviceverfügbarkeit bleiben von bestätigtem Ziel und Umfang abhängig.',
    primaryCta: 'E-Commerce-Übergabe planen',
    secondaryCta: 'Operativen Weg ansehen',
    mediaId: 'industry-ecommerce',
    mediaAlt: 'Wareneingang im E-Commerce-Lager: Kartons werden an organisierten Regalen geprüft.',
    rail: [
      { label: 'PRODUKT' },
      { label: 'PRÜFUNG' },
      { label: 'VERPACKUNG' },
      { label: 'WARENEINGANG' },
      { label: 'FREIGABE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'E-Commerce ist eine Folge von Zusagen, nicht ein Versandetikett.',
        paragraphs: [
          'Das Produkt, das ein Kunde sieht, muss mit dem beschafften Produkt, der gepackten Version, dem eingegangenen Bestand und dem freigegebenen Auftrag verbunden sein. Ist ein Glied unklar, muss das nächste Team dieselbe Frage erneut stellen oder eine Annahme treffen, die das Kundenerlebnis verändert.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Von der Beschaffung in China zum kundenfertigen Auftrag.',
        steps: [
          { title: 'PRODUKTREFERENZ', copy: 'Produktlink, Spezifikation, Version und Marktkontext.' },
          {
            title: 'CHINA-BESCHAFFUNGSÜBERGABE',
            copy: 'Lieferantenfragen, Antwortvergleich und offene Entscheidungen.',
          },
          { title: 'PACKREGEL', copy: 'Verpackung, Beilage, Etikett, Bündel und Lieferantenmaterial.' },
          { title: 'WARENEINGANGSKONTEXT', copy: 'SKU, Menge, Wareneingangsnachweis und Bestandszweck.' },
          { title: 'AUFTRAGSFREIGABE', copy: 'Kommissionieren, Packen, Etikett, Versandübergabe und Ausnahmeverantwortung.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Ein Produkt, unterschiedliche operative Kontexte.',
        cards: [
          {
            title: 'DTC / ABO',
            copy: 'Auftragsquelle, Bündel, Beilage, Nachfüllung und kundengerichtete Regel.',
          },
          {
            title: 'EINZELHANDEL / GROSSHANDEL',
            copy: 'Karton, Etikett, Packmenge, Liefertermin oder Händlervorgabe, die zu bestätigen sind.',
          },
          {
            title: 'SAISON / KAMPAGNE',
            copy: 'Stichtag, Bestandszweck, Launch-Fenster und Eskalationsverantwortung.',
          },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Was klar sein muss, bevor Bestand sich bewegt.',
        items: [
          'Lässt sich das Produkt über eine aktive SKU oder Version identifizieren?',
          'Ist die Packregel an das aktuelle Produkt gebunden?',
          'Wer darf Bestand freigeben oder halten?',
          'Welcher Nachweis wird beim Wareneingang erwartet?',
          'Was passiert, wenn Menge, Adresse, Etikett oder Produkt abweichen?',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Starten Sie mit den operativen Fakten, die Sie bereits haben.',
        items: [
          'Produkt- und SKU-Liste.',
          'Lieferant oder Produktreferenz in China.',
          'Zielmärkte und Kanäle.',
          'Auftragsprofil.',
          'Verpackung und Markenmaterialien.',
          'Erwarteter Wareneingang.',
          'Kundenversprechen.',
          'Aktuelle Blockade.',
          'Entscheidungsverantwortliche.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'E-Commerce: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-ec-kette',
            question: 'Können Sie unsere gesamte E-Commerce-Lieferkette steuern?',
            answer:
              'Die Seite verbindet bestätigte Serviceübergaben; tatsächliche Leistungen und Länder brauchen eine Umfangsprüfung.',
          },
          {
            id: 'de-ec-termine',
            question: 'Können Sie Liefertermine garantieren?',
            answer: 'Nein; Route, Carrier, Zoll und Zielbedingungen müssen bestätigt werden.',
          },
          {
            id: 'de-ec-shop',
            question: 'Können Sie Shopify oder einen anderen Shop unterstützen?',
            answer: 'Keine Integrationszusage, bevor Plattform und Datenunterstützung geprüft sind.',
          },
          {
            id: 'de-ec-verbindung',
            question: 'Können Sourcing, Verpackung, Lagerung und Fulfillment verbunden werden?',
            answer: 'Ja, wenn jede Übergabe eine freigegebene Aufzeichnung hat.',
          },
          {
            id: 'de-ec-saison',
            question: 'Kann Saisonbestand gestaffelt freigegeben werden?',
            answer: 'Ja, mit Bestandszweck, Freigabeverantwortung und bestätigtem Ziel.',
          },
          {
            id: 'de-ec-zuerst',
            question: 'Was sollte eine E-Commerce-Marke zuerst senden?',
            answer: 'Produkt und SKU, Märkte, Auftragsquelle, Verpackung, Timing und die aktuelle operative Entscheidung.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: DE_INDUSTRY_RELATED.map((link) => ({ ...link })),
  },
  relatedIndustries: {
    heading: 'Verwandte Branchenthemen',
    links: [
      { ...DE_INDUSTRY_RAIL['consumer-goods'] },
      { ...DE_INDUSTRY_RAIL['industrial-components'] },
      { ...DE_INDUSTRY_RAIL['time-critical-cargo'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Machen Sie die nächste E-Commerce-Übergabe leichter freigebbar.',
    body: 'Teilen Sie Produkt, Kanäle, Zielmärkte, Bestandssituation und die aktuelle Blockade. Wir ordnen die praktischen Fragen, bevor ein Leistungsumfang bestätigt wird.',
    reassurance: [],
    contextTitle: 'Zu dieser E-Commerce-Anfrage',
    contextFields: DE_INDUSTRY_CONTEXT_FIELDS.map((field) => ({ ...field })),
  },
};

export const DE_CONSUMER_GOODS_TOPIC: TopicPageContent = {
  id: 'de-industry-consumer-goods',
  kind: 'industry',
  route: '/de/industries/consumer-goods',
  pageLabel: 'Konsumgüter',
  breadcrumbParent: { label: 'Branchen', href: '/de/branchen' },
  meta: {
    title: 'Logistik für Konsumgüter aus China | FreightVanta',
    description:
      'Koordinieren Sie Konsumgüter aus China von Produktreferenz und Verpackung über Wareneingang und Kanalfreigabe bis zur handels- oder kundenfertigen Übergabe.',
    keywords: [
      'Logistik Konsumgüter aus China',
      'Konsumgüter Sourcing und Verpackung aus China',
      'Lieferkettenkoordination Konsumgüter China',
      'handelsfertige Übergabe',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Konsumgüter-Plan anfragen',
  hero: {
    kicker: 'KONSUMGÜTER',
    title: 'Bringen Sie Konsumgüter von der Produktreferenz in China zur handels- oder kundenfertigen Übergabe.',
    body: 'Ein Konsumprodukt ist mehr als der Artikel im Karton. Produktversion, Präsentation, Verpackung, Wareneingangsnachweis, Kanal und Freigabeverantwortung prägen die nächste Entscheidung. FreightVanta hilft, diese Übergaben für DTC-, Abo-, Einzelhandels-, Großhandels-, Saison- und Nachfüllkontexte zu ordnen, ohne Produktqualität, Konformität, Lagerkapazität oder Lieferabdeckung vorauszusetzen.',
    primaryCta: 'Konsumgüter-Plan anfragen',
    secondaryCta: 'Operativen Weg ansehen',
    mediaId: 'industry-consumer-goods',
    mediaAlt: 'Neutrales Konsumgut wird aus einem Karton mit Packpapier entnommen.',
    rail: [
      { label: 'PRODUKT' },
      { label: 'BESCHAFFUNG' },
      { label: 'PRÄSENTATION' },
      { label: 'WARENEINGANG' },
      { label: 'FREIGABE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Das Produkterlebnis beginnt, bevor der Kunde den Karton öffnet.',
        paragraphs: [
          'Aktives Produkt, Verpackung, Beilage, Etikett, Bündel und Wareneingangsregel sollten dieselbe kundengerichtete Version beschreiben. Eine Änderung an Artwork, Komponente oder Produktvariante braucht einen Verantwortlichen und einen Stichtag, bevor Bestand freigegeben wird.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Sechs Schritte',
        steps: [
          { copy: 'Freigegebene Produktreferenz.' },
          { copy: 'Beschaffungs- oder Einkaufsübergabe aus China.' },
          { copy: 'Verpackungs- und Präsentationsregel.' },
          { copy: 'Wareneingang: Zählung und Nachweiskontext.' },
          { copy: 'Kanalspezifische Freigaberegel.' },
          { copy: 'Kunden- oder Handelsübergabe und Ausnahmepfad.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Freigabekontexte',
        cards: [
          {
            title: 'DTC / ABO',
            copy: 'Nachfüllzyklus, Bündel, Beilage und Kundenauftragsregel.',
          },
          {
            title: 'EINZELHANDEL / GROSSHANDEL',
            copy: 'Packmenge, Karton und Etikett sowie Händlervorgabe zum Bestätigen.',
          },
          {
            title: 'SAISON / KAMPAGNE',
            copy: 'Stichtag, Launch-Bestand, Ziel und Eskalationsverantwortung.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Produktkontext-Checkliste',
        items: [
          'Produktversion.',
          'Material und Variante.',
          'Verpackung und Präsentation.',
          'Zielkanal.',
          'Wareneingangsnachweis.',
          'Bestandszweck.',
          'Freigabeverantwortliche.',
          'Ausnahmeentscheidung.',
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Operative Kontrollen',
        paragraphs: [
          'Die Koordination kann Produkt und Version, Verpackung, Nachweise und Freigabefragen organisieren. Qualität, Prüfung, Produktkonformität, Aussagen, Vorschriften, Lagerung, Raten, Retouren und Lieferfähigkeit bleiben zu bestätigen.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Planungsbrief',
        body: 'Senden Sie Produktreferenz, Zielmarkt und Kanal, erwartete Menge, Verpackungsrichtung, Wareneingangstermin, Kunden- oder Händleranforderung und die aktuelle Blockade. Unbekanntes bleibt als offene Frage stehen.',
      },
    },
    {
      type: 'faq',
      tone: 'mist',
      content: {
        heading: 'Konsumgüter: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-cg-vorschriften',
            question: 'Können Sie garantieren, dass ein Konsumprodukt lokale Vorschriften erfüllt?',
            answer: 'Nein; eine qualifizierte Konformitätsprüfung ist erforderlich.',
          },
          {
            id: 'de-cg-handelsfertig',
            question: 'Können Sie handelsfertige Verpackung vorbereiten?',
            answer: 'Verpackung und Packablauf sind planbar, wenn Dateien, Komponenten und Anweisungen freigegeben sind.',
          },
          {
            id: 'de-cg-saison',
            question: 'Können Sie Saisonbestand für einen Launch handhaben?',
            answer: 'Der Bestandsweg ist planbar; Termine und Kapazität müssen bestätigt werden.',
          },
          {
            id: 'de-cg-erfuellen',
            question: 'Können Produkte in China beschafft und anschließend erfüllt werden?',
            answer: 'Ja, über bestätigte Serviceübergaben.',
          },
          {
            id: 'de-cg-tests',
            question: 'Bieten Sie Produkttests an?',
            answer: 'Nur wenn Prüfmethode und Umfang ausdrücklich bestätigt sind.',
          },
          {
            id: 'de-cg-zuerst',
            question: 'Was sollte eine Marke zuerst senden?',
            answer: 'Produktversion, Kanal, Verpackung, Menge, Ziel und gewünschte Übergabe.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: DE_INDUSTRY_RELATED.map((link) => ({ ...link })),
  },
  relatedIndustries: {
    heading: 'Verwandte Branchenthemen',
    links: [
      { ...DE_INDUSTRY_RAIL['cross-border-ecommerce'] },
      { ...DE_INDUSTRY_RAIL['industrial-components'] },
      { ...DE_INDUSTRY_RAIL['time-critical-cargo'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem Produkt, das Kunden sehen, dem Kanal, den es erreichen muss, und der nächsten Freigabeentscheidung.',
    reassurance: [],
    contextTitle: 'Zu dieser Konsumgüter-Anfrage',
    contextFields: DE_INDUSTRY_CONTEXT_FIELDS.map((field) => ({ ...field })),
  },
};

export const DE_INDUSTRIAL_COMPONENTS_TOPIC: TopicPageContent = {
  id: 'de-industry-industrial-components',
  kind: 'industry',
  route: '/de/industries/industrial-components',
  pageLabel: 'Industriekomponenten',
  breadcrumbParent: { label: 'Branchen', href: '/de/branchen' },
  meta: {
    title: 'Logistik für Industriekomponenten aus China | FreightVanta',
    description:
      'Koordinieren Sie spezifikationsgeführte Industrieteile aus China mit Versionskontrolle, Schutzverpackung, Dokumenten, Wareneingangsidentifikation und bestätigter Empfangsübergabe.',
    keywords: [
      'Logistik Industriekomponenten aus China',
      'Industrieteile Sourcing und Versand aus China',
      'industrielle Lieferkette China',
      'Schutzverpackung Industrieteile',
      'spezifikationsgeführte Frachtkoordination',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Komponenten-Plan anfragen',
  hero: {
    kicker: 'INDUSTRIEKOMPONENTEN',
    title: 'Führen Sie die aktive Bauteilspezifikation von China bis zur kontrollierten Empfangsübergabe.',
    body: 'Bei Industrieteilen beginnt eine nutzbare Lieferentscheidung mit der korrekten Referenz, Version, Menge, Schutzmethode, Dokumenten, Wareneingangsidentifikation und Empfangsverantwortung. FreightVanta hilft, diese Informationen für Produktionseinsatz, Wartung und Ersatzteile, Projekt sowie Baustellenlieferung zu ordnen. Technische Freigabe, Prüfung, regulatorische Arbeit, Carrier-Fähigkeit und Baustellenzugang bleiben separate Bestätigungspunkte.',
    primaryCta: 'Komponenten-Plan anfragen',
    secondaryCta: 'Operativen Weg ansehen',
    mediaId: 'industry-industrial',
    mediaAlt: 'Geschützte Bauteile in einer wiederverwendbaren Holzkiste mit Dokumentenmappe und Empfangsetikett.',
    rail: [
      { label: 'REFERENZ' },
      { label: 'VERPACKUNG' },
      { label: 'DOKUMENTE' },
      { label: 'EMPFANG' },
      { label: 'FREIGABE' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Ein korrektes Teil braucht trotzdem eine nutzbare Empfangsentscheidung.',
        paragraphs: [
          'Das nächste Team sollte sehen, welche Version aktiv ist, welcher Schutz erforderlich ist, welches Dokument zum Teil gehört, wohin es geht und wer es freigeben darf. Die Logistikaufzeichnung ersetzt keine technische Freigabe; sie verhindert, dass das Empfangsteam raten muss, welcher Produktkontext aktuell ist.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Sechs Schritte',
        steps: [
          { copy: 'Aktive Teilenummer, Zeichnung und Version festlegen.' },
          { copy: 'Beschaffungs- oder Lieferantenübergabe aus China vorbereiten.' },
          { copy: 'Schutzverpackung und Handhabungsfragen bestätigen.' },
          { copy: 'Handels-, Produkt- und Versanddokumente verbinden, sofern bereitgestellt.' },
          { copy: 'Wareneingang: Teil, Menge, Kiste oder Karton und Ziel identifizieren.' },
          { copy: 'Freigabe an Produktion, Wartung, Projekt oder Baustelle oder an einen bestätigten Verantwortlichen.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Komponentenkontexte',
        cards: [
          {
            title: 'PRODUKTIONSEINSATZ',
            copy: 'Version, Los oder Menge, Schutzregel und Produktionsverantwortung.',
          },
          {
            title: 'WARTUNG / ERSATZTEILE',
            copy: 'Ersatzreferenz, Dringlichkeit, Kompatibilitätsfrage und Empfangsverantwortung.',
          },
          {
            title: 'PROJEKT / BAUSTELLE',
            copy: 'Baustelle, Meilenstein, Zugang, Verpackung und Dokumentenanforderungen zum Bestätigen.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Empfangskontext-Checkliste',
        items: [
          'Aktive Version.',
          'Menge.',
          'Schutzmethode.',
          'Nachweise und Dokumente.',
          'Wareneingangskennung.',
          'Ziel oder Baustelle.',
          'Zeitmeilenstein.',
          'Empfangsverantwortung.',
          'Ausnahmepfad.',
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Leistungsumfang',
        groups: [
          {
            label: 'Enthalten',
            items: [
              'Organisation von Referenz und Übergabe',
              'Fragen zur Schutzverpackung',
              'Dokumentenweg',
              'Wareneingangsidentifikation',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Technische Abnahme',
              'Prüfung',
              'Zertifizierung',
              'Gefahrgut und Sonderbehandlung',
              'Carrier',
              'Versicherung',
              'Zoll',
              'Baustellenzugang und Liefertermin',
            ],
          },
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Industriekomponenten: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-ic-freigabe',
            question: 'Geben Sie die technische Spezifikation frei?',
            answer:
              'Nein; die Seite organisiert die aktive Referenz, die technische Freigabe bleibt beim verantwortlichen Team.',
          },
          {
            id: 'de-ic-schutz',
            question: 'Können Sie Schutzverpackung arrangieren?',
            answer: 'Die Anforderung kann koordiniert werden; Material und Handhabungsumfang müssen bestätigt werden.',
          },
          {
            id: 'de-ic-meilenstein',
            question: 'Können Sie eine Baustellenlieferung zu einem Meilenstein garantieren?',
            answer: 'Nein; Route, Carrier, Zoll und Baustellenbedingungen müssen bestätigt werden.',
          },
          {
            id: 'de-ic-lager',
            question: 'Können Industrieteile vor der Freigabe gelagert werden?',
            answer: 'Lagerung und Identifikation sind in einem bestätigten Umfang planbar.',
          },
          {
            id: 'de-ic-zeitkritisch',
            question: 'Können dringende Ersatzteile den zeitkritischen Weg nutzen?',
            answer:
              'Verweisen Sie auf Zeitkritische Fracht, sobald Konsequenz, Bereitstellungstermin und Routenentscheidung definiert sind.',
          },
          {
            id: 'de-ic-zuerst',
            question: 'Was sollte zuerst angehängt werden?',
            answer: 'Teilenummer und Version, Zeichnung oder Foto, Menge, Ziel, Verpackung und Timing.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: DE_INDUSTRY_RELATED.map((link) => ({ ...link })),
  },
  relatedIndustries: {
    heading: 'Verwandte Branchenthemen',
    links: [
      { ...DE_INDUSTRY_RAIL['cross-border-ecommerce'] },
      { ...DE_INDUSTRY_RAIL['consumer-goods'] },
      { ...DE_INDUSTRY_RAIL['time-critical-cargo'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit der aktiven Referenz, dem Empfangskontext und der Entscheidung, die nicht der Annahme überlassen werden darf.',
    reassurance: [],
    contextTitle: 'Zu dieser Komponenten-Anfrage',
    contextFields: DE_INDUSTRY_CONTEXT_FIELDS.map((field) => ({ ...field })),
  },
};

export const DE_TIME_CRITICAL_CARGO_TOPIC: TopicPageContent = {
  id: 'de-industry-time-critical-cargo',
  kind: 'industry',
  route: '/de/industries/time-critical-cargo',
  pageLabel: 'Zeitkritische Fracht',
  breadcrumbParent: { label: 'Branchen', href: '/de/branchen' },
  meta: {
    title: 'Logistik für zeitkritische Fracht aus China | FreightVanta',
    description:
      'Planen Sie zeitkritische Fracht aus China mit sichtbarem Bereitstellungstermin, Dokumenten, Routenoptionen, Eskalationspfad und bestätigter nächster Übergabe.',
    keywords: [
      'zeitkritische Fracht Logistik aus China',
      'dringender Versand aus China',
      'Luftfracht China dringend',
      'zeitkritische Lieferkette',
      'Notnachfüllung Logistik',
    ],
  },
  serviceName: null,
  startingPoint: null,
  formButton: 'Zeitkritische Fracht planen',
  hero: {
    kicker: 'ZEITKRITISCHE FRACHT',
    title: 'Machen Sie die nächste machbare Bewegung sichtbar, bevor die Uhr übernimmt.',
    body: 'Dringende Frachtentscheidungen brauchen mehr als das Wort Express. FreightVanta hilft, geschäftliche Konsequenz, Frachtbereitschaft, Bereitstellungstermin, Dokumente, Routenfrage, Empfangsfenster und Eskalationsverantwortung zu sammeln, damit eine zeitkritische Bewegung als Entscheidungsset geprüft werden kann. Carrier-Kapazität, Laufzeit, Zollfreigabe, Raten, Sonderbehandlung und finale Lieferung werden nur für die tatsächliche Fracht und Route bestätigt.',
    primaryCta: 'Zeitkritische Fracht planen',
    secondaryCta: 'Dringlichkeitsablauf ansehen',
    mediaId: 'industry-time-critical',
    mediaAlt: 'Versandbereite neutrale Kartons, Dokumentenmappe und Übergabe am Flugzeug bei Nacht.',
    rail: [
      { label: 'ANFRAGE' },
      { label: 'BEREIT' },
      { label: 'DOKUMENTE' },
      { label: 'ROUTE' },
      { label: 'EMPFANG' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Dringlichkeit ist eine verbundene Faktenlage, kein Carrier-Versprechen.',
        paragraphs: [
          'Geschäftliche Konsequenz, Bereitstellungstermin, Verpackung, Dokumente, Routenoptionen, Zielbedingung und Eskalationsverantwortung müssen zusammen sichtbar sein. Ein schnelles Etikett löst keine fehlende Frachtbereitschaft, unklare Papiere oder ein nicht verfügbares Empfangsfenster.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Dringlichkeitsablauf',
        steps: [
          { copy: 'Deadline und geschäftliche Konsequenz definieren.' },
          { copy: 'Frachtbereitschaft, Maße, Gewicht, Menge und Verpackungskontext bestätigen.' },
          { copy: 'Handels-, Produkt- und Transportdokumente am Ursprung sammeln.' },
          { copy: 'Routenoptionen und offene Einschränkungen vergleichen.' },
          { copy: 'Eskalationsverantwortung für Carrier, Zoll, Ziel oder Empfangsfrage zuweisen.' },
          { copy: 'Die nächste Freigabe oder Übergabe erst nach Prüfung des tatsächlichen Routenumfangs bestätigen.' },
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'white',
      content: {
        heading: 'Zeitkritische Kontexte',
        cards: [
          {
            title: 'PRODUKTION / NACHFÜLLUNG',
            copy: 'Konsequenz eines Linienstopps oder Ausverkaufs, Bereitstellungstermin, Ersatzmenge.',
          },
          {
            title: 'KUNDE / ERSATZ',
            copy: 'Kundenzusage, Produktidentität, Ziel und Ausnahmeverantwortung.',
          },
          {
            title: 'PROJEKT / BAUSTELLENMEILENSTEIN',
            copy: 'Baustellenfenster, Zugang, Dokument- und Empfangsanforderung.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Frachtkontext-Checkliste',
        items: [
          'Geschäftliche Konsequenz.',
          'Erforderliches Ankunfts- oder Empfangsfenster.',
          'Frachtbeschreibung.',
          'Packstücke, Maße und Gewicht.',
          'Bereitstellungstermin.',
          'Ursprung.',
          'Ziel.',
          'Dokumente.',
          'Routenproblem.',
          'Entscheidungsverantwortliche.',
        ],
      },
    },
    {
      type: 'controls',
      tone: 'navy',
      content: {
        heading: 'Leistungsumfang',
        groups: [
          {
            label: 'Kann organisiert werden',
            items: [
              'Deadline-Brief',
              'Frachtfakten',
              'Dokumentencheckliste',
              'Routenfragen',
              'Eskalationspfad',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Carrier-Kapazität',
              'Feste Laufzeit',
              'Zollabfertigung',
              'Versicherung',
              'Gefahrgut',
              'Temperatur- und Sonderbehandlung',
              'Baustellenzugang',
              'Rate und Liefertermin',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Planungsbrief',
        body: 'Senden Sie Bereitstellungstermin, Empfangsfenster, Konsequenz, Frachtfakten, Verpackungsdetails, Ursprung und Ziel, vorhandene Dokumente und die Frage, die die nächste Bewegung blockiert.',
      },
    },
    {
      type: 'faq',
      tone: 'mist',
      content: {
        heading: 'Zeitkritische Fracht: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-tc-ankunft',
            question: 'Können Sie eine Ankunftszeit garantieren?',
            answer: 'Nein; tatsächlicher Carrier, Route, Zoll und Empfangsbedingungen müssen bestätigt werden.',
          },
          {
            id: 'de-tc-unvollstaendig',
            question: 'Kann dringende Fracht mit unvollständigen Informationen starten?',
            answer:
              'Die erste Prüfung kann fehlende Fakten zeigen, aber eine Route lässt sich ohne die erforderlichen Angaben nicht bestätigen.',
          },
          {
            id: 'de-tc-routen',
            question: 'Können Sie Luftfracht und andere Routenoptionen aus China vergleichen?',
            answer: 'Routenfragen können organisiert werden; Verfügbarkeit, Rate und Laufzeit brauchen eine tatsächliche Bestätigung.',
          },
          {
            id: 'de-tc-scheitern',
            question: 'Was, wenn die ursprüngliche Route scheitert?',
            answer:
              'Der Eskalationspfad hält fest, wer Alternativen prüft und welche Entscheidung als Nächstes nötig ist.',
          },
          {
            id: 'de-tc-sonderfracht',
            question: 'Können Sie Sonder- oder regulierte Fracht übernehmen?',
            answer: 'Nur nach ausdrücklicher Bestätigung von Produkt, Dokumenten, Handhabung und rechtlichen Anforderungen.',
          },
          {
            id: 'de-tc-zuerst',
            question: 'Was sollten wir zuerst senden?',
            answer:
              'Bereitstellungstermin, Konsequenz, Fracht- und Verpackungsfakten, Ursprung, Ziel, Dokumente und Empfangsfenster.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: DE_INDUSTRY_RELATED.map((link) => ({ ...link })),
  },
  relatedIndustries: {
    heading: 'Verwandte Branchenthemen',
    links: [
      { ...DE_INDUSTRY_RAIL['cross-border-ecommerce'] },
      { ...DE_INDUSTRY_RAIL['consumer-goods'] },
      { ...DE_INDUSTRY_RAIL['industrial-components'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem Bereitstellungstermin, der geschäftlichen Konsequenz und der Übergabe, die ihre Entscheidung nicht verpassen darf.',
    reassurance: [],
    contextTitle: 'Zu dieser Dringlichkeitsanfrage',
    contextFields: DE_INDUSTRY_CONTEXT_FIELDS.map((field) => ({ ...field })),
  },
};
