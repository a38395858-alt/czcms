/**
 * Página de inicio en español (España) — datos de secciones localizados.
 * La estructura respeta el contrato de secciones compartido (../types.ts); el contenido pertenece a este sitio.
 * Personalidad de la plantilla: « Mediterráneo Azulejo » — arena, carbón cálido, azulejo, sol y terracota.
 * Tratamiento de usted; comillas angulares «…»; signos de apertura ¿ ¡.
 */
import type { StartingPointValue } from '../types';

export const ES_META = {
  title: 'Sourcing en China, transporte internacional y fulfillment | FreightVanta',
  description:
    'FreightVanta coordina el sourcing de producto en China, el transporte marítimo y aéreo, la preparación de envíos, el almacenaje, el fulfillment y la entrega en España en un plan de envío práctico.',
  path: '/es/',
  lang: 'es-ES',
};

export const esAnnouncement = {
  body: '¿Mercancía con destino España o la UE? Solicite un plan de envío a un especialista en logística.',
  cta_label: 'Solicitar un plan de envío',
  cta_url: '/es/solicitud',
};

export const esNav = [
  { label: 'Servicios', href: '/es/servicios' },
  { label: 'Proceso', href: '/es/proceso' },
  { label: 'Sectores', href: '/es/sectores' },
  { label: 'Recursos', href: '/es/recursos' },
  { label: 'Preguntas', href: '/es/preguntas' },
  { label: 'Contacto', href: '/es/solicitud' },
];

export const esHero = {
  eyebrow: 'Sourcing y transporte, bien coordinados',
  title: 'Del sourcing en China a la entrega en España, cada traspaso claro.',
  body: 'FreightVanta ayuda a empresas en crecimiento a coordinar el sourcing de producto, la preparación del envío, el transporte marítimo y aéreo, la información aduanera, el almacenaje, el fulfillment y la entrega final mediante un único plan operativo.',
  cta_primary_label: 'Solicitar un plan de envío',
  cta_primary_url: '/es/solicitud',
  cta_secondary_label: 'Ver servicios',
  cta_secondary_url: '/es/servicios',
  microcopy:
    'Empiece con un enlace de producto, un resumen del envío o la ruta que necesita planificar. Le ayudaremos a identificar el siguiente paso útil.',
  route_labels: ['ORIGEN', 'PUERTO', 'ALMACÉN', 'CLIENTE'],
  media_id: 'es-hero-puerto',
  media_alt: 'Grúas de una terminal de contenedores recortadas contra el cielo del atardecer sobre aguas tranquilas.',
  media_caption: 'Fig. 1 · Terminal de contenedores al atardecer',
};

export const esCoverage = [
  'Sourcing de producto en China',
  'Transporte marítimo',
  'Transporte aéreo',
  'Coordinación aduanera',
  'Almacenaje y fulfillment',
  'Entrega de última milla',
];

export interface EsService {
  id: string;
  label: string;
  title: string;
  copy: string;
  tags: string[];
  starting_point: StartingPointValue | null;
  detail_url: string;
}

