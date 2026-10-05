/**
 * Guías en español (España). La página de inicio muestra las tres guías *publicadas* más recientes;
 * los borradores nunca se muestran. En producción, la consulta al CMS sustituye este módulo.
 */
import type { Article, ArticleSection } from '../en-global/articles';

export interface ArticleEs extends Omit<Article, 'locale'> {
  locale: 'es';
  sections: ArticleSection[];
}

const ARTICLES_ES: ArticleEs[] = [
  {
    slug: 'checklist-importacion-espana',
    locale: 'es',
    status: 'published',
    title: 'Importar de China a España: checklist antes de reservar',
    excerpt:
      'La mayoría de los retrasos se ven venir si alguien está mirando. Esta checklist ayuda a aclarar documentación, responsabilidades y detalles de recepción antes de que la mercancía salga del proveedor.',
    category: 'Preparación de la importación',
    publishedAt: '2026-09-26',
    readMinutes: 8,
    coverId: 'es-guide-checklist',
    coverAlt: 'Una persona toma notas en un portapapeles junto a cajas de cartón embaladas.',
    sections: [
      {
        heading: 'Producto y proveedor',
        blocks: [
          {
            type: 'list',
            items: [
              'Descripción definitiva de la mercancía, materiales y cantidades',
              'Nombre del proveedor, dirección de recogida y fecha de disponibilidad',
              'Número de bultos, medidas y pesos',
              'Requisitos de marcado o etiquetado propios del producto',
            ],
          },
        ],
      },
      {
        heading: 'Datos aduaneros',
        blocks: [
          {
            type: 'p',
            text: 'Para importar en la Unión Europea, el importador necesita un número EORI; en España lo gestiona la Agencia Tributaria. Aclare también el código TARIC, el valor en aduana y el origen de la mercancía: de ahí se derivan los aranceles y el IVA a la importación.',
          },
          {
            type: 'p',
            text: 'La declaración aduanera (DUA) la presenta el representante aduanero designado, que también se ocupa de la clasificación arancelaria. Según su régimen de IVA, puede ser posible diferir el IVA a la importación e incluirlo en la autoliquidación periódica: consúltelo con su asesor antes de reservar.',
          },
        ],
      },
      {
        heading: 'Documentación comercial',
        blocks: [
          {
            type: 'p',
            text: 'La factura comercial y la lista de bultos deben coincidir entre sí y con la mercancía. Compártalas pronto para que las dudas surjan antes del siguiente control.',
          },
          {
            type: 'list',
            items: [
              'Factura comercial con descripción, valores e Incoterm',
              'Lista de bultos (packing list) con cajas, medidas y pesos',
              'Documento de transporte (conocimiento de embarque o carta de porte aéreo)',
              'Si procede, certificados de origen o documentación de conformidad',
            ],
          },
        ],
      },
      {
        heading: 'Conformidad del producto en España y en la UE',
        blocks: [
          {
            type: 'p',
            text: 'Según el producto, se aplican requisitos propios: marcado CE, persona responsable establecida en la UE conforme al Reglamento de Seguridad General de los Productos (RSGP), información obligatoria en castellano, obligaciones de envases del Real Decreto 1055/2022, el impuesto especial sobre envases de plástico no reutilizables de la Ley 7/2022 y, en su caso, las obligaciones de RAEE o de pilas. Decida pronto quién asume cada obligación.',
          },
          {
            type: 'note',
            text: 'Esta guía es una orientación general y no constituye asesoramiento jurídico ni aduanero. La información vinculante es la de la Agencia Tributaria, las autoridades competentes y sus asesores.',
          },
        ],
      },
      {
        heading: 'Responsabilidades e Incoterms',
        blocks: [
          {
            type: 'p',
            text: 'Pacte el Incoterm con su proveedor y deje por escrito quién reserva, paga y asegura cada tramo. Si la regla y el plan no coinciden, corríjalo antes de la recogida.',
          },
        ],
      },
      {
        heading: 'Destino y recepción',
        blocks: [
          {
            type: 'list',
            items: [
              'Dirección de entrega, horario de recepción y persona de contacto',
              'Requisitos de cita previa, muelle o equipo',
              'Instrucciones de almacenaje, consolidación o logística e-commerce',
              'Quién confirma la recepción y revisa la mercancía',
            ],
          },
        ],
      },
      {
        heading: 'Incidencias',
        blocks: [
          {
            type: 'p',
            text: 'Decida quién se entera de un cambio —un proveedor que se retrasa, una duda documental, una cita perdida— y en cuánto tiempo. Un plan que muestra el cambio pronto se recupera mejor que uno que lo esconde en una larga cadena de correos.',
          },
        ],
      },
    ],
    relatedServices: ['coordinacion-aduanera', 'almacenaje-y-logistica-e-commerce'],
  },
  {
    slug: 'maritimo-aereo-o-ferrocarril',
    locale: 'es',
    status: 'published',
    title: '¿Marítimo, aéreo o ferrocarril? Una guía práctica para decidir',
    excerpt:
      'El modo de transporte adecuado depende de lo que el envío deba proteger: el presupuesto, una fecha de lanzamiento, la cobertura de stock o una promesa al cliente. Empiece por ahí, no por el modo.',
    category: 'Transporte internacional',
    publishedAt: '2026-09-19',
    readMinutes: 6,
    coverId: 'es-guide-modos',
    coverAlt: 'Tren de mercancías con contenedores sobre las vías bajo un cielo con nubes.',
    sections: [
      {
        heading: 'Empezar por la restricción, no por el modo',
        blocks: [
          {
            type: 'p',
            text: 'Las decisiones sobre el modo de transporte se tuercen cuando la pregunta es «¿cuál es más barato?» en lugar de «¿qué debe proteger este envío?». Nombre primero la restricción: una fecha de lanzamiento, la cobertura de stock, una promesa al cliente o el presupuesto del coste puesto en destino.',
          },
        ],
      },
      {
        heading: 'Cuándo suele encajar el transporte marítimo',
        blocks: [
          {
            type: 'p',
            text: 'El marítimo suele ser el tramo más económico para mercancía que está lista con antelación y no tiene una fecha de llegada cercana obligatoria. Para destinos en España, las rutas habituales pasan por los grandes puertos del Mediterráneo —como Valencia, Barcelona o Algeciras— o por puertos del norte, con transporte final por carretera o ferrocarril, incluidos los puertos secos del interior.',
          },
          {
            type: 'list',
            items: [
              'FCL (contenedor completo): su mercancía ocupa el contenedor entero',
              'LCL (grupaje): su mercancía comparte contenedor con otros envíos',
              'Puerta a puerta: el plan continúa tras el puerto de destino hasta su dirección de entrega',
            ],
          },
        ],
      },
      {
        heading: 'Cuándo el ferrocarril China–Europa es una opción',
        blocks: [
          {
            type: 'p',
            text: 'Entre el marítimo y el aéreo está el ferrocarril China–Europa. Puede resultar interesante cuando la mercancía debe llegar antes que por barco, pero sin la urgencia del avión. La disponibilidad, los plazos y las condiciones dependen de la ruta y del momento, y se comprueban en el plan de envío.',
          },
        ],
      },
      {
        heading: 'Cuándo el aéreo se gana su sitio',
        blocks: [
          {
            type: 'p',
            text: 'Vale la pena comparar el aéreo cuando un lanzamiento, una reposición o un pedido urgente no pueden esperar al siguiente ciclo marítimo, o cuando la mercancía es pequeña y valiosa en relación con su volumen.',
          },
        ],
      },
      {
        heading: 'Preguntas que hacen útil la comparación',
        blocks: [
          {
            type: 'list',
            items: [
              '¿Cuándo estará realmente lista la mercancía para la recogida?',
              '¿Cuáles son las medidas, los pesos y el número de bultos?',
              '¿Qué fecha importa en destino y qué ocurre si se retrasa?',
              '¿Hay requisitos de recepción en la dirección de entrega?',
              '¿Podría viajar parte del pedido por avión mientras el resto va por mar o por ferrocarril?',
            ],
          },
          {
            type: 'note',
            text: 'No publicamos plazos ni tarifas genéricos. Las opciones realistas dependen de la ruta, la mercancía y la fecha, y se confirman en el plan de envío.',
          },
        ],
      },
    ],
    relatedServices: ['transporte-maritimo', 'transporte-aereo'],
  },
  {
    slug: 'briefing-de-compras-en-china',
    locale: 'es',
    status: 'published',
    title: 'Cómo preparar un briefing de compras para China',
    excerpt:
      'Un buen briefing de compras no tiene que ser largo. Tiene que dejar claros el producto, las cantidades, las expectativas de calidad y la siguiente decisión para todas las personas implicadas.',
    category: 'Proveedores en China',
    publishedAt: '2026-09-10',
    readMinutes: 6,
    coverId: 'es-guide-briefing',
    coverAlt: 'Selección de cartas de color y muestras de tejido sobre un escritorio.',
    sections: [
      {
        heading: 'Empezar por lo que ya tiene',
        blocks: [
          {
            type: 'p',
            text: 'Un enlace de producto, una foto o una ficha técnica breve bastan para abrir la conversación. Comparta lo que tenga en lugar de esperar al documento perfecto: el briefing crecerá a medida que el plan se concrete.',
          },
          {
            type: 'p',
            text: 'Si tiene un precio objetivo, indíquelo. Acota pronto las opciones de proveedores y mantiene las comparaciones con los pies en el suelo.',
          },
        ],
      },
      {
        heading: 'Describir el producto como lo presupuesta un proveedor',
        blocks: [
          {
            type: 'p',
            text: 'Los proveedores presupuestan detalles, no intenciones. Cuantos más puntos de esta lista confirme, más fácil será comparar ofertas en igualdad de condiciones:',
          },
          {
            type: 'list',
            items: [
              'Materiales, acabados y referencias de color',
              'Medidas, peso y las tolerancias que importan',
              'Variantes: tallas, colores o packs',
              'Expectativas de embalaje de venta y de envío',
              'Etiquetado, marcado o documentación que exige su mercado',
            ],
          },
        ],
      },
      {
        heading: 'Dejar claros las cantidades y los plazos',
        blocks: [
          {
            type: 'p',
            text: 'Indique la cantidad del primer pedido que baraja, si prevé reposiciones y la fecha en la que la mercancía debe estar disponible. Diga si esa fecha es fija o flexible: cambia qué opciones son realistas.',
          },
        ],
      },
      {
        heading: 'Definir qué es «aceptable» antes de las muestras',
        blocks: [
          {
            type: 'p',
            text: 'Las muestras solo sirven si todos saben qué se revisa. Anote los puntos que deciden la aprobación, quién aprueba y qué ocurre si una muestra falla en alguno.',
          },
          {
            type: 'note',
            text: 'Mantenga el briefing, las respuestas de los proveedores y los comentarios sobre las muestras en un mismo hilo de trabajo para que el siguiente traspaso parta de la última versión.',
          },
        ],
      },
      {
        heading: 'Checklist breve antes de enviarlo',
        blocks: [
          {
            type: 'list',
            items: [
              'Enlace de producto, foto o ficha técnica adjunta',
              'Precio objetivo y horquilla de cantidades indicados',
              'Destino y fecha deseada incluidos',
              'Requisitos de embalaje, etiquetado y normativa anotados',
              'Persona responsable de aprobar las muestras designada',
            ],
          },
        ],
      },
    ],
    relatedServices: ['busqueda-de-proveedores-en-china', 'marca-propia-y-marca-blanca'],
  },
  {
    slug: 'guia-de-embalaje-e-insertos',
    locale: 'es',
    status: 'published',
    title: 'Embalaje e insertos: qué dejar resuelto antes de preparar pedidos',
    excerpt:
      'Insertos, pegatinas, etiquetas colgantes y cajas de marca funcionan mejor cuando el diseño, las cantidades y la colocación están confirmados antes de que la mercancía llegue a la mesa de preparación.',
    category: 'Embalaje y marca',
    publishedAt: '2026-08-29',
    readMinutes: 5,
    coverId: 'es-guide-embalaje',
    coverAlt: 'Un operario sonriente revisa cajas de cartón en un almacén.',
    sections: [
      {
        heading: 'Decidir qué ve primero el cliente',
        blocks: [
          {
            type: 'p',
            text: 'Enumere cada elemento de marca en el orden en que el cliente lo encuentra: caja exterior, papel de seda, tarjeta, etiqueta del producto. El briefing se mantiene centrado y evita pagar elementos que nadie ve.',
          },
        ],
      },
      {
        heading: 'Confirmar diseño y cantidades',
        blocks: [
          {
            type: 'list',
            items: [
              'Archivos de diseño definitivos y versiones aprobadas',
              'Cantidades por referencia, más un pequeño margen por roturas',
              'Quién suministra cada elemento y cuándo llega',
              'Necesidades de almacenaje del material de embalaje',
            ],
          },
        ],
      },
      {
        heading: 'Escribir instrucciones de colocación que un preparador pueda seguir',
        blocks: [
          {
            type: 'p',
            text: 'Describa la colocación por referencia en pasos sencillos, idealmente con la foto de una muestra aprobada. «Tarjeta encima, logotipo hacia arriba» es más claro que «añadir inserto».',
          },
        ],
      },
      {
        heading: 'No olvide las obligaciones de envases',
        blocks: [
          {
            type: 'p',
            text: 'Quien pone en el mercado español productos envasados está sujeto, por lo general, a la responsabilidad ampliada del productor del Real Decreto 1055/2022: inscripción en el registro de productores y participación en un sistema de responsabilidad ampliada. Además, los envases de plástico no reutilizables pueden estar sujetos al impuesto especial de la Ley 7/2022. Deje claro en el briefing quién asume ese papel: proveedor, marca o distribuidor.',
          },
          {
            type: 'note',
            text: 'Orientación general, no asesoramiento jurídico. La información vinculante es la del Ministerio para la Transición Ecológica y el Reto Demográfico, la Agencia Tributaria y sus asesores.',
          },
        ],
      },
      {
        heading: 'Proteger el producto tanto como la presentación',
        blocks: [
          {
            type: 'p',
            text: 'La presentación tiene que sobrevivir al viaje. Compruebe que el embalaje de marca sigue protegiendo el producto durante la consolidación, el transporte y la entrega final.',
          },
        ],
      },
    ],
    relatedServices: ['embalaje-y-marca', 'almacenaje-y-logistica-e-commerce'],
  },
  {
    slug: 'incoterms-2020-explicados',
    locale: 'es',
    status: 'published',
    title: 'Incoterms 2020 explicados: ¿quién se encarga de cada traspaso?',
    excerpt:
      'Los Incoterms describen dónde pasa la responsabilidad del vendedor al comprador. Conocer ese punto facilita comparar presupuestos, seguros y planes de entrega.',
    category: 'Incoterms',
    publishedAt: '2026-08-15',
    readMinutes: 6,
    coverId: 'es-guide-incoterms',
    coverAlt: 'Puerto con grúas de carga y buques bajo un cielo despejado.',
    sections: [
      {
        heading: 'Qué regulan los Incoterms y qué no',
        blocks: [
          {
            type: 'p',
            text: 'Publicados por la Cámara de Comercio Internacional (ICC), los Incoterms® describen dónde se realiza la entrega, cuándo pasa el riesgo del vendedor al comprador y quién organiza y paga el transporte y determinados gastos.',
          },
          {
            type: 'p',
            text: 'No regulan cuándo se transmite la propiedad, cómo se paga ni qué ocurre si se incumple el contrato. Eso corresponde a su contrato de compraventa.',
          },
        ],
      },
      {
        heading: 'Las reglas que más verá en los presupuestos',
        blocks: [
          {
            type: 'list',
            items: [
              'EXW (En fábrica): el vendedor pone la mercancía a disposición en sus instalaciones; el comprador organiza casi todo a partir de ahí, incluido el despacho de exportación.',
              'FCA (Franco porteador): el vendedor entrega la mercancía despachada para exportación al transportista que designa el comprador. Para contenedores suele ser más práctico que EXW.',
              'FOB (Franco a bordo): el vendedor entrega la mercancía a bordo del buque en el puerto de embarque convenido. Solo para transporte marítimo y fluvial.',
              'CIF (Coste, seguro y flete): el vendedor paga el flete y un seguro mínimo hasta el puerto de destino, pero el riesgo pasa en el momento de la carga a bordo en origen.',
              'DAP (Entregada en lugar): el vendedor entrega en el lugar convenido, lista para descargar; el despacho de importación y los derechos corren a cargo del comprador.',
              'DDP (Entregada derechos pagados): el vendedor entrega en el lugar convenido con la mercancía despachada de importación y los derechos pagados.',
            ],
          },
        ],
      },
      {
        heading: 'Hacer coincidir la regla y el plan',
        blocks: [
          {
            type: 'p',
            text: 'Un presupuesto solo tiene sentido junto a la regla que presupone. Compruebe que el lugar convenido es preciso, que el seguro se corresponde con el punto de transmisión del riesgo y que el plan indica quién se encarga de cada traspaso a partir de ahí.',
          },
          {
            type: 'note',
            text: 'Esta guía es información general, no asesoramiento jurídico. Compruebe la versión de los Incoterms y la regla en su contrato. Incoterms® es una marca de la ICC.',
          },
        ],
      },
    ],
    relatedServices: ['transporte-maritimo', 'coordinacion-aduanera'],
  },
  {
    slug: 'coordinacion-con-proveedores',
    locale: 'es',
    status: 'draft',
    title: 'Coordinación con proveedores: muestras, aprobaciones y cambios en un mismo hilo',
    excerpt: 'Borrador, todavía no publicado.',
    category: 'Proveedores en China',
    publishedAt: '2026-09-27',
    readMinutes: 5,
    coverId: 'es-guide-proveedores',
    coverAlt: '',
    sections: [],
    relatedServices: ['busqueda-de-proveedores-en-china'],
  },
];

export function getPublishedArticlesEs(): ArticleEs[] {
  return ARTICLES_ES.filter((article) => article.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getLatestArticlesEs = (limit = 3) => getPublishedArticlesEs().slice(0, Math.max(0, limit));

export const getArticleEs = (slug: string) => getPublishedArticlesEs().find((article) => article.slug === slug) ?? null;

export function formatDateEs(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
