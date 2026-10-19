/**
 * Deutsche Themenseiten: Lagerhaltung, Eigenmarke & White Label, Fulfillment.
 * Wortlaut 1:1 aus dem DE-Dokument §1.4–1.6.
 */
import type { TopicPageContent } from '../../en-global/topics/types';
import { DE_RELATED_RAIL } from './rails';

export const DE_INVENTORY_STORAGE_TOPIC: TopicPageContent = {
  id: 'de-inventory-storage',
  kind: 'service',
  route: '/de/services/inventory-storage',
  pageLabel: 'Lagerhaltung & Bestandsfreigabe',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Lagerhaltung für Waren aus China | FreightVanta',
    description:
      'Organisieren Sie Wareneingang, Identifikation, Lagerung, Freigabeanweisungen und Ausnahmeentscheidungen für importierte Ware, bevor sie zu Versand, Handel oder Kundenaufträgen weitergeht.',
    keywords: [
      'Lagerhaltung für Waren aus China',
      'Bestandsverwaltung importierter Ware',
      'Wareneingang und Freigabe',
      'Lagerung für Produkte aus China',
    ],
  },
  serviceName: 'Lagerhaltung für Waren aus China',
  startingPoint: 'warehousing-fulfillment',
  formButton: 'Lagerhaltungsplan anfragen',
  hero: {
    kicker: 'LAGERHALTUNG',
    title: 'Geben Sie importiertem Bestand einen klaren Wareneingangs-, Lager- und Freigabeplan.',
    body: 'Wenn Ware aus China eintrifft, lautet die nächste Frage nicht nur, wo sie liegt. Das Team muss wissen, was angekommen ist, zu welcher Produktversion es gehört, wie es identifiziert wird, welcher Nachweis erfasst ist, was freigegeben werden darf und wer entscheidet, wenn Anzahl, Karton, Etikett oder Ziel nicht passen. FreightVanta hilft, diese operative Aufzeichnung zu ordnen, bevor Lagerung und Freigabe bestätigt werden.',
    primaryCta: 'Lagerhaltungsplan anfragen',
    secondaryCta: 'Ablauf Wareneingang bis Freigabe ansehen',
    mediaId: 'service-warehousing',
    mediaAlt: 'Wareneingangsbereich mit gescanntem Etikett, neutralen Kartons und getrenntem Bestand.',
    rail: [
      { step: '01', label: 'MELDUNG', note: 'Erwarteter Eingang, Dokumente' },
      { step: '02', label: 'EMPFANG', note: 'Kartons und Version erfassen' },
      { step: '03', label: 'AUFZEICHNUNG', note: 'Zählung, Zustand, Nachweis' },
      { step: '04', label: 'ZWECK', note: 'Halten, lagern, freigeben' },
      { step: '05', label: 'FREIGABE', note: 'An Versand, Handel oder Fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Lagerung ist nützlich, wenn die nächste Freigabeentscheidung sichtbar ist.',
        paragraphs: [
          'Eine Lageradresse oder ein Bestandszähler allein sagt dem nächsten Team nicht, ob Ware verkaufsfähig, reserviert, wartend auf Nachweis, für den Handel bestimmt oder für einen späteren Auftrag gehalten wird. Eine Aufzeichnung von Wareneingang bis Freigabe verbindet Produktidentität, Menge, Verpackung, Ziel und Freigabeverantwortung.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Wann es passt',
        cards: [
          {
            title: 'WARE KOMMT VOR DER ENDGÜLTIGEN FREIGABE AN',
            copy: 'Erwartete Kartons, Produktidentität und Halte- oder Freigaberegel erfassen.',
          },
          {
            title: 'EIN WARENEINGANG VERSORGT MEHRERE ZIELE',
            copy: 'Zweck für Handel, Versand, Nachfüllung und Auftragsvorbereitung trennen.',
          },
          {
            title: 'BESTANDSINFORMATIONEN SIND VERTEILT',
            copy: 'SKU, Referenz, Zählung, Bilder, Schadensnotizen und offene Entscheidungen zusammenführen.',
          },
          {
            title: 'VERPACKUNG ODER BRANDING-MATERIAL WIRD MITGELAGERT',
            copy: 'Komponenten- und Packversionen sichtbar halten.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Ablauf Wareneingang bis Freigabe',
        steps: [
          { copy: 'Wareneingangsmeldung und Dokumentenkontext vorbereiten.' },
          { copy: 'Kartons, Paletten, Produkte und aktive Version erfassen und identifizieren.' },
          { copy: 'Zählung, sichtbaren Zustand und erforderlichen Nachweis im bestätigten Umfang festhalten.' },
          { copy: 'Bestandszweck, Haltestatus, Lageranweisung und Freigabeverantwortung zuweisen.' },
          { copy: 'Verpackungs-, Etiketten-, Bündel- oder Zielregel anbinden.' },
          { copy: 'Freigabe an bestätigten Versand, Handel, Fulfillment oder eine benannte Übergabe.' },
          { copy: 'Abweichung, Schaden, fehlendes Dokument oder Mengendifferenz zur Entscheidung eskalieren.' },
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
              'Wareneingangsbrief',
              'Bestandskennungen',
              'Zähl- und Freigaberegel',
              'Ausnahmepfad',
              'Übergabeaufzeichnung',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Lagerort',
              'Kapazität',
              'Lagergebühr',
              'Versicherung',
              'Temperatur- oder Sonderbehandlung',
              'Prüfstandard',
              'Anbindung an das Bestandssystem und tatsächliche Länderabdeckung',
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
          'Erwarteter Wareneingangstermin oder Zeitraum.',
          'Kartons und Paletten.',
          'Produkt- und SKU-Liste.',
          'Lieferant und Ursprung.',
          'Aktive Verpackung und Version.',
          'Ziel oder Bestandszweck.',
          'Zähl- und Nachweisanforderung.',
          'Freigabeverantwortliche.',
          'Sonderbehandlung oder Einschränkung.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Bestandsstatus und Auftragsstatus bleiben getrennt.',
        items: ['Wareneingang', 'Identifiziert', 'Gehalten', 'Verfügbar', 'Reserviert', 'Freigegeben', 'Ausnahme'],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Lagerhaltung: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-lager-kann',
            question: 'Können Sie aus China importierte Produkte lagern?',
            answer:
              'Teilen Sie Ursprung, Produkt, Menge, Zeitpunkt und Ziel; Ort, Kapazität und Handhabung müssen bestätigt werden.',
          },
          {
            id: 'de-lager-staffel',
            question: 'Kann Bestand gestaffelt freigegeben werden?',
            answer: 'Ja, wenn Bestandszweck, Identifikation und Freigabeverantwortung definiert sind.',
          },
          {
            id: 'de-lager-zaehlung',
            question: 'Garantieren Sie eine Zählung oder ein Prüfergebnis?',
            answer: 'Nein; Nachweis-, Prüf- und Annahmestandards brauchen einen ausdrücklichen Umfang.',
          },
          {
            id: 'de-lager-beilagen',
            question: 'Können Verpackung und Beilagen beim Bestand bleiben?',
            answer: 'Sie können in eine freigegebene Komponenten- und Freigaberegel aufgenommen werden.',
          },
          {
            id: 'de-lager-fulfillment',
            question: 'Kann die Lagerung an Fulfillment anbinden?',
            answer: 'Ja, sobald verkaufsfähige Identität, Packregel und Auftragsübergabe bereit sind.',
          },
          {
            id: 'de-lager-abweichung',
            question: 'Was, wenn Kartons nicht zur Meldung passen?',
            answer: 'Abweichung erfassen und vor der Freigabe an den benannten Entscheidungsverantwortlichen leiten.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: [
      { ...DE_RELATED_RAIL['bulk-procurement'] },
      { ...DE_RELATED_RAIL['packaging-branding'] },
      { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem, was ankommt, wofür es bestimmt ist und wer es freigeben darf.',
    reassurance: [],
    contextTitle: 'Zu dieser Lagerhaltungsanfrage',
    contextFields: [
      { name: 'inbound_cartons', label: 'Wareneingangs-Kartons' },
      { name: 'sku_identifier', label: 'SKU/Kennung' },
      { name: 'receiving_evidence', label: 'Wareneingangsnachweis' },
      { name: 'release_destination', label: 'Freigabeziel' },
    ],
  },
};

export const DE_PRIVATE_WHITE_LABEL_TOPIC: TopicPageContent = {
  id: 'de-private-white-label',
  kind: 'service',
  route: '/de/services/private-white-label',
  pageLabel: 'Eigenmarke & White Label',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Eigenmarke und White Label aus China | FreightVanta',
    description:
      'Koordinieren Sie Produkt, Branding-Materialien, Verpackungsversionen, Freigabepunkte und Fulfillment-Übergabe für Eigenmarken- und White-Label-Programme aus China.',
    keywords: [
      'Private Label aus China',
      'White Label aus China',
      'Eigenmarke Sourcing',
      'Versionskontrolle Markenprodukt',
      'Private-Label-Verpackung',
    ],
  },
  serviceName: 'Eigenmarke und White Label aus China',
  startingPoint: 'product-sourcing',
  formButton: 'Eigenmarken-Plan anfragen',
  hero: {
    kicker: 'EIGENMARKE / WHITE LABEL',
    title: 'Halten Sie Produkt, Verpackung und Freigabe Ihrer Eigenmarke von China bis zur nächsten Übergabe auf einer Linie.',
    body: 'Ein Eigenmarken-Programm ist mehr als ein Logo auf einem bestehenden Produkt. Produktversion, freigegebene Eigenschaften, Markendateien, Etiketten, Verpackung, Beilagen, Lieferantenfragen und Fulfillment-Anweisung müssen sich auf dieselbe Entscheidung beziehen. FreightVanta hilft, diese Aufzeichnung zu ordnen und die nächste bestätigte Übergabe vorzubereiten. Marke, IP, rechtliche Kennzeichnung, Produktaussagen und Konformität bleiben einer qualifizierten Prüfung und einem schriftlichen Umfang vorbehalten.',
    primaryCta: 'Eigenmarken-Plan anfragen',
    secondaryCta: 'Freigabeablauf ansehen',
    mediaId: 'service-private-label',
    mediaAlt: 'Unbedruckte Verpackung, Versionsdateien, Beilagen und Produktmuster für eine Eigenmarken-Prüfung.',
    rail: [
      { step: '01', label: 'PRODUKT', note: 'Referenz, Kundenversprechen' },
      { step: '02', label: 'MATERIAL', note: 'Markendateien, Verpackung' },
      { step: '03', label: 'VERSION', note: 'Lieferantenstand, Muster' },
      { step: '04', label: 'FREIGABE', note: 'Verantwortliche, Stichtag' },
      { step: '05', label: 'ÜBERGABE', note: 'An Lager oder Fulfillment' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Ein Markenprodukt braucht Versionskontrolle, bevor es mehr Volumen braucht.',
        paragraphs: [
          'Dasselbe Produkt kann mehrere Namen, Artwork-Dateien, Beilagen, Etiketten, Bündel und Marktversionen haben. Die operative Frage ist, welche Version aktiv ist, wer sie freigegeben hat, wann sie in Kraft tritt, was mit bestehendem Bestand passiert und wie das Packen an das nächste Team übergeht.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Wann es passt',
        cards: [
          {
            title: 'EIN WHITE-LABEL-BASISPRODUKT BRAUCHT IHRE KUNDENGERICHTETE VERSION',
            copy: 'Produktreferenz, Markenmaterialien und Packvorgabe verbinden.',
          },
          {
            title: 'EIN EIGENMARKEN-PROGRAMM GEHT VOM MUSTER IN DEN EINKAUF',
            copy: 'Musterfreigabe, Spezifikation, Menge und Artwork in einer Aufzeichnung halten.',
          },
          {
            title: 'EINE VERPACKUNGS- ODER SPRACHÜBERARBEITUNG KOMMT',
            copy: 'Stichtag und Umgang mit Altbestand definieren.',
          },
          {
            title: 'DAS PRODUKT MUSS AN LAGER ODER FULFILLMENT ANBINDEN',
            copy: 'SKU, Etikett, Bündel und Ausnahmeregeln weiterreichen.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Freigabe- und Übergabeablauf',
        steps: [
          { copy: 'Produktreferenz, Zielmarkt und Kundenversprechen festlegen.' },
          { copy: 'Markenmaterialien, Artwork, Wortlaut, Etiketten, Beilagen und Verpackungsrichtung sammeln.' },
          { copy: 'Lieferanten- und Produktversion, Musterkontext und offene Handelsfragen erfassen.' },
          { copy: 'Freigabeverantwortliche für Produkt, Kreativ, Verpackung und Betrieb benennen.' },
          { copy: 'Aktive Version, Stichtag und Restbestandsentscheidung festlegen.' },
          { copy: 'Nach der Freigabe Verpackungs-, Lager-, Versand- oder Fulfillment-Übergabe vorbereiten.' },
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
              'Versionsaufzeichnung',
              'Asset-Checkliste',
              'Freigabepfad',
              'Packübergabe',
              'Änderungsprotokoll',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Marken-, IP- und Rechtsberatung',
              'Produktdesign und Herstellung',
              'Testing und Zertifizierung',
              'Marktkonformität',
              'Produktaussagen und Produktannahme',
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
          'Produkt- und Musterreferenz.',
          'Zielmarkt.',
          'Markenmaterialien und freigegebener Wortlaut.',
          'Verpackungs-, Etiketten- und Beilagendateien.',
          'Bekannter Lieferant.',
          'Versionsnamen.',
          'Stichtage.',
          'Freigabeverantwortliche.',
          'Ziel für Lager und Fulfillment.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Die Markenentscheidung bleibt nach der Freigabe der Designdatei sichtbar.',
        items: [
          'Das Kundenerlebnis hat eine operative Aufzeichnung.',
          'Änderungen werden seltener vermischt.',
          'Freigaben passieren vor unwiderruflicher Arbeit.',
          'Das Programm kann an praktische Logistik anbinden.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Eigenmarke & White Label: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-pl-beratung',
            question: 'Bieten Sie Marken- oder IP-Beratung?',
            answer: 'Nein; nutzen Sie qualifizierte Rechtsberatung und einen bestätigten Umfang.',
          },
          {
            id: 'de-pl-verpackung',
            question: 'Können White-Label-Produkte eigene Verpackung nutzen?',
            answer: 'Möglich, wenn Produkt, Material, Menge und Packvorgabe freigegeben sind.',
          },
          {
            id: 'de-pl-etiketten',
            question: 'Wie werden alte und neue Etiketten getrennt?',
            answer: 'Über aktive Version, Stichtag, Restbestandsregel und klare Anweisung.',
          },
          {
            id: 'de-pl-konformitaet',
            question: 'Garantiert die Eigenmarken-Koordination Marktkonformität?',
            answer: 'Nein; Sicherheit, Zertifizierung, rechtliche Kennzeichnung und Aussagen müssen geprüft werden.',
          },
          {
            id: 'de-pl-anbindung',
            question: 'Kann ein Eigenmarken-Programm an Sourcing und Fulfillment anbinden?',
            answer: 'Ja, nachdem Produkt- und Markenentscheidungen stabil sind.',
          },
          {
            id: 'de-pl-entwurf',
            question: 'Was, wenn das Artwork noch geprüft wird?',
            answer: 'Als Entwurf belassen, Freigebenden benennen und nicht als aktive Packregel verwenden.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: [
      { ...DE_RELATED_RAIL['product-sourcing'] },
      { ...DE_RELATED_RAIL['packaging-branding'] },
      { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit dem Produkt, der aktuell freigegebenen Markenentscheidung und der Änderung, die Sie steuern müssen.',
    reassurance: [],
    contextTitle: 'Zu dieser Eigenmarken-Anfrage',
    contextFields: [
      { name: 'product_version', label: 'Produktversion' },
      { name: 'brand_assets', label: 'Markenmaterialien' },
      { name: 'approval_owner', label: 'Freigabeverantwortlicher' },
      { name: 'effective_date', label: 'Stichtag' },
    ],
  },
};

export const DE_WORLDWIDE_FULFILLMENT_TOPIC: TopicPageContent = {
  id: 'de-worldwide-fulfillment',
  kind: 'service',
  route: '/de/services/worldwide-fulfillment',
  pageLabel: 'Fulfillment & Auftragsabwicklung',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Fulfillment für Produkte aus China | FreightVanta',
    description:
      'Bereiten Sie Bestand aus China mit klaren Kommissionier-, Pack-, Etiketten-, Versand- und Ausnahmeanweisungen für Kundenaufträge vor.',
    keywords: [
      'Fulfillment für Produkte aus China',
      'weltweites Fulfillment für importierte Produkte',
      'E-Commerce-Fulfillment aus China',
      'Pick-and-Pack-Übergabe',
      'Ausnahmeprozess Aufträge',
    ],
  },
  serviceName: 'Fulfillment für Produkte aus China',
  startingPoint: 'warehousing-fulfillment',
  formButton: 'Fulfillment-Setup anfragen',
  hero: {
    kicker: 'WELTWEITES FULFILLMENT',
    title: 'Machen Sie aus Bestand aus China kundenfertige Aufträge mit einem klaren Fulfillment-Plan.',
    body: 'Fulfillment ist die operative Ebene zwischen bereitem Bestand und dem Kundenversprechen. FreightVanta hilft zu koordinieren, wie Produkte aus China identifiziert, kommissioniert, gepackt, etikettiert, an einen Versanddienst übergeben und bearbeitet werden, wenn ein Auftrag eine Entscheidung braucht. Das richtige Setup hängt von Produkt, Auftragsprofil, Ziel, Markenmaterialien, Auftragsquelle und Lieferanforderung ab. Diese Seite verspricht keine Lagerstandorte, Carrier-Abdeckung, Automatisierung, Cut-off-Zeiten, Tracking-Verhalten oder weltweite Lieferung, bis diese Punkte geprüft sind.',
    primaryCta: 'Fulfillment-Setup anfragen',
    secondaryCta: 'Auftragslebenszyklus ansehen',
    mediaId: 'industry-ecommerce',
    mediaAlt: 'Scannen, Kommissionieren, Verpacken und Etikettenübergabe an einer Fulfillment-Station.',
    rail: [
      { step: '01', label: 'BESTAND', note: 'Identifizierter, verkaufsfähiger Bestand' },
      { step: '02', label: 'REGEL', note: 'Aktive Pack- und Bündelregel' },
      { step: '03', label: 'PICK & PACK', note: 'Kommissionieren, packen, etikettieren' },
      { step: '04', label: 'VERSAND', note: 'Übergabe und Referenz' },
      { step: '05', label: 'AUSNAHMEN', note: 'Sichtbarer Entscheidungsweg' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        heading: 'Ein Kundenauftrag sollte nicht der Moment sein, in dem das Team die Packregel kennenlernt.',
        paragraphs: [
          'Jedes verkaufsfähige Produkt braucht eine Kennung, eine aktive Verpackungs- oder Bündelregel, eine Zielanweisung und einen Ausnahmepfad. Ein fehlender Artikel, eine geänderte Adresse, eine beschädigte Komponente, eine Bestandsdifferenz oder ein unklares Etikett sollten eine sichtbare Entscheidungsanfrage erzeugen statt eines improvisierten Kundenergebnisses.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Wann es passt',
        cards: [
          {
            title: 'MEHRERE ZIELE ODER AUFTRAGSARTEN',
            copy: 'Unterschiedliche Produkte, Etiketten, Dokumente und Packregeln brauchen einen Auftragslebenszyklus.',
          },
          {
            title: 'GEBRANDETE KOMPONENTEN ODER BÜNDEL',
            copy: 'Beilagen, Geschenke, Multi-SKU-Kombinationen und der Ausschluss von Lieferantenmaterial brauchen aktive Regeln.',
          },
          {
            title: 'MEHRERE TEAMS FASSEN DEN AUFTRAG AN',
            copy: 'Status getrennt halten: Wareneingang, verkaufsfähig, kommissioniert, gepackt, versandt und Ausnahme.',
          },
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'white',
      content: {
        heading: 'Auftragslebenszyklus',
        steps: [
          { copy: 'Bestand empfangen und identifizieren.' },
          { copy: 'Verkaufsfähiges Produkt, SKU und aktive Packregel vorbereiten.' },
          { copy: 'Kommissionierregel für enthaltene, ausgeschlossene und freigegebene Ersatzartikel erstellen.' },
          { copy: 'Verpackungs- und Markenregel anwenden.' },
          { copy: 'Etiketten und bestätigte Versandübergabe vorbereiten.' },
          { copy: 'Tracking-Referenz verbinden, sofern der gewählte Service sie bereitstellt.' },
          { copy: 'Bestands-, Adress-, Schadens-, Storno-, Verzögerungs- oder Rückfrage als Ausnahme bearbeiten.' },
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
              'Auftragsvorbereitungsablauf',
              'Bündel- und Markenkomponenten',
              'Ausnahmepfad',
              'Tracking-Übergabe soweit unterstützt',
            ],
          },
          {
            label: 'Zuerst zu bestätigen',
            items: [
              'Lagerort',
              'Länderabdeckung',
              'Carrier-Verfügbarkeit',
              'Verbotene Waren',
              'Bearbeitungszeit',
              'Cut-off',
              'Rate',
              'Shop-API',
              'Retouren und Zoll',
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
          'Produkt- und SKU-Liste.',
          'Bestandskontext.',
          'Erwartetes Auftragsvolumen und Saisonalität.',
          'Auftragsquelle und Datenfelder.',
          'Zielmärkte.',
          'Markenmaterialien.',
          'Bündel-, Ersatz- und Ausschlussregel.',
          'Kundenservice-Ansatz für Ausnahmen.',
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Auftragsvorbereitung wird sichtbar, bevor ein Kunde auf eine Antwort wartet.',
        items: [
          'Bestandsstatus und Auftragsstatus bleiben getrennt.',
          'Marken- und Bündelregeln reisen mit dem Auftrag.',
          'Ausnahmen haben einen verantwortlichen Weg.',
          'Der Ablauf wächst mit freigegebener Komplexität.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Fulfillment: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-ff-weltweit',
            question: 'Können Sie Kundenaufträge weltweit erfüllen?',
            answer:
              'Teilen Sie Zielmärkte; tatsächliche Standorte, Carrier, Produkteinschränkungen und Zielverfügbarkeit müssen geprüft werden.',
          },
          {
            id: 'de-ff-buendel',
            question: 'Kann Lieferantenmaterial entfernt oder können Produkte gebündelt werden?',
            answer: 'Möglich im Rahmen einer freigegebenen Packanweisung.',
          },
          {
            id: 'de-ff-shop',
            question: 'Kann sich unser Shop automatisch anbinden?',
            answer: 'Keine Integrationszusage, bevor Plattform und technische Unterstützung bestätigt sind.',
          },
          {
            id: 'de-ff-tracking',
            question: 'Wie werden Tracking-Updates behandelt?',
            answer: 'Abhängig vom gewählten Versandservice und der verfügbaren Anbindung.',
          },
          {
            id: 'de-ff-bestand',
            question: 'Kann Fulfillment mit bereits aus China beschafftem Bestand starten?',
            answer: 'Ja, sobald Produktidentität, Menge und Packregel nutzbar sind.',
          },
          {
            id: 'de-ff-retouren',
            question: 'Wie werden Retouren oder Adressänderungen behandelt?',
            answer: 'Den Ausnahmeverantwortlichen und den Reaktionsweg vor der Freigabe definieren.',
          },
        ],
      },
    },
  ],
  related: {
    heading: 'Verwandte Leistungen',
    links: [
      { ...DE_RELATED_RAIL['inventory-storage'] },
      { ...DE_RELATED_RAIL['packaging-branding'] },
      { ...DE_RELATED_RAIL['product-sourcing'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Starten Sie mit den Produkten, den Aufträgen und der kundengerichteten Regel, die konsistent bleiben muss.',
    reassurance: [],
    contextTitle: 'Zu dieser Fulfillment-Anfrage',
    contextFields: [
      { name: 'order_source', label: 'Auftragsquelle' },
      { name: 'sku_list', label: 'SKU-Liste' },
      { name: 'destination_markets', label: 'Zielmärkte' },
      { name: 'bundle_rule', label: 'Bündelregel' },
      { name: 'exception_type', label: 'Ausnahmeart' },
    ],
  },
};