export const esServices: EsService[] = [
  {
    id: 'sourcing',
    label: 'Sourcing de producto',
    title: 'Encuentre el camino de producto adecuado.',
    copy: 'Comparta un enlace de producto, una foto, una especificación o un coste objetivo. Le ayudamos a ordenar las preguntas al proveedor, los puntos de comparación, las muestras y los detalles de compra que deben quedar claros antes del siguiente traspaso.',
    tags: ['Sourcing en China', 'Briefing a proveedores', 'Coordinación de muestras'],
    starting_point: 'product-sourcing',
    detail_url: '/solutions/product-sourcing',
  },
  {
    id: 'maritimo',
    label: 'Transporte marítimo',
    title: 'Planifique el tramo económico.',
    copy: 'En carga consolidada o en contenedor, ayudamos a alinear la disponibilidad de la mercancía, los documentos de exportación, los traspasos en puerto y el plan de entrega. El resumen muestra qué se incluye, qué decisiones siguen abiertas y quién asume el siguiente paso.',
    tags: ['FCL', 'LCL', 'Puerto a puerta'],
    starting_point: 'ocean-freight',
    detail_url: '/solutions/ocean-freight',
  },
  {
    id: 'aereo',
    label: 'Transporte aéreo',
    title: 'Proteja el tramo urgente.',
    copy: 'Cuando un lanzamiento, una reposición o un pedido urgente no puede esperar al siguiente ciclo marítimo, comparamos opciones aéreas realistas y organizamos la recogida, los documentos del envío y los traspasos de entrega.',
    tags: ['Exprés', 'Estándar', 'Reposición urgente'],
    starting_point: 'air-freight',
    detail_url: '/solutions/air-freight',
  },
  {
    id: 'aduanas',
    label: 'Coordinación aduanera',
    title: 'Tenga los documentos listos con antelación.',
    copy: 'Ayudamos a reunir facturas comerciales, listas de embalaje e información del envío para que las dudas salgan a la luz antes de que la mercancía llegue al siguiente punto de control. La clasificación arancelaria definitiva y el despacho corresponden a la autoridad competente y al representante aduanero responsable.',
    tags: ['Información del envío', 'Documentación lista', 'Apoyo en traspasos'],
    starting_point: 'not-sure',
    detail_url: '/solutions/customs-coordination',
  },
  {
    id: 'almacenaje',
    label: 'Almacenaje y fulfillment',
    title: 'Recibir, revisar y despachar con criterio.',
    copy: 'El inventario puede recibirse, revisarse, consolidarse, almacenarse y prepararse para el destino que usted apruebe. El resumen mantiene las instrucciones de producto, embalaje y liberación asociadas al pedido.',
    tags: ['Consolidación', 'Almacenaje', 'Preparación de pedidos'],
    starting_point: 'warehousing-fulfillment',
    detail_url: '/solutions/warehousing-fulfillment',
  },
  {
    id: 'embalaje',
    label: 'Embalaje y branding',
    title: 'Haga que el paquete sea suyo.',
    copy: 'Coordine inserts, pegatinas, etiquetas colgantes, bolsas, cajas y otros elementos de marca aprobados dentro del resumen de fulfillment. Artes finales, cantidades y pasos de producción se confirman antes de su uso.',
    tags: ['Inserts', 'Etiquetas', 'Preparación de marca propia'],
    starting_point: 'packaging-branding',
    detail_url: '/solutions/packaging-branding',
  },
];

export const esServicesSection = {
  kicker: 'Qué coordinamos',
  title: 'Una visión operativa única, del proveedor al cliente.',
  body: 'Su envío rara vez sigue un único paso. Conectamos sourcing, preparación, transporte, aduanas, almacenaje y entrega en un flujo de trabajo que su equipo puede seguir.',
  panel_cta_label: 'Incluir este servicio en el plan',
  detail_link_label: 'Página detallada (EN)',
};

export const esOperation = {
  kicker: 'Una operación conectada',
  title: 'La fiabilidad se construye en los detalles.',
  pull_quote: '«Una visión operativa clara, desde la primera decisión de producto o proveedor hasta la entrega.»',
  items: [
    {
      title: 'Un interlocutor asignado',
      copy: 'Una sola persona mantiene la solicitud, las preguntas al proveedor, las notas del envío y la siguiente acción en el mismo hilo de trabajo.',
    },
    {
      title: 'Controles antes del despacho',
      copy: 'Se confirman el estado del producto, la cantidad y las instrucciones de embalaje acordadas antes de que la mercancía salga de la instalación.',
    },
    {
      title: 'Preparación flexible del envío',
      copy: 'Consolide pedidos, separe destinos o mantenga inventario según el plan que su equipo apruebe.',
    },
    {
      title: 'Traspasos trazables',
      copy: 'Las referencias de transportista y las notas de estado se mantienen juntas para que su equipo vea qué ha cambiado y qué ocurre después.',
    },
  ],
};

