const root = document.querySelector('[data-taric]');
if (root) {
  const context = JSON.parse(document.getElementById('taric-context').textContent);
  const c = context.copy;
  const toast = root.querySelector('[data-taric-toast]');
  let toastTimer;
  const enableCopy = () => root.querySelectorAll('[data-taric-copy]').forEach(button => { button.disabled = false; });
  enableCopy();
  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-taric-copy]');
    if (!button) return;
    let copied = false;
    try { await navigator.clipboard.writeText(button.dataset.taricCopy); copied = true; }
    catch {
      const field = document.createElement('textarea');
      field.value = button.dataset.taricCopy;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field); field.select();
      try { copied = document.execCommand('copy'); } catch { /* Manual fallback below. */ }
      field.remove(); button.focus();
    }
    toast.textContent = copied ? c.copied : `${c.copyError} ${button.dataset.taricCopy}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); toast.textContent = ''; }, 5000);
  });

  const searchForm = root.querySelector('[data-taric-search]');
  const results = root.querySelector('[data-taric-results]');
  let searchTimer, searchController, searchSequence = 0;
  if (results) {
    const query = searchForm.elements.q;
    const loadSearch = async (url, history = true) => {
      const sequence = ++searchSequence;
      searchController?.abort(); searchController = new AbortController();
      results.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(url, {signal: searchController.signal, headers: {'Accept': 'text/html'}});
        if (!response.ok) throw new Error(c.error);
        const document = new DOMParser().parseFromString(await response.text(), 'text/html');
        const content = document.querySelector('[data-taric-results]');
        if (!content) throw new Error(c.error);
        if (sequence !== searchSequence) return;
        results.replaceChildren(...content.childNodes);
        enableCopy();
        if (history) window.history.replaceState(null, '', url);
      } catch (error) {
        if (error.name === 'AbortError' || sequence !== searchSequence) return;
        const message = document.createElement('p'); message.className = 'taric-feedback'; message.setAttribute('role', 'alert'); message.textContent = c.error;
        const retry = document.createElement('a'); retry.href = url; retry.textContent = c.retry; message.append(' ', retry);
        results.replaceChildren(message);
      } finally { if (sequence === searchSequence) results.setAttribute('aria-busy', 'false'); }
    };
    const searchURL = () => `${context.baseURL}?${new URLSearchParams({q: query.value.trim()})}`;
    query.addEventListener('input', () => { clearTimeout(searchTimer); searchController?.abort(); ++searchSequence; searchTimer = setTimeout(() => loadSearch(searchURL()), 300); });
    searchForm.addEventListener('submit', event => { event.preventDefault(); clearTimeout(searchTimer); loadSearch(searchURL()); });
    window.addEventListener('popstate', () => { query.value = new URLSearchParams(location.search).get('q') || ''; loadSearch(location.href, false); });
  }

  const measureForm = root.querySelector('[data-taric-measures]');
  if (measureForm) {
    const output = root.querySelector('[data-taric-measure-output]');
    const button = measureForm.querySelector('button');
    const officialLinks = root.querySelectorAll('[data-taric-measure-link]');
    const validOrigins = new Set(context.originCodes);
    const selectedSource = () => {
      const origin = measureForm.elements.origin, date = measureForm.elements.date;
      if (!origin.validity.valid || !date.validity.valid || !validOrigins.has(origin.value.trim().toUpperCase())) return null;
      const source = new URL('https://ec.europa.eu/taxation_customs/dds2/taric/measures.jsp');
      source.search = new URLSearchParams({Lang: context.language, Taric: context.code, Area: origin.value.trim().toUpperCase(), SimDate: date.value.replaceAll('-', '')});
      return source.href;
    };
    const updateOfficialLinks = source => officialLinks.forEach(link => {
      if (source) { link.href = source; link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.setAttribute('tabindex', '-1'); }
    });
    updateOfficialLinks(selectedSource());
    let controller, sequence = 0;
    const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
    const renderMeasures = data => {
      const fragment = document.createDocumentFragment();
      if (data.stale) fragment.append(el('p', c.stale, 'taric-feedback'));
      fragment.append(el('p', `${c.origin}: ${data.origin} · ${c.measureDate}: ${data.date} · ${c.checked}: ${new Date(data.checkedAt).toLocaleString(context.language)}`, 'taric-measure-meta'));
      const table = el('table', '', 'data-table taric-measure-table');
      table.append(el('caption', c.measures, 'sr-only'));
      const head = el('thead'), header = el('tr'), labels = [c.measures, c.rate, c.area, c.regulation];
      labels.forEach(label => { const th = el('th', label); th.scope = 'col'; header.append(th); }); head.append(header); table.append(head);
      const body = el('tbody');
      data.items.forEach(item => {
        const row = el('tr');
        [item.description, item.rate || c.noRate, item.area, item.regulation || c.unavailable].forEach((text, i) => {
          const cell = el('td', '', ''); cell.dataset.label = labels[i]; cell.append(el(i === 1 ? 'strong' : 'span', text));
          if (i === 0 && item.conditional) cell.append(el('small', c.conditional));
          row.append(cell);
        }); body.append(row);
      }); table.append(body); fragment.append(table, el('p', c.conditionText, 'small-note')); output.replaceChildren(fragment);
      updateOfficialLinks(data.sourceURL);
    };
    const selectionChanged = () => { ++sequence; controller?.abort(); output.replaceChildren(el('p', c.measureInitial, 'taric-feedback')); output.setAttribute('aria-busy', 'false'); button.disabled = false; updateOfficialLinks(selectedSource()); };
    measureForm.addEventListener('input', selectionChanged);
    measureForm.addEventListener('change', selectionChanged);
    measureForm.addEventListener('submit', async event => {
      event.preventDefault(); if (!measureForm.reportValidity()) return;
      const current = ++sequence;
      controller?.abort(); controller = new AbortController(); button.disabled = true;
      output.setAttribute('aria-busy', 'true');
      const message = el('p', c.loading, 'taric-feedback'); message.setAttribute('role', 'status'); output.replaceChildren(message);
      const params = new URLSearchParams({lang: context.language, code: context.code, origin: measureForm.elements.origin.value.trim().toUpperCase(), date: measureForm.elements.date.value});
      updateOfficialLinks(selectedSource());
      try {
        const response = await fetch(`/api/public/taric-measures?${params}`, {signal: controller.signal});
        const data = await response.json();
        if (!response.ok) throw new Error(response.status === 400 ? c.inputError : c.measureError);
        if (current !== sequence) return;
        renderMeasures(data);
      } catch (error) {
        if (error.name === 'AbortError' || current !== sequence) return;
        const message = el('p', error.message || c.measureError, 'taric-feedback'); message.setAttribute('role', 'alert'); output.replaceChildren(message);
      } finally { if (current === sequence) { output.setAttribute('aria-busy', 'false'); button.disabled = false; } }
    });
  }
}
