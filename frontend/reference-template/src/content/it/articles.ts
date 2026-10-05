/**
 * Guide in italiano. La home mostra le tre guide *pubblicate* più recenti;
 * le bozze non vengono mai visualizzate. In produzione la query al CMS sostituisce questo modulo.
 */
import type { Article, ArticleSection } from '../en-global/articles';

export interface ArticleIt extends Omit<Article, 'locale'> {
  locale: 'it';
  sections: ArticleSection[];
}

const ARTICLES_IT: ArticleIt[] = [
  {
    slug: 'checklist-import-italia',
    locale: 'it',
    status: 'published',
    title: 'Importare dalla Cina in Italia: la checklist prima di prenotare',
    excerpt:
      'Quasi tutti i ritardi si vedono arrivare, se qualcuno sta guardando. Questa checklist aiuta a chiarire documenti, responsabilità e dettagli di ricevimento prima che la merce lasci il fornitore.',
    category: 'Preparazione all’import',
    publishedAt: '2026-09-26',
    readMinutes: 8,
    coverId: 'it-guide-checklist',
    coverAlt: 'Una mano con il guanto scrive su una lavagnetta tra scatole imballate.',
    sections: [
      {
        heading: 'Prodotto e fornitore',
        blocks: [
          {
            type: 'list',
            items: [
              'Descrizione definitiva della merce, materiali e quantità',
              'Nome del fornitore, indirizzo di ritiro e data di disponibilità',
              'Numero di colli, dimensioni e pesi',
              'Requisiti di marcatura o etichettatura specifici del prodotto',
            ],
          },
        ],
      },
      {
        heading: 'Dati doganali',
        blocks: [
          {
            type: 'p',
            text: 'Per importare nell’Unione europea l’importatore ha bisogno di un codice EORI; in Italia si ottiene tramite l’Agenzia delle Dogane e dei Monopoli. Chiarisca anche il codice TARIC, il valore in dogana e l’origine della merce: da qui derivano dazi e IVA all’importazione.',
          },
          {
            type: 'p',
            text: 'La dichiarazione doganale viene presentata dal rappresentante doganale incaricato, che si occupa anche della classificazione tariffaria. Definisca chi è prima di prenotare la spedizione: cambia tempi e responsabilità.',
          },
        ],
      },
      {
        heading: 'Documenti commerciali',
        blocks: [
          {
            type: 'p',
            text: 'Fattura commerciale e packing list devono coincidere tra loro e con la merce. Le condivida presto, così i dubbi emergono prima del controllo successivo.',
          },
          {
            type: 'list',
            items: [
              'Fattura commerciale con descrizione, valori e Incoterm',
              'Packing list con colli, dimensioni e pesi',
              'Documento di trasporto (polizza di carico o lettera di vettura aerea)',
              'Se previsti, certificati di origine o documentazione di conformità',
            ],
          },
        ],
      },
      {
        heading: 'Conformità del prodotto in Italia e nell’UE',
        blocks: [
          {
            type: 'p',
            text: 'A seconda del prodotto valgono requisiti specifici: marcatura CE, persona responsabile stabilita nell’UE ai sensi del regolamento sulla sicurezza generale dei prodotti (GPSR), informazioni obbligatorie in lingua italiana, adesione al CONAI con il relativo Contributo Ambientale, etichettatura ambientale degli imballaggi e, se pertinenti, gli obblighi RAEE o sulle pile. Definisca presto chi se ne fa carico.',
          },
          {
            type: 'note',
            text: 'Questa guida è un orientamento generale e non costituisce consulenza legale o doganale. Fanno fede le indicazioni dell’Agenzia delle Dogane e dei Monopoli, delle autorità competenti e dei suoi consulenti.',
          },
        ],
      },
      {
        heading: 'Responsabilità e Incoterms',
        blocks: [
          {
            type: 'p',
            text: 'Concordi l’Incoterm con il fornitore e metta per iscritto chi prenota, paga e assicura ogni tratta. Se la regola e il piano non coincidono, corregga prima del ritiro.',
          },
        ],
      },
      {
        heading: 'Destinazione e ricevimento',
        blocks: [
          {
            type: 'list',
            items: [
              'Indirizzo di consegna, orari di ricevimento e referente',
              'Requisiti di prenotazione, banchina o attrezzature',
              'Istruzioni di stoccaggio, consolidamento o logistica e-commerce',
              'Chi conferma il ricevimento e controlla la merce',
            ],
          },
        ],
      },
      {
        heading: 'Eccezioni',
        blocks: [
          {
            type: 'p',
            text: 'Decida chi viene informato di un cambiamento — un fornitore in ritardo, un dubbio documentale, una finestra di scarico saltata — ed entro quanto tempo. Un piano che mostra il cambiamento presto si recupera meglio di uno che lo nasconde in una lunga catena di e-mail.',
          },
        ],
      },
    ],
    relatedServices: ['coordinamento-doganale', 'magazzino-e-logistica-e-commerce'],
  },
  {
    slug: 'marittimo-aereo-o-ferrovia',
    locale: 'it',
    status: 'published',
    title: 'Marittimo, aereo o ferrovia? Una guida pratica per decidere',
    excerpt:
      'La modalità giusta dipende da che cosa la spedizione deve proteggere: il budget, una data di lancio, la copertura di stock o una promessa al cliente. Parta da lì, non dalla modalità.',
    category: 'Trasporto internazionale',
    publishedAt: '2026-09-19',
    readMinutes: 6,
    coverId: 'it-guide-modalita',
    coverAlt: 'Treno merci con container sui binari sotto un cielo nuvoloso.',
    sections: [
      {
        heading: 'Partire dal vincolo, non dalla modalità',
        blocks: [
          {
            type: 'p',
            text: 'Le decisioni sulla modalità sbagliano strada quando la domanda è «quale costa meno?» invece di «che cosa deve proteggere questa spedizione?». Dia prima un nome al vincolo: una data di lancio, la copertura di stock, una promessa al cliente o il budget del costo a destino.',
          },
        ],
      },
      {
        heading: 'Quando il marittimo è di solito la scelta giusta',
        blocks: [
          {
            type: 'p',
            text: 'Il marittimo è in genere la tratta economica per merce pronta in anticipo e senza una data di arrivo ravvicinata obbligata. Per l’Italia le rotte tipiche passano dai porti liguri e tirrenici o dall’Alto Adriatico, con inoltro su gomma o su ferro e, spesso, un passaggio da un interporto.',
          },
          {
            type: 'list',
            items: [
              'FCL (container completo): la merce occupa l’intero container',
              'LCL (groupage): la merce condivide il container con altre spedizioni',
              'Porto-porta: il piano prosegue oltre il porto di destino fino al suo indirizzo di consegna',
            ],
          },
        ],
      },
      {
        heading: 'Quando la ferrovia Cina–Europa è un’opzione',
        blocks: [
          {
            type: 'p',
            text: 'Tra marittimo e aereo si colloca il ferroviario Cina–Europa. Può essere interessante quando la merce deve arrivare prima che via nave, ma senza l’urgenza dell’aereo. Disponibilità, tempi e condizioni dipendono da rotta e periodo e si verificano nel piano di spedizione.',
          },
        ],
      },
      {
        heading: 'Quando l’aereo si guadagna il posto',
        blocks: [
          {
            type: 'p',
            text: 'Vale la pena confrontare l’aereo quando un lancio, un riassortimento o un ordine urgente non possono aspettare il ciclo marittimo successivo, oppure quando la merce è piccola e di valore elevato rispetto al volume.',
          },
        ],
      },
      {
        heading: 'Le domande che rendono utile il confronto',
        blocks: [
          {
            type: 'list',
            items: [
              'Quando sarà davvero pronta la merce per il ritiro?',
              'Quali sono dimensioni, pesi e numero di colli?',
              'Quale data conta a destino e che cosa succede se slitta?',
              'Ci sono requisiti di ricevimento all’indirizzo di consegna?',
              'Una parte dell’ordine potrebbe viaggiare in aereo mentre il resto segue via mare o via ferrovia?',
            ],
          },
          {
            type: 'note',
            text: 'Non pubblichiamo tempi di resa né tariffe generiche. Le opzioni realistiche dipendono da rotta, merce e data e vengono confermate nel piano di spedizione.',
          },
        ],
      },
    ],
    relatedServices: ['trasporto-marittimo', 'trasporto-aereo'],
  },
  {
    slug: 'briefing-acquisti-cina',
    locale: 'it',
    status: 'published',
    title: 'Come preparare un briefing acquisti per la Cina',
    excerpt:
      'Un briefing acquisti utile non deve essere lungo. Deve rendere chiari il prodotto, le quantità, le aspettative di qualità e la decisione successiva a tutte le persone coinvolte.',
    category: 'Fornitori in Cina',
    publishedAt: '2026-09-10',
    readMinutes: 6,
    coverId: 'it-guide-briefing',
    coverAlt: 'Selezione di cartelle colori e campioni di tessuto su una scrivania.',
    sections: [
      {
        heading: 'Partire da quello che ha già',
        blocks: [
          {
            type: 'p',
            text: 'Un link al prodotto, una foto o una scheda tecnica sintetica bastano per aprire la conversazione. Condivida quello che ha invece di aspettare il documento perfetto: il briefing crescerà man mano che il piano prende forma.',
          },
          {
            type: 'p',
            text: 'Se ha un prezzo obiettivo, lo indichi. Restringe presto il campo dei fornitori e tiene i confronti con i piedi per terra.',
          },
        ],
      },
      {
        heading: 'Descrivere il prodotto come lo quota un fornitore',
        blocks: [
          {
            type: 'p',
            text: 'I fornitori quotano dettagli, non intenzioni. Più punti di questo elenco riesce a confermare, più sarà facile confrontare le offerte a parità di condizioni:',
          },
          {
            type: 'list',
            items: [
              'Materiali, finiture e riferimenti colore',
              'Dimensioni, peso e le tolleranze che contano',
              'Varianti: taglie, colori o kit',
              'Aspettative su imballaggio di vendita e di spedizione',
              'Etichettature, marcature o documenti richiesti dal suo mercato',
            ],
          },
        ],
      },
      {
        heading: 'Essere chiari su quantità e tempi',
        blocks: [
          {
            type: 'p',
            text: 'Indichi la quantità del primo ordine che sta valutando, se prevede riassortimenti e la data entro cui la merce deve essere disponibile. Specifichi se quella data è fissa o flessibile: cambia quali opzioni sono praticabili.',
          },
        ],
      },
      {
        heading: 'Definire che cosa significa «accettabile» prima dei campioni',
        blocks: [
          {
            type: 'p',
            text: 'I campioni servono solo se tutti sanno che cosa si sta verificando. Metta per iscritto i punti che decidono l’approvazione, chi approva e che cosa succede se un campione ne manca uno.',
          },
          {
            type: 'note',
            text: 'Tenga briefing, risposte dei fornitori e commenti sui campioni in un unico filo di lavoro, così il passaggio successivo parte dall’ultima versione.',
          },
        ],
      },
      {
        heading: 'Una breve checklist prima di inviarlo',
        blocks: [
          {
            type: 'list',
            items: [
              'Link al prodotto, foto o scheda tecnica allegata',
              'Prezzo obiettivo e fascia di quantità indicati',
              'Destinazione e data desiderata inserite',
              'Requisiti di imballaggio, etichettatura e conformità annotati',
              'Persona responsabile dell’approvazione dei campioni indicata',
            ],
          },
        ],
      },
    ],
    relatedServices: ['ricerca-fornitori-in-cina', 'private-label'],
  },
  {
    slug: 'guida-imballaggio-e-inserti',
    locale: 'it',
    status: 'published',
    title: 'Imballaggio e inserti: che cosa definire prima della preparazione ordini',
    excerpt:
      'Inserti, adesivi, cartellini e scatole brandizzate funzionano meglio quando grafica, quantità e posizionamento sono confermati prima che la merce arrivi al banco di preparazione.',
    category: 'Imballaggio e brand',
    publishedAt: '2026-08-29',
    readMinutes: 5,
    coverId: 'it-guide-imballaggio',
    coverAlt: 'Una persona confeziona una t-shirt piegata con un biglietto in una scatola.',
    sections: [
      {
        heading: 'Decidere che cosa vede per primo il cliente',
        blocks: [
          {
            type: 'p',
            text: 'Elenchi ogni elemento di marca nell’ordine in cui il cliente lo incontra: scatola esterna, velina, biglietto, etichetta di prodotto. Il briefing resta concentrato e si evita di pagare elementi che nessuno vede.',
          },
        ],
      },
      {
        heading: 'Confermare grafica e quantità',
        blocks: [
          {
            type: 'list',
            items: [
              'File grafici definitivi e versioni approvate',
              'Quantità per referenza, più un piccolo margine per le rotture',
              'Chi fornisce ciascun elemento e quando arriva',
              'Esigenze di stoccaggio del materiale di imballaggio',
            ],
          },
        ],
      },
      {
        heading: 'Scrivere istruzioni di posizionamento che un operatore possa seguire',
        blocks: [
          {
            type: 'p',
            text: 'Descriva il posizionamento per ogni referenza in passaggi semplici, meglio se con la foto di un campione approvato. «Biglietto sopra, logo rivolto verso l’alto» è più chiaro di «aggiungere inserto».',
          },
        ],
      },
      {
        heading: 'Non dimenticare CONAI ed etichettatura ambientale',
        blocks: [
          {
            type: 'p',
            text: 'Chi immette imballaggi sul mercato italiano è di norma tenuto ad aderire al CONAI e a versare il Contributo Ambientale. Gli imballaggi devono inoltre riportare l’etichettatura ambientale prevista dal D.lgs. 116/2020, con l’identificazione del materiale e, per gli imballaggi destinati al consumatore, le indicazioni per la raccolta differenziata. Chiarisca nel briefing chi assume questo ruolo: fornitore, marchio o distributore.',
          },
          {
            type: 'note',
            text: 'Orientamento generale, non consulenza legale. Fanno fede le indicazioni di CONAI, delle autorità competenti e dei suoi consulenti.',
          },
        ],
      },
      {
        heading: 'Proteggere il prodotto quanto la presentazione',
        blocks: [
          {
            type: 'p',
            text: 'La presentazione deve sopravvivere al viaggio. Verifichi che l’imballaggio brandizzato continui a proteggere il prodotto attraverso consolidamento, trasporto e consegna finale.',
          },
        ],
      },
    ],
    relatedServices: ['imballaggio-e-brand', 'magazzino-e-logistica-e-commerce'],
  },
  {
    slug: 'incoterms-2020-spiegati',
    locale: 'it',
    status: 'published',
    title: 'Incoterms 2020 spiegati: chi risponde di quale passaggio?',
    excerpt:
      'Gli Incoterms descrivono dove la responsabilità passa dal venditore al compratore. Conoscere quel punto rende più semplice confrontare preventivi, assicurazione e piani di consegna.',
    category: 'Incoterms',
    publishedAt: '2026-08-15',
    readMinutes: 6,
    coverId: 'it-guide-incoterms',
    coverAlt: 'Porto industriale con gru e merci sotto un cielo nuvoloso.',
    sections: [
      {
        heading: 'Che cosa regolano gli Incoterms e che cosa no',
        blocks: [
          {
            type: 'p',
            text: 'Pubblicati dalla Camera di Commercio Internazionale (ICC), gli Incoterms® descrivono dove avviene la consegna, quando il rischio passa dal venditore al compratore e chi organizza e paga il trasporto e determinati costi.',
          },
          {
            type: 'p',
            text: 'Non regolano quando si trasferisce la proprietà, come avviene il pagamento o che cosa succede in caso di inadempimento. Questo appartiene al contratto di compravendita.',
          },
        ],
      },
      {
        heading: 'Le regole che incontrerà più spesso nei preventivi',
        blocks: [
          {
            type: 'list',
            items: [
              'EXW (Franco fabbrica): il venditore mette la merce a disposizione presso i propri locali; da lì il compratore organizza quasi tutto, sdoganamento all’export compreso.',
              'FCA (Franco vettore): il venditore consegna la merce sdoganata all’export al vettore designato dal compratore. Per i container è spesso più pratico di EXW.',
              'FOB (Franco a bordo): il venditore consegna la merce a bordo della nave nel porto di imbarco convenuto. Solo per trasporto marittimo e per vie navigabili interne.',
              'CIF (Costo, assicurazione e nolo): il venditore paga nolo e assicurazione minima fino al porto di destino, ma il rischio passa già al caricamento a bordo all’origine.',
              'DAP (Reso al luogo di destinazione): il venditore consegna al luogo convenuto, pronto per lo scarico; sdoganamento all’import e dazi restano a carico del compratore.',
              'DDP (Reso sdoganato): il venditore consegna al luogo convenuto con merce sdoganata all’import e dazi pagati.',
            ],
          },
        ],
      },
      {
        heading: 'Far coincidere la regola e il piano',
        blocks: [
          {
            type: 'p',
            text: 'Un preventivo ha senso solo accanto alla regola che presuppone. Verifichi che il luogo convenuto sia preciso, che l’assicurazione corrisponda al punto di passaggio del rischio e che il piano indichi chi risponde di ogni passaggio da lì in poi.',
          },
          {
            type: 'note',
            text: 'Questa guida è informazione generale, non consulenza legale. Verifichi la versione degli Incoterms e la regola nel suo contratto. Incoterms® è un marchio della ICC.',
          },
        ],
      },
    ],
    relatedServices: ['trasporto-marittimo', 'coordinamento-doganale'],
  },
  {
    slug: 'coordinamento-fornitori',
    locale: 'it',
    status: 'draft',
    title: 'Coordinamento fornitori: campioni, approvazioni e modifiche in un unico filo',
    excerpt: 'Bozza, non ancora pubblicata.',
    category: 'Fornitori in Cina',
    publishedAt: '2026-09-27',
    readMinutes: 5,
    coverId: 'it-guide-fornitori',
    coverAlt: '',
    sections: [],
    relatedServices: ['ricerca-fornitori-in-cina'],
  },
];

export function getPublishedArticlesIt(): ArticleIt[] {
  return ARTICLES_IT.filter((article) => article.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getLatestArticlesIt = (limit = 3) => getPublishedArticlesIt().slice(0, Math.max(0, limit));

export const getArticleIt = (slug: string) => getPublishedArticlesIt().find((article) => article.slug === slug) ?? null;

export function formatDateIt(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
