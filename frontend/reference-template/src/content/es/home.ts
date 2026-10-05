/**
 * Página de inicio en español (España) — registros de sección localizados.
 * La estructura sigue el contrato de sección compartido (../types.ts); los textos son de este sitio.
 */
import { SITE_META } from '../../config/site';
import type {
  AnnouncementSection,
  CoverageSection,
  EnquirySection,
  FaqSection,
  FooterSection,
  HeroSection,
  HomeSection,
  IndustriesSection,
  OperationSection,
  ProcessSection,
  ResourcesSection,
  ServicePathsSection,
} from '../types';
import { INDUSTRIES_ES } from './industries';
import { SERVICES_ES } from './services';

const base = {
  site_id: SITE_META.es.siteId,
  locale: SITE_META.es.locale,
  enabled: true,
  eyebrow: '',
  title: '',
  body: '',
  cta_primary_label: '',
  cta_primary_url: '',
  cta_secondary_label: '',
  cta_secondary_url: '',
  media_id: '',
  media_alt: '',
  draft_version: 1,
  published_version: 1,
};

export const ES_ANCHORS = {
  enquiry: '/es/#solicitud',
  services: '/es/#soluciones',
  process: '/es/#metodo',
};

export const announcementEs: AnnouncementSection = {
  ...base,
  section_key: 'announcement',
  sort_order: 10,
  body: '¿Mercancía de China con destino a España o a la UE? Solicite un plan de envío a un especialista en logística.',
  cta_primary_label: 'Solicitar plan de envío',
  cta_primary_url: ES_ANCHORS.enquiry,
  items: [],
  settings: {},
};

export const heroEs: HeroSection = {
  ...base,
  section_key: 'hero',
  sort_order: 20,
  eyebrow: 'CARGA EN MOVIMIENTO. NEGOCIO EN MARCHA.',
  title: 'De origen a destino, sin perder el control.',
  body: 'FreightVanta coordina proveedores, preparación, transporte, documentación, almacén y entrega para que cada paso de tu cadena logística tenga un responsable y una siguiente acción clara.',
  cta_primary_label: 'Planificar un envío',
  cta_primary_url: ES_ANCHORS.enquiry,
  cta_secondary_label: 'Ver soluciones',
  cta_secondary_url: ES_ANCHORS.services,
  media_id: 'es-hero-puerto',
  media_alt: 'Vista aérea de contenedores y grúas en el puerto de Barcelona.',
  items: [],
  settings: {
    microcopy:
      'Cuéntanos qué mueves, desde dónde sale y a dónde debe llegar. Empezamos con un plan que puedas revisar.',
    route_labels: ['FÁBRICA', 'PUERTO', 'ALMACÉN', 'CLIENTE'],
  },
};

/** Phrase in the hero title that gets the albero highlighter. */
export const HERO_HIGHLIGHT_ES = 'sin perder el control';

/** "Hoja de ruta" — one short caption per stop in the hero route bar. */
export const HERO_ROUTE_ES: string[] = ['Proveedor en China', 'Mar, aire o ferrocarril', 'Aduana, stock y preparación', 'Entrega confirmada'];

export const coverageEs: CoverageSection = {
  ...base,
  section_key: 'coverage',
  sort_order: 30,
  title: 'Nuestro ámbito de trabajo',
  items: [
    { label: 'Búsqueda de proveedores en China', href: '/es/soluciones/busqueda-de-proveedores-en-china' },
    { label: 'Transporte marítimo', href: '/es/soluciones/transporte-maritimo' },
    { label: 'Transporte aéreo', href: '/es/soluciones/transporte-aereo' },
    { label: 'Coordinación aduanera', href: '/es/soluciones/coordinacion-aduanera' },
    { label: 'Almacenaje y logística e-commerce', href: '/es/soluciones/almacenaje-y-logistica-e-commerce' },
    { label: 'Entrega de última milla', href: '/es/soluciones/transporte-terrestre-y-entrega' },
  ],
  settings: {},
};

export const servicePathsEs: ServicePathsSection = {
  ...base,
  section_key: 'service_paths',
  sort_order: 40,
  eyebrow: 'Qué coordinamos',
  title: 'Una cadena coordinada para que tu negocio no se detenga.',
  body: 'No necesitas perseguir a cada proveedor y transportista por separado. Reunimos la información necesaria y conectamos los relevos.',
  items: SERVICES_ES.filter((service) => service.inSelector).map((service) => ({
    id: service.slug,
    label: service.label,
    title: service.title,
    copy: service.copy,
    tags: service.tags,
    link_label: service.linkLabel,
    link_url: `/es/soluciones/${service.slug}`,
    media_id: service.mediaId,
    media_alt: service.mediaAlt,
    starting_point: service.startingPoint,
  })),
  settings: {
    panel_cta_label: 'Ver cómo encaja este servicio en su envío',
    default_tab: 'busqueda-de-proveedores-en-china',
  },
};

