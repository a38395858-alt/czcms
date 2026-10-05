import type { StartingPointValue } from '../content/types';

export type EnquiryFieldName =
  | 'fullName'
  | 'workEmail'
  | 'company'
  | 'phone'
  | 'origin'
  | 'destination'
  | 'startingPoint'
  | 'cargoDetails'
  | 'timing'
  | 'context'
  | 'consent';

export type TimingValue = '' | 'ready-now' | 'this-month' | 'planning-ahead';

export interface ValidationMessages {
  fullNameRequired: string;
  fullNameLong: (max: number) => string;
  emailRequired: string;
  emailInvalid: string;
  companyRequired: string;
  companyLong: (max: number) => string;
  phoneInvalid: string;
  originRequired: string;
  originLong: (max: number) => string;
  destinationRequired: string;
  destinationLong: (max: number) => string;
  startingPointRequired: string;
  cargoLong: string;
  contextLong: string;
  consentRequired: string;
}

export interface EnquiryStrings {
  /** BCP 47 tag used for number formatting (character counters). */
  locale: string;
  formLabel: string;
  requiredBefore: string;
  requiredAsterisk: string;
  requiredAfter: string;
  optional: string;
  fields: Record<EnquiryFieldName, { label: string; hint?: string; placeholder?: string }>;
  startingPoints: Record<StartingPointValue, string>;
  timingPlaceholder: string;
  timing: Record<Exclude<TimingValue, ''>, string>;
  honeypotLabel: string;
  newTab: string;
  reference: string;
  sendAnother: string;
  stillInForm: string;
  contactDetails: string;
  validation: ValidationMessages;
}

export const enStrings: EnquiryStrings = {
  locale: 'en-US',
  formLabel: 'Request a shipment plan',
  requiredBefore: 'Fields marked with',
  requiredAsterisk: 'an asterisk',
  requiredAfter: 'are required.',
  optional: 'Optional',
  fields: {
    fullName: { label: 'Full name' },
    workEmail: { label: 'Work email', placeholder: 'name@company.com' },
    company: { label: 'Company' },
    phone: { label: 'Phone', hint: 'International format, including country code.', placeholder: '+1' },
    origin: { label: 'Origin', hint: 'Country, city, or port.' },
    destination: { label: 'Destination', hint: 'Country, city, port, or ZIP code.' },
    startingPoint: {
      label: 'Starting point',
      hint: 'Where should the plan begin? You can request one service or a combined plan.',
    },
    cargoDetails: {
      label: 'Cargo or product details',
      hint: 'Product type, links, quantities, cartons, dimensions, or weight — whatever you know so far.',
    },
    timing: { label: 'Target timing' },
    context: {
      label: 'Additional context',
      hint: 'Packaging, compliance, receiving, or delivery requirements — anything that shapes the plan.',
    },
    consent: { label: 'Consent' },
  },
  startingPoints: {
    'product-sourcing': 'Product sourcing',
    'ocean-freight': 'Ocean freight',
    'air-freight': 'Air freight',
    'warehousing-fulfillment': 'Warehousing & fulfillment',
    'packaging-branding': 'Packaging & branding',
    'not-sure': 'Not sure yet',
  },
  timingPlaceholder: 'Select target timing',
  timing: { 'ready-now': 'Ready now', 'this-month': 'This month', 'planning-ahead': 'Planning ahead' },
  honeypotLabel: 'Company website',
  newTab: '(opens in a new tab)',
  reference: 'Reference:',
  sendAnother: 'Send another request',
  stillInForm: 'Everything you entered is still in the form, so you can correct it and send again.',
  contactDetails: 'Contact details',
  validation: {
    fullNameRequired: 'Enter your full name so a specialist knows who to reply to.',
    fullNameLong: (max) => `Shorten your name to ${max} characters or fewer.`,
    emailRequired: 'Enter your work email so we can send your plan.',
    emailInvalid: 'Enter a complete email address, for example name@company.com.',
    companyRequired: 'Enter your company name.',
    companyLong: (max) => `Shorten the company name to ${max} characters or fewer.`,
    phoneInvalid:
      'Enter the number with its country code, such as +1 followed by the number, or leave this field blank.',
    originRequired: 'Enter where the goods start: a country, city, or port.',
    originLong: (max) => `Keep the origin under ${max} characters.`,
    destinationRequired: 'Enter where the goods need to go: a country, city, port, or ZIP code.',
    destinationLong: (max) => `Keep the destination under ${max} characters.`,
    startingPointRequired: 'Choose a starting point. Pick “Not sure yet” if you would like us to suggest one.',
    cargoLong: 'Keep cargo details under 2,000 characters. You can share more in the follow-up.',
    contextLong: 'Keep additional context under 2,000 characters. You can share more in the follow-up.',
    consentRequired: 'Confirm that you agree to the privacy policy so we can respond to your request.',
  },
};