export const esProcess = {
  kicker: 'Proceso',
  title: 'Un proceso práctico para cargas complejas.',
  body: 'La idea no es hacer que la logística parezca sencilla, sino mantener visibles la siguiente decisión, el siguiente documento y el siguiente traspaso antes de que se conviertan en un retraso.',
  steps: [
    {
      step: '01',
      title: 'Cuéntenos qué se mueve.',
      copy: 'Comparta enlaces de producto, cantidades, origen, destino, fecha objetivo y cualquier necesidad de embalaje o cumplimiento normativo.',
    },
    {
      step: '02',
      title: 'Revise el plan.',
      copy: 'Aclaramos el servicio propuesto, las dudas abiertas, los documentos necesarios y las responsabilidades antes de empezar.',
    },
    {
      step: '03',
      title: 'Coordinamos cada traspaso.',
      copy: 'Sourcing, compras, inspección, preparación, transporte, almacenaje y entrega siguen un mismo registro de trabajo.',
    },
    {
      step: '04',
      title: 'Cumpla su promesa al cliente.',
      copy: 'Reciba el seguimiento y las notas de incidencias que su equipo necesita para planificar el inventario y la comunicación con el cliente.',
    },
  ],
  closing: 'Si cambia una hipótesis, el plan debe mostrar el cambio en lugar de esconderlo en una larga cadena de correos.',
};

export const esIndustries = {
  kicker: 'Sectores',
  title: 'Pensado para equipos que se juegan algo en cada traspaso.',
  body: 'Cada mercancía exige controles, documentos y conversaciones de entrega distintos. El trabajo empieza por la restricción que más importa a su operación.',
  detail_label: 'Página del sector (EN)',
  media_id: 'industry-receiving',
  media_alt:
    'Coordinador de recepción revisando una entrega de cajas de consumo y un cajón de piezas industriales en un muelle de almacén.',
  media_caption: 'Recepción e inspección en el muelle',
  items: [
    {
      slug: 'cross-border-ecommerce',
      name: 'Ecommerce y retail',
      copy: 'Mantenga ordenadas la reposición, los packs, la preparación para marketplaces y los embalajes específicos de cada tienda, del proveedor al cliente.',
      href: '/industries/cross-border-ecommerce',
    },
    {
      slug: 'consumer-goods',
      name: 'Bienes de consumo',
      copy: 'Coordine los detalles de producto, los controles de calidad, la preparación del lanzamiento y la presentación, del proveedor al lineal o a la puerta de casa.',
      href: '/industries/consumer-goods',
    },
    {
      slug: 'industrial-components',
      name: 'Componentes industriales',
      copy: 'Trabaje a partir de especificaciones, documentación, requisitos de recepción y un plan claro para el siguiente traspaso de producción o servicio.',
      href: '/industries/industrial-components',
    },
    {
      slug: 'time-critical-cargo',
      name: 'Carga urgente',
      copy: 'Priorice el siguiente movimiento viable y haga visibles las incidencias desde el principio cuando el plazo no admite espera.',
      href: '/industries/time-critical-cargo',
    },
  ],
};

export const esResources = {
  kicker: 'Recursos',
  title: 'Información logística para decidir mejor.',
  body: 'Guías prácticas sobre sourcing en China, transporte internacional, preparación de importaciones, Incoterms y coordinación de proveedores: las decisiones que hay entre «pedido» y «entregado».',
  note: 'Nuestras guías se publican primero en inglés; las versiones en español llegarán después. Los enlaces abren la edición en inglés.',
  topics: [
    { label: 'Lista de verificación para planificar importaciones (EN)', href: '/guides/import-planning-checklist' },
    { label: '¿Transporte marítimo o aéreo? (EN)', href: '/guides/ocean-or-air-freight' },
    { label: 'Cómo preparar un briefing de sourcing en China (EN)', href: '/guides/china-sourcing-brief' },
    { label: 'Guía de embalaje e inserts (EN)', href: '/guides/packaging-insert-guide' },
    { label: 'Incoterms en lenguaje claro (EN)', href: '/guides/incoterms-handoffs' },
  ],
  cta_label: 'Visitar el centro de recursos (EN)',
  cta_url: '/guides',
};

