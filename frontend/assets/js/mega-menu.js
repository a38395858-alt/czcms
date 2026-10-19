/* ==========================================================================
   Unified site mega menu — independent panels (see mega-menu.css)
   Solutions shows only solutions; Industries shows only industries.
   No dependencies; safe to load with `defer`.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
  "en": [
    {
      "key": "solutions",
      "trigger": "Solutions",
      "eyebrow": "Solutions",
      "columns": 2,
      "items": [
        {
          "title": "Product Sourcing from China for Businesses",
          "desc": "Coordinate product sourcing from China with a supplier-ready brief, comparable…",
          "href": "/product-sourcing"
        },
        {
          "title": "Bulk Procurement From China: Plan the Next…",
          "desc": "Prepare a bulk purchase from China with clearer quantities, supplier questions…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Packaging and Branding for Products From China",
          "desc": "Turn approved packaging, labels, inserts, and brand materials for products from…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Inventory Storage for Goods From China",
          "desc": "Organize imported inventory receiving, identification, storage, release…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Private Label Products From China",
          "desc": "Coordinate product, brand assets, packaging versions, approval checkpoints, and…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Fulfillment for China-Sourced Products",
          "desc": "Prepare China-sourced inventory for customer orders with clear picking, packing…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "Not sure where to start?",
        "body": "Start with a product link, a shipment brief, or the route you need to plan.",
        "cta": "Get a shipment plan",
        "ctaHref": "#enquiry",
        "secondary": "Compare service paths",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Industries",
      "eyebrow": "Industries",
      "columns": 1,
      "items": [
        {
          "title": "Cross-Border Ecommerce Logistics From China",
          "desc": "Plan a cross-border ecommerce operating path from China sourcing to product…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Consumer Goods Logistics From China",
          "desc": "Coordinate China-sourced consumer goods from product reference and packaging…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Industrial Components Logistics From China",
          "desc": "Coordinate specification-led industrial parts from China with revision control…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Time-Critical Cargo Logistics From China",
          "desc": "Plan time-critical cargo from China with a visible ready date, documents, routing…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "Need a sector view?",
        "body": "See how the operating model adapts to your goods.",
        "cta": "Explore industries",
        "ctaHref": "/industries"
      }
    }
  ],
  "de": [
    {
      "key": "solutions",
      "trigger": "Leistungen",
      "eyebrow": "Leistungen",
      "columns": 2,
      "items": [
        {
          "title": "Produkte aus China beschaffen",
          "desc": "Produkte aus China beschaffen: Lieferantenanfragen, vergleichbare Antworten…",
          "href": "/product-sourcing"
        },
        {
          "title": "Großeinkauf aus China planen",
          "desc": "Planen Sie einen Großeinkauf aus China mit klaren Mengen, Lieferantenfragen…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Verpackung und Branding für Produkte aus China",
          "desc": "Verwandeln Sie freigegebene Verpackung, Etiketten, Beilagen und…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Lagerhaltung für Waren aus China",
          "desc": "Organisieren Sie Wareneingang, Identifikation, Lagerung, Freigabeanweisungen und…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Eigenmarke und White Label aus China",
          "desc": "Koordinieren Sie Produkt, Branding-Materialien, Verpackungsversionen…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Fulfillment für Produkte aus China",
          "desc": "Bereiten Sie Bestand aus China mit klaren Kommissionier-, Pack-, Etiketten-…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "Nicht sicher, wo Sie anfangen sollen?",
        "body": "Nennen Sie Produkt, Sendung oder Route. Wir zeigen den nächsten sinnvollen Schritt.",
        "cta": "Versandplan anfordern",
        "ctaHref": "#anfrage",
        "secondary": "Leistungen vergleichen",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Branchen",
      "eyebrow": "Branchen",
      "columns": 1,
      "items": [
        {
          "title": "Logistik für grenzüberschreitenden E-Commerce…",
          "desc": "Planen Sie den operativen Weg von der Beschaffung in China über Produktprüfung…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Logistik für Konsumgüter aus China",
          "desc": "Koordinieren Sie Konsumgüter aus China von Produktreferenz und Verpackung über…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Logistik für Industriekomponenten aus China",
          "desc": "Koordinieren Sie spezifikationsgeführte Industrieteile aus China mit…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Logistik für zeitkritische Fracht aus China",
          "desc": "Planen Sie zeitkritische Fracht aus China mit sichtbarem Bereitstellungstermin…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "Branchenblick gesucht?",
        "body": "Sehen Sie, wie das Betriebsmodell zu Ihrer Ware passt.",
        "cta": "Branchen ansehen",
        "ctaHref": "/industries"
      }
    }
  ],
  "fr": [
    {
      "key": "solutions",
      "trigger": "Solutions",
      "eyebrow": "Solutions",
      "columns": 2,
      "items": [
        {
          "title": "Sourcing en Chine pour entreprises",
          "desc": "Coordonnez votre sourcing en Chine avec un brief fournisseur, des réponses…",
          "href": "/product-sourcing"
        },
        {
          "title": "Planifier un achat en volume depuis la Chine",
          "desc": "Préparez un achat en volume depuis la Chine avec des quantités claires, des…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Emballage et image de marque pour les…",
          "desc": "Transformez un emballage validé, des étiquettes, des notices et des éléments de…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Stockage des marchandises en provenance de…",
          "desc": "Organisez la réception, l'identification, le stockage, les instructions de…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Marque propre et marque blanche depuis la…",
          "desc": "Coordonnez produit, éléments de marque, versions d'emballage, points de…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Préparation de commandes pour produits…",
          "desc": "Préparez un stock issu de Chine pour les commandes clients avec des instructions…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "Vous ne savez pas par où commencer ?",
        "body": "Partez d'un produit, d'un besoin d'expédition ou d'un itinéraire.",
        "cta": "Demander un plan",
        "ctaHref": "#demande",
        "secondary": "Comparer les solutions",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Secteurs",
      "eyebrow": "Secteurs",
      "columns": 1,
      "items": [
        {
          "title": "Logistique e-commerce transfrontalier depuis…",
          "desc": "Planifiez un parcours opérationnel de l'approvisionnement en Chine au contrôle…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Logistique des biens de consommation depuis…",
          "desc": "Coordonnez des biens de consommation sourcés en Chine, de la référence produit et…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Logistique des composants industriels depuis…",
          "desc": "Coordonnez des pièces industrielles pilotées par spécification depuis la Chine…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Logistique de fret urgent depuis la Chine",
          "desc": "Planifiez un fret urgent depuis la Chine avec date de mise à disposition…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "Besoin d'une vue sectorielle ?",
        "body": "Voyez comment le modèle s'adapte à vos marchandises.",
        "cta": "Voir les secteurs",
        "ctaHref": "/industries"
      }
    }
  ],
  "es": [
    {
      "key": "solutions",
      "trigger": "Soluciones",
      "eyebrow": "Soluciones",
      "columns": 2,
      "items": [
        {
          "title": "Sourcing de productos en China",
          "desc": "Organiza el sourcing de productos en China con un brief para proveedor…",
          "href": "/product-sourcing"
        },
        {
          "title": "Planificar una compra al por mayor en China",
          "desc": "Prepara una compra al por mayor en China con cantidades claras, preguntas al…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Embalaje e imagen de marca para productos de…",
          "desc": "Convierte embalaje aprobado, etiquetas, insertos y materiales de marca en una…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Almacenaje de mercancía procedente de China",
          "desc": "Organiza recepción, identificación, almacenaje, instrucciones de liberación y…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Marca propia y marca blanca desde China",
          "desc": "Coordina producto, materiales de marca, versiones de embalaje, puntos de…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Preparación de pedidos para productos con…",
          "desc": "Prepara stock con origen en China para pedidos de cliente con instrucciones…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "¿No sabes por dónde empezar?",
        "body": "Empieza con un producto, un envío o una ruta.",
        "cta": "Solicitar un plan",
        "ctaHref": "#solicitud",
        "secondary": "Comparar servicios",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Sectores",
      "eyebrow": "Sectores",
      "columns": 1,
      "items": [
        {
          "title": "Logística de comercio electrónico…",
          "desc": "Planifica un recorrido operativo desde el sourcing en China hasta la comprobación…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Logística de bienes de consumo desde China",
          "desc": "Coordina bienes de consumo con origen en China desde la referencia de producto y…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Logística de componentes industriales desde…",
          "desc": "Coordina piezas industriales guiadas por especificación desde China con control…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Logística de carga urgente desde China",
          "desc": "Planifica carga urgente desde China con fecha de disponibilidad, documentos…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "¿Necesitas una visión sectorial?",
        "body": "Mira cómo se adapta el modelo a tus mercancías.",
        "cta": "Ver sectores",
        "ctaHref": "/industries"
      }
    }
  ],
  "it": [
    {
      "key": "solutions",
      "trigger": "Servizi",
      "eyebrow": "Servizi",
      "columns": 2,
      "items": [
        {
          "title": "Sourcing prodotti dalla Cina per aziende",
          "desc": "Organizza il sourcing di prodotti dalla Cina con un brief per il fornitore…",
          "href": "/product-sourcing"
        },
        {
          "title": "Pianificare un acquisto all'ingrosso in Cina",
          "desc": "Prepara un acquisto all'ingrosso in Cina con quantità chiare, domande ai…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Imballaggio e immagine di marca per prodotti…",
          "desc": "Trasforma imballaggi approvati, etichette, inserti e materiali di marca in…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Stoccaggio di merci provenienti dalla Cina",
          "desc": "Organizza ricezione, identificazione, stoccaggio, istruzioni di rilascio e…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Marca privata e white label dalla Cina",
          "desc": "Coordina prodotto, materiali di marca, versioni di imballaggio, punti di…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Preparazione ordini per prodotti dalla Cina",
          "desc": "Prepara scorte provenienti dalla Cina per gli ordini cliente con istruzioni…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "Non sai da dove iniziare?",
        "body": "Parti da un prodotto, una spedizione o un percorso.",
        "cta": "Richiedi un piano",
        "ctaHref": "#richiesta",
        "secondary": "Confronta i servizi",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Settori",
      "eyebrow": "Settori",
      "columns": 1,
      "items": [
        {
          "title": "Logistica e-commerce transfrontaliero dalla…",
          "desc": "Pianifica un percorso operativo dal sourcing in Cina al controllo prodotto, al…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Logistica per beni di consumo dalla Cina",
          "desc": "Coordina beni di consumo provenienti dalla Cina dalla referenza di prodotto e…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Logistica componenti industriali dalla Cina",
          "desc": "Coordina parti industriali guidate da specifica dalla Cina con controllo di…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Logistica spedizioni urgenti dalla Cina",
          "desc": "Pianifica una spedizione urgente dalla Cina con data di disponibilità, documenti…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "Ti serve una vista di settore?",
        "body": "Scopri come il modello si adatta alle tue merci.",
        "cta": "Vedi i settori",
        "ctaHref": "/industries"
      }
    }
  ],
  "nl": [
    {
      "key": "solutions",
      "trigger": "Oplossingen",
      "eyebrow": "Oplossingen",
      "columns": 2,
      "items": [
        {
          "title": "Producten inkopen in China",
          "desc": "Producten inkopen in China met een leveranciersbrief, vergelijkbare antwoorden…",
          "href": "/product-sourcing"
        },
        {
          "title": "Grootschalige inkoop in China plannen",
          "desc": "Plan een grootschalige inkoop in China met duidelijke aantallen…",
          "href": "/services/bulk-procurement"
        },
        {
          "title": "Verpakking en merk voor producten uit China",
          "desc": "Zet goedgekeurde verpakking, etiketten, inserts en merkmaterialen om in een…",
          "href": "/services/packaging-branding"
        },
        {
          "title": "Opslag van goederen uit China",
          "desc": "Organiseer ontvangst, identificatie, opslag, vrijgave-instructies en…",
          "href": "/services/inventory-storage"
        },
        {
          "title": "Eigen merk en white label uit China",
          "desc": "Coördineer product, merkmaterialen, verpakkingsversies, goedkeuringsmomenten en…",
          "href": "/services/private-white-label"
        },
        {
          "title": "Orderverwerking voor producten uit China",
          "desc": "Maak voorraad uit China klaar voor klantorders met heldere instructies voor…",
          "href": "/services/worldwide-fulfillment"
        }
      ],
      "aside": {
        "title": "Weet u niet waar u moet beginnen?",
        "body": "Begin met een product, een zending of een route.",
        "cta": "Vraag een plan aan",
        "ctaHref": "#aanvraag",
        "secondary": "Vergelijk diensten",
        "secondaryHref": "/services"
      }
    },
    {
      "key": "industries",
      "trigger": "Sectoren",
      "eyebrow": "Sectoren",
      "columns": 1,
      "items": [
        {
          "title": "Logistiek voor grensoverschrijdende…",
          "desc": "Plan een operationeel pad van sourcing in China via productcontrole, verpakking…",
          "href": "/industries/cross-border-ecommerce"
        },
        {
          "title": "Logistiek voor consumentengoederen uit China",
          "desc": "Coördineer consumentengoederen uit China van productreferentie en verpakking tot…",
          "href": "/industries/consumer-goods"
        },
        {
          "title": "Logistiek voor industriële onderdelen uit…",
          "desc": "Coördineer specificatiegestuurde industriële onderdelen uit China met…",
          "href": "/industries/industrial-components"
        },
        {
          "title": "Logistiek voor tijdkritische vracht uit China",
          "desc": "Plan tijdkritische vracht uit China met zichtbare beschikbaarheidsdatum…",
          "href": "/industries/time-critical-cargo"
        }
      ],
      "aside": {
        "title": "Sectoroverzicht nodig?",
        "body": "Zie hoe het model past bij uw goederen.",
        "cta": "Bekijk sectoren",
        "ctaHref": "/industries"
      }
    }
  ]
};

  var lang = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
  var menus = CONFIG[lang];
  if (!menus) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildPanel(menu) {
    var root = el('div', 'cz-mega');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', menu.trigger);
    root.setAttribute('data-open', 'false');
    root.setAttribute('data-size', menu.columns === 1 ? 'narrow' : 'wide');

    var grid = el('div', 'cz-mega-grid');
    var main = el('div', 'cz-mega-main');
    main.appendChild(el('p', 'cz-mega-eyebrow', menu.eyebrow));

    var ul = el('ul', 'cz-mega-list');
    ul.setAttribute('data-cols', String(menu.columns));
    menu.items.forEach(function (item) {
      var li = el('li', 'cz-mega-item');
      var a = el('a', 'cz-mega-link');
      a.href = item.href;
      a.appendChild(el('span', 'cz-mega-title', item.title));
      if (item.desc) a.appendChild(el('span', 'cz-mega-desc', item.desc));
      li.appendChild(a);
      ul.appendChild(li);
    });
    main.appendChild(ul);
    grid.appendChild(main);

    var aside = el('aside', 'cz-mega-aside');
    aside.appendChild(el('h2', null, menu.aside.title));
    aside.appendChild(el('p', null, menu.aside.body));

    var cta = el('a', 'cz-mega-cta');
    var href = menu.aside.ctaHref;
    if (href.charAt(0) === '#' && !document.querySelector(href)) href = '/contact';
    cta.href = href;
    cta.appendChild(document.createTextNode(menu.aside.cta + ' '));
    var arrow = el('span', null, '\u2192');
    arrow.setAttribute('aria-hidden', 'true');
    cta.appendChild(arrow);
    aside.appendChild(cta);

    if (menu.aside.secondary) {
      var sec = el('a', 'cz-mega-secondary', menu.aside.secondary);
      sec.href = menu.aside.secondaryHref;
      aside.appendChild(sec);
    }

    grid.appendChild(aside);
    root.appendChild(grid);
    document.body.appendChild(root);
    return root;
  }

  function hideLegacy(trg) {
    if (trg.tagName === 'SUMMARY') {
      var details = trg.parentElement;
      Array.prototype.forEach.call(details.children, function (child) {
        if (child !== trg) child.style.setProperty('display', 'none', 'important');
      });
      details.open = false;
      details.addEventListener('toggle', function () { if (details.open) details.open = false; });
    } else {
      var id = trg.getAttribute('aria-controls');
      var legacy = id && document.getElementById(id);
      if (legacy) legacy.style.setProperty('display', 'none', 'important');
    }
    var scope = trg.closest('nav') || trg.parentElement;
    if (scope) {
      scope.querySelectorAll('.fv-ref-mega, .fv-de-mega').forEach(function (p) {
        p.style.setProperty('display', 'none', 'important');
      });
    }
    // A plain <a> trigger must not navigate.
    if (trg.tagName === 'A') {
      trg.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }

  function bind(menu) {
    var label = menu.trigger.toLowerCase();
    var candidates = Array.prototype.slice.call(
      document.querySelectorAll('header summary, header nav button, header nav summary, header nav a')
    );
    var trg = candidates.find(function (n) {
      var t = (n.textContent || '').trim().toLowerCase();
      return t === label || t.indexOf(label) === 0;
    }) || null;

    if (!trg) {
      var nav = document.querySelector('header nav ul') || document.querySelector('header nav');
      if (!nav) return;
      var li = el('li', 'cz-mega-navitem');
      var btn = el('button', 'cz-mega-navtrigger');
      btn.type = 'button';
      btn.textContent = menu.trigger;
      li.appendChild(btn);
      nav.insertBefore(li, nav.firstElementChild);
      trg = btn;
    }

    hideLegacy(trg);
    var panel = buildPanel(menu);
    var id = 'cz-mega-' + menu.key;
    panel.id = id;
    panel.setAttribute('data-key', menu.key);
    trg.setAttribute('data-cz-trigger', menu.key);

    trg.setAttribute('aria-haspopup', 'true');
    trg.setAttribute('aria-expanded', 'false');
    trg.setAttribute('aria-controls', id);

    function isOpen() { return panel.getAttribute('data-open') === 'true'; }

    function position() {
      var r = trg.getBoundingClientRect();
      var header = trg.closest('header') || trg.closest('nav');
      var top = (header ? header.getBoundingClientRect().bottom : r.bottom) + window.scrollY;
      var width = panel.offsetWidth || 940;
      var maxLeft = window.scrollX + document.documentElement.clientWidth - width - 20;
      var left = Math.min(r.left, maxLeft);
      if (left < 20) left = 20;
      panel.style.top = Math.round(top) + 'px';
      panel.style.left = Math.round(left) + 'px';
    }

    function close() {
      panel.setAttribute('data-open', 'false');
      trg.setAttribute('aria-expanded', 'false');
    }

    function open() {
      // Only one panel may be visible at a time.
      document.querySelectorAll('.cz-mega[data-open="true"]').forEach(function (p) {
        if (p !== panel) p.setAttribute('data-open', 'false');
      });
      document.querySelectorAll('[aria-expanded="true"]').forEach(function (n) {
        if (n !== trg && n.hasAttribute('aria-controls')) n.setAttribute('aria-expanded', 'false');
      });
      position();
      panel.setAttribute('data-open', 'true');
      trg.setAttribute('aria-expanded', 'true');
    }

    trg.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen() ? close() : open();
    }, true);

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (panel.contains(e.target) || trg.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { close(); trg.focus(); }
    });
    window.addEventListener('resize', function () { if (isOpen()) position(); });
    window.addEventListener('scroll', function () { if (isOpen()) position(); }, { passive: true });
  }

  function init() {
    menus.forEach(function (menu) {
      var existing = document.querySelector('.cz-mega[data-key="' + menu.key + '"]');
      if (existing) {
        var bound = document.querySelector('[data-cz-trigger="' + menu.key + '"]');
        // React re-renders replace the header nodes; rebind when the trigger we
        // attached to is gone, otherwise leave the working instance alone.
        if (bound && bound.isConnected) return;
        existing.remove();
      }
      bind(menu);
    });
  }

  // React-rendered homepages hydrate after DOMContentLoaded, so run again once
  // the page has settled and rebind anything React replaced.
  init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);
  setTimeout(init, 900);
  setTimeout(init, 2200);
})();
