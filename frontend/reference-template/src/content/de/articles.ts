/**
 * Deutsche Ratgeber. Die Startseite zeigt die drei neuesten *veröffentlichten* Beiträge;
 * Entwürfe werden nie gerendert. In Produktion ersetzt die CMS-Abfrage dieses Modul.
 */
import type { Article, ArticleSection } from '../en-global/articles';

export interface ArticleDe extends Omit<Article, 'locale'> {
  locale: 'de';
  sections: ArticleSection[];
}

const ARTICLES_DE: ArticleDe[] = [
  {
    slug: 'import-checkliste-deutschland',
    locale: 'de',
    status: 'published',
    title: 'Import aus China nach Deutschland: Checkliste vor der Buchung',
    excerpt:
      'Die meisten Verzögerungen sind früh sichtbar, wenn jemand hinsieht. Diese Checkliste hilft, Unterlagen, Zuständigkeiten und Wareneingangsdetails zu klären, bevor die Ware den Lieferanten verlässt.',
    category: 'Importvorbereitung',
    publishedAt: '2026-09-24',
    readMinutes: 8,
    coverId: 'de-guide-checkliste',
    coverAlt: 'Eine Hand in Handschuhen schreibt auf einem Klemmbrett zwischen gepackten Kartons.',
    sections: [
      {
        heading: 'Produkt und Lieferant',
        blocks: [
          {
            type: 'list',
            items: [
              'Endgültige Warenbeschreibung, Materialien und Mengen',
              'Lieferantenname, Abholadresse und Versandbereitschaftstermin',
              'Kartonanzahl, Maße und Gewichte',
              'Produktspezifische Kennzeichnungs- oder Etikettierungsvorgaben',
            ],
          },
        ],
      },
      {
        heading: 'Zollrelevante Angaben',
        blocks: [
          {
            type: 'p',
            text: 'Für die Einfuhr in die EU benötigt der Importeur eine EORI-Nummer; in Deutschland wird sie bei der Zollverwaltung beantragt. Klären Sie außerdem Warennummer (Zolltarifnummer), Zollwert und Warenursprung – daraus ergeben sich Einfuhrabgaben und Einfuhrumsatzsteuer.',
          },
          {
            type: 'p',
            text: 'Tarifierung und förmliche Zollanmeldung übernimmt der beauftragte Zolldienstleister nach den Vorgaben der Zollverwaltung. Legen Sie fest, wer das ist, bevor die Sendung gebucht wird.',
          },
        ],
      },
      {
        heading: 'Handelsunterlagen',
        blocks: [
          {
            type: 'p',
            text: 'Handelsrechnung und Packliste müssen zueinander und zur Ware passen. Teilen Sie sie früh, damit Fragen auftauchen, bevor die Ware den nächsten Kontrollpunkt erreicht.',
          },
          {
            type: 'list',
            items: [
              'Handelsrechnung mit Warenbeschreibung, Werten und Incoterms-Klausel',
              'Packliste mit Kartons, Maßen und Gewichten',
              'Frachtpapiere (Konnossement bzw. Luftfrachtbrief)',
              'Gegebenenfalls Ursprungsnachweise oder Konformitätsunterlagen',
            ],
          },
        ],
      },
      {
        heading: 'Produktkonformität in Deutschland und der EU',
        blocks: [
          {
            type: 'p',
            text: 'Je nach Produkt gelten eigene Anforderungen – etwa CE-Kennzeichnung, eine in der EU ansässige verantwortliche Person nach der Produktsicherheitsverordnung (GPSR), Registrierungspflichten nach dem Verpackungsgesetz (LUCID), dem Elektro- und Elektronikgerätegesetz oder dem Batteriegesetz. Klären Sie früh, wer diese Pflichten trägt.',
          },
          {
            type: 'note',
            text: 'Dieser Ratgeber ist eine allgemeine Orientierung und keine Rechts- oder Zollberatung. Verbindliche Auskünfte erteilen Zollverwaltung, zuständige Behörden und Ihre Beraterinnen und Berater.',
          },
        ],
      },
      {
        heading: 'Zuständigkeiten und Incoterms',
        blocks: [
          {
            type: 'p',
            text: 'Vereinbaren Sie die Incoterms-Klausel mit Ihrem Lieferanten und halten Sie fest, wer jeden Abschnitt bucht, bezahlt und versichert. Passen Klausel und Plan nicht zusammen, korrigieren Sie das vor der Abholung.',
          },
        ],
      },
      {
        heading: 'Zielort und Wareneingang',
        blocks: [
          {
            type: 'list',
            items: [
              'Lieferadresse, Annahmezeiten und Ansprechperson',
              'Avisierung, Rampe oder Equipment-Anforderungen',
              'Anweisungen zu Lagerung, Konsolidierung oder Fulfillment',
              'Wer den Empfang bestätigt und die Ware prüft',
            ],
          },
        ],
      },
      {
        heading: 'Ausnahmen',
        blocks: [
          {
            type: 'p',
            text: 'Legen Sie fest, wer von einer Änderung erfährt – ein verspäteter Lieferant, eine Dokumentenfrage, ein verpasstes Zeitfenster – und wie schnell. Ein Plan, der die Änderung früh zeigt, ist leichter zu retten als einer, der sie in einer langen E-Mail-Kette versteckt.',
          },
        ],
      },
    ],
    relatedServices: ['zollkoordination', 'lager-und-fulfillment'],
  },
  {
    slug: 'seefracht-luftfracht-oder-bahn',
    locale: 'de',
    status: 'published',
    title: 'Seefracht, Luftfracht oder Bahn? Eine praxisnahe Entscheidungshilfe',
    excerpt:
      'Der richtige Verkehrsträger hängt davon ab, was die Sendung schützen muss: Budget, Launch-Termin, Bestandsreichweite oder ein Kundenversprechen. Beginnen Sie dort – nicht beim Verkehrsträger.',
    category: 'Internationale Fracht',
    publishedAt: '2026-09-17',
    readMinutes: 6,
    coverId: 'de-guide-verkehrstraeger',
    coverAlt: 'Güterzüge mit Containern an einem Bahnterminal im Hamburger Hafen.',
    sections: [
      {
        heading: 'Mit der Anforderung beginnen, nicht mit dem Verkehrsträger',
        blocks: [
          {
            type: 'p',
            text: 'Verkehrsträger-Entscheidungen gehen schief, wenn die Frage „Was ist günstiger?“ lautet statt „Was muss diese Sendung schützen?“. Benennen Sie zuerst die Anforderung – einen Launch-Termin, die Bestandsreichweite, ein Kundenversprechen oder das Budget für die Gesamtkosten bis zur Zustellung.',
          },
        ],
      },
      {
        heading: 'Wann Seefracht meist passt',
        blocks: [
          {
            type: 'p',
            text: 'Seefracht ist in der Regel der wirtschaftliche Abschnitt für Ware, die früh bereitsteht und nicht zu einem bestimmten nahen Termin ankommen muss. Für Ziele in Deutschland führen typische Routen über die deutschen Seehäfen oder die Westhäfen mit anschließendem Hinterlandverkehr per Lkw, Bahn oder Binnenschiff.',
          },
          {
            type: 'list',
            items: [
              'FCL (Full Container Load): Ihre Ware belegt einen ganzen Container',
              'LCL (Less than Container Load): Ihre Ware teilt sich den Container mit anderen Sendungen und wird konsolidiert',
              'Hafen-zu-Haus: Der Plan reicht über den Zielhafen hinaus bis zu Ihrer Lieferadresse',
            ],
          },
        ],
      },
      {
        heading: 'Wann die Bahn China–Europa eine Option ist',
        blocks: [
          {
            type: 'p',
            text: 'Zwischen See- und Luftfracht liegt der Schienengüterverkehr China–Europa. Er kann interessant sein, wenn Ware schneller als per Schiff, aber nicht so dringend wie per Flugzeug ankommen soll. Verfügbarkeit, Laufzeiten und Konditionen hängen von Route und Zeitraum ab und werden im Sendungsplan geprüft.',
          },
        ],
      },
      {
        heading: 'Wann Luftfracht ihren Platz verdient',
        blocks: [
          {
            type: 'p',
            text: 'Luftfracht lohnt den Vergleich, wenn ein Launch, eine Nachbestellung oder ein dringender Auftrag nicht auf den nächsten Seefrachtzyklus warten kann – oder wenn Ware im Verhältnis zu ihrer Größe klein und wertvoll ist.',
          },
        ],
      },
      {
        heading: 'Fragen, die den Vergleich brauchbar machen',
        blocks: [
          {
            type: 'list',
            items: [
              'Wann ist die Ware tatsächlich abholbereit?',
              'Welche Kartonmaße, Gewichte und Stückzahlen liegen vor?',
              'Welcher Termin zählt am Zielort – und was passiert, wenn er rutscht?',
              'Gibt es Anforderungen im Wareneingang an der Lieferadresse?',
              'Könnte ein Teil der Bestellung per Luft reisen, während der Rest per See oder Bahn folgt?',
            ],
          },
          {
            type: 'note',
            text: 'Wir veröffentlichen keine pauschalen Laufzeiten oder Preise. Praktikable Optionen hängen von Route, Ware und Termin ab und werden im Sendungsplan bestätigt.',
          },
        ],
      },
    ],
    relatedServices: ['seefracht', 'luftfracht'],
  },
  {
    slug: 'sourcing-briefing-china',
    locale: 'de',
    status: 'published',
    title: 'So bereiten Sie ein Sourcing-Briefing für China vor',
    excerpt:
      'Ein brauchbares Sourcing-Briefing muss nicht lang sein. Es muss Produkt, Mengen, Qualitätserwartungen und die nächste Entscheidung für alle Beteiligten klar machen.',
    category: 'Beschaffung in China',
    publishedAt: '2026-09-08',
    readMinutes: 6,
    coverId: 'de-guide-sourcing',
    coverAlt: 'Auswahl von Farb- und Stoffmustern auf einem Schreibtisch.',
    sections: [
      {
        heading: 'Mit dem beginnen, was Sie schon haben',
        blocks: [
          {
            type: 'p',
            text: 'Ein Produktlink, ein Foto oder eine kurze Spezifikation reicht, um ein Beschaffungsgespräch zu eröffnen. Teilen Sie, was Sie haben, statt auf das perfekte Dokument zu warten – das Briefing kann wachsen, sobald der Plan klarer wird.',
          },
          {
            type: 'p',
            text: 'Wenn Sie einen Zielpreis haben, nennen Sie ihn. Er grenzt Lieferantenoptionen früh ein und hält Vergleichsgespräche auf dem Boden.',
          },
        ],
      },
      {
        heading: 'Das Produkt so beschreiben, wie ein Lieferant es kalkuliert',
        blocks: [
          {
            type: 'p',
            text: 'Lieferanten kalkulieren anhand von Details, nicht Absichten. Je mehr dieser Punkte Sie bestätigen können, desto leichter lassen sich Angebote vergleichen:',
          },
          {
            type: 'list',
            items: [
              'Materialien, Oberfläche und Farbreferenzen',
              'Maße, Gewicht und die Toleranzen, die zählen',
              'Varianten wie Größen, Farben oder Bundles',
              'Erwartungen an Verkaufs- und Versandverpackung',
              'Kennzeichnungen, Markierungen oder Unterlagen, die Ihr Zielmarkt verlangt',
            ],
          },
        ],
      },
      {
        heading: 'Mengen und Zeitrahmen klar benennen',
        blocks: [
          {
            type: 'p',
            text: 'Nennen Sie die Erstbestellmenge, die Sie in Betracht ziehen, ob Sie Nachbestellungen erwarten und wann die Ware verfügbar sein muss. Sagen Sie, ob dieser Termin fix oder flexibel ist – das entscheidet, welche Optionen praktikabel sind.',
          },
        ],
      },
      {
        heading: 'Vor den Mustern festlegen, was „akzeptabel“ heißt',
        blocks: [
          {
            type: 'p',
            text: 'Muster sind nur nützlich, wenn alle wissen, was geprüft wird. Halten Sie die Punkte fest, die über die Freigabe entscheiden, wer freigibt und was passiert, wenn ein Muster einen Punkt verfehlt.',
          },
          {
            type: 'note',
            text: 'Halten Sie Briefing, Lieferantenantworten und Musterfeedback in einem Arbeitsfaden zusammen, damit die nächste Übergabe vom aktuellen Stand ausgeht.',
          },
        ],
      },
      {
        heading: 'Kurze Checkliste vor dem Versenden',
        blocks: [
          {
            type: 'list',
            items: [
              'Produktlink, Foto oder Spezifikation angehängt',
              'Zielpreis und Mengenspanne genannt',
              'Zielort und Wunschtermin enthalten',
              'Verpackungs-, Kennzeichnungs- und Konformitätsanforderungen notiert',
              'Freigabeverantwortliche für Muster benannt',
            ],
          },
        ],
      },
    ],
    relatedServices: ['beschaffung-in-china', 'private-label'],
  },
  {
    slug: 'verpackung-und-beilagen',
    locale: 'de',
    status: 'published',
    title: 'Verpackung und Beilagen: Was vor dem Fulfillment geklärt sein muss',
    excerpt:
      'Beilagen, Aufkleber, Hangtags und Markenkartons funktionieren am besten, wenn Artwork, Mengen und Platzierung bestätigt sind, bevor die Ware den Packtisch erreicht.',
    category: 'Verpackung & Branding',
    publishedAt: '2026-08-27',
    readMinutes: 5,
    coverId: 'de-guide-verpackung',
    coverAlt: 'Eine Person packt ein gefaltetes T-Shirt mit Dankeskarte in einen Karton.',
    sections: [
      {
        heading: 'Festlegen, was der Kunde zuerst sieht',
        blocks: [
          {
            type: 'p',
            text: 'Listen Sie jedes Markenelement in der Reihenfolge auf, in der der Kunde es wahrnimmt – Umkarton, Seidenpapier, Beilagenkarte, Produktetikett. Das hält das Briefing fokussiert und vermeidet Elemente, die niemand sieht.',
          },
        ],
      },
      {
        heading: 'Artwork und Mengen bestätigen',
        blocks: [
          {
            type: 'list',
            items: [
              'Finale Artwork-Dateien und freigegebene Versionen',
              'Mengen je SKU plus ein kleiner Puffer für Beschädigungen',
              'Wer welches Element liefert und wann es eintrifft',
              'Lagerbedarf für Verpackungsmaterial',
            ],
          },
        ],
      },
      {
        heading: 'Platzierungsanweisungen schreiben, denen ein Packer folgen kann',
        blocks: [
          {
            type: 'p',
            text: 'Beschreiben Sie die Platzierung je SKU in einfachen Schritten, idealerweise mit einem Foto eines freigegebenen Musters. „Beilagenkarte obenauf, Logo nach oben“ ist klarer als „Beilage hinzufügen“.',
          },
        ],
      },
      {
        heading: 'Verpackungsgesetz nicht vergessen',
        blocks: [
          {
            type: 'p',
            text: 'Wer verpackte Ware in Deutschland erstmals in Verkehr bringt, muss sich in der Regel im Verpackungsregister LUCID registrieren und die Verpackung an einem dualen System beteiligen. Klären Sie im Briefing, wer diese Rolle übernimmt – Lieferant, Marke oder Händler.',
          },
          {
            type: 'note',
            text: 'Allgemeine Orientierung, keine Rechtsberatung. Verbindliche Auskünfte erteilen die Zentrale Stelle Verpackungsregister und Ihre Beraterinnen und Berater.',
          },
        ],
      },
      {
        heading: 'Das Produkt genauso schützen wie die Präsentation',
        blocks: [
          {
            type: 'p',
            text: 'Die Präsentation muss den Weg überstehen. Stellen Sie sicher, dass Markenverpackung das Produkt durch Konsolidierung, Fracht und Zustellung weiterhin schützt.',
          },
        ],
      },
    ],
    relatedServices: ['verpackung-und-branding', 'lager-und-fulfillment'],
  },
  {
    slug: 'incoterms-2020-verstaendlich',
    locale: 'de',
    status: 'published',
    title: 'Incoterms 2020 verständlich: Wer verantwortet welche Übergabe?',
    excerpt:
      'Incoterms-Klauseln beschreiben, wo Verantwortung zwischen Verkäufer und Käufer wechselt. Wer diesen Punkt kennt, kann Angebote, Versicherung und Zustellpläne leichter vergleichen.',
    category: 'Incoterms',
    publishedAt: '2026-08-13',
    readMinutes: 6,
    coverId: 'de-guide-incoterms',
    coverAlt: 'Kräne und Schiffscontainer im Hamburger Hafen.',
    sections: [
      {
        heading: 'Was Incoterms regeln – und was nicht',
        blocks: [
          {
            type: 'p',
            text: 'Die von der Internationalen Handelskammer (ICC) herausgegebenen Incoterms® beschreiben, wo die Lieferung erfolgt, wann das Risiko vom Verkäufer auf den Käufer übergeht und wer Transport und bestimmte Kosten organisiert und trägt.',
          },
          {
            type: 'p',
            text: 'Sie regeln nicht, wann das Eigentum übergeht, wie bezahlt wird oder was bei einer Vertragsverletzung passiert. Das gehört in Ihren Kaufvertrag.',
          },
        ],
      },
      {
        heading: 'Klauseln, die Ihnen in Angeboten häufig begegnen',
        blocks: [
          {
            type: 'list',
            items: [
              'EXW (Ab Werk): Der Verkäufer stellt die Ware auf seinem Gelände bereit; der Käufer organisiert ab dort nahezu alles – einschließlich der Ausfuhrabfertigung.',
              'FCA (Frei Frachtführer): Der Verkäufer übergibt die Ware ausfuhrfreigemacht an den vom Käufer benannten Frachtführer. Für Containerfracht oft praktikabler als EXW.',
              'FOB (Frei an Bord): Der Verkäufer liefert die Ware an Bord des Schiffes im benannten Verschiffungshafen. Nur für See- und Binnenschiffstransport.',
              'CIF (Kosten, Versicherung und Fracht): Der Verkäufer trägt Fracht und Mindestversicherung bis zum Bestimmungshafen; das Risiko geht jedoch bereits mit der Verladung an Bord über.',
              'DAP (Geliefert benannter Ort): Der Verkäufer liefert entladebereit am benannten Zielort; Einfuhrabfertigung und Abgaben trägt der Käufer.',
              'DDP (Geliefert verzollt): Der Verkäufer liefert am benannten Zielort einfuhrverzollt und mit bezahlten Abgaben.',
            ],
          },
        ],
      },
      {
        heading: 'Klausel und Plan zusammenbringen',
        blocks: [
          {
            type: 'p',
            text: 'Ein Angebot ergibt nur neben der Klausel Sinn, die es voraussetzt. Prüfen Sie, ob der benannte Ort präzise ist, ob die Versicherung zum Risikoübergang passt und ob der Plan zeigt, wer ab diesem Punkt jede Übergabe verantwortet.',
          },
          {
            type: 'note',
            text: 'Dieser Ratgeber ist allgemeine Information, keine Rechtsberatung. Prüfen Sie Incoterms-Version und Klausel in Ihrem Vertrag. Incoterms® ist eine Marke der ICC.',
          },
        ],
      },
    ],
    relatedServices: ['seefracht', 'zollkoordination'],
  },
  {
    slug: 'lieferantenkoordination',
    locale: 'de',
    status: 'draft',
    title: 'Lieferantenkoordination: Muster, Freigaben und Änderungen in einem Faden',
    excerpt: 'Entwurf – noch nicht veröffentlicht.',
    category: 'Lieferantenkoordination',
    publishedAt: '2026-09-27',
    readMinutes: 5,
    coverId: 'de-guide-lieferanten',
    coverAlt: '',
    sections: [],
    relatedServices: ['beschaffung-in-china'],
  },
];

export function getPublishedArticlesDe(): ArticleDe[] {
  return ARTICLES_DE.filter((article) => article.status === 'published').sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export const getLatestArticlesDe = (limit = 3) => getPublishedArticlesDe().slice(0, Math.max(0, limit));

export const getArticleDe = (slug: string) => getPublishedArticlesDe().find((article) => article.slug === slug) ?? null;

export function formatDateDe(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}
