/* ==========================================================================
   Unified enquiry form
   Topic pages render a 22-field bespoke form; the homepage renders the short
   CMS form that posts to /home-enquiry. This replaces the topic form with the
   homepage form so every surface collects and submits the same way.
   Runs after the topic application has committed hydration.
   ========================================================================== */
(function () {
  'use strict';

  var COPY = {
  "en": {
    "labels": [
      "Name",
      "Work email",
      "Company",
      "Where should we start?",
      "What is moving?"
    ],
    "options": [
      "Product sourcing",
      "Ocean freight",
      "Air freight",
      "Warehousing & fulfillment",
      "Packaging & branding",
      "Not sure yet"
    ],
    "placeholder": "Share the product, origin, destination, quantity, target date, or a product link.",
    "consent": "I agree that FreightVanta may use these details to review my request and follow up with me, as described in the privacy policy.",
    "button": "Request a shipment plan →",
    "phone": false,
    "origin": false,
    "destination": false,
    "privacy": "/privacy"
  },
  "de": {
    "labels": [
      "Name",
      "Geschäftliche E-Mail",
      "Unternehmen",
      "Telefon (optional)",
      "Abgangsort",
      "Zielort",
      "Wo sollen wir beginnen?",
      "Was wird bewegt?"
    ],
    "options": [
      "Beschaffung in China",
      "Seefracht",
      "Luftfracht",
      "Lager & Fulfillment",
      "Verpackung & Marke",
      "Noch nicht sicher"
    ],
    "placeholder": "Produkt, Menge, Start, Ziel, gewünschter Termin oder Produktlink.",
    "consent": "Ich habe die Datenschutzerklärung zur Kenntnis genommen und bin einverstanden, dass FreightVanta meine Angaben zur Bearbeitung meiner Anfrage und zur Kontaktaufnahme verarbeitet.",
    "button": "Angebot anfordern →",
    "phone": true,
    "origin": true,
    "destination": true,
    "privacy": "/datenschutz"
  },
  "fr": {
    "labels": [
      "Nom",
      "E-mail professionnel",
      "Entreprise",
      "Téléphone (facultatif)",
      "Origine",
      "Destination",
      "Par où souhaitez-vous commencer ?",
      "Que devez-vous faire voyager ?"
    ],
    "options": [
      "Sourcing en Chine",
      "Fret maritime",
      "Fret aérien",
      "Entreposage et logistique e-commerce",
      "Emballage et image de marque",
      "Je ne sais pas encore"
    ],
    "placeholder": "Produit, quantité, origine, destination, date visée ou lien produit.",
    "consent": "J’ai pris connaissance de la politique de confidentialité et j’accepte que FreightVanta traite mes données pour étudier ma demande et me recontacter.",
    "button": "Demander un plan d’expédition →",
    "phone": true,
    "origin": true,
    "destination": true,
    "privacy": "/confidentialite"
  },
  "es": {
    "labels": [
      "Nombre *",
      "Correo profesional *",
      "Empresa",
      "Teléfono (opcional)",
      "Origen",
      "Destino",
      "¿Por dónde quiere empezar?",
      "¿Qué hay que mover? *"
    ],
    "options": [
      "Búsqueda de proveedores en China",
      "Transporte marítimo",
      "Transporte aéreo",
      "Almacenaje y logística e-commerce",
      "Embalaje y marca",
      "Todavía no lo sé"
    ],
    "placeholder": "Producto, cantidad, origen, destino, fecha objetivo o enlace de producto.",
    "consent": "He leído y acepto la política de privacidad. Consiento que FreightVanta trate mis datos para gestionar mi solicitud y ponerse en contacto conmigo.",
    "button": "Solicitar plan de envío →",
    "phone": true,
    "origin": true,
    "destination": true,
    "privacy": "/privacidad"
  },
  "it": {
    "labels": [
      "Nome *",
      "E-mail di lavoro *",
      "Azienda",
      "Telefono (facoltativo)",
      "Origine",
      "Destinazione",
      "Da dove desidera iniziare?",
      "Che cosa deve spostare? *"
    ],
    "options": [
      "Ricerca fornitori in Cina",
      "Trasporto marittimo",
      "Trasporto aereo",
      "Magazzino e logistica e-commerce",
      "Imballaggio e brand",
      "Non lo so ancora"
    ],
    "placeholder": "Prodotto, quantità, origine, destinazione, data obiettivo o link al prodotto.",
    "consent": "Ho letto l’informativa privacy e acconsento al trattamento dei miei dati per la gestione della richiesta e per essere ricontattato.",
    "button": "Richiedi un piano di spedizione →",
    "phone": true,
    "origin": true,
    "destination": true,
    "privacy": "/privacy"
  }
};

  var ctxEl = document.getElementById('freightvanta-cms-context');
  if (!ctxEl) return;
  var ctx;
  try { ctx = JSON.parse(ctxEl.textContent); } catch (e) { return; }

  var lang = (ctx.locale || document.documentElement.lang || 'en').split('-')[0].toLowerCase();
  var copy = COPY[lang];
  if (!copy) return;

  var base = ctx.basePath || '';
  var words = {
    sending: { en: 'Sending…', de: 'Wird gesendet…', fr: 'Envoi en cours…', es: 'Enviando…', it: 'Invio in corso…' }[lang] || 'Sending…',
    ok: { en: 'Your request has been received.', de: 'Ihre Anfrage ist eingegangen.', fr: 'Votre demande a bien été reçue.', es: 'Hemos recibido tu solicitud.', it: 'La richiesta è stata ricevuta.' }[lang] || 'Received.',
    fail: { en: 'Unable to send. Please try again.', de: 'Senden fehlgeschlagen. Bitte erneut versuchen.', fr: 'Échec de l’envoi. Veuillez réessayer.', es: 'No se pudo enviar. Inténtalo de nuevo.', it: 'Invio non riuscito. Riprova.' }[lang] || 'Please try again.',
    stale: { en: 'Refresh this page and try again.', de: 'Bitte die Seite neu laden.', fr: 'Actualisez cette page.', es: 'Actualiza la página.', it: 'Aggiorna la pagina.' }[lang] || 'Refresh the page.',
    required: { en: 'Fields marked with * are required.', de: 'Mit * gekennzeichnete Felder sind Pflichtfelder.', fr: 'Les champs marqués d’un * sont obligatoires.', es: 'Los campos con * son obligatorios.', it: 'I campi con * sono obbligatori.' }[lang] || 'Fields marked with * are required.',
    start: { en: 'Where should we start?', de: 'Wo sollen wir beginnen?', fr: 'Par où souhaitez-vous commencer ?', es: '¿Por dónde quiere empezar?', it: 'Da dove desidera iniziare?' }[lang] || 'Where should we start?',
    brief: { en: 'What is moving?', de: 'Was wird bewegt?', fr: 'Que devez-vous faire voyager ?', es: '¿Qué hay que mover?', it: 'Che cosa deve spostare?' }[lang] || 'What is moving?',
  };

  var POINTS = ['product-sourcing', 'ocean-freight', 'air-freight', 'warehousing-fulfillment', 'packaging-branding', 'not-sure'];

  function field(name, label, attrs) {
    var wrap = document.createElement('div');
    wrap.className = 'cz-enq-field';
    var id = 'cz-enq-' + name;
    var lab = document.createElement('label');
    lab.setAttribute('for', id);
    lab.innerHTML = label;
    wrap.appendChild(lab);
    var input = document.createElement(attrs.tag || 'input');
    input.id = id;
    input.name = name;
    if (attrs.type) input.type = attrs.type;
    if (attrs.autocomplete) input.autocomplete = attrs.autocomplete;
    if (attrs.placeholder) input.placeholder = attrs.placeholder;
    if (attrs.required) { input.required = true; lab.innerHTML = label + ' <span class="cz-enq-req" aria-hidden="true">*</span>'; }
    if (attrs.tag === 'textarea') input.rows = 4;
    wrap.appendChild(input);
    return wrap;
  }

  function build() {
    var form = document.createElement('form');
    form.className = 'cz-enq';
    form.noValidate = false;
    form.setAttribute('data-cz-enquiry', '1');

    var note = document.createElement('p');
    note.className = 'cz-enq-note';
    note.textContent = words.required;
    form.appendChild(note);

    var grid = document.createElement('div');
    grid.className = 'cz-enq-grid';

    grid.appendChild(field('name', copy.labels[0], { autocomplete: 'name', required: true }));
    grid.appendChild(field('email', copy.labels[1], { type: 'email', autocomplete: 'email', required: true }));
    grid.appendChild(field('company', copy.labels[2], { autocomplete: 'organization' }));
    if (copy.phone) grid.appendChild(field('phone', copy.labels[3], { type: 'tel', autocomplete: 'tel' }));
    if (copy.origin) grid.appendChild(field('origin', copy.labels[copy.phone ? 4 : 3], {}));
    if (copy.destination) grid.appendChild(field('destination', copy.labels[copy.phone ? 5 : 4], {}));

    // starting point
    var startWrap = document.createElement('div');
    startWrap.className = 'cz-enq-field';
    var startLab = document.createElement('label');
    startLab.setAttribute('for', 'cz-enq-start');
    startLab.textContent = words.start;
    var sel = document.createElement('select');
    sel.id = 'cz-enq-start';
    sel.name = 'starting_point';
    copy.options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.textContent = o;
      sel.appendChild(opt);
    });
    startWrap.appendChild(startLab);
    startWrap.appendChild(sel);
    grid.appendChild(startWrap);

    // brief
    var briefWrap = document.createElement('div');
    briefWrap.className = 'cz-enq-field cz-enq-field-wide';
    var briefLab = document.createElement('label');
    briefLab.setAttribute('for', 'cz-enq-brief');
    briefLab.textContent = words.brief;
    var ta = document.createElement('textarea');
    ta.id = 'cz-enq-brief';
    ta.name = 'brief';
    ta.rows = 4;
    ta.placeholder = copy.placeholder;
    briefWrap.appendChild(briefLab);
    briefWrap.appendChild(ta);
    grid.appendChild(briefWrap);

    form.appendChild(grid);

    // consent
    var consent = document.createElement('label');
    consent.className = 'cz-enq-consent';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'consent';
    cb.required = true;
    var cspan = document.createElement('span');
    cspan.textContent = copy.consent;
    consent.appendChild(cb);
    consent.appendChild(cspan);
    form.appendChild(consent);

    // honeypot
    var trap = document.createElement('input');
    trap.name = 'website';
    trap.hidden = true;
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    form.appendChild(trap);

    var button = document.createElement('button');
    button.type = 'submit';
    button.className = 'cz-enq-submit';
    button.textContent = copy.button;
    form.appendChild(button);

    var status = document.createElement('p');
    status.className = 'cz-enq-status';
    status.hidden = true;
    form.appendChild(status);

    return form;
  }

  function wire(form) {
    var started = Date.now();
    var status = form.querySelector('.cz-enq-status');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.getAttribute('aria-busy') === 'true' || !form.reportValidity()) return;
      var button = form.querySelector('.cz-enq-submit');
      var original = button.textContent;
      var val = function (n) { var el = form.elements.namedItem(n); return el && el.value ? el.value.trim() : ''; };
      var sel = form.querySelector('select[name="starting_point"]');
      var payload = {
        site_id: ctx.siteId,
        locale: ctx.locale,
        form_token: ctx.formToken,
        website: val('website'),
        form_started_at: started,
        full_name: val('name'),
        work_email: val('email'),
        company: val('company'),
        phone: val('phone'),
        origin: val('origin'),
        destination: val('destination'),
        starting_point: POINTS[sel ? sel.selectedIndex : 5] || 'not-sure',
        cargo_details: val('brief'),
        consent: !!form.querySelector('input[name="consent"]:checked'),
        placement: 'home-enquiry',
      };
      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.textContent = words.sending;
      status.hidden = true;
      fetch(base + '/home-enquiry', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (response.status !== 201 || data.submitted !== true) {
            throw new Error(response.status === 403 ? words.stale : response.status === 409 ? words.ok : words.fail);
          }
          status.setAttribute('role', 'status');
          status.textContent = words.ok + ' ' + (data.reference || '');
          form.reset();
        });
      }).catch(function (error) {
        status.setAttribute('role', 'alert');
        status.textContent = error.message || words.fail;
      }).then(function () {
        status.hidden = false;
        status.focus();
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.textContent = original;
      });
    });
  }

  var SECTION_IDS = ['topic-enquiry', 'topic-anfrage', 'topic-demande', 'topic-solicitud',
    'topic-richiesta', 'topic-aanvraag', 'enquiry', 'anfrage', 'demande', 'solicitud',
    'richiesta', 'aanvraag'];

  function findHost() {
    for (var i = 0; i < SECTION_IDS.length; i++) {
      var section = document.getElementById(SECTION_IDS[i]);
      if (!section) continue;
      var inside = section.querySelector('form');
      if (inside) return inside;
    }
    // Fall back to the form with the most fields that is not in the chrome.
    var forms = [].slice.call(document.querySelectorAll('form')).filter(function (f) {
      return !f.closest('header, nav, footer') && f.getAttribute('data-cz-enquiry') !== '1';
    });
    if (!forms.length) return null;
    forms.sort(function (a, b) {
      return b.querySelectorAll('input,select,textarea').length - a.querySelectorAll('input,select,textarea').length;
    });
    return forms[0];
  }

  function replace() {
    var host = findHost();
    if (!host) return false;
    if (host.getAttribute('data-cz-enquiry') === '1') return true;
    var form = build();
    host.parentNode.replaceChild(form, host);
    wire(form);
    return true;
  }

  function init() { replace(); }

  // Loading the document does not mean lazy React modules have hydrated yet.
  // Use the application commit signal instead of guessing with timeouts.
  if (document.documentElement.dataset.topicHydrated === 'true') init();
  else document.addEventListener('freightvanta:topic-ready', init, { once: true });
})();