export const frStrings: EnquiryStrings = {
  locale: 'fr-FR',
  formLabel: 'Demander un plan d’expédition',
  requiredBefore: 'Les champs marqués d’un',
  requiredAsterisk: 'astérisque',
  requiredAfter: 'sont obligatoires.',
  optional: 'Facultatif',
  fields: {
    fullName: { label: 'Nom et prénom' },
    workEmail: { label: 'Adresse e-mail professionnelle', placeholder: 'prenom.nom@entreprise.fr' },
    company: { label: 'Entreprise' },
    phone: { label: 'Téléphone', hint: 'Format international, indicatif compris.', placeholder: '+33' },
    origin: { label: 'Origine', hint: 'Pays, ville ou port.' },
    destination: { label: 'Destination', hint: 'Pays, ville, port ou code postal.' },
    startingPoint: {
      label: 'Point de départ',
      hint: 'Par où le plan doit-il commencer ? Vous pouvez demander une seule prestation ou un plan combiné.',
    },
    cargoDetails: {
      label: 'Détails de la marchandise ou du produit',
      hint: 'Type de produit, liens, quantités, colis, dimensions ou poids : tout ce que vous savez déjà.',
    },
    timing: { label: 'Échéance visée' },
    context: {
      label: 'Informations complémentaires',
      hint: 'Emballage, conformité, réception ou contraintes de livraison : tout ce qui influence le plan.',
    },
    consent: { label: 'Consentement' },
  },
  startingPoints: {
    'product-sourcing': 'Sourcing en Chine',
    'ocean-freight': 'Fret maritime',
    'air-freight': 'Fret aérien',
    'warehousing-fulfillment': 'Entreposage et logistique e-commerce',
    'packaging-branding': 'Emballage et image de marque',
    'not-sure': 'Je ne sais pas encore',
  },
  timingPlaceholder: 'Choisir une échéance',
  timing: { 'ready-now': 'Marchandise prête', 'this-month': 'Ce mois-ci', 'planning-ahead': 'En anticipation' },
  honeypotLabel: 'Site web de l’entreprise',
  newTab: '(s’ouvre dans un nouvel onglet)',
  reference: 'Référence :',
  sendAnother: 'Envoyer une autre demande',
  stillInForm: 'Vos saisies sont conservées dans le formulaire : vous pouvez les corriger et renvoyer la demande.',
  contactDetails: 'Nous contacter',
  validation: {
    fullNameRequired: 'Veuillez indiquer votre nom et prénom afin que nous sachions à qui répondre.',
    fullNameLong: (max) => `Veuillez limiter le nom à ${max} caractères.`,
    emailRequired: 'Veuillez indiquer votre adresse e-mail professionnelle pour recevoir votre plan.',
    emailInvalid: 'Veuillez saisir une adresse e-mail complète, par exemple prenom.nom@entreprise.fr.',
    companyRequired: 'Veuillez indiquer le nom de votre entreprise.',
    companyLong: (max) => `Veuillez limiter le nom de l’entreprise à ${max} caractères.`,
    phoneInvalid: 'Veuillez saisir le numéro avec son indicatif (par ex. +33 …) ou laisser ce champ vide.',
    originRequired: 'Veuillez indiquer d’où part la marchandise : pays, ville ou port.',
    originLong: (max) => `Veuillez limiter l’origine à ${max} caractères.`,
    destinationRequired: 'Veuillez indiquer où la marchandise doit arriver : pays, ville, port ou code postal.',
    destinationLong: (max) => `Veuillez limiter la destination à ${max} caractères.`,
    startingPointRequired: 'Veuillez choisir un point de départ. Choisissez « Je ne sais pas encore » si vous souhaitez une proposition.',
    cargoLong: 'Veuillez limiter les détails de la marchandise à 2 000 caractères. Vous pourrez en dire plus ensuite.',
    contextLong: 'Veuillez limiter les informations complémentaires à 2 000 caractères. Vous pourrez en dire plus ensuite.',
    consentRequired: 'Veuillez confirmer avoir pris connaissance de la politique de confidentialité pour que nous puissions traiter votre demande.',
  },
};

