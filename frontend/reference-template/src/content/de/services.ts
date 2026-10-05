import type { StartingPointValue } from '../types';

export interface ServiceContentDe {
  slug: string;
  navLabel: string;
  label: string;
  menuLine: string;
  title: string;
  copy: string;
  tags: string[];
  linkLabel: string;
  mediaId: string;
  mediaAlt: string;
  startingPoint: StartingPointValue | null;
  inSelector: boolean;
  share: string[];
  clarify: string[];
  scopeNote?: string;
  relatedGuides: string[];
}

export const SERVICES_DE: ServiceContentDe[] = [
  {
    slug: 'beschaffung-in-china',
    navLabel: 'Beschaffung in China',
    label: 'Beschaffung in China',
    menuLine: 'Lieferantenbriefing, Vergleich und Muster',
    title: 'Lieferantenoptionen belastbar prüfen.',
    copy: 'Senden Sie Link, Foto oder Spezifikation. Wir helfen, geeignete Lieferanten zu identifizieren, Varianten zu vergleichen und die nächsten Einkaufsfragen zu klären.',
    tags: ['Beschaffung in China', 'Lieferantenbriefing', 'Musterkoordination'],
    linkLabel: 'Beschaffung in China ansehen',
    mediaId: 'de-service-beschaffung',
    mediaAlt: 'Produktmuster, Farbkarten und Unterlagen auf einem Arbeitstisch bei der Lieferantenauswahl.',
    startingPoint: 'product-sourcing',
    inSelector: true,
    share: [
      'Ein Produktlink, ein Foto oder eine kurze Spezifikation',
      'Zielpreis und die Mengen, die Sie in Betracht ziehen',
      'Zielmarkt und Wunschtermin',
      'Bereits bekannte Anforderungen an Verpackung, Kennzeichnung oder Konformität (z. B. CE-Kennzeichnung)',
    ],
    clarify: [
      'Welche Lieferantenfragen vor dem Einkauf beantwortet sein müssen',
      'Welche Vergleichskriterien für Ihr Produkt zählen',
      'Erwartungen an Muster und wer sie freigibt',
      'Welche Einkaufsdetails vor der nächsten Übergabe zu bestätigen sind',
    ],
    relatedGuides: ['sourcing-briefing-china', 'verpackung-und-beilagen'],
  },
  {
    slug: 'seefracht',
    navLabel: 'Seefracht',
    label: 'Seefracht',
    menuLine: 'FCL, LCL und Hafen-zu-Haus-Planung',
    title: 'Kapazität und Übergaben sauber vorbereiten.',
    copy: 'Für Sammel- oder Containerfracht stimmen wir Warenbereitschaft, Packdaten, Exportunterlagen und die Übergabe am Ziel ab. Offene Punkte bleiben sichtbar.',
    tags: ['FCL', 'LCL', 'Hafen-zu-Haus'],
    linkLabel: 'Seefracht ansehen',
    mediaId: 'de-service-seefracht',
    mediaAlt: 'Containerbrücken am Terminal Burchardkai im Hamburger Hafen.',
    startingPoint: 'ocean-freight',
    inSelector: true,
    share: [
      'Versandbereitschaftstermin und Abholort',
      'Kartonanzahl, Maße und Gewicht',
      'Zieladresse oder Zielhafen',
      'Die mit dem Lieferanten vereinbarte Incoterms-Klausel, sofern bekannt',
    ],
    clarify: [
      'Was der Plan enthält und welche Entscheidungen offen sind',
      'Exportunterlagen und Hafenübergaben',
      'Wer den jeweils nächsten Schritt verantwortet',
      'Der Zustellplan nach dem Hafen – einschließlich Nachlauf zum Empfänger',
    ],
    relatedGuides: ['seefracht-luftfracht-oder-bahn', 'incoterms-2020-verstaendlich'],
  },
  {
    slug: 'luftfracht',
    navLabel: 'Luftfracht',
    label: 'Luftfracht',
    menuLine: 'Express, Standard und dringende Nachversorgung',
    title: 'Wenn der Termin die Route bestimmt.',
    copy: 'Bei dringenden Nachlieferungen vergleichen wir geeignete Luftfrachtwege und bereiten die für die nächste Übergabe erforderlichen Informationen vor.',
    tags: ['Express', 'Standard', 'Dringende Nachversorgung'],
    linkLabel: 'Luftfracht ansehen',
    mediaId: 'de-service-luftfracht',
    mediaAlt: 'Bodenabfertigung eines Flugzeugs am Terminal mit Servicefahrzeugen.',
    startingPoint: 'air-freight',
    inSelector: true,
    share: [
      'Was die Sendung absichert: Launch, Nachschub oder dringender Auftrag',
      'Versandbereitschaft, Maße und Gewicht',
      'Abhol- und Zustellort',
      'Waren, die besondere Handhabung oder Unterlagen erfordern (z. B. Batterien)',
    ],
    clarify: [
      'Praktikable Luftfrachtoptionen für den entscheidenden Termin',
      'Abholzeitpunkt und Versandunterlagen',
      'Zustellübergaben am Zielort',
      'Was passiert, wenn sich ein Termin oder eine Annahme ändert',
    ],
    relatedGuides: ['seefracht-luftfracht-oder-bahn', 'import-checkliste-deutschland'],
  },
  {
    slug: 'landtransport-und-zustellung',
    navLabel: 'Landtransport & Zustellung',
    label: 'Landtransport & Zustellung',
    menuLine: 'Vor- und Nachlauf, Wareneingang, Zustellübergabe',
    title: 'Die Strecke mit Blick auf den Empfänger abschließen.',
    copy: 'Nach der Freigabe braucht der letzte Abschnitt einen eigenen Plan: Abholzeitpunkt, Anforderungen im Wareneingang, Avisierung und Zeitfenster – und wer die Zustellung bestätigt. Wir halten diese Details an der Sendung, damit die Übergabe an Ihr Lager, Ihre Filiale oder Ihren Kunden geplant statt improvisiert ist.',
    tags: ['Abholkoordination', 'Wareneingangsanforderungen', 'Zustellübergabe'],
    linkLabel: 'Landtransport & Zustellung ansehen',
    mediaId: 'de-service-nachlauf',
    mediaAlt: 'Kartons auf einer Sackkarre im Laderaum eines Lieferfahrzeugs.',
    startingPoint: null,
    inSelector: false,
    share: [
      'Lieferadresse, Annahmezeiten und Ansprechperson vor Ort',
      'Avisierung, Rampe oder Equipment-Anforderungen (z. B. Hebebühne)',
      'Karton- oder Palettenanzahl und Gewicht',
      'Wer den Empfang am Zielort bestätigt',
    ],
    clarify: [
      'Abholzeitpunkt nach der Freigabe',
      'Wareneingangsanforderungen, die die Zustellung erfüllen muss',
      'Zustellbestätigung und Ausnahmehinweise',
      'Wer kontaktiert wird, wenn sich etwas ändert',
    ],
    relatedGuides: ['import-checkliste-deutschland', 'seefracht-luftfracht-oder-bahn'],
  },
  {
    slug: 'zollkoordination',
    navLabel: 'Zollkoordination',
    label: 'Zollkoordination',
    menuLine: 'Handelsrechnung, Packliste und Dokumentenbereitschaft',
    title: 'Dokumente früh auf Vollständigkeit prüfen.',
    copy: 'Rechnungs-, Pack- und Produktangaben werden vor dem Versand strukturiert gesammelt. Tarifierung und Freigabe bleiben Sache der zuständigen Stelle oder Ihres Zollpartners.',
    tags: ['Sendungsdaten', 'Dokumentenbereitschaft', 'Übergabeunterstützung'],
    linkLabel: 'Zollkoordination ansehen',
    mediaId: 'de-service-zoll',
    mediaAlt: 'Versandunterlagen, Laptop und Kartons auf einem Schreibtisch bei der Dokumentenvorbereitung.',
    startingPoint: 'not-sure',
    inSelector: true,
    share: [
      'Handelsrechnung und Packliste',
      'Warenbeschreibung, Materialien und Verwendungszweck',
      'Angaben zu Lieferant und Empfänger – einschließlich EORI-Nummer des Importeurs',
      'Ihr bestehender Zolldienstleister, falls vorhanden',
    ],
    clarify: [
      'Welche Sendungsdaten noch fehlen',
      'Dokumentenfragen, die vor dem nächsten Kontrollpunkt zu klären sind',
      'Wer für Tarifierung (Warennummer) und die förmliche Zollanmeldung verantwortlich ist',
      'Übergaben zwischen Lieferant, Frachtteam und Zolldienstleister',
    ],
    scopeNote:
      'Wir koordinieren Sendungsdaten und Dokumentenübergaben. Zuständiger Zolldienstleister, Zuständigkeitsbereich, Tarifierung und der formale Umfang der Zollabfertigung müssen festgelegt sein, bevor eine Zusage zur Verzollung möglich ist. Einfuhrabgaben und Einfuhrumsatzsteuer richten sich nach den Vorgaben der Zollverwaltung.',
    relatedGuides: ['import-checkliste-deutschland', 'incoterms-2020-verstaendlich'],
  },
  {
    slug: 'lager-und-fulfillment',
    navLabel: 'Lager & Fulfillment',
    label: 'Lager & Fulfillment',
    menuLine: 'Konsolidierung, Lagerung und Auftragsvorbereitung',
    title: 'Prüfen, bündeln, versenden.',
    copy: 'Waren können angenommen, kontrolliert, zusammengeführt und gemäß Ihrer Versandvorgabe vorbereitet werden. Mehrteilige Bestellungen und neutrale Pakete lassen sich im Prozess abbilden.',
    tags: ['Konsolidierung', 'Lagerung', 'Auftragsvorbereitung'],
    linkLabel: 'Lager & Fulfillment ansehen',
    mediaId: 'de-service-lager',
    mediaAlt: 'Mitarbeitende organisieren Bestände zwischen Regalreihen in einem Lager.',
    startingPoint: 'warehousing-fulfillment',
    inSelector: true,
    share: [
      'Was von welchen Lieferanten wann eintrifft',
      'Prüfungen im Wareneingang',
      'Anweisungen zu Lagerung, Konsolidierung oder Freigabe',
      'Zielorte und Anforderungen an die Auftragsvorbereitung',
    ],
    clarify: [
      'Wareneingangs- und Prüfschritte vor der Einlagerung',
      'Wie Aufträge konsolidiert, getrennt oder zurückgehalten werden',
      'Produkt-, Verpackungs- und Freigabeanweisungen je Auftrag',
      'Der Leistungsumfang – bestätigt, bevor Bestände bewegt werden',
    ],
    scopeNote:
      'Nennen Sie uns Ihre Anforderungen an Wareneingang, Lagerung, Vorbereitung und Freigabe. Der verfügbare Leistungsumfang wird im Plan bestätigt, bevor Bestände bewegt werden.',
    relatedGuides: ['verpackung-und-beilagen', 'import-checkliste-deutschland'],
  },
  {
    slug: 'verpackung-und-branding',
    navLabel: 'Verpackung & Branding',
    label: 'Verpackung & Branding',
    menuLine: 'Beilagen, Etiketten und Markenverpackung',
    title: 'Verpackung passend zur Marke umsetzen.',
    copy: 'Beileger, Aufkleber, Hangtags, Beutel oder Kartons werden nach freigegebenem Artwork und vereinbarter Stückzahl vorbereitet.',
    tags: ['Beilagen', 'Etiketten', 'Private-Label-Vorbereitung'],
    linkLabel: 'Verpackung & Branding ansehen',
    mediaId: 'de-service-verpackung',
    mediaAlt: 'Eine Person legt eine Dankeskarte zu einem gefalteten T-Shirt in einen Versandkarton.',
    startingPoint: 'packaging-branding',
    inSelector: true,
    share: [
      'Artwork-Dateien und Markenrichtlinien',
      'Mengen für Beilagen, Aufkleber, Hangtags, Beutel oder Kartons',
      'Platzierungsanweisungen je SKU',
      'Wer Muster vor dem Einsatz freigibt',
    ],
    clarify: [
      'Welche Markenelemente Teil des Fulfillment-Briefings sind',
      'Artwork, Mengen und Produktionsschritte, die zu bestätigen sind',
      'Platzierungsanweisungen, denen ein Packer folgen kann',
      'Freigabepunkte, bevor Ware verpackt wird – einschließlich der Registrierungsfrage nach dem Verpackungsgesetz (LUCID)',
    ],
    relatedGuides: ['verpackung-und-beilagen', 'sourcing-briefing-china'],
  },
  {
    slug: 'private-label',
    navLabel: 'Private Label & White Label',
    label: 'Private Label & White Label',
    menuLine: 'Markenspezifikation, Artwork und Musterfreigabe',
    title: 'Aus einem beschafften Produkt Ihr Produkt machen.',
    copy: 'Trägt ein Produkt Ihre Marke, braucht das Briefing mehr als eine Logodatei. Wir helfen, Spezifikation, Artwork-Freigaben, Verpackungs- und Kennzeichnungsdetails sowie die Musterfreigabe zu ordnen, damit Lieferant, Packteam und Frachtplan mit demselben Stand arbeiten.',
    tags: ['Markenspezifikation', 'Artwork-Freigabe', 'Musterfreigabe'],
    linkLabel: 'Private Label & White Label ansehen',
    mediaId: 'de-service-private-label',
    mediaAlt: 'Materialmuster und Planer auf einem Tisch bei der Produktentwicklung.',
    startingPoint: 'product-sourcing',
    inSelector: false,
    share: [
      'Das Produkt, das Sie branden möchten, oder ein Link zu einem vergleichbaren Produkt',
      'Logo, Artwork-Dateien und Markenrichtlinien',
      'Verpackungs- und Kennzeichnungsanforderungen für Ihren Markt (z. B. Pflichtangaben in deutscher Sprache)',
      'Zielmengen und Launch-Zeitpunkt',
    ],
    clarify: [
      'White Label (bestehendes Produkt unter Ihrer Marke) oder Private Label (an Ihre Spezifikation angepasst)',
      'Artwork-Versionen und wer sie freigibt',
      'Musterfreigabe vor der Produktion',
      'Verpackungs-, Kennzeichnungs- und Vorbereitungsschritte vor der Fracht',
    ],
    relatedGuides: ['sourcing-briefing-china', 'verpackung-und-beilagen'],
  },
];

export const getServiceDe = (slug: string) => SERVICES_DE.find((service) => service.slug === slug) ?? null;
