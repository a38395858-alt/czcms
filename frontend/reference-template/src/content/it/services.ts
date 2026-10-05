import type { StartingPointValue } from '../types';

export interface ServiceContentIt {
  slug: string;
  navLabel: string;
  /** Short label for tabs and pills. */
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

export const SERVICES_IT: ServiceContentIt[] = [
  {
    slug: 'ricerca-fornitori-in-cina',
    navLabel: 'Ricerca fornitori in Cina',
    label: 'Fornitori in Cina',
    menuLine: 'Briefing fornitore, confronto e campioni',
    title: 'Iniziare dal prodotto giusto.',
    copy: 'Invia link, foto o specifiche. Possiamo cercare fornitori in Cina, confrontare alternative e preparare campioni o domande d’acquisto.',
    tags: ['Fornitori in Cina', 'Briefing fornitore', 'Gestione campioni'],
    linkLabel: 'Scopri la ricerca fornitori',
    mediaId: 'it-service-fornitori',
    mediaAlt: 'Una persona esamina campioni di tessuto in uno studio durante la selezione dei fornitori.',
    startingPoint: 'product-sourcing',
    inSelector: true,
    share: [
      'Un link al prodotto, una foto o una scheda tecnica sintetica',
      'Il prezzo obiettivo e le quantità che sta valutando',
      'Il mercato di destinazione e la data desiderata',
      'I requisiti di imballaggio, etichettatura o conformità già noti (ad esempio la marcatura CE)',
    ],
    clarify: [
      'Quali domande ai fornitori vanno risolte prima dell’acquisto',
      'Quali criteri di confronto contano per il suo prodotto',
      'Che cosa ci si aspetta dai campioni e chi li approva',
      'Quali dettagli d’acquisto confermare prima del passaggio successivo',
    ],
    relatedGuides: ['briefing-acquisti-cina', 'guida-imballaggio-e-inserti'],
  },
  {
    slug: 'trasporto-marittimo',
    navLabel: 'Trasporto marittimo',
    label: 'Trasporto marittimo',
    menuLine: 'FCL, LCL e pianificazione porto-porta',
    title: 'Dare struttura al volume.',
    copy: 'Per groupage o container coordiniamo disponibilità, preparazione, dati di imballo, partenza e consegna prevista.',
    tags: ['FCL', 'LCL', 'Porto-porta'],
    linkLabel: 'Scopri il trasporto marittimo',
    mediaId: 'it-service-marittimo',
    mediaAlt: 'Veduta aerea di una nave cargo ormeggiata presso un terminal industriale.',
    startingPoint: 'ocean-freight',
    inSelector: true,
    share: [
      'Data di disponibilità della merce e luogo di ritiro',
      'Numero di colli, dimensioni e peso',
      'Indirizzo o porto di destinazione',
      'L’Incoterm concordato con il fornitore, se lo conosce',
    ],
    clarify: [
      'Che cosa include il piano e quali decisioni restano aperte',
      'I documenti di export e i passaggi in porto',
      'Chi segue ciascun passo successivo',
      'Il piano di consegna dopo il porto, compreso l’inoltro fino a destino',
    ],
    relatedGuides: ['marittimo-aereo-o-ferrovia', 'incoterms-2020-spiegati'],
  },
  {
    slug: 'trasporto-aereo',
    navLabel: 'Trasporto aereo',
    label: 'Trasporto aereo',
    menuLine: 'Express, standard e riassortimento urgente',
    title: 'Proteggere un momento importante.',
    copy: 'Per lanci, riassortimenti o urgenze valutiamo un percorso aereo coerente con prodotto, documenti e priorità.',
    tags: ['Express', 'Standard', 'Riassortimento urgente'],
    linkLabel: 'Scopri il trasporto aereo',
    mediaId: 'it-service-aereo',
    mediaAlt: 'Assistenza a terra di un aeromobile al terminal, con i mezzi di piazzale.',
    startingPoint: 'air-freight',
    inSelector: true,
    share: [
      'Che cosa protegge la spedizione: un lancio, un riassortimento o un ordine urgente',
      'Data di disponibilità, dimensioni e peso',
      'Luoghi di ritiro e di consegna',
      'Merci che richiedono movimentazione o documenti particolari (ad esempio batterie)',
    ],
    clarify: [
      'Le opzioni aeree realistiche per la data che conta',
      'Il momento del ritiro e i documenti di spedizione',
      'I passaggi di consegna a destino',
      'Che cosa succede se cambia una data o un’ipotesi',
    ],
    relatedGuides: ['marittimo-aereo-o-ferrovia', 'checklist-import-italia'],
  },
  {
    slug: 'trasporto-terrestre-e-consegna',
    navLabel: 'Trasporto terrestre e consegna',
    label: 'Trasporto e consegna',
    menuLine: 'Ritiro, ricevimento merci e consegna finale',
    title: 'Chiudere il percorso pensando a chi riceve.',
    copy: 'Dopo lo svincolo, l’ultima tratta merita un piano a sé: momento del ritiro, requisiti di ricevimento, prenotazione della finestra di scarico e chi conferma la consegna. Teniamo questi dettagli agganciati alla spedizione, così la consegna al suo magazzino, al negozio o al cliente è pianificata e non improvvisata.',
    tags: ['Coordinamento ritiri', 'Requisiti di ricevimento', 'Consegna finale'],
    linkLabel: 'Scopri trasporto e consegna',
    mediaId: 'it-service-consegna',
    mediaAlt: 'Scatole di cartone su un carrello all’interno di un furgone per le consegne.',
    startingPoint: null,
    inSelector: false,
    share: [
      'Indirizzo di consegna, orari di ricevimento e referente in loco',
      'Requisiti di prenotazione, banchina o attrezzature (ad esempio sponda idraulica)',
      'Numero di colli o pallet e peso',
      'Chi conferma il ricevimento a destino',
    ],
    clarify: [
      'Il momento del ritiro dopo lo svincolo',
      'I requisiti di ricevimento che la consegna deve rispettare',
      'La conferma di consegna e le note sulle eccezioni',
      'Chi viene avvisato se qualcosa cambia',
    ],
    relatedGuides: ['checklist-import-italia', 'marittimo-aereo-o-ferrovia'],
  },
  {
    slug: 'coordinamento-doganale',
    navLabel: 'Coordinamento doganale',
    label: 'Coordinamento doganale',
    menuLine: 'Fattura, packing list e documenti pronti',
    title: 'Preparare prima di spedire.',
    copy: 'Fattura, packing list e informazioni prodotto restano raccolte in modo ordinato. Classificazione e sdoganamento dipendono dal broker e dalle autorità competenti.',
    tags: ['Dati della spedizione', 'Documenti pronti', 'Supporto ai passaggi'],
    linkLabel: 'Scopri il coordinamento doganale',
    mediaId: 'it-service-dogana',
    mediaAlt: 'Ricevute e documenti ordinati su una scrivania durante la preparazione delle pratiche.',
    startingPoint: 'not-sure',
    inSelector: true,
    share: [
      'Fattura commerciale e packing list',
      'Descrizione della merce, materiali e destinazione d’uso',
      'Dati di fornitore e destinatario, compreso il codice EORI dell’importatore',
      'Il suo spedizioniere doganale attuale, se già ne ha uno',
    ],
    clarify: [
      'Quali dati della spedizione mancano ancora',
      'Quali dubbi documentali risolvere prima del controllo successivo',
      'Chi si occupa della classificazione tariffaria (codice TARIC) e della dichiarazione doganale',
      'I passaggi tra fornitore, team trasporti e rappresentante doganale',
    ],
    scopeNote:
      'Coordiniamo i dati della spedizione e i passaggi documentali. Rappresentante doganale, ambito, classificazione tariffaria e perimetro formale dello sdoganamento vanno definiti prima di qualsiasi impegno. Dazi e IVA all’importazione seguono le regole applicate dall’Agenzia delle Dogane e dei Monopoli.',
    relatedGuides: ['checklist-import-italia', 'incoterms-2020-spiegati'],
  },
  {
    slug: 'magazzino-e-logistica-e-commerce',
    navLabel: 'Magazzino e logistica e-commerce',
    label: 'Magazzino ed e-commerce',
    menuLine: 'Consolidamento, stoccaggio e preparazione ordini',
    title: 'Ricevere, controllare, preparare.',
    copy: 'Ricezione, verifica, consolidamento, imballo e invio seguono una stessa istruzione approvata. Gli ordini con più articoli e i pacchi neutri rientrano nel brief.',
    tags: ['Consolidamento', 'Stoccaggio', 'Preparazione ordini'],
    linkLabel: 'Scopri il magazzino',
    mediaId: 'it-service-magazzino',
    mediaAlt: 'Interno luminoso di un magazzino con scaffalature metalliche e merce stoccata.',
    startingPoint: 'warehousing-fulfillment',
    inSelector: true,
    share: [
      'Che cosa arriva, da quali fornitori e quando',
      'Quali controlli effettuare al ricevimento',
      'Istruzioni di stoccaggio, consolidamento o rilascio',
      'Destinazioni e requisiti di preparazione degli ordini',
    ],
    clarify: [
      'I passaggi di ricevimento e controllo prima dello stoccaggio',
      'Come gli ordini vengono consolidati, separati o trattenuti',
      'Istruzioni di prodotto, imballaggio e rilascio per ogni ordine',
      'Il perimetro operativo, confermato prima di muovere lo stock',
    ],
    scopeNote:
      'Ci indichi i suoi requisiti di ricevimento, stoccaggio, preparazione e rilascio. Il perimetro operativo disponibile viene confermato nel piano prima di muovere lo stock.',
    relatedGuides: ['guida-imballaggio-e-inserti', 'checklist-import-italia'],
  },
  {
    slug: 'imballaggio-e-brand',
    navLabel: 'Imballaggio e brand',
    label: 'Imballaggio e brand',
    menuLine: 'Inserti, etichette e packaging personalizzato',
    title: 'Portare la tua identità nel pacco.',
    copy: 'Cartoline, adesivi, etichette, buste o scatole personalizzate vengono gestiti dopo l’approvazione di grafica, quantità e sequenza produttiva.',
    tags: ['Inserti', 'Etichette', 'Preparazione private label'],
    linkLabel: 'Scopri imballaggio e brand',
    mediaId: 'it-service-imballaggio',
    mediaAlt: 'Una persona inserisce un biglietto di ringraziamento accanto a una t-shirt piegata in una scatola.',
    startingPoint: 'packaging-branding',
    inSelector: true,
    share: [
      'File grafici e manuale del marchio',
      'Quantità di inserti, adesivi, cartellini, buste o scatole',
      'Istruzioni di posizionamento per ogni referenza (SKU)',
      'Chi approva i campioni prima dell’uso',
    ],
    clarify: [
      'Quali elementi di marca fanno parte del briefing logistico',
      'Grafica, quantità e fasi di produzione da confermare',
      'Istruzioni di posizionamento che un operatore possa seguire',
      'I punti di approvazione prima dell’imballaggio, compresi il Contributo Ambientale CONAI e l’etichettatura ambientale degli imballaggi',
    ],
    relatedGuides: ['guida-imballaggio-e-inserti', 'briefing-acquisti-cina'],
  },
  {
    slug: 'private-label',
    navLabel: 'Private label e white label',
    label: 'Private label',
    menuLine: 'Capitolato, grafiche e approvazione campioni',
    title: 'Trasformare un prodotto di fornitura nel suo prodotto.',
    copy: 'Quando un prodotto porta il suo marchio, il briefing richiede più di un logo. La aiutiamo a mettere in ordine capitolato, approvazioni grafiche, dettagli di imballaggio ed etichettatura e validazione dei campioni, così fornitore, team di preparazione e piano di trasporto lavorano sulla stessa versione.',
    tags: ['Capitolato', 'Approvazione grafiche', 'Validazione campioni'],
    linkLabel: 'Scopri private label e white label',
    mediaId: 'it-service-private-label',
    mediaAlt: 'Campioni di materiali e un’agenda su un tavolo durante lo sviluppo di un prodotto.',
    startingPoint: 'product-sourcing',
    inSelector: false,
    share: [
      'Il prodotto da personalizzare, o il link a uno analogo',
      'Logo, file grafici e manuale del marchio',
      'Requisiti di imballaggio ed etichettatura per il suo mercato (ad esempio le informazioni obbligatorie in italiano)',
      'Quantità obiettivo e data di lancio',
    ],
    clarify: [
      'White label (un prodotto esistente con il suo marchio) o private label (adattato al suo capitolato)',
      'Le versioni grafiche e chi le approva',
      'La validazione dei campioni prima della produzione',
      'Le fasi di imballaggio, etichettatura e preparazione prima del trasporto',
    ],
    relatedGuides: ['briefing-acquisti-cina', 'guida-imballaggio-e-inserti'],
  },
];

export const getServiceIt = (slug: string) => SERVICES_IT.find((service) => service.slug === slug) ?? null;