export const operationEs: OperationSection = {
  ...base,
  section_key: 'operation',
  sort_order: 50,
  eyebrow: 'Una operación conectada',
  title: 'El control está en los pequeños detalles.',
  cta_primary_label: 'Cómo avanza el trabajo',
  cta_primary_url: ES_ANCHORS.process,
  items: [
    {
      title: 'Un contacto que responde',
      copy: 'Preguntas de proveedor, compras y envíos en el mismo hilo.',
    },
    {
      title: 'Revisión antes de salir',
      copy: 'Estado, cantidad y presentación comprobados antes del siguiente relevo.',
    },
    {
      title: 'Estados que sirven',
      copy: 'Cada actualización explica qué se hizo y qué toca ahora.',
    },
    {
      title: 'Avisos a tiempo',
      copy: 'Los cambios aparecen antes de convertirse en una sorpresa para tus clientes.',
    },
  ],
  settings: {
    pull_quote: 'Una visión clara de conjunto, desde la primera decisión sobre producto o proveedor hasta la entrega al destinatario.',
  },
};

export const processEs: ProcessSection = {
  ...base,
  section_key: 'process',
  sort_order: 60,
  title: 'Cuatro pasos para moverlo mejor.',
  body: 'No necesitas perseguir a cada proveedor y transportista por separado. Reunimos la información necesaria y conectamos los relevos.',
  items: [
    {
      step: '01',
      title: 'Cuéntanos qué mueves',
      copy: 'Producto, cantidad, origen, destino, fecha y requisitos.',
    },
    {
      step: '02',
      title: 'Recibe un plan útil',
      copy: 'Alcance, documentos, responsables y preguntas abiertas.',
    },
    {
      step: '03',
      title: 'Coordinamos cada entrega',
      copy: 'Proveedor, inspección, embalaje, transporte, almacén y último tramo.',
    },
    {
      step: '04',
      title: 'Sigue el envío hasta llegar',
      copy: 'Tracking y excepciones para que puedas informar y decidir.',
    },
  ],
  settings: {
    closing: '',
  },
};

export const industriesEs: IndustriesSection = {
  ...base,
  section_key: 'industries',
  sort_order: 70,
  title: 'Logística para negocios que no se detienen.',
  body: 'Cada tipo de mercancía necesita sus propios controles, documentos y conversaciones de entrega. El trabajo empieza por la restricción que más importa a su operación.',
  cta_primary_label: 'Ver soluciones por sector',
  cta_primary_url: '/es/sectores',
  media_id: 'es-industry-featured',
  media_alt: 'Un hombre recorre un gran almacén industrial entre estanterías llenas de mercancía.',
  items: INDUSTRIES_ES.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    copy: industry.copy,
    href: `/es/sectores/${industry.slug}`,
  })),
  settings: {
    media_caption: 'Recepción y control',
  },
};

export const resourcesEs: ResourcesSection = {
  ...base,
  section_key: 'resources',
  sort_order: 80,
  eyebrow: 'Recursos de planificación',
  title: 'Información para tomar mejores decisiones.',
  body: 'Guías prácticas sobre importación, Incoterms, brief de proveedores, transporte marítimo frente a aéreo y control de embalaje.',
  cta_primary_label: 'Ver todas las guías',
  cta_primary_url: '/es/guias',
  items: [
    { label: 'Checklist de importación', href: '/es/guias/checklist-importacion-espana' },
    { label: 'Marítimo o aéreo', href: '/es/guias/maritimo-aereo-o-ferrocarril' },
    { label: 'Brief para proveedores', href: '/es/guias/briefing-de-compras-en-china' },
    { label: 'Packaging para ecommerce', href: '/es/guias/guia-de-embalaje-e-insertos' },
  ],
  settings: {
    heading_url: '/es/guias',
    article_limit: 3,
    topics_label: 'Empezar por un tema',
  },
};

