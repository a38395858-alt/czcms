import type { StartingPointValue } from '../content/types';
import { EN_MESSAGES, type FieldName, type TimingValue, type ValidationMessages } from './enquiry';

/**
 * UI string bundles for the enquiry form. The main conversion copy (headline, button, loading,
 * success, error, consent sentence) comes from each site's enquiry section record; this bundle
 * covers field labels, hints, options, and recovery strings.
 */
export interface EnquiryStrings {
  /** Locale used for number formatting (character counter). */
  numberLocale: string;
  requiredNote: string;
  requiredMarkSr: string;
  optionalTag: string;
  labels: Record<FieldName, string>;
  hints: Partial<Record<FieldName, string>>;
  emailPlaceholder: string;
  phonePlaceholder: string;
  startingHint: string;
  startingPoints: ReadonlyArray<{ value: StartingPointValue; label: string }>;
  timingOptions: ReadonlyArray<{ value: Exclude<TimingValue, ''>; label: string }>;
  timingPlaceholder: string;
  honeypotLabel: string;
  contactHeading: string;
  keepEntriesNote: string;
  referenceLabel: string;
  sendAnother: string;
  consentNewTabSr: string;
  messages: ValidationMessages;
}

export const EN_STRINGS: EnquiryStrings = {
  numberLocale: 'en-US',
  requiredNote: 'Fields marked with * are required.',
  requiredMarkSr: 'required',
  optionalTag: 'Optional',
  labels: {
    fullName: 'Full name',
    workEmail: 'Work email',
    company: 'Company',
    phone: 'Phone',
    origin: 'Origin',
    destination: 'Destination',
    startingPoint: 'Starting point',
    cargoDetails: 'Cargo or product details',
    timing: 'Target timing',
    context: 'Additional context',
    consent: 'Consent',
  },
  hints: {
    phone: 'International format, including country code.',
    origin: 'Country, city, or port.',
    destination: 'Country, city, port, or ZIP code.',
    cargoDetails: 'Product type, links, quantities, cartons, dimensions, or weight — whatever you know so far.',
    context: 'Packaging, compliance, receiving, or delivery requirements — anything that shapes the plan.',
  },
  emailPlaceholder: 'name@company.com',
  phonePlaceholder: '+1',
  startingHint: 'Where should the plan begin? You can request one service or a combined plan.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Product sourcing' },
    { value: 'ocean-freight', label: 'Ocean freight' },
    { value: 'air-freight', label: 'Air freight' },
    { value: 'warehousing-fulfillment', label: 'Warehousing & fulfillment' },
    { value: 'packaging-branding', label: 'Packaging & branding' },
    { value: 'not-sure', label: 'Not sure yet' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Ready now' },
    { value: 'this-month', label: 'This month' },
    { value: 'planning-ahead', label: 'Planning ahead' },
  ],
  timingPlaceholder: 'Select target timing',
  honeypotLabel: 'Company website',
  contactHeading: 'Contact details',
  keepEntriesNote: 'Everything you entered is still in the form, so you can correct it and send again.',
  referenceLabel: 'Reference',
  sendAnother: 'Send another request',
  consentNewTabSr: '(opens in a new tab)',
  messages: EN_MESSAGES,
};

export const DE_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Bitte geben Sie Ihren vollständigen Namen an, damit wir wissen, an wen sich die Antwort richtet.',
  fullNameLong: 'Bitte kürzen Sie den Namen auf höchstens 120 Zeichen.',
  emailRequired: 'Bitte geben Sie Ihre geschäftliche E-Mail-Adresse an, damit wir Ihnen den Plan senden können.',
  emailInvalid: 'Bitte geben Sie eine vollständige E-Mail-Adresse ein, z. B. name@firma.de.',
  companyRequired: 'Bitte geben Sie Ihren Firmennamen an.',
  companyLong: 'Bitte kürzen Sie den Firmennamen auf höchstens 120 Zeichen.',
  phoneInvalid: 'Bitte geben Sie die Nummer mit Ländervorwahl an (z. B. +49 …) oder lassen Sie das Feld leer.',
  originRequired: 'Bitte geben Sie an, wo die Ware startet: Land, Stadt oder Hafen.',
  originLong: 'Bitte beschränken Sie die Angabe auf 160 Zeichen.',
  destinationRequired: 'Bitte geben Sie an, wohin die Ware geliefert werden soll: Land, Stadt, Hafen oder PLZ.',
  destinationLong: 'Bitte beschränken Sie die Angabe auf 160 Zeichen.',
  startingPointRequired: 'Bitte wählen Sie einen Ausgangspunkt. Wählen Sie „Noch unklar“, wenn wir einen Vorschlag machen sollen.',
  longText: 'Bitte beschränken Sie den Text auf 2.000 Zeichen. Weitere Details können Sie im Anschluss teilen.',
  consentRequired: 'Bitte bestätigen Sie die Datenschutzerklärung, damit wir auf Ihre Anfrage antworten dürfen.',
};

