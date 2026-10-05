export interface IndustryContentEs {
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

export const INDUSTRIES_ES: IndustryContentEs[] = [
  {
    slug: 'e-commerce-y-retail',
    navLabel: 'E-commerce y retail',
    name: 'E-commerce y retail',
    menuLine: 'Reposición, packs y preparación para marketplaces',
    copy: 'Reposiciones, bundles y preparación coherente para cada pedido.',
    questions: [
      '¿Qué referencias, packs o kits deben viajar juntos?',
      '¿Hay instrucciones de cajas, etiquetas o embalaje propias de un marketplace o de una cadena?',
      '¿Cómo influye el ritmo de reposición en el stock de destino?',
      '¿Quién aprueba insertos, etiquetas y embalaje antes de liberar la mercancía?',
    ],
    relatedServices: ['almacenaje-y-logistica-e-commerce', 'embalaje-y-marca', 'transporte-maritimo', 'busqueda-de-proveedores-en-china'],
    relatedGuides: ['guia-de-embalaje-e-insertos', 'maritimo-aereo-o-ferrocarril'],
    mediaId: 'es-industry-ecommerce',
    mediaAlt: 'Equipo de almacén manipulando cajas delante de estanterías ordenadas.',
  },
  {
    slug: 'bienes-de-consumo',
    navLabel: 'Bienes de consumo',
    name: 'Bienes de consumo',
    menuLine: 'Control de calidad, lanzamiento y presentación',
    copy: 'Producto, calidad y experiencia de entrega en una misma conversación.',
    questions: [
      '¿Qué detalles de producto y controles de calidad deben confirmarse antes del envío?',
      '¿De qué depende el lanzamiento: muestras, embalaje o calendario?',
      '¿Cómo debe llegar la presentación del proveedor al lineal o a la puerta del cliente?',
      '¿Qué etiquetado o documentación espera el mercado español o europeo?',
    ],
    relatedServices: ['busqueda-de-proveedores-en-china', 'embalaje-y-marca', 'marca-propia-y-marca-blanca', 'almacenaje-y-logistica-e-commerce'],
    relatedGuides: ['briefing-de-compras-en-china', 'guia-de-embalaje-e-insertos'],
    mediaId: 'es-industry-consumo',
    mediaAlt: 'Una persona desembala un pequeño producto de una caja con papel de relleno.',
  },
  {
    slug: 'componentes-industriales',
    navLabel: 'Componentes industriales',
    name: 'Componentes industriales',
    menuLine: 'Especificaciones, documentación y recepción',
    copy: 'Especificaciones, documentos y recepción ordenada.',
    questions: [
      '¿Qué especificaciones y planos definen una pieza aceptable?',
      '¿Qué documentación debe acompañar al envío (por ejemplo, certificados de material)?',
      '¿Qué requisitos de recepción se aplican en destino?',
      '¿Cuál es el siguiente traspaso a producción o a servicio tras la entrega?',
    ],
    relatedServices: ['busqueda-de-proveedores-en-china', 'coordinacion-aduanera', 'transporte-maritimo', 'transporte-terrestre-y-entrega'],
    relatedGuides: ['checklist-importacion-espana', 'incoterms-2020-explicados'],
    mediaId: 'es-industry-industria',
    mediaAlt: 'Primer plano de engranajes y piezas mecanizadas en un taller.',
  },
  {
    slug: 'carga-urgente',
    navLabel: 'Carga urgente',
    name: 'Carga urgente',
    menuLine: 'Siguiente movimiento viable, incidencias a tiempo',
    copy: 'Una alternativa realista y riesgos visibles desde el principio.',
    questions: [
      '¿Cuál es el siguiente movimiento viable y de qué depende?',
      '¿Qué documentos o aprobaciones podrían retener el envío?',
      '¿Quién debe enterarse de una incidencia y en cuánto tiempo?',
      '¿Cuál es la alternativa si la primera opción deja de ser viable?',
    ],
    relatedServices: ['transporte-aereo', 'coordinacion-aduanera', 'transporte-terrestre-y-entrega'],
    relatedGuides: ['maritimo-aereo-o-ferrocarril', 'checklist-importacion-espana'],
    mediaId: 'es-industry-urgente',
    mediaAlt: 'Avión en la puerta de embarque de noche mientras se gestiona la carga.',
  },
];

export const getIndustryEs = (slug: string) => INDUSTRIES_ES.find((industry) => industry.slug === slug) ?? null;