export const esFaq = {
  kicker: 'Preguntas frecuentes',
  title: '¿Preguntas antes de mover su carga?',
  aside_prompt: '¿No encuentra su duda aquí? Empiece con lo que sabe: un especialista le ayudará con el resto.',
  aside_link_label: 'Cuéntenos qué se mueve',
  aside_link_url: '/es/solicitud',
  items: [
    {
      id: 'enlace-producto',
      question: '¿Puedo empezar solo con un enlace de producto?',
      answer:
        'Sí. Un enlace de producto, una foto o una breve especificación bastan para una primera conversación de sourcing. Las cantidades, el destino y los plazos pueden llegar cuando el plan sea más claro.',
    },
    {
      id: 'sourcing-fulfillment',
      question: '¿Pueden combinar sourcing y fulfillment?',
      answer:
        'Esta página presenta sourcing, preparación, transporte, almacenaje y fulfillment como un flujo conectado. El alcance final se confirma en el plan de envío.',
    },
    {
      id: 'maritimo-aereo',
      question: '¿Pueden ayudar tanto con transporte marítimo como aéreo?',
      answer:
        'Sí. Cuéntenos qué se mueve, con qué rapidez debe llegar y qué es lo más importante del envío. Podemos comentar el servicio más práctico y el siguiente traspaso.',
    },
    {
      id: 'aduanas',
      question: '¿Ofrecen despacho de aduanas?',
      answer:
        'Coordinamos la información del envío y los traspasos de documentos. Antes de asumir cualquier compromiso de despacho, deben identificarse el representante aduanero responsable, la jurisdicción, la clasificación arancelaria y el alcance formal del despacho.',
    },
    {
      id: 'almacen-espana',
      question: '¿Pueden dar soporte de almacenaje y fulfillment en España?',
      answer:
        'Indíquenos los requisitos de recepción, almacenaje, preparación y liberación. El alcance operativo disponible debe confirmarse en el plan antes de mover inventario.',
    },
    {
      id: 'un-servicio',
      question: '¿Puedo solicitar un único servicio?',
      answer:
        'Sí. Puede empezar por sourcing, transporte, almacenaje, embalaje, fulfillment o un plan combinado. El formulario le permite elegir el punto de partida.',
    },
  ],
};

export const esEnquiry = {
  kicker: 'Solicite un plan de envío',
  form_tag: 'Ficha de solicitud · Plan de envío',
  title: 'Cuéntenos qué necesita mover. Convertiremos las piezas sueltas en un plan que su equipo pueda usar.',
  body: 'Empiece por el producto, la ruta o el resultado de entrega que necesita. Un especialista de FreightVanta revisará los detalles y le responderá con el siguiente paso adecuado.',
  reassurance: [
    'Un enlace de producto, una foto o una breve especificación bastan para una primera conversación de sourcing.',
    'Puede empezar por sourcing, transporte, almacenaje, embalaje, fulfillment o un plan combinado.',
    'El alcance final se confirma en el plan de envío.',
  ],
  copy: {
    button: 'Solicitar un plan de envío',
    loading: 'Enviando su solicitud…',
    success_title: 'Gracias: su solicitud va de camino.',
    success_body:
      'Un especialista de FreightVanta revisará los detalles y le responderá con el siguiente paso adecuado.',
    error:
      'Todavía no hemos podido enviar la solicitud. Revise los campos marcados e inténtelo de nuevo, o póngase en contacto con nosotros mediante los datos que figuran abajo.',
    reassurance: [],
    consent_prefix:
      'Acepto que FreightVanta utilice estos datos para revisar mi solicitud y ponerse en contacto conmigo, tal como se describe en la',
    consent_link_label: 'política de privacidad',
    consent_suffix: '.',
  },
};

export const esFooter = {
  tagline: 'Un plan práctico, responsabilidades claras y novedades sobre las que poder actuar.',
  cta_label: 'Solicitar un plan de envío',
  cta_url: '/es/solicitud',
  columns: {
    services: 'Servicios',
    site: 'Navegación',
    legal: 'Contacto y legal',
  },
  legal_links: [
    { label: 'Aviso legal', href: '/es/aviso-legal' },
    { label: 'Política de privacidad', href: '/es/privacidad' },
    { label: 'Política de cookies', href: '/es/cookies' },
  ],
  language_label: 'Idioma',
  cookie_settings: 'Preferencias de cookies',
  rights: 'Todos los derechos reservados.',
  locale_tag: 'Español · España',
};
