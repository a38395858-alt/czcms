export interface IndustryContentIt {
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

export const INDUSTRIES_IT: IndustryContentIt[] = [
  {
    slug: 'e-commerce-e-retail',
    navLabel: 'E-commerce e retail',
    name: 'E-commerce e retail',
    menuLine: 'Riassortimento, kit e preparazione marketplace',
    copy: 'Riassortimenti, bundle e presentazione coerente.',
    questions: [
      'Quali referenze, kit o bundle devono viaggiare insieme?',
      'Ci sono istruzioni di cartoni, etichette o imballaggio proprie di un marketplace o di un’insegna?',
      'Come incide il ritmo di riassortimento sulla giacenza a destino?',
      'Chi approva inserti, etichette e imballaggio prima del rilascio della merce?',
    ],
    relatedServices: ['magazzino-e-logistica-e-commerce', 'imballaggio-e-brand', 'trasporto-marittimo', 'ricerca-fornitori-in-cina'],
    relatedGuides: ['guida-imballaggio-e-inserti', 'marittimo-aereo-o-ferrovia'],
    mediaId: 'it-industry-ecommerce',
    mediaAlt: 'Team di magazzino che movimenta scatole davanti a scaffalature ordinate.',
  },
  {
    slug: 'beni-di-consumo',
    navLabel: 'Beni di consumo',
    name: 'Beni di consumo',
    menuLine: 'Controllo qualità, lancio e presentazione',
    copy: 'Qualità, packaging e consegna come parte della marca.',
    questions: [
      'Quali dettagli di prodotto e controlli qualità vanno confermati prima della spedizione?',
      'Da che cosa dipende la preparazione del lancio: campioni, imballaggio o calendario?',
      'Come deve reggere la presentazione dal fornitore allo scaffale o alla porta del cliente?',
      'Quali etichettature o documenti si attende il mercato italiano ed europeo?',
    ],
    relatedServices: ['ricerca-fornitori-in-cina', 'imballaggio-e-brand', 'private-label', 'magazzino-e-logistica-e-commerce'],
    relatedGuides: ['briefing-acquisti-cina', 'guida-imballaggio-e-inserti'],
    mediaId: 'it-industry-consumo',
    mediaAlt: 'Una persona apre un piccolo prodotto da una scatola con carta da riempimento.',
  },
  {
    slug: 'componenti-industriali',
    navLabel: 'Componenti industriali',
    name: 'Componenti industriali',
    menuLine: 'Specifiche, documentazione e ricevimento',
    copy: 'Specifiche, documenti e ricezione controllata.',
    questions: [
      'Quali specifiche e disegni definiscono un pezzo accettabile?',
      'Quale documentazione deve accompagnare la spedizione (ad esempio i certificati di materiale)?',
      'Quali requisiti valgono al ricevimento presso la destinazione?',
      'Qual è il passaggio successivo in produzione o in assistenza dopo la consegna?',
    ],
    relatedServices: ['ricerca-fornitori-in-cina', 'coordinamento-doganale', 'trasporto-marittimo', 'trasporto-terrestre-e-consegna'],
    relatedGuides: ['checklist-import-italia', 'incoterms-2020-spiegati'],
    mediaId: 'it-industry-industria',
    mediaAlt: 'Primo piano di ingranaggi e componenti meccanici in officina.',
  },
  {
    slug: 'spedizioni-urgenti',
    navLabel: 'Spedizioni urgenti',
    name: 'Spedizioni urgenti',
    menuLine: 'Prossimo movimento possibile, eccezioni in anticipo',
    copy: 'Priorità chiara e scenario realistico.',
    questions: [
      'Qual è il prossimo movimento possibile e da che cosa dipende?',
      'Quali documenti o approvazioni potrebbero fermare la spedizione?',
      'Chi deve sapere di un’eccezione, ed entro quanto tempo?',
      'Qual è l’alternativa se la prima opzione non è più praticabile?',
    ],
    relatedServices: ['trasporto-aereo', 'coordinamento-doganale', 'trasporto-terrestre-e-consegna'],
    relatedGuides: ['marittimo-aereo-o-ferrovia', 'checklist-import-italia'],
    mediaId: 'it-industry-urgente',
    mediaAlt: 'Aeromobile al gate di notte durante la gestione del carico.',
  },
];

export const getIndustryIt = (slug: string) => INDUSTRIES_IT.find((industry) => industry.slug === slug) ?? null;
