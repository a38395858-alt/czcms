import type { StartingPointValue } from '../types';

export interface ServiceContentEs {
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

export const SERVICES_ES: ServiceContentEs[] = [
  {
    slug: 'busqueda-de-proveedores-en-china',
    navLabel: 'Búsqueda de proveedores en China',
    label: 'Proveedores en China',
    menuLine: 'Briefing de compra, comparativa y muestras',
    title: 'Encuentra una opción viable.',
    copy: 'Comparte un enlace, una foto o una ficha. Ayudamos a buscar proveedores en China, comparar alternativas y preparar muestras o preguntas de compra.',
    tags: ['Proveedores en China', 'Briefing de compra', 'Gestión de muestras'],
    linkLabel: 'Ver búsqueda de proveedores',
    mediaId: 'es-service-proveedores',
    mediaAlt: 'Una persona revisa muestras de tejido en un estudio durante la selección de proveedores.',
    startingPoint: 'product-sourcing',
    inSelector: true,
    share: [
      'Un enlace de producto, una foto o una ficha técnica breve',
      'El precio objetivo y las cantidades que baraja',
      'El mercado de destino y la fecha deseada',
      'Los requisitos de embalaje, etiquetado o normativa que ya conozca (por ejemplo, el marcado CE)',
    ],
    clarify: [
      'Qué preguntas a proveedores deben resolverse antes de comprar',
      'Qué criterios de comparación importan para su producto',
      'Qué se espera de las muestras y quién las aprueba',
      'Qué detalles de compra hay que confirmar antes del siguiente traspaso',
    ],
    relatedGuides: ['briefing-de-compras-en-china', 'guia-de-embalaje-e-insertos'],
  },
  {
    slug: 'transporte-maritimo',
    navLabel: 'Transporte marítimo',
    label: 'Transporte marítimo',
    menuLine: 'FCL, LCL y planificación puerta a puerta',
    title: 'Mueve volumen con un plan.',
    copy: 'Alineamos disponibilidad de la mercancía, preparación, datos de bultos, salida y entrega para carga consolidada o contenedor, según el caso.',
    tags: ['FCL', 'LCL', 'Puerta a puerta'],
    linkLabel: 'Ver transporte marítimo',
    mediaId: 'es-service-maritimo',
    mediaAlt: 'Buque de carga entre grúas y contenedores en el puerto de Cádiz.',
    startingPoint: 'ocean-freight',
    inSelector: true,
    share: [
      'Fecha de disponibilidad de la mercancía y lugar de recogida',
      'Número de bultos, medidas y peso',
      'Dirección o puerto de destino',
      'El Incoterm pactado con el proveedor, si lo conoce',
    ],
    clarify: [
      'Qué incluye el plan y qué decisiones siguen abiertas',
      'La documentación de exportación y los traspasos en puerto',
      'Quién se encarga de cada siguiente paso',
      'El plan de entrega tras el puerto, incluido el transporte final hasta destino',
    ],
    relatedGuides: ['maritimo-aereo-o-ferrocarril', 'incoterms-2020-explicados'],
  },
  {
    slug: 'transporte-aereo',
    navLabel: 'Transporte aéreo',
    label: 'Transporte aéreo',
    menuLine: 'Exprés, estándar y reposición urgente',
    title: 'Cuando la fecha importa.',
    copy: 'Para reposiciones, lanzamientos o pedidos urgentes, revisamos una alternativa aérea práctica y los datos que deben acompañarla.',
    tags: ['Exprés', 'Estándar', 'Reposición urgente'],
    linkLabel: 'Ver transporte aéreo',
    mediaId: 'es-service-aereo',
    mediaAlt: 'Asistencia en tierra a un avión en la terminal, con vehículos de servicio.',
    startingPoint: 'air-freight',
    inSelector: true,
    share: [
      'Qué protege el envío: un lanzamiento, una reposición o un pedido urgente',
      'Fecha de disponibilidad, medidas y peso',
      'Lugares de recogida y entrega',
      'Mercancías que requieran manipulación o documentación especial (por ejemplo, baterías)',
    ],
    clarify: [
      'Opciones aéreas realistas para la fecha que importa',
      'Momento de la recogida y documentación del envío',
      'Traspasos de entrega en destino',
      'Qué ocurre si cambia una fecha o una hipótesis',
    ],
    relatedGuides: ['maritimo-aereo-o-ferrocarril', 'checklist-importacion-espana'],
  },
  {
    slug: 'transporte-terrestre-y-entrega',
    navLabel: 'Transporte terrestre y entrega',
    label: 'Transporte terrestre y entrega',
    menuLine: 'Recogida, recepción y entrega al destinatario',
    title: 'Terminar el trayecto pensando en quien recibe.',
    copy: 'Una vez liberada la mercancía, el último tramo necesita su propio plan: momento de recogida, requisitos de recepción, cita previa y franja horaria, y quién confirma la entrega. Mantenemos esos detalles unidos al envío para que la entrega a su almacén, su tienda o su cliente esté planificada y no improvisada.',
    tags: ['Coordinación de recogidas', 'Requisitos de recepción', 'Entrega al destinatario'],
    linkLabel: 'Ver transporte terrestre y entrega',
    mediaId: 'es-service-entrega',
    mediaAlt: 'Furgoneta de reparto cargada con cajas en un almacén.',
    startingPoint: null,
    inSelector: false,
    share: [
      'Dirección de entrega, horario de recepción y persona de contacto',
      'Requisitos de cita previa, muelle o equipo (por ejemplo, plataforma elevadora)',
      'Número de bultos o palés y peso',
      'Quién confirma la recepción en destino',
    ],
    clarify: [
      'Momento de la recogida tras la liberación',
      'Requisitos de recepción que debe cumplir la entrega',
      'Confirmación de entrega y notas de incidencias',
      'A quién se avisa si algo cambia',
    ],
    relatedGuides: ['checklist-importacion-espana', 'maritimo-aereo-o-ferrocarril'],
  },
  {
    slug: 'coordinacion-aduanera',
    navLabel: 'Coordinación aduanera',
    label: 'Coordinación aduanera',
    menuLine: 'Factura comercial, packing list y documentación lista',
    title: 'Menos sorpresas en el siguiente control.',
    copy: 'Organizamos factura, packing list y datos del producto antes de la salida. La clasificación y el despacho dependen del agente y de las autoridades correspondientes.',
    tags: ['Datos del envío', 'Documentación preparada', 'Apoyo en los traspasos'],
    linkLabel: 'Ver coordinación aduanera',
    mediaId: 'es-service-aduana',
    mediaAlt: 'Recibos y documentos ordenados sobre un escritorio durante la preparación de la documentación.',
    startingPoint: 'not-sure',
    inSelector: true,
    share: [
      'Factura comercial y lista de bultos',
      'Descripción de la mercancía, materiales y uso previsto',
      'Datos del proveedor y del destinatario, incluido el número EORI del importador',
      'Su representante aduanero actual, si ya trabaja con uno',
    ],
    clarify: [
      'Qué datos del envío faltan todavía',
      'Qué dudas documentales hay que resolver antes del siguiente control',
      'Quién se encarga de la clasificación arancelaria (código TARIC) y de la declaración aduanera',
      'Los traspasos entre proveedor, equipo de transporte y representante aduanero',
    ],
    scopeNote:
      'Coordinamos los datos del envío y los traspasos de documentación. El representante aduanero, el ámbito, la clasificación arancelaria y el alcance formal del despacho deben definirse antes de asumir cualquier compromiso. Aranceles e IVA a la importación se rigen por la normativa que aplica el Departamento de Aduanas de la Agencia Tributaria; según su régimen de IVA, puede ser posible diferir el IVA a la importación.',
    relatedGuides: ['checklist-importacion-espana', 'incoterms-2020-explicados'],
  },
  {
    slug: 'almacenaje-y-logistica-e-commerce',
    navLabel: 'Almacenaje y logística e-commerce',
    label: 'Almacenaje y e-commerce',
    menuLine: 'Consolidación, almacenaje y preparación de pedidos',
    title: 'Recibir, revisar y preparar.',
    copy: 'Gestiona recepción, control, consolidación y preparación de pedidos con una instrucción única. Podemos mantener paquetes neutros y pedidos con varios artículos según el brief.',
    tags: ['Consolidación', 'Almacenaje', 'Preparación de pedidos'],
    linkLabel: 'Ver almacenaje',
    mediaId: 'es-service-almacen',
    mediaAlt: 'Operario con una transpaleta entre cajas apiladas y estanterías metálicas en un almacén.',
    startingPoint: 'warehousing-fulfillment',
    inSelector: true,
    share: [
      'Qué llega, de qué proveedores y cuándo',
      'Qué controles hacer en la recepción',
      'Instrucciones de almacenaje, consolidación o liberación',
      'Destinos y requisitos de preparación de pedidos',
    ],
    clarify: [
      'Pasos de recepción y control antes del almacenaje',
      'Cómo se consolidan, separan o retienen los pedidos',
      'Instrucciones de producto, embalaje y liberación para cada pedido',
      'El alcance operativo, confirmado antes de mover el stock',
    ],
    scopeNote:
      'Indíquenos sus requisitos de recepción, almacenaje, preparación y liberación. El alcance operativo disponible se confirma en el plan antes de mover el stock.',
    relatedGuides: ['guia-de-embalaje-e-insertos', 'checklist-importacion-espana'],
  },
  {
    slug: 'embalaje-y-marca',
    navLabel: 'Embalaje y marca',
    label: 'Embalaje y marca',
    menuLine: 'Insertos, etiquetas y embalaje personalizado',
    title: 'Que el paquete también hable de tu marca.',
    copy: 'Coordina tarjetas, pegatinas, etiquetas, bolsas o cajas personalizadas tras aprobar diseño, cantidad y orden de producción.',
    tags: ['Insertos', 'Etiquetas', 'Preparación de marca propia'],
    linkLabel: 'Ver embalaje y marca',
    mediaId: 'es-service-embalaje',
    mediaAlt: 'Una persona introduce una tarjeta de agradecimiento junto a una camiseta doblada en una caja de envío.',
    startingPoint: 'packaging-branding',
    inSelector: true,
    share: [
      'Archivos de diseño y manual de marca',
      'Cantidades de insertos, pegatinas, etiquetas, bolsas o cajas',
      'Instrucciones de colocación por referencia (SKU)',
      'Quién aprueba las muestras antes de usarlas',
    ],
    clarify: [
      'Qué elementos de marca forman parte del briefing logístico',
      'Diseño, cantidades y pasos de producción que hay que confirmar',
      'Instrucciones de colocación que un preparador pueda seguir',
      'Puntos de aprobación antes de embalar, incluidas las obligaciones de envases (Real Decreto 1055/2022) y el impuesto especial sobre envases de plástico no reutilizables',
    ],
    relatedGuides: ['guia-de-embalaje-e-insertos', 'briefing-de-compras-en-china'],
  },
  {
    slug: 'marca-propia-y-marca-blanca',
    navLabel: 'Marca propia y marca blanca',
    label: 'Marca propia y marca blanca',
    menuLine: 'Especificaciones, diseño y validación de muestras',
    title: 'Hacer suyo un producto de proveedor.',
    copy: 'Cuando un producto lleva su marca, el briefing necesita algo más que un logotipo. Le ayudamos a ordenar las especificaciones, la aprobación de diseños, los detalles de embalaje y etiquetado y la validación de muestras para que el proveedor, el equipo de preparación y el plan de transporte trabajen con la misma versión.',
    tags: ['Especificaciones', 'Aprobación de diseño', 'Validación de muestras'],
    linkLabel: 'Ver marca propia y marca blanca',
    mediaId: 'es-service-marca',
    mediaAlt: 'Muestras de materiales y una agenda sobre una mesa durante el desarrollo de un producto.',
    startingPoint: 'product-sourcing',
    inSelector: false,
    share: [
      'El producto que quiere personalizar, o un enlace a uno similar',
      'Logotipo, archivos de diseño y manual de marca',
      'Requisitos de embalaje y etiquetado para su mercado (por ejemplo, la información obligatoria en castellano)',
      'Cantidades objetivo y fecha de lanzamiento',
    ],
    clarify: [
      'Marca blanca (un producto existente con su marca) o marca propia (adaptado a sus especificaciones)',
      'Versiones de diseño y quién las aprueba',
      'Validación de muestras antes de producir',
      'Pasos de embalaje, etiquetado y preparación antes del transporte',
    ],
    relatedGuides: ['briefing-de-compras-en-china', 'guia-de-embalaje-e-insertos'],
  },
];

export const getServiceEs = (slug: string) => SERVICES_ES.find((service) => service.slug === slug) ?? null;