export const itStrings: EnquiryStrings = {
  locale: 'it-IT',
  formLabel: 'Richiedi un piano di spedizione',
  requiredBefore: 'I campi contrassegnati con',
  requiredAsterisk: 'asterisco',
  requiredAfter: 'sono obbligatori.',
  optional: 'Facoltativo',
  fields: {
    fullName: { label: 'Nome e cognome' },
    workEmail: { label: 'E-mail aziendale', placeholder: 'nome@azienda.it' },
    company: { label: 'Azienda' },
    phone: { label: 'Telefono', hint: 'Formato internazionale, con prefisso.', placeholder: '+39' },
    origin: { label: 'Origine', hint: 'Paese, città o porto.' },
    destination: { label: 'Destinazione', hint: 'Paese, città, porto o CAP.' },
    startingPoint: {
      label: 'Punto di partenza',
      hint: 'Da dove deve iniziare il piano? Può richiedere un singolo servizio o un piano combinato.',
    },
    cargoDetails: {
      label: 'Dettagli della merce o del prodotto',
      hint: 'Tipo di prodotto, link, quantità, colli, dimensioni o peso: tutto ciò che già sa.',
    },
    timing: { label: 'Tempistica prevista' },
    context: {
      label: 'Informazioni aggiuntive',
      hint: 'Imballaggio, conformità, ricevimento merci o requisiti di consegna: tutto ciò che incide sul piano.',
    },
    consent: { label: 'Consenso' },
  },
  startingPoints: {
    'product-sourcing': 'Ricerca fornitori in Cina',
    'ocean-freight': 'Trasporto marittimo',
    'air-freight': 'Trasporto aereo',
    'warehousing-fulfillment': 'Magazzino e logistica e-commerce',
    'packaging-branding': 'Imballaggio e brand',
    'not-sure': 'Non lo so ancora',
  },
  timingPlaceholder: 'Scegli una tempistica',
  timing: { 'ready-now': 'Merce pronta', 'this-month': 'Questo mese', 'planning-ahead': 'In programmazione' },
  honeypotLabel: 'Sito web dell’azienda',
  newTab: '(si apre in una nuova scheda)',
  reference: 'Riferimento:',
  sendAnother: 'Invia un’altra richiesta',
  stillInForm: 'I suoi dati restano nel modulo: può correggerli e inviare di nuovo la richiesta.',
  contactDetails: 'Contatti',
  validation: {
    fullNameRequired: 'Indichi nome e cognome, così sappiamo a chi rispondere.',
    fullNameLong: (max) => `Riduca il nome a un massimo di ${max} caratteri.`,
    emailRequired: 'Indichi la sua e-mail aziendale per ricevere il piano.',
    emailInvalid: 'Inserisca un indirizzo e-mail completo, ad esempio nome@azienda.it.',
    companyRequired: 'Indichi il nome della sua azienda.',
    companyLong: (max) => `Riduca il nome dell’azienda a un massimo di ${max} caratteri.`,
    phoneInvalid: 'Inserisca il numero con il prefisso internazionale (ad esempio +39 …) oppure lasci il campo vuoto.',
    originRequired: 'Indichi da dove parte la merce: paese, città o porto.',
    originLong: (max) => `L’origine non può superare i ${max} caratteri.`,
    destinationRequired: 'Indichi dove deve arrivare la merce: paese, città, porto o CAP.',
    destinationLong: (max) => `La destinazione non può superare i ${max} caratteri.`,
    startingPointRequired: 'Scelga un punto di partenza. Selezioni «Non lo so ancora» se preferisce una proposta da parte nostra.',
    cargoLong: 'Limiti i dettagli della merce a 2.000 caratteri. Potrà aggiungere altro in seguito.',
    contextLong: 'Limiti le informazioni aggiuntive a 2.000 caratteri. Potrà aggiungere altro in seguito.',
    consentRequired: 'Confermi di aver letto l’informativa privacy per permetterci di gestire la sua richiesta.',
  },
};

