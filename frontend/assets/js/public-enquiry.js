/* Native homepage and guide subscription forms share the CMS inbox. */
(() => {
  const source = document.getElementById('freightvanta-enquiry-context');
  if (!source) return;
  const context = JSON.parse(source.textContent);
  const words = {
    en: ['Sending…', 'Your request has been received.', 'Unable to send. Please try again.', 'This request was already received.', 'Refresh this page and try again.'],
    de: ['Wird gesendet…', 'Ihre Anfrage ist eingegangen.', 'Senden fehlgeschlagen. Bitte erneut versuchen.', 'Diese Anfrage ist bereits eingegangen.', 'Bitte die Seite neu laden und erneut versuchen.'],
    fr: ['Envoi en cours…', 'Votre demande a bien été reçue.', 'Échec de l’envoi. Veuillez réessayer.', 'Cette demande a déjà été reçue.', 'Actualisez cette page, puis réessayez.'],
    es: ['Enviando…', 'Hemos recibido tu solicitud.', 'No se pudo enviar. Inténtalo de nuevo.', 'Esta solicitud ya se ha recibido.', 'Actualiza la página e inténtalo de nuevo.'],
    it: ['Invio in corso…', 'La richiesta è stata ricevuta.', 'Invio non riuscito. Riprova.', 'Questa richiesta è già stata ricevuta.', 'Aggiorna la pagina e riprova.'],
    nl: ['Bezig met versturen…', 'Uw aanvraag is ontvangen.', 'Versturen mislukt. Probeer het opnieuw.', 'Deze aanvraag is al ontvangen.', 'Vernieuw de pagina en probeer het opnieuw.'],
  }[context.locale] || ['Sending…', 'Received.', 'Please try again.', 'Already received.', 'Refresh the page.'];
  document.querySelectorAll('[data-home-enquiry], [data-newsletter-form]').forEach(form => {
    const newsletter = form.hasAttribute('data-newsletter-form');
    const started = Date.now();
    const trap = document.createElement('input');
    trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.hidden = true; form.append(trap);
    const status = document.createElement('p'); status.className = 'enquiry-feedback'; status.hidden = true; status.tabIndex = -1; form.append(status);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.getAttribute('aria-busy') === 'true' || !form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      const original = button.innerHTML;
      const value = key => form.elements.namedItem(key)?.value?.trim() || '';
      const select = form.querySelector('select[name="starting_point"]');
      const point = ['product-sourcing','ocean-freight','air-freight','warehousing-fulfillment','packaging-branding','not-sure'][select?.selectedIndex] || 'not-sure';
      const payload = {site_id:context.siteId,locale:context.locale,form_token:context.formToken,website:value('website'),form_started_at:started,
        full_name:value('name'),work_email:value('email'),company:value('company'),phone:value('phone'),origin:value('origin'),destination:value('destination'),
        starting_point:point,cargo_details:value('brief'),consent:!!form.querySelector('input[type="checkbox"]:checked'),placement:newsletter?'guide-newsletter':form.dataset.placement==='contact'?'contact':'home-enquiry'};
      form.setAttribute('aria-busy','true'); button.disabled = true; button.textContent = words[0]; status.hidden = true;
      try {
        const response = await fetch(`${context.basePath}/${newsletter?'newsletter':'home-enquiry'}`, {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
        const data = await response.json().catch(() => ({}));
        if (response.status !== 201 || data.submitted !== true) throw new Error(response.status === 403 ? words[4] : response.status === 409 ? words[3] : words[2]);
        status.setAttribute('role','status'); status.textContent = `${words[1]} ${data.reference || ''}`; form.reset();
      } catch (error) { status.setAttribute('role','alert'); status.textContent = error.message || words[2]; }
      finally { status.hidden = false; status.focus(); form.removeAttribute('aria-busy'); button.disabled = false; button.innerHTML = original; }
    });
  });
})();