export const faqEs: FaqSection = {
  ...base,
  section_key: 'faq',
  sort_order: 90,
  title: '¿Dudas antes de enviar?',
  items: [
    {
      id: 'enlace-producto',
      question: '¿Puedo empezar con un enlace de producto?',
      answer:
        'Sí. Un enlace, foto o descripción corta es suficiente para iniciar.',
    },
    {
      id: 'proveedores-logistica',
      question: '¿Puedo contratar solo una parte?',
      answer:
        'Sí. El formulario permite seleccionar sourcing, transporte, almacén, packaging, fulfillment o un plan combinado.',
    },
    {
      id: 'maritimo-aereo',
      question: '¿Incluye despacho de aduanas?',
      answer:
        'Coordinamos información y relevos; el agente responsable debe confirmarse para cada operación.',
    },
    {
      id: 'aduanas',
      question: '¿Qué datos aceleran la respuesta?',
      answer:
        'Producto, cantidad, origen, destino, fecha objetivo y documentos disponibles.',
    },
    {
      id: 'almacenaje-espana',
      question: '¿Ofrecen almacenaje y logística e-commerce en España?',
      answer:
        'Indíquenos sus requisitos de recepción, almacenaje, preparación y liberación. El alcance operativo disponible se confirma en el plan antes de mover el stock.',
    },
    {
      id: 'servicio-unico',
      question: '¿Puedo solicitar un único servicio?',
      answer:
        'Sí. Puede empezar por la búsqueda de proveedores, el transporte, el almacenaje, el embalaje, la logística e-commerce o un plan combinado. En el formulario elige el punto de partida.',
    },
  ],
  settings: {
    aside_prompt: '¿No encuentra su pregunta? Empiece por lo que ya sabe: un especialista le ayudará con el resto.',
    aside_link_label: 'Cuéntenos qué hay que mover',
    aside_link_url: ES_ANCHORS.enquiry,
  },
};

export const enquiryEs: EnquirySection = {
  ...base,
  section_key: 'enquiry',
  sort_order: 100,
  eyebrow: 'Planificar un envío',
  title: 'Dinos qué necesitas mover. Convertimos cada paso en una ruta que puedas seguir.',
  body: 'Empieza por el producto, la ruta o el resultado de entrega que necesitas. Un especialista de FreightVanta revisará los detalles y te propondrá el siguiente paso adecuado.',
  items: [],
  settings: {
    button: 'Solicitar un plan',
    loading: 'Enviando su solicitud…',
    success_title: 'Gracias, su solicitud está en camino.',
    success_body: 'Un especialista de FreightVanta revisará los detalles y se pondrá en contacto con usted con el siguiente paso adecuado.',
    error:
      'Todavía no hemos podido enviar la solicitud. Revise los campos señalados y vuelva a intentarlo, o contacte con nosotros mediante los datos que aparecen más abajo.',
    reassurance: [
      'Solo pedimos lo necesario para un primer plan de envío; los campos obligatorios llevan un asterisco.',
      'Un enlace de producto, una foto o una ficha técnica breve bastan para empezar a hablar de proveedores.',
      'Puede empezar con un único servicio o con un plan combinado; el alcance definitivo se confirma en el plan de envío.',
    ],
    consent_prefix: 'He leído y acepto la',
    consent_link_label: 'política de privacidad',
    consent_suffix: '. Consiento que FreightVanta trate mis datos para gestionar mi solicitud y ponerse en contacto conmigo.',
  },
};

export const footerEs: FooterSection = {
  ...base,
  section_key: 'footer',
  sort_order: 110,
  body: 'FreightVanta · Soluciones · Sectores · Recursos · Contacto · Privacidad · Aviso legal.',
  cta_primary_label: 'Solicitar un plan',
  cta_primary_url: ES_ANCHORS.enquiry,
  items: [
    { key: 'brand', title: 'FreightVanta' },
    { key: 'solutions', title: 'Soluciones' },
    { key: 'industries', title: 'Sectores y guías' },
    { key: 'contact', title: 'Contacto y aviso legal' },
  ],
  settings: {},
};

export const HOME_SECTIONS_ES: HomeSection[] = [
  announcementEs,
  heroEs,
  coverageEs,
  servicePathsEs,
  operationEs,
  processEs,
  industriesEs,
  resourcesEs,
  faqEs,
  enquiryEs,
  footerEs,
];

export function getPublishedHomeSectionsEs(): HomeSection[] {
  return HOME_SECTIONS_ES.filter((section) => section.enabled && section.published_version > 0).sort((a, b) => a.sort_order - b.sort_order);
}

export const HOME_META_ES = {
  title: 'FreightVanta España | Sourcing, transporte y fulfillment internacional',
  description:
    'Coordina sourcing, transporte marítimo y aéreo, documentación, almacén y fulfillment con un plan claro para tu cadena logística.',
  path: '/es/',
};