export const esStrings: EnquiryStrings = {
  locale: 'es-ES',
  formLabel: 'Solicitar plan de envío',
  requiredBefore: 'Los campos marcados con',
  requiredAsterisk: 'asterisco',
  requiredAfter: 'son obligatorios.',
  optional: 'Opcional',
  fields: {
    fullName: { label: 'Nombre y apellidos' },
    workEmail: { label: 'Correo electrónico profesional', placeholder: 'nombre@empresa.es' },
    company: { label: 'Empresa' },
    phone: { label: 'Teléfono', hint: 'Formato internacional, con prefijo.', placeholder: '+34' },
    origin: { label: 'Origen', hint: 'País, ciudad o puerto.' },
    destination: { label: 'Destino', hint: 'País, ciudad, puerto o código postal.' },
    startingPoint: {
      label: 'Punto de partida',
      hint: '¿Por dónde debe empezar el plan? Puede solicitar un único servicio o un plan combinado.',
    },
    cargoDetails: {
      label: 'Detalles de la mercancía o del producto',
      hint: 'Tipo de producto, enlaces, cantidades, bultos, medidas o peso: todo lo que ya sepa.',
    },
    timing: { label: 'Plazo previsto' },
    context: {
      label: 'Información adicional',
      hint: 'Embalaje, normativa, recepción o requisitos de entrega: todo lo que influya en el plan.',
    },
    consent: { label: 'Consentimiento' },
  },
  startingPoints: {
    'product-sourcing': 'Búsqueda de proveedores',
    'ocean-freight': 'Transporte marítimo',
    'air-freight': 'Transporte aéreo',
    'warehousing-fulfillment': 'Almacenaje y logística e-commerce',
    'packaging-branding': 'Embalaje y marca',
    'not-sure': 'Aún no lo sé',
  },
  timingPlaceholder: 'Elija un plazo',
  timing: { 'ready-now': 'Mercancía lista', 'this-month': 'Este mes', 'planning-ahead': 'Para más adelante' },
  honeypotLabel: 'Sitio web de la empresa',
  newTab: '(se abre en una pestaña nueva)',
  reference: 'Referencia:',
  sendAnother: 'Enviar otra solicitud',
  stillInForm: 'Sus datos siguen en el formulario: puede corregirlos y volver a enviar la solicitud.',
  contactDetails: 'Contacto',
  validation: {
    fullNameRequired: 'Indique su nombre y apellidos para que sepamos a quién responder.',
    fullNameLong: (max) => `Acorte el nombre a ${max} caracteres como máximo.`,
    emailRequired: 'Indique su correo electrónico profesional para que podamos enviarle el plan.',
    emailInvalid: 'Introduzca una dirección de correo completa, por ejemplo nombre@empresa.es.',
    companyRequired: 'Indique el nombre de su empresa.',
    companyLong: (max) => `Acorte el nombre de la empresa a ${max} caracteres como máximo.`,
    phoneInvalid: 'Introduzca el número con el prefijo internacional (por ejemplo, +34 …) o deje el campo vacío.',
    originRequired: 'Indique desde dónde sale la mercancía: país, ciudad o puerto.',
    originLong: (max) => `El origen no puede superar los ${max} caracteres.`,
    destinationRequired: 'Indique adónde debe llegar la mercancía: país, ciudad, puerto o código postal.',
    destinationLong: (max) => `El destino no puede superar los ${max} caracteres.`,
    startingPointRequired: 'Elija un punto de partida. Seleccione «Aún no lo sé» si prefiere que le propongamos uno.',
    cargoLong: 'Limite los detalles de la mercancía a 2000 caracteres. Podrá ampliarlos más adelante.',
    contextLong: 'Limite la información adicional a 2000 caracteres. Podrá ampliarla más adelante.',
    consentRequired: 'Confirme que ha leído y acepta la política de privacidad para que podamos tramitar su solicitud.',
  },
};