export const FR_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Veuillez indiquer votre nom complet afin que nous sachions à qui répondre.',
  fullNameLong: 'Veuillez raccourcir le nom à 120 caractères maximum.',
  emailRequired: 'Veuillez indiquer votre e-mail professionnel pour recevoir votre plan.',
  emailInvalid: 'Veuillez saisir une adresse e-mail complète, par exemple nom@entreprise.fr.',
  companyRequired: 'Veuillez indiquer le nom de votre entreprise.',
  companyLong: 'Veuillez raccourcir le nom de l’entreprise à 120 caractères maximum.',
  phoneInvalid: 'Veuillez saisir le numéro avec l’indicatif pays (par ex. +33 …) ou laisser le champ vide.',
  originRequired: 'Veuillez indiquer le point de départ de la marchandise\u202f: pays, ville ou port.',
  originLong: 'Veuillez limiter cette information à 160 caractères.',
  destinationRequired: 'Veuillez indiquer la destination\u202f: pays, ville, port ou code postal.',
  destinationLong: 'Veuillez limiter cette information à 160 caractères.',
  startingPointRequired: 'Veuillez choisir un point de départ. Sélectionnez «\u00a0Pas encore décidé\u00a0» pour une suggestion.',
  longText: 'Veuillez limiter ce champ à 2\u202f000 caractères. Vous pourrez en dire plus ensuite.',
  consentRequired: 'Veuillez accepter la politique de confidentialité pour que nous puissions répondre à votre demande.',
};

export const FR_STRINGS: EnquiryStrings = {
  numberLocale: 'fr-FR',
  requiredNote: 'Les champs marqués d’un * sont obligatoires.',
  requiredMarkSr: 'obligatoire',
  optionalTag: 'Facultatif',
  labels: {
    fullName: 'Nom complet',
    workEmail: 'E-mail professionnel',
    company: 'Entreprise',
    phone: 'Téléphone',
    origin: 'Origine',
    destination: 'Destination',
    startingPoint: 'Point de départ',
    cargoDetails: 'Détails sur la marchandise ou le produit',
    timing: 'Calendrier visé',
    context: 'Contexte complémentaire',
    consent: 'Consentement',
  },
  hints: {
    phone: 'Format international, avec l’indicatif pays.',
    origin: 'Pays, ville ou port.',
    destination: 'Pays, ville, port ou code postal.',
    cargoDetails: 'Type de produit, liens, quantités, colis, dimensions ou poids — tout ce que vous savez déjà.',
    context: 'Exigences d’emballage, de conformité, de réception ou de livraison — tout ce qui façonne le plan.',
  },
  emailPlaceholder: 'nom@entreprise.fr',
  phonePlaceholder: '+33',
  startingHint: 'Par où le plan doit-il commencer\u202f? Vous pouvez demander une prestation unique ou un plan combiné.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Sourcing produit' },
    { value: 'ocean-freight', label: 'Fret maritime' },
    { value: 'air-freight', label: 'Fret aérien' },
    { value: 'warehousing-fulfillment', label: 'Entreposage & fulfillment' },
    { value: 'packaging-branding', label: 'Emballage & branding' },
    { value: 'not-sure', label: 'Pas encore décidé' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Prêt à expédier' },
    { value: 'this-month', label: 'Ce mois-ci' },
    { value: 'planning-ahead', label: 'En anticipation' },
  ],
  timingPlaceholder: 'Choisir un calendrier',
  honeypotLabel: 'Site web de l’entreprise',
  contactHeading: 'Coordonnées',
  keepEntriesNote: 'Vos saisies restent dans le formulaire\u202f: vous pouvez les corriger et renvoyer la demande.',
  referenceLabel: 'Référence',
  sendAnother: 'Envoyer une autre demande',
  consentNewTabSr: '(s’ouvre dans un nouvel onglet)',
  messages: FR_MESSAGES,
};

