export interface IndustryContentDe {
  slug: string;
  navLabel: string;
  name: string;
  menuLine: string;
  copy: string;
  questions: string[];
  relatedServices: string[];
  relatedGuides: string[];
  mediaId: string;
  mediaAlt: string;
}

export const INDUSTRIES_DE: IndustryContentDe[] = [
  {
    slug: 'e-commerce-und-handel',
    navLabel: 'E-Commerce & Handel',
    name: 'E-Commerce & Handel',
    menuLine: 'Nachschub, Bundles und Marktplatzvorbereitung',
    copy: 'Nachbestellungen, Bundles und neutrale Markenverpackung koordinieren.',
    questions: [
      'Welche SKUs, Bundles oder Sets müssen gemeinsam versendet werden?',
      'Gibt es Marktplatz- oder filialspezifische Vorgaben für Kartons, Etiketten oder Verpackung?',
      'Wie wirkt sich der Nachschubtakt auf den Bestand am Zielort aus?',
      'Wer gibt Beilagen, Etiketten und Verpackung frei, bevor Ware freigegeben wird?',
    ],
    relatedServices: ['lager-und-fulfillment', 'verpackung-und-branding', 'seefracht', 'beschaffung-in-china'],
    relatedGuides: ['verpackung-und-beilagen', 'seefracht-luftfracht-oder-bahn'],
    mediaId: 'de-industry-ecommerce',
    mediaAlt: 'Lagerteam beim Handling von Kartons vor geordneten Regalen.',
  },
  {
    slug: 'konsumgueter',
    navLabel: 'Konsumgüter',
    name: 'Konsumgüter',
    menuLine: 'Qualitätsprüfung, Launch-Bereitschaft und Präsentation',
    copy: 'Produktqualität, Präsentation und planbare Übergaben verbinden.',
    questions: [
      'Welche Produktdetails und Qualitätsprüfungen müssen vor dem Versand bestätigt sein?',
      'Wovon hängt die Launch-Bereitschaft ab – Muster, Verpackung oder Termin?',
      'Wie soll die Präsentation vom Lieferanten bis ins Regal oder an die Haustür bestehen?',
      'Welche Kennzeichnungen oder Unterlagen erwartet der deutsche bzw. europäische Markt?',
    ],
    relatedServices: ['beschaffung-in-china', 'verpackung-und-branding', 'private-label', 'lager-und-fulfillment'],
    relatedGuides: ['sourcing-briefing-china', 'verpackung-und-beilagen'],
    mediaId: 'de-industry-konsumgueter',
    mediaAlt: 'Eine Person packt ein kleines Produkt aus einem Karton mit Füllpapier aus.',
  },
  {
    slug: 'industriekomponenten',
    navLabel: 'Industriekomponenten',
    name: 'Industriekomponenten',
    menuLine: 'Spezifikationen, Dokumentation und Wareneingang',
    copy: 'Spezifikationen, Packdaten und Empfangsvorgaben im Vordergrund.',
    questions: [
      'Welche Spezifikationen und Zeichnungen definieren ein annehmbares Teil?',
      'Welche Dokumentation muss die Sendung begleiten (z. B. Prüfzeugnisse)?',
      'Welche Anforderungen gelten im Wareneingang am Zielort?',
      'Was ist die nächste Produktions- oder Serviceübergabe nach der Zustellung?',
    ],
    relatedServices: ['beschaffung-in-china', 'zollkoordination', 'seefracht', 'landtransport-und-zustellung'],
    relatedGuides: ['import-checkliste-deutschland', 'incoterms-2020-verstaendlich'],
    mediaId: 'de-industry-industrie',
    mediaAlt: 'Nahaufnahme von Zahnrädern und gefrästen Bauteilen in einer Werkstatt.',
  },
  {
    slug: 'zeitkritische-sendungen',
    navLabel: 'Zeitkritische Sendungen',
    name: 'Terminsensible Sendungen',
    menuLine: 'Nächste machbare Bewegung, frühe Ausnahmen',
    copy: 'Nächste realistische Option und offene Risiken früh sichtbar machen.',
    questions: [
      'Was ist die nächste machbare Bewegung – und wovon hängt sie ab?',
      'Welche Unterlagen oder Freigaben könnten die Sendung aufhalten?',
      'Wer muss von einer Ausnahme erfahren – und wie schnell?',
      'Was ist die Rückfalloption, wenn die erste Variante nicht mehr machbar ist?',
    ],
    relatedServices: ['luftfracht', 'zollkoordination', 'landtransport-und-zustellung'],
    relatedGuides: ['seefracht-luftfracht-oder-bahn', 'import-checkliste-deutschland'],
    mediaId: 'de-industry-zeitkritisch',
    mediaAlt: 'Flugzeug am Gate bei Nacht während der Frachtabfertigung.',
  },
];

export const getIndustryDe = (slug: string) => INDUSTRIES_DE.find((industry) => industry.slug === slug) ?? null;
