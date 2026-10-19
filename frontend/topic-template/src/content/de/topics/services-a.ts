/**
 * Deutsche Themenseiten: Großeinkauf, Verpackung & Branding.
 * Wortlaut 1:1 aus dem DE-Dokument §1.2–1.3.
 */
import type { TopicPageContent } from '../../en-global/topics/types';
import { DE_RELATED_RAIL } from './rails';

export const DE_BULK_PROCUREMENT_TOPIC: TopicPageContent = {
  id: 'de-bulk-procurement',
  kind: 'service',
  route: '/de/services/bulk-procurement',
  pageLabel: 'Großeinkauf aus China',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Großeinkauf aus China planen | FreightVanta',
    description:
      'Planen Sie einen Großeinkauf aus China mit klaren Mengen, Lieferantenfragen, Bestandsentscheidungen, Verpackungsvorgaben und Wareneingangshinweisen.',
    keywords: [
      'Großeinkauf aus China',
      'Sammelbestellung China',
      'Einkauf großer Mengen aus China',
      'Beschaffungsplanung China',
      'gestaffelte Bestandsfreigabe',
    ],
  },
  serviceName: 'Großeinkauf aus China',
  startingPoint: 'product-sourcing',
  formButton: 'Großeinkauf planen',
  hero: {
    kicker: 'GROSSEINKAUF AUS CHINA',
    title: 'Planen Sie den Großeinkauf aus China, bevor aus der Menge teure offene Punkte werden.',
    body: 'Eine größere Bestellung ist nicht nur eine kleinere Bestellung mit mehr Stück. Sie verändert Produktionsfragen, Verpackungsvorgaben, Zahlungsgespräche, Wareneingang, Bestandszweck und Freigabeplan. FreightVanta hilft, diese zusammenhängenden Entscheidungen in einem arbeitsfähigen Beschaffungsbrief zu bündeln, bevor der Großeinkauf aus China in die nächste Phase geht. Lieferantenauswahl, Handelsbedingungen und finale Freigabe bleiben bei Ihrem Team.',
    primaryCta: 'Großeinkauf planen',
    secondaryCta: 'Planungsschritte ansehen',
    mediaId: 'service-warehousing',
    mediaAlt: 'Verpackte Mengen, Produktlabels und ein Beschaffungsbrief am Wareneingang.',
    rail: [
      { step: '01', label: 'ZIEL', note: 'Freigegebenes Produkt, Einkaufszweck' },
      { step: '02', label: 'FRAGEN', note: 'Ein Fragenkatalog für Lieferanten' },
      { step: '03', label: 'FREIGABE', note: 'Verantwortliche vor dem nächsten Schritt' },
      { step: '04', label: 'BESTAND', note: 'Benannter Zweck, Freigaberegel' },
      { step: '05', label: 'ÜBERGABE', note: 'An Lager, Versand oder Fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Ein Großeinkauf braucht einen Zielplan, nicht nur eine bestätigte Menge.',
        paragraphs: [
          'Vor dem nächsten Produktionslauf sollte der Käufer beantworten können: Welche Produktversion ist freigegeben? Ist die Menge für eine Sendung oder eine gestaffelte Nachlieferung gedacht? Welche Verpackung und Etiketten reisen mit? Wie wird der Bestand identifiziert? Und wer genehmigt eine Änderung? Die Seite organisiert diese Fragen; sie verspricht keinen Preis, kein Produktionsdatum, kein Prüfergebnis und kein Versandergebnis.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Nutzen Sie die Großeinkaufsplanung, wenn die nächste Bestellung mehr als eine Übergabe betrifft.',
        cards: [
          {
            title: 'TESTBESTELLUNG ZU PLANUNG',
            copy: 'Eine größere Menge bringt Produktversion, Stückverpackung, Kartonkennzeichnung, Lagerort und Freigabetermin ins Spiel, die eine kleine Bestellung noch verdeckt hat.',
          },
          {
            title: 'LAUNCH, NACHFÜLLUNG ODER SAISONFENSTER',
            copy: 'Ein Zieldatum braucht Verantwortliche für Produkt, Menge, Verpackung, Wareneingang und Ziel; es ist für sich genommen keine Lieferzusage.',
          },
          {
            title: 'EIN EINKAUF, MEHRERE ZIELE',
            copy: 'Halten Sie fest, ob Bestand für Lagerung, Versandfreigabe, Einzelhandel oder Kundenaufträge gedacht ist, damit das nächste Team den Kontext nicht neu aufbaut.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Die größere Entscheidung zusammenhängend halten.',
        steps: [
          { copy: 'Einkaufsziel und freigegebene Produktreferenz bestätigen.' },
          { copy: 'Fragenkatalog für Produkt, Verpackung, Kartons und Lieferbedingungen erstellen.' },
          { copy: 'Freigabeverantwortliche für Nachweise, Artwork, Handelsschritte und Freigabeanweisungen festlegen.' },
          { copy: 'Bestandsübergabe planen: Kennung, Menge, Karton- und Palettenangaben sowie Wareneingangsziel.' },
          { copy: 'Verpackungs- und Freigabeanweisungen für Etiketten, Beilagen, Bündel und den Umgang mit Lieferantenmaterial vorbereiten.' },
          { copy: 'Die bestätigte nächste Bewegung in Lagerung, Versand, Einzelhandel oder Fulfillment koordinieren.' },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'mist',
      content: {
        heading: 'Was der Großeinkaufsplan organisieren kann.',
        groups: [
          {
            label: 'Enthalten',
            items: [
              'Produkt- und Mengenbrief',
              'Lieferantenfragen',
              'Bestandsbereitschaft',
              'Verpackungsübergabe',
              'Freigabeverantwortung',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Preisverhandlung oder Einsparungen',
              'Verträge, Zahlung und Handelsfinanzierung',
              'Werksaudit',
              'Prüfung und Testing',
              'Zertifizierung',
              'Kapazität',
              'Frachtrate und Laufzeit',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Bringen Sie den Einkaufskontext mit, nicht nur die Menge.',
        items: [
          'Produktlink oder freigegebenes Muster.',
          'Zielmenge und Nachbestellmuster.',
          'Bekannter Lieferant.',
          'Zielmarkt und Zielort.',
          'Variante, Material, Ausführung, Maße und Verpackung.',
          'Gewünschter Bereitstellungstermin.',
          'Nächste Übergabe.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Ein größerer Einkauf bleibt nach der Freigabe leichter erklärbar.',
        items: [
          'Ein Brief begleitet die Entscheidung.',
          'Freigabepunkte sind sichtbar, bevor sie zur Verzögerung werden.',
          'Bestand hat einen benannten Zweck.',
          'Änderungen haben einen Ort.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Großeinkauf aus China: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-bulk-preis',
            question: 'Garantiert FreightVanta niedrigere Preise für einen Großeinkauf aus China?',
            answer: 'Nein. Ohne schriftlichen Handelsumfang wird kein Rabatt und keine Einsparung zugesagt.',
          },
          {
            id: 'de-bulk-staffel',
            question: 'Kann ein Großeinkauf gestaffelt freigegeben werden?',
            answer: 'Ja, wenn Wareneingang, Lagerung, Verpackung, Versand und Freigabeanweisungen vorher bestätigt sind.',
          },
          {
            id: 'de-bulk-lieferant',
            question: 'Können wir mit einem bestehenden Lieferanten starten?',
            answer: 'Ja, wenn Produktversion, Menge, Verpackung, Ziel und Freigabeweg vorliegen.',
          },
          {
            id: 'de-bulk-qualitaet',
            question: 'Enthält der Großeinkauf eine Qualitätsprüfung?',
            answer: 'Nicht automatisch; Annahmestandards, Audit, Testing und Konformität müssen bestätigt werden.',
          },
          {
            id: 'de-bulk-fulfillment',
            question: 'Kann der Großeinkauf an Fulfillment anbinden?',
            answer: 'Ja, sobald Bestandskennung, Verpackung und Kommissionierregeln stabil sind.',
          },
          {
            id: 'de-bulk-menge',
            question: 'Was passiert, wenn die Menge noch unklar ist?',
            answer:
              'Halten Sie eine Bandbreite und den Entscheidungsverantwortlichen sichtbar, statt eine unbestätigte Zahl als endgültig darzustellen.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: [
      { ...DE_RELATED_RAIL['product-sourcing'] },
      { ...DE_RELATED_RAIL['inventory-storage'] },
      { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem Produkt, der geplanten Menge und dem nächsten Ziel der Ware.',
    body: 'Teilen Sie Produktreferenz, Menge, bekannten Lieferanten, Zielmarkt, gewünschten Bereitstellungstermin, Verpackungsanforderung und die geplante Übergabe an Lagerung, Versand, Einzelhandel oder Fulfillment.',
    reassurance: [],
    contextTitle: 'Zu dieser Großeinkaufsanfrage',
    contextFields: [
      { name: 'quantity_range', label: 'Mengenbandbreite' },
      { name: 'reorder_pattern', label: 'Nachbestellmuster' },
      { name: 'stock_purpose', label: 'Bestandszweck' },
      { name: 'planned_release', label: 'Geplante Freigabe' },
    ],
  },
};

export const DE_PACKAGING_BRANDING_TOPIC: TopicPageContent = {
  id: 'de-packaging-branding',
  kind: 'service',
  route: '/de/services/packaging-branding',
  pageLabel: 'Verpackung & Branding',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Verpackung und Branding für Produkte aus China | FreightVanta',
    description:
      'Verwandeln Sie freigegebene Verpackung, Etiketten, Beilagen und Branding-Materialien aus China in eine praktische Packanweisung für Ihr Fulfillment.',
    keywords: [
      'Verpackung für Produkte aus China',
      'Verpackung und Branding Fulfillment',
      'Beilagen und Etiketten',
      'Packanweisung',
      'gebrandete Verpackung aus China',
    ],
  },
  serviceName: 'Verpackung & Branding für Produkte aus China',
  startingPoint: 'packaging-branding',
  formButton: 'Verpackungs- und Brandingplan anfragen',
  hero: {
    kicker: 'VERPACKUNG & BRANDING',
    title: 'Produkte aus China sollen in Verpackung ankommen, die Ihre Marke weiterträgt.',
    body: 'Ein fertiges Produkt ist noch kein fertiges Kundenerlebnis. Karton, Beutel, Beilage, Etikett, Schutzregel, Bündel und der Umgang mit Lieferantenmaterial müssen beim Packteam als nutzbare Anweisung ankommen. FreightVanta hilft, freigegebene Verpackungs- und Branding-Materialien in einen abgestimmten Packbrief für Produkte aus China zu überführen. Marke, Artwork, Kundenversprechen und finale Freigabe bleiben bei Ihrem Team.',
    primaryCta: 'Verpackungs- und Brandingplan anfragen',
    secondaryCta: 'Packablauf ansehen',
    mediaId: 'service-packaging',
    mediaAlt: 'Unbedruckte Kartons, Etiketten, Beilagen und Packreihenfolge auf einem Packtisch.',
    rail: [
      { step: '01', label: 'PRODUKT', note: 'Version und Kundenziel' },
      { step: '02', label: 'MATERIAL', note: 'Artwork, Etiketten, Beilagen' },
      { step: '03', label: 'REGELN', note: 'Menge, Reihenfolge, Schutz' },
      { step: '04', label: 'VERSION', note: 'Stichtag, Verantwortliche' },
      { step: '05', label: 'PACKEN', note: 'Aktive Anweisung zur Übergabe' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Verpackung wird operativ, sobald jedes Bauteil einen Zweck und eine Version hat.',
        paragraphs: [
          'Eine Logo-Datei allein sagt einem Packteam nicht, was in eine Bestellung gehört. Der operative Brief muss Produktvariante, Anzahl der Beilagen, aktive Sprache, Schutzmethode, den Umgang mit Lieferantenmaterial und den Zeitpunkt festhalten, ab dem alte Verpackung nicht mehr verwendet wird.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Nutzen Sie die Verpackungs- und Branding-Koordination, wenn aus Dateien physische Bestellungen werden.',
        cards: [
          {
            title: 'DAS PRODUKT IST FERTIG, DAS PACKING NICHT',
            copy: 'Karton, Beutel, Etikett, Beilage, Geschenkkomponente und Lieferantenmaterial in einer Regel zusammenführen.',
          },
          {
            title: 'EINE MARKENÜBERARBEITUNG KOMMT',
            copy: 'Version, Stichtag und Restbestandsentscheidung verhindern, dass altes und neues Material gemischt werden.',
          },
          {
            title: 'MEHRERE TEAMS FASSEN DIE BESTELLUNG AN',
            copy: 'Sourcing, Lager, Packen, Fulfillment und Kundenservice erhalten eine aktuelle Anweisung.',
          },
          {
            title: 'DAS PRODUKT KOMMT AUS CHINA',
            copy: 'Freigegebene Verpackungsvorgaben von der Lieferantenübergabe bis zum Wareneingang und zur Auftragsvorbereitung weiterführen.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Von der freigegebenen Markenentscheidung zum wiederholbaren Packen.',
        steps: [
          { copy: 'Produkt/Version und kundengerichtetes Ziel bestätigen.' },
          { copy: 'Artwork, Etiketten, Beilagen, Verpackungskomponenten und Sprachversionen sammeln.' },
          { copy: 'Menge, Reihenfolge, Schutz, Bündelung und Ausschlussregeln definieren.' },
          { copy: 'Lieferanten- und Komponenteninformationen, Stichtag und Änderungsverantwortlichen festhalten.' },
          { copy: 'Ein Muster oder Nachweisdokument prüfen, sofern im Umfang enthalten.' },
          { copy: 'Die aktive Packanweisung für Lager oder Fulfillment veröffentlichen.' },
        ],
      },
    },
    {
      type: 'controls',
      tone: 'mist',
      content: {
        heading: 'Leistungsumfang',
        groups: [
          {
            label: 'Enthalten',
            items: [
              'Verpackungsbrief',
              'Aktive Version',
              'Reihenfolge von Beilagen und Etiketten',
              'Komponentenliste',
              'Übergabehinweise',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Grafikdesign',
              'Druck und Herstellung',
              'Marken-, IP- und Rechtsprüfung',
              'Produktsicherheitsrelevante Etiketten',
              'Regulatorische Formulierungen',
              'Materialtests',
              'Finale kreative Freigabe',
            ],
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Vorbereitung',
        items: [
          'Produktreferenz und Varianten.',
          'Aktuelles Artwork und Wortlaut.',
          'Verpackungsrichtung.',
          'Beilagen, Etiketten und Sprachen.',
          'Bekannte Lieferanten- oder Komponentenquelle.',
          'Freigabeverantwortliche.',
          'Versionsname und Stichtag.',
          'Geplante Übergabe an Lager, Versand oder Fulfillment.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Die Markenentscheidung bleibt nach der Freigabe der Designdatei sichtbar.',
        cards: [
          {
            title: 'Das Kundenerlebnis hat eine operative Aufzeichnung',
            copy: 'Artwork ist mit Produkt und Auftragsvorbereitung verknüpft.',
          },
          {
            title: 'Änderungen werden seltener vermischt',
            copy: 'Aktive Version und Altbestandsregel sind eindeutig.',
          },
          {
            title: 'Freigaben passieren vor unwiderruflicher Arbeit',
            copy: 'Produkt-, Muster-, Verpackungs- und Packpunkte sind sichtbar.',
          },
          {
            title: 'Markenentscheidungen können an Logistik anknüpfen',
            copy: 'Eine stabile Anweisung folgt Sourcing, Lager, Versand und Fulfillment.',
          },
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Verpackung & Branding: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-pack-logo',
            question: 'Können Sie unser Logo oder unsere Marke gestalten?',
            answer:
              'Die Seite koordiniert freigegebene Materialien; Recht, IP und kreative Verantwortung brauchen einen gesonderten Umfang.',
          },
          {
            id: 'de-pack-whitelabel',
            question: 'Können White-Label-Produkte eigene Beilagen oder Verpackung nutzen?',
            answer: 'Möglich, wenn Produkt, Material, Menge und Packvorgabe freigegeben sind.',
          },
          {
            id: 'de-pack-mischung',
            question: 'Wie vermeiden wir die Mischung alter und neuer Verpackung?',
            answer: 'Über aktive Version, Stichtag, Restbestandsregel und eine aktuelle Anweisung.',
          },
          {
            id: 'de-pack-konformitaet',
            question: 'Garantiert die Verpackungskoordination regulatorische Konformität?',
            answer: 'Nein; Markt-, Sicherheits- und Zertifizierungsanforderungen brauchen eine geprüfte Stelle.',
          },
          {
            id: 'de-pack-anbindung',
            question: 'Kann Verpackung an Eigenmarke und Fulfillment anbinden?',
            answer: 'Ja, sobald Produkt, Version und Packregeln stabil sind.',
          },
          {
            id: 'de-pack-entwurf',
            question: 'Was, wenn das Artwork noch nicht final ist?',
            answer: 'Status als Entwurf belassen und den Freigebenden festhalten; nicht als aktive Regel veröffentlichen.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: [
      { ...DE_RELATED_RAIL['private-white-label'] },
      { ...DE_RELATED_RAIL['inventory-storage'] },
      { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem Produkt, der aktuell freigegebenen Markenentscheidung und der Änderung, die Sie steuern müssen.',
    reassurance: [],
    contextTitle: 'Zu dieser Verpackungsanfrage',
    contextFields: [
      { name: 'artwork_status', label: 'Artwork-Status' },
      { name: 'packaging_components', label: 'Verpackungskomponenten' },
      { name: 'insert_label_language', label: 'Sprache Beilagen/Etiketten' },
      { name: 'active_version', label: 'Aktive Version' },
    ],
  },
};