export const ES_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Indique su nombre completo para que sepamos a quién responder.',
  fullNameLong: 'Acorte el nombre a 120 caracteres como máximo.',
  emailRequired: 'Indique su correo electrónico profesional para que podamos enviarle el plan.',
  emailInvalid: 'Introduzca una dirección de correo completa, por ejemplo nombre@empresa.es.',
  companyRequired: 'Indique el nombre de su empresa.',
  companyLong: 'Acorte el nombre de la empresa a 120 caracteres como máximo.',
  phoneInvalid: 'Introduzca el número con el prefijo del país (por ejemplo, +34 …) o deje el campo vacío.',
  originRequired: 'Indique dónde empieza el recorrido de la mercancía: país, ciudad o puerto.',
  originLong: 'Limite esta información a 160 caracteres.',
  destinationRequired: 'Indique el destino de la mercancía: país, ciudad, puerto o código postal.',
  destinationLong: 'Limite esta información a 160 caracteres.',
  startingPointRequired: 'Elija un punto de partida. Seleccione «Aún no lo sé» si prefiere que le sugiramos uno.',
  longText: 'Limite este campo a 2000 caracteres. Podrá ampliar la información después.',
  consentRequired: 'Confirme que acepta la política de privacidad para que podamos responder a su solicitud.',
};

export const ES_STRINGS: EnquiryStrings = {
  numberLocale: 'es-ES',
  requiredNote: 'Los campos marcados con * son obligatorios.',
  requiredMarkSr: 'obligatorio',
  optionalTag: 'Opcional',
  labels: {
    fullName: 'Nombre completo',
    workEmail: 'Correo electrónico profesional',
    company: 'Empresa',
    phone: 'Teléfono',
    origin: 'Origen',
    destination: 'Destino',
    startingPoint: 'Punto de partida',
    cargoDetails: 'Detalles de la carga o el producto',
    timing: 'Plazo objetivo',
    context: 'Contexto adicional',
    consent: 'Consentimiento',
  },
  hints: {
    phone: 'Formato internacional, con prefijo del país.',
    origin: 'País, ciudad o puerto.',
    destination: 'País, ciudad, puerto o código postal.',
    cargoDetails: 'Tipo de producto, enlaces, cantidades, bultos, dimensiones o peso: lo que sepa hasta ahora.',
    context: 'Requisitos de embalaje, cumplimiento normativo, recepción o entrega: cualquier dato que condicione el plan.',
  },
  emailPlaceholder: 'nombre@empresa.es',
  phonePlaceholder: '+34',
  startingHint: '¿Por dónde debe empezar el plan? Puede solicitar un solo servicio o un plan combinado.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Sourcing de producto' },
    { value: 'ocean-freight', label: 'Transporte marítimo' },
    { value: 'air-freight', label: 'Transporte aéreo' },
    { value: 'warehousing-fulfillment', label: 'Almacenaje y fulfillment' },
    { value: 'packaging-branding', label: 'Embalaje y branding' },
    { value: 'not-sure', label: 'Aún no lo sé' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Lista para enviar' },
    { value: 'this-month', label: 'Este mes' },
    { value: 'planning-ahead', label: 'Planificando con antelación' },
  ],
  timingPlaceholder: 'Seleccione un plazo',
  honeypotLabel: 'Sitio web de la empresa',
  contactHeading: 'Datos de contacto',
  keepEntriesNote: 'Todo lo que ha escrito sigue en el formulario: puede corregirlo y volver a enviarlo.',
  referenceLabel: 'Referencia',
  sendAnother: 'Enviar otra solicitud',
  consentNewTabSr: '(se abre en una pestaña nueva)',
  messages: ES_MESSAGES,
};

export const IT_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Indichi il Suo nome e cognome così che sapremo a chi rispondere.',
  fullNameLong: 'Riduca il nome a 120 caratteri al massimo.',
  emailRequired: 'Indichi il Suo indirizzo e-mail di lavoro così da poterLe inviare il piano.',
  emailInvalid: 'Inserisca un indirizzo e-mail completo, per esempio nome@azienda.it.',
  companyRequired: 'Indichi il nome della Sua azienda.',
  companyLong: 'Riduca il nome dell’azienda a 120 caratteri al massimo.',
  phoneInvalid: 'Inserisca il numero con il prefisso internazionale (per esempio +39 …) oppure lasci il campo vuoto.',
  originRequired: 'Indichi dove inizia il viaggio della merce: paese, città o porto.',
  originLong: 'Limiti questa informazione a 160 caratteri.',
  destinationRequired: 'Indichi la destinazione della merce: paese, città, porto o codice di avviamento postale.',
  destinationLong: 'Limiti questa informazione a 160 caratteri.',
  startingPointRequired: 'Scelga un punto di partenza. Selezioni «Non lo so ancora» se preferisce un nostro suggerimento.',
  longText: 'Limiti questo campo a 2.000 caratteri. Potrà aggiungere dettagli in seguito.',
  consentRequired: 'Confermi di accettare l’informativa sulla privacy così che possiamo rispondere alla Sua richiesta.',
};

