/**
 * Deutsche Themenseite: Beschaffung aus China (/de/product-sourcing).
 * SEO, H1 und CTA wörtlich aus dem DE-Dokument §1.1; die Module 2–12 folgen
 * der englischen 12-Modul-Struktur in deutscher Lokalisierung.
 */
import type { TopicPageContent } from '../../en-global/topics/types';
import { DE_RELATED_RAIL } from './rails';

export const DE_PRODUCT_SOURCING_TOPIC: TopicPageContent = {
  id: 'de-product-sourcing',
  kind: 'service',
  route: '/de/product-sourcing',
  pageLabel: 'Beschaffung aus China',
  breadcrumbParent: { label: 'Leistungen', href: '/de/leistungen' },
  meta: {
    title: 'Produkte aus China beschaffen | FreightVanta',
    description:
      'Produkte aus China beschaffen: Lieferantenanfragen, vergleichbare Antworten, Musterpunkte und die Übergabe für Ihren Zielmarkt klar koordinieren.',
    keywords: [
      'Beschaffung aus China',
      'China-Sourcing',
      'Produkte aus China beschaffen',
      'Lieferantenvergleich China',
      'Musterkoordination',
    ],
  },
  serviceName: 'Beschaffung aus China',
  startingPoint: 'product-sourcing',
  formButton: 'Beschaffungsplan anfragen',
  hero: {
    kicker: 'BESCHAFFUNG AUS CHINA',
    title: 'Produkte aus China beschaffen – mit einem klaren Brief für den nächsten Einkauf.',
    body: 'Beginnen Sie mit einem Produktlink, einem Referenzbild, einer Spezifikation oder einer Zielmenge. FreightVanta hilft, die Beschaffung aus China in einem lieferantenfähigen Brief zu strukturieren: was das Produkt sein muss, was ein Lieferant in China bestätigen muss, welche Muster oder Vergleichspunkte zählen und wie freigegebene Details an die nächste operative Übergabe weitergehen. Die Einkaufsentscheidung bleibt bei Ihnen; wir machen Fragen, Nachweise und den nächsten Verantwortlichen sichtbar.',
    primaryCta: 'Beschaffungsplan anfragen',
    secondaryCta: 'Ablauf ansehen',
    mediaId: 'service-product-sourcing',
    mediaAlt:
      'Produktmuster, Messwerkzeuge, Spezifikationen und Verpackungsreferenzen für eine China-Beschaffungsprüfung.',
    rail: [
      { step: '01', label: 'CHINA-REFERENZ', note: 'Beginnen Sie mit dem identifizierbaren Produkt' },
      { step: '02', label: 'BRIEF', note: 'Referenz in Lieferantenfragen überführen' },
      { step: '03', label: 'VERGLEICH', note: 'Antworten im selben Rahmen halten' },
      { step: '04', label: 'PRÜFUNG', note: 'Muster, Spezifikationen und offene Entscheidungen verbinden' },
      { step: '05', label: 'ÜBERGABE', note: 'Freigegebene Details weiterreichen' },
    ],
  },
  sections: [
    {
      type: 'decision',
      tone: 'white',
      content: {
        kicker: 'DIE BESCHAFFUNGSENTSCHEIDUNG',
        heading: 'Ein Produktlink ist ein Ausgangspunkt. Ein nutzbarer Beschaffungsbrief ist die nächste Entscheidung.',
        paragraphs: [
          'Ein Marktplatzlink oder eine Lieferantennachricht enthält selten alles, was ein Unternehmen für eine Einkaufsfreigabe braucht. Material, Maße, Ausführung, Varianten, Zielmenge, Verpackung, Zielmarkt, Musteranforderungen und offene Fragen verteilen sich über Bilder und Gespräche. Ein strukturierter China-Beschaffungsbrief hält diese Details zusammen, sodass jeder Lieferant vergleichbare Fragen erhält und das nächste Team den Produktkontext nicht neu aufbauen muss.',
          'Das Ziel ist nicht, ein unsicheres Lieferanten-, Preis-, Qualitäts- oder Konformitätsergebnis sicher klingen zu lassen. Das Ziel ist, die Entscheidung leichter prüfbar zu machen: was bekannt ist, was noch eine Antwort braucht, welche Nachweise vorliegen, wer freigibt und wohin das freigegebene Produkt als Nächstes geht.',
        ],
      },
    },
    {
      type: 'scenarios',
      tone: 'mist',
      content: {
        heading: 'Produkte aus China beschaffen, wenn die Chance klar ist, die nächste Freigabe aber nicht.',
        intro:
          'Nutzen Sie die Leistung, wenn eine Produktrichtung besteht und das Unternehmen einen saubereren Weg von der ersten Referenz bis zur freigegebenen operativen Übergabe braucht.',
        cards: [
          {
            title: 'SIE HABEN EINE CHINA-REFERENZ',
            copy: 'Ein Produktlink, eine Fabrikseite, ein Bild, ein Wettbewerbsmuster, eine Zeichnung oder eine frühe Spezifikation lassen sich in konkrete Fragen zu Material, Größe, Ausführung, Varianten, Menge, Verpackung und Ziel überführen.',
          },
          {
            title: 'SIE BRAUCHEN EIN VERGLEICHBARES LIEFERANTENGESPRÄCH',
            copy: 'Antworten von Lieferanten in China werden am selben Fragenkatalog gelesen, sodass Unterschiede, fehlende Angaben, Musterbedarf und offene Handelsentscheidungen für den Käufer sichtbar bleiben.',
          },
          {
            title: 'SIE BEWEGEN SICH AUF EINEN EINKAUF ZU',
            copy: 'Wenn Produkt, Menge, Verpackung, Ziel und Freigabeverantwortung klarer sind, kann das Team entscheiden, was für einen Einkauf bereit ist und was offen bleiben muss.',
          },
          {
            title: 'DAS NÄCHSTE TEAM BRAUCHT KONTEXT',
            copy: 'Bemusterung, Verpackung, Prüfung, Lagerung, Versand und Fulfillment lassen sich leichter planen, wenn der freigegebene Produktstand festgehalten ist, statt ihn aus einzelnen Nachrichten zu rekonstruieren.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'white',
      content: {
        heading: 'Sie brauchen nicht jede Antwort vor dem ersten Lieferantengespräch in China.',
        body: 'Ein nutzbarer erster Brief kann mit unvollständigen Angaben beginnen. Teilen Sie, was bekannt ist, und benennen Sie, was nicht bekannt ist. Ein Produktlink, ein Bild, eine Zeichnung, ein vorhandenes Muster, eine Zielmenge, ein Zielmarkt oder ein bekannter Lieferant genügt, um den ersten Fragenkatalog zu definieren. Unbekannte Angaben bleiben ein offener Punkt; sie werden niemals stillschweigend durch eine Annahme ersetzt.',
        items: [
          'Produktlink, Bild, Zeichnung, vorhandenes Muster oder Wettbewerbsreferenz.',
          'Produktname, Verwendungszweck, Materialien, Ausführung, Maße, Varianten und nicht verhandelbare Eigenschaften.',
          'Zielmenge, erwartetes Nachbestellmuster und ob die Menge fest oder erkundend ist.',
          'Bekannter Lieferant, Fabrik, Marktplatz oder Herstellerkontakt in China, falls vorhanden.',
          'Zielmarkt, Vertriebskanal und kundengerichtete Verpackungserwartung.',
          'Gewünschter Bereitstellungszeitraum, Launch- oder Nachfüllkontext und bekannte Einschränkungen.',
          'Die nächste Übergabe: Bemusterung, Einkaufsfreigabe, Verpackung, Lagerung, Versand oder Fulfillment.',
        ],
      },
    },
    {
      type: 'workflow',
      tone: 'mist',
      content: {
        heading: 'Eine China-Beschaffungsentscheidung voranbringen, ohne ihren Kontext zu verlieren.',
        intro:
          'Jede Stufe trennt bestätigte Angaben, offene Fragen, Nachweise und Verantwortung. Die Einkaufsfreigabe bleibt bei Ihrem Team.',
        steps: [
          {
            step: '01',
            title: 'China-Referenz teilen',
            copy: 'Produktlinks, Lieferanten- oder Fabrikangaben soweit vorhanden, Bilder, Spezifikationen, Menge, Ziel und das benötigte Ergebnis zusammenführen.',
          },
          {
            step: '02',
            title: 'Lieferantenfähigen Brief erstellen',
            copy: 'Eigenschaften, Varianten, Verpackung, Zielmarkt, Timing und Entscheidungskriterien in eine klare Anfrage an einen Lieferanten in China überführen.',
          },
          {
            step: '03',
            title: 'Vergleichbaren Fragenkatalog erstellen',
            copy: 'Jeden Lieferanten in China um dieselben Kernangaben bitten und lieferantenspezifische Fragen getrennt festhalten, damit der Vergleich lesbar bleibt.',
          },
          {
            step: '04',
            title: 'Antworten und fehlende Nachweise prüfen',
            copy: 'Jede Antwort mit der Frage verbinden, die sie beantwortet. Unbekanntes, widersprüchliche Details und Punkte markieren, die ein Muster, Foto, Video, eine Zeichnung oder eine schriftliche Bestätigung brauchen.',
          },
          {
            step: '05',
            title: 'Muster und Spezifikation koordinieren',
            copy: 'Musterpunkte, Maße, Ausführung, Variante, Packbild und Freigabenotizen organisieren. Bemusterungs- oder Prüfstandards werden nur bei gesonderter Bestätigung veröffentlicht.',
          },
          {
            step: '06',
            title: 'Einkaufsfreigabe vorbereiten',
            copy: 'Ausgewählten oder engeren Produktstand, Mengenannahmen, Verpackungsanforderung, Zielkontext, offenes Risiko und Freigabeverantwortung festhalten. Dies ist eine Entscheidungsaufzeichnung, keine Preis- oder Qualitätsgarantie.',
          },
          {
            step: '07',
            title: 'Nächste operative Übergabe vorbereiten',
            copy: 'Freigegebene Produktdetails, Mengen, Verpackung, Ursprungsangaben und Verantwortlichen-Anweisungen in bestätigte Arbeit für Großeinkauf, Verpackung, Lagerung, Versand oder Fulfillment überführen.',
          },
        ],
      },
    },
    {
      type: 'brief',
      tone: 'navy',
      content: {
        heading: 'Ein gemeinsamer Brief für das China-Sourcing statt mehrerer unverbundener Gespräche.',
        paragraphs: [
          'Ein Beschaffungsgespräch wird nützlicher, wenn Produktreferenz, Lieferantenfragen, Zielmarkt, Musternachweise und Freigabeaufzeichnung verbunden bleiben. Das ist die praktische Bedeutung hinter Suchen wie „China-Sourcing-Agent“ oder „Lieferantensuche in China“: Ein Unternehmen braucht einen verlässlichen Weg von der Referenz zur Entscheidung, keine Liste vager Lieferantenversprechen.',
          'Der Brief kann zeigen, welche Lieferantenangaben vergleichbar sind, welche Handelskondition noch verhandelt werden muss, welche Produkteigenschaft noch nicht belegt ist und welches nachgelagerte Team eingebunden werden muss. Die Seite beschreibt FreightVanta nur dann als rechtlichen Importeur, Werksauditor oder garantierte Qualitätsinstanz, wenn der bestätigte Umfang dies vorsieht.',
        ],
        points: [
          {
            lead: 'China-Lieferantenreferenz',
            rest: 'Link, Fabrikseite, Marktplatzangebot, Kontakt, Bild oder Muster.',
          },
          {
            lead: 'Produkt- und Handelskontext',
            rest: 'Materialien, Varianten, Zielmenge, Verpackung, Markt und Einschränkungen.',
          },
          {
            lead: 'Vergleichbare Kommunikation',
            rest: 'gleiche Fragen, Antworten, Musternachweise und offene Entscheidungen.',
          },
          {
            lead: 'Geplante Übergabe',
            rest: 'freigegebene Details, bereit für Einkauf, Verpackung, Lagerung, Versand oder Fulfillment.',
          },
        ],
        mediaId: 'guide-sourcing-brief',
        mediaAlt:
          'Lieferantenfähiger China-Beschaffungsbrief mit Produktmaßen, Materialien, Zielmengen und Verpackungsnotizen.',
      },
    },
    {
      type: 'comparison',
      tone: 'white',
      content: {
        heading: 'Vergleichen Sie, was jeder Lieferant geantwortet hat – nicht nur die Zahl auf dem Angebot.',
        body: 'Ein nutzbarer Vergleich hält Produktversion, Mengengrundlage, Verpackungsannahme, Musterstatus, Handelskondition und offene Frage in einer Sicht. So erkennt ein Käufer, ob zwei Antworten wirklich vergleichbar sind oder ob eine günstiger wirkende Zahl auf einem anderen Produkt, einer anderen Menge, einem anderen Packbild oder einer anderen Lieferannahme beruht.',
        rows: [
          'Produktreferenz und aktive Revision.',
          'Material-, Maß-, Ausführungs-, Farb- und Variantendetails.',
          'Mengengrundlage, Karton- und Stückverpackung sowie Nachbestellkontext.',
          'Verfügbares Muster, Bild, Zeichnung oder schriftlicher Nachweis.',
          'Verpackung, Etiketten, Beilagen und Umgang mit Lieferantenmaterial.',
          'Zielmarktfrage und nächste Übergabe.',
          'Offene Entscheidung, verantwortliche Person und Freigabestatus.',
        ],
        mediaId: 'service-private-label',
        mediaAlt:
          'Produktmuster und Spezifikationsnotizen, angeordnet zum Vergleich zwischen Lieferantenoptionen in China.',
      },
    },
    {
      type: 'checkpoints',
      tone: 'mist',
      content: {
        heading: 'Muster und Nachweise nutzen, um die nächste Frage konkret zu machen.',
        body: 'Muster, Fotos, Videos, Maße und Lieferantenaussagen können eine interne Prüfung stützen, beantworten aber nur die Fragen, die sie tatsächlich belegen. Ein Muster garantiert für sich genommen keinen Serienlauf, kein regulatorisches Ergebnis und keine künftige Charge. Die Beschaffungsaufzeichnung sollte zeigen, was geprüft und was angenommen wurde, was offen bleibt und ob ein gesonderter Prüf- oder Testumfang erforderlich ist.',
        cards: [
          {
            tag: 'SPEZIFIKATION',
            copy: 'Freigegebene Eigenschaften, Maße, Materialien, Ausführung und Varianten vergleichen.',
          },
          {
            tag: 'NACHWEIS',
            copy: 'Fotos, Videos, Musternotizen, Zeichnungen oder Lieferantenaussagen der passenden Frage zuordnen.',
          },
          {
            tag: 'FREIGABE',
            copy: 'Festhalten, wer den Produktstand angenommen hat und welche Annahmen offen bleiben.',
          },
          {
            tag: 'ÄNDERUNGSSTEUERUNG',
            copy: 'Überarbeitetem Produkt, Bauteil, Verpackung oder Lieferanten­antwort einen neuen Prüfpunkt geben.',
          },
        ],
      },
    },
    {
      type: 'scopeTable',
      tone: 'white',
      content: {
        heading: 'Was der Beschaffungsbrief organisieren kann – und was zuerst bestätigt werden muss.',
        headers: ['Thema', 'Was der Beschaffungsbrief organisieren kann', 'Was zuerst bestätigt werden muss'],
        rows: [
          {
            topic: 'Produktbrief',
            organize: 'Produktreferenz, Spezifikation, Varianten, Menge und offene Fragen organisieren.',
            confirm: '—',
          },
          {
            topic: 'Lieferantenfragen',
            organize: 'Vergleichbare Fragen koordinieren und Antworten bekannter oder identifizierter Lieferanten festhalten.',
            confirm: '—',
          },
          {
            topic: 'Musterkoordination',
            organize: 'Musteranfragen und Prüfinotizen organisieren, soweit im Umfang enthalten.',
            confirm: 'Musterkosten, Prüfstandard und Annahmekriterien.',
          },
          {
            topic: 'Qualitätsarbeit',
            organize: 'Vereinbarte Nachweise und Prüfpunkte in die Aufzeichnung überführen.',
            confirm: 'Prüfung, Werksaudit, Testing und Qualitätsgarantie.',
          },
          {
            topic: 'Handelsergebnis',
            organize: 'Annahmen und Konditionen leichter vergleichbar machen.',
            confirm: 'Endpreis, Rabatt, MOQ, Zahlung, Vertrag und Einsparungen.',
          },
          {
            topic: 'Konformität',
            organize: 'Markt- oder Produktfragen aufzeigen, die geprüft werden müssen.',
            confirm: 'Zertifizierung, rechtliche Kennzeichnung, Zoll, Produktsicherheit und regulatorische Beratung.',
          },
          {
            topic: 'Übergabe',
            organize: 'Freigegebene Angaben für bestätigte Verpackung, Lagerung, Versand oder Fulfillment vorbereiten.',
            confirm: 'Lager, Carrier, Lieferzeit und Abdeckung.',
          },
        ],
      },
    },
    {
      type: 'checklist',
      tone: 'mist',
      content: {
        heading: 'Das Ergebnis ist eine entscheidungsreife Beschaffungsaufzeichnung.',
        body: 'Das nützliche Ergebnis ist keine lange Liste ungefilterter Lieferantenlinks. Es ist eine Arbeitsaufzeichnung, die eine andere Person verstehen und nutzen kann: Produktreferenz, aktueller Brief, Lieferantenfragen und Antworten, Muster- und Nachweisnotizen, offene Punkte, Freigabeverantwortung, Verpackungskontext, Mengenannahmen und die nächste bestätigte Übergabe.',
        items: [
          'Lieferantenfähiger Produktbrief.',
          'Vergleichbare Fragen- und Antwortmatrix.',
          'Muster- und Nachweisprüfnotizen (wenn im bestätigten Umfang enthalten).',
          'Protokoll offener Fragen und Entscheidungen.',
          'Freigegebener Produkt-, Varianten- und Verpackungsstand.',
          'Übergabehinweise für Großeinkauf, Verpackung, Lagerung, Versand oder Fulfillment.',
        ],
      },
    },
    {
      type: 'faq',
      tone: 'white',
      content: {
        heading: 'Beschaffung aus China: Fragen, die sich früh zu klären lohnen.',
        items: [
          {
            id: 'de-ps-link',
            question: 'Können Sie uns bei der Beschaffung aus China helfen, wenn wir nur einen Link haben?',
            answer:
              'Ja. Ein Link, ein Bild oder eine kurze Beschreibung kann das erste Gespräch eröffnen. Fehlende Angaben zu Produkt, Lieferant, Verpackung und Ziel werden als offene Frage erfasst statt angenommen.',
          },
          {
            id: 'de-ps-agent',
            question: 'Treten Sie als China-Sourcing-Agent auf?',
            answer:
              'Die Seite beschreibt Beschaffungskoordination, Fragenmanagement, Vergleich und Übergabe. Eine Vertretung, Einkaufsvollmacht, Einfuhrverantwortung oder rechtliche Vertretung muss in einem gesondert bestätigten Umfang definiert werden.',
          },
          {
            id: 'de-ps-compare',
            question: 'Können Sie mehrere Lieferanten in China vergleichen?',
            answer:
              'Ja, wenn Lieferantenreferenzen oder Antworten vorliegen. Sie werden an einem gemeinsamen Fragenkatalog verglichen; Unterschiede und fehlende Nachweise bleiben sichtbar.',
          },
          {
            id: 'de-ps-guarantee',
            question: 'Sind Lieferant, Preis oder Qualität garantiert?',
            answer:
              'Nein. Lieferantenauswahl, Preis, Qualitätskontrolle, Werksaudit, Testing, Konformität und Annahmekriterien brauchen eine ausdrückliche Bestätigung.',
          },
          {
            id: 'de-ps-samples',
            question: 'Können Sie Muster oder Prüfungen arrangieren?',
            answer:
              'Musterkoordination und Prüfung lassen sich als gesonderte Umfangspunkte besprechen. Vor einer Vereinbarung darf die Seite keine Prüfmethode, kein Bestehen und keine Prüfzusage andeuten.',
          },
          {
            id: 'de-ps-downstream',
            question: 'Kann die Beschaffung in Verpackung, Lagerung und Fulfillment weitergehen?',
            answer:
              'Ja. Sobald Produkt, Menge, Verpackung, Ursprung und Ziel freigegeben sind, kann die Aufzeichnung an bestätigte nachgelagerte Leistungen übergeben werden.',
          },
          {
            id: 'de-ps-private-label',
            question: 'Können Sie Eigenmarken-Produkte aus China beschaffen?',
            answer:
              'Produkt- und Markenprogramm lassen sich besprechen; Artwork, Marke, IP, rechtliche Etiketten, Produktaussagen und Herstellungsverantwortung brauchen jedoch eine eigene Prüfung und Freigabe.',
          },
          {
            id: 'de-ps-first',
            question: 'Was sollten wir zuerst senden?',
            answer:
              'Senden Sie Produktreferenz, Zielmenge, Markt, Timing, bekannten Lieferanten und die Entscheidung, die aktuell blockiert ist. Die erste Antwort konzentriert sich auf die Fragen, die den Umfang definieren.',
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
      { ...DE_RELATED_RAIL['inventory-storage'] },
      { ...DE_RELATED_RAIL['worldwide-fulfillment'] },
    ],
  },
  enquiry: {
    kicker: 'Gespräch beginnen',
    heading: 'Beginnen Sie mit dem Produkt, der China-Übergabe und dem Ergebnis, das Sie brauchen.',
    body: 'Teilen Sie Produkt, Menge, bekannte Lieferantenreferenz in China, Ziel, Timing, Verpackungserwartung und den Punkt, an dem Ihr Prozess Unterstützung braucht. FreightVanta beginnt mit den praktischen Fragen, die den Umfang definieren.',
    reassurance: [],
    contextTitle: 'Zu dieser Beschaffungsanfrage',
    contextFields: [
      { name: 'known_china_supplier', label: 'Bekannter Lieferant in China' },
      { name: 'material', label: 'Material' },
      { name: 'variant', label: 'Variante' },
      { name: 'sample_need', label: 'Musterbedarf' },
      { name: 'target_market', label: 'Zielmarkt' },
    ],
  },
};