export const deStrings: EnquiryStrings = {
  locale: 'de-DE',
  formLabel: 'Sendungsplan anfragen',
  requiredBefore: 'Mit',
  requiredAsterisk: 'Sternchen',
  requiredAfter: 'gekennzeichnete Felder sind Pflichtfelder.',
  optional: 'Optional',
  fields: {
    fullName: { label: 'Vor- und Nachname' },
    workEmail: { label: 'Geschäftliche E-Mail-Adresse', placeholder: 'name@unternehmen.de' },
    company: { label: 'Unternehmen' },
    phone: { label: 'Telefon', hint: 'Internationales Format mit Ländervorwahl.', placeholder: '+49' },
    origin: { label: 'Abholort / Ursprung', hint: 'Land, Stadt oder Hafen.' },
    destination: { label: 'Zielort', hint: 'Land, Stadt, Hafen oder Postleitzahl.' },
    startingPoint: {
      label: 'Ausgangspunkt',
      hint: 'Wo soll der Plan beginnen? Sie können eine einzelne Leistung oder einen kombinierten Plan anfragen.',
    },
    cargoDetails: {
      label: 'Waren- oder Produktdetails',
      hint: 'Produktart, Links, Mengen, Kartons, Maße oder Gewicht – alles, was Sie bereits wissen.',
    },
    timing: { label: 'Zeitrahmen' },
    context: {
      label: 'Weitere Hinweise',
      hint: 'Verpackung, Konformität, Wareneingang oder Zustellanforderungen – alles, was den Plan beeinflusst.',
    },
    consent: { label: 'Einwilligung' },
  },
  startingPoints: {
    'product-sourcing': 'Beschaffung in China',
    'ocean-freight': 'Seefracht',
    'air-freight': 'Luftfracht',
    'warehousing-fulfillment': 'Lager & Fulfillment',
    'packaging-branding': 'Verpackung & Branding',
    'not-sure': 'Noch unklar',
  },
  timingPlaceholder: 'Zeitrahmen wählen',
  timing: { 'ready-now': 'Versandbereit', 'this-month': 'Diesen Monat', 'planning-ahead': 'In Planung' },
  honeypotLabel: 'Website des Unternehmens',
  newTab: '(öffnet in neuem Tab)',
  reference: 'Referenz:',
  sendAnother: 'Weitere Anfrage senden',
  stillInForm: 'Ihre Eingaben bleiben im Formular erhalten – Sie können sie korrigieren und erneut senden.',
  contactDetails: 'Kontaktmöglichkeiten',
  validation: {
    fullNameRequired: 'Bitte geben Sie Ihren Vor- und Nachnamen an, damit wir wissen, an wen wir antworten.',
    fullNameLong: (max) => `Bitte kürzen Sie den Namen auf höchstens ${max} Zeichen.`,
    emailRequired: 'Bitte geben Sie Ihre geschäftliche E-Mail-Adresse an, damit wir Ihnen den Plan senden können.',
    emailInvalid: 'Bitte geben Sie eine vollständige E-Mail-Adresse ein, z. B. name@unternehmen.de.',
    companyRequired: 'Bitte geben Sie den Namen Ihres Unternehmens an.',
    companyLong: (max) => `Bitte kürzen Sie den Unternehmensnamen auf höchstens ${max} Zeichen.`,
    phoneInvalid: 'Bitte geben Sie die Nummer mit Ländervorwahl ein (z. B. +49 …) oder lassen Sie das Feld leer.',
    originRequired: 'Bitte geben Sie an, wo die Ware startet: Land, Stadt oder Hafen.',
    originLong: (max) => `Bitte beschränken Sie den Abholort auf ${max} Zeichen.`,
    destinationRequired: 'Bitte geben Sie an, wohin die Ware soll: Land, Stadt, Hafen oder Postleitzahl.',
    destinationLong: (max) => `Bitte beschränken Sie den Zielort auf ${max} Zeichen.`,
    startingPointRequired:
      'Bitte wählen Sie einen Ausgangspunkt. Wählen Sie „Noch unklar“, wenn wir einen Vorschlag machen sollen.',
    cargoLong: 'Bitte beschränken Sie die Warendetails auf 2.000 Zeichen. Weitere Angaben können Sie später nachreichen.',
    contextLong: 'Bitte beschränken Sie die Hinweise auf 2.000 Zeichen. Weitere Angaben können Sie später nachreichen.',
    consentRequired: 'Bitte bestätigen Sie den Datenschutzhinweis, damit wir Ihre Anfrage bearbeiten dürfen.',
  },
};