export const IT_STRINGS: EnquiryStrings = {
  numberLocale: 'it-IT',
  requiredNote: 'I campi contrassegnati con * sono obbligatori.',
  requiredMarkSr: 'obbligatorio',
  optionalTag: 'Facoltativo',
  labels: {
    fullName: 'Nome e cognome',
    workEmail: 'E-mail di lavoro',
    company: 'Azienda',
    phone: 'Telefono',
    origin: 'Origine',
    destination: 'Destinazione',
    startingPoint: 'Punto di partenza',
    cargoDetails: 'Dettagli su carico o prodotto',
    timing: 'Tempi obiettivo',
    context: 'Contesto aggiuntivo',
    consent: 'Consenso',
  },
  hints: {
    phone: 'Formato internazionale, con prefisso del paese.',
    origin: 'Paese, città o porto.',
    destination: 'Paese, città, porto o CAP.',
    cargoDetails: 'Tipo di prodotto, link, quantità, colli, dimensioni o peso: ciò che sa finora.',
    context: 'Requisiti di imballaggio, conformità, ricevimento o consegna: tutto ciò che condiziona il piano.',
  },
  emailPlaceholder: 'nome@azienda.it',
  phonePlaceholder: '+39',
  startingHint: 'Da dove deve partire il piano? Può richiedere un singolo servizio o un piano combinato.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Sourcing di prodotto' },
    { value: 'ocean-freight', label: 'Trasporto marittimo' },
    { value: 'air-freight', label: 'Trasporto aereo' },
    { value: 'warehousing-fulfillment', label: 'Magazzinaggio e fulfillment' },
    { value: 'packaging-branding', label: 'Imballaggio e branding' },
    { value: 'not-sure', label: 'Non lo so ancora' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Pronta da spedire' },
    { value: 'this-month', label: 'Questo mese' },
    { value: 'planning-ahead', label: 'Pianificando in anticipo' },
  ],
  timingPlaceholder: 'Scelga i tempi',
  honeypotLabel: 'Sito web dell’azienda',
  contactHeading: 'Recapiti',
  keepEntriesNote: 'Tutto ciò che ha scritto resta nel modulo: può correggerlo e inviarlo di nuovo.',
  referenceLabel: 'Riferimento',
  sendAnother: 'Invii un’altra richiesta',
  consentNewTabSr: '(si apre in una nuova scheda)',
  messages: IT_MESSAGES,
};

export const NL_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Vul uw volledige naam in, zodat wij weten aan wie wij antwoorden.',
  fullNameLong: 'Kort de naam in tot maximaal 120 tekens.',
  emailRequired: 'Vul uw zakelijke e-mail in, zodat wij u het plan kunnen sturen.',
  emailInvalid: 'Vul een volledig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.',
  companyRequired: 'Vul uw bedrijfsnaam in.',
  companyLong: 'Kort de bedrijfsnaam in tot maximaal 120 tekens.',
  phoneInvalid: 'Vul het nummer in met landcode (bijvoorbeeld +31 …) of laat het veld leeg.',
  originRequired: 'Vul in waar de goederen vandaan komen: land, stad of haven.',
  originLong: 'Beperk deze informatie tot 160 tekens.',
  destinationRequired: 'Vul in waar de goederen naartoe moeten: land, stad, haven of postcode.',
  destinationLong: 'Beperk deze informatie tot 160 tekens.',
  startingPointRequired: 'Kies een startpunt. Kies “Weet ik nog niet” als u een suggestie wilt.',
  longText: 'Beperk dit veld tot 2.000 tekens. U kunt later meer delen.',
  consentRequired: 'Bevestig dat u akkoord gaat met de privacyverklaring, zodat wij op uw aanvraag kunnen reageren.',
};

export const NL_STRINGS: EnquiryStrings = {
  numberLocale: 'nl-NL',
  requiredNote: 'Velden met een * zijn verplicht.',
  requiredMarkSr: 'verplicht',
  optionalTag: 'Optioneel',
  labels: {
    fullName: 'Volledige naam',
    workEmail: 'Zakelijke e-mail',
    company: 'Bedrijf',
    phone: 'Telefoon',
    origin: 'Herkomst',
    destination: 'Bestemming',
    startingPoint: 'Startpunt',
    cargoDetails: 'Details over lading of product',
    timing: 'Gewenste timing',
    context: 'Aanvullende context',
    consent: 'Toestemming',
  },
  hints: {
    phone: 'Internationale notatie, met landcode.',
    origin: 'Land, stad of haven.',
    destination: 'Land, stad, haven of postcode.',
    cargoDetails: 'Productsoort, links, aantallen, colli, afmetingen of gewicht: alles wat u nu weet.',
    context: 'Eisen voor verpakking, compliance, ontvangst of levering: alles wat het plan beïnvloedt.',
  },
  emailPlaceholder: 'naam@bedrijf.nl',
  phonePlaceholder: '+31',
  startingHint: 'Waar moet het plan beginnen? U kunt één dienst of een gecombineerd plan aanvragen.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Productsourcing' },
    { value: 'ocean-freight', label: 'Zeevracht' },
    { value: 'air-freight', label: 'Luchtvracht' },
    { value: 'warehousing-fulfillment', label: 'Opslag & fulfilment' },
    { value: 'packaging-branding', label: 'Verpakking & branding' },
    { value: 'not-sure', label: 'Weet ik nog niet' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Klaar voor verzending' },
    { value: 'this-month', label: 'Deze maand' },
    { value: 'planning-ahead', label: 'Vooruit plannen' },
  ],
  timingPlaceholder: 'Kies een timing',
  honeypotLabel: 'Website van het bedrijf',
  contactHeading: 'Contactgegevens',
  keepEntriesNote: 'Alles wat u invulde staat nog in het formulier: u kunt het corrigeren en opnieuw verzenden.',
  referenceLabel: 'Referentie',
  sendAnother: 'Stuur nog een aanvraag',
  consentNewTabSr: '(opent in een nieuw tabblad)',
  messages: NL_MESSAGES,
};

export const DE_STRINGS: EnquiryStrings = {
  numberLocale: 'de-DE',
  requiredNote: 'Mit * gekennzeichnete Felder sind Pflichtfelder.',
  requiredMarkSr: 'Pflichtfeld',
  optionalTag: 'Optional',
  labels: {
    fullName: 'Vollständiger Name',
    workEmail: 'Geschäftliche E-Mail',
    company: 'Unternehmen',
    phone: 'Telefon',
    origin: 'Abgangsort',
    destination: 'Zielort',
    startingPoint: 'Ausgangspunkt',
    cargoDetails: 'Angaben zu Ware oder Produkt',
    timing: 'Zeitrahmen',
    context: 'Weiterer Kontext',
    consent: 'Einwilligung',
  },
  hints: {
    phone: 'Internationales Format mit Ländervorwahl.',
    origin: 'Land, Stadt oder Hafen.',
    destination: 'Land, Stadt, Hafen oder PLZ.',
    cargoDetails: 'Produktart, Links, Mengen, Kartons, Maße oder Gewicht – alles, was Sie bereits wissen.',
    context: 'Verpackungs-, Compliance-, Warenannahme- oder Lieferanforderungen – alles, was den Plan beeinflusst.',
  },
  emailPlaceholder: 'name@firma.de',
  phonePlaceholder: '+49',
  startingHint: 'Womit soll der Plan beginnen? Sie können eine einzelne Leistung oder einen kombinierten Plan anfragen.',
  startingPoints: [
    { value: 'product-sourcing', label: 'Produktbeschaffung' },
    { value: 'ocean-freight', label: 'Seefracht' },
    { value: 'air-freight', label: 'Luftfracht' },
    { value: 'warehousing-fulfillment', label: 'Lagerung & Fulfillment' },
    { value: 'packaging-branding', label: 'Verpackung & Branding' },
    { value: 'not-sure', label: 'Noch unklar' },
  ],
  timingOptions: [
    { value: 'ready-now', label: 'Sofort versandbereit' },
    { value: 'this-month', label: 'Diesen Monat' },
    { value: 'planning-ahead', label: 'In Planung' },
  ],
  timingPlaceholder: 'Zeitrahmen wählen',
  honeypotLabel: 'Firmenwebsite',
  contactHeading: 'Kontaktmöglichkeiten',
  keepEntriesNote: 'Ihre Eingaben bleiben im Formular erhalten – Sie können sie korrigieren und erneut senden.',
  referenceLabel: 'Referenz',
  sendAnother: 'Weitere Anfrage senden',
  consentNewTabSr: '(öffnet in neuem Tab)',
  messages: DE_MESSAGES,
};
