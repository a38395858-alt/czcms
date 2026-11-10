const root = document.querySelector('[data-hts-detail]')
if (root) {
  const form = root.querySelector('form'), input = root.querySelector('#htd-query'), toast = root.querySelector('[data-copy-toast]')
  let toastTimer
  root.querySelector('[data-copy-code]').disabled = false
  form.addEventListener('submit', event => {
    const query = input.value.trim()
    if (!/^[0-9.\s]+$/.test(query)) return
    const digits = query.replace(/[.\s]/g, '')
    if (!/^\d{10}$/.test(digits)) return
    event.preventDefault()
    location.assign(form.action.replace(/\/$/, '') + '/' + digits)
  })
  const country = root.querySelector('#htd-origin'), title = root.querySelector('[data-origin-title]'), message = root.querySelector('[data-origin-message]'), link = root.querySelector('[data-origin-link]')
  const originGuidance = {
    CN: { title: 'China origin: check Chapter 99 and current trade measures.', text: 'Review Section 301 measures and any other applicable Chapter 99 duties, exclusions, trade remedies and fees for this exact HTS code. The General rate alone does not determine the final duty.', label: 'Review CBP Section 301 guidance', url: 'https://www.cbp.gov/trade/remedies/301-certain-products-china' },
    CA: { title: 'Canada origin: confirm origin rules and current measures.', text: 'USMCA preferential treatment depends on qualifying origin, documentation and the applicable tariff provision. Shipping from Canada alone does not establish eligibility. Check current measures and any exceptions before filing.', label: 'Review official CBP USMCA guidance', url: 'https://www.cbp.gov/trade/priority-issues/trade-agreements/free-trade-agreements/USMCA' },
    MX: { title: 'Mexico origin: confirm origin rules and current measures.', text: 'USMCA preferential treatment depends on qualifying origin, documentation and the applicable tariff provision. Shipping from Mexico alone does not establish eligibility. Check current measures and any exceptions before filing.', label: 'Review official CBP USMCA guidance', url: 'https://www.cbp.gov/trade/priority-issues/trade-agreements/free-trade-agreements/USMCA' },
    other: { title: 'Check the tariff treatment for the actual country of origin.', text: 'Review the applicable General or Special treatment, rules of origin, Chapter 99 measures, trade remedies and fees. A listed preference does not establish that your shipment qualifies.', label: 'Check official CBP duty guidance', url: 'https://www.cbp.gov/trade/programs-administration/determining-duty-rates' },
    '': { title: 'Additional measures need a separate check.', text: 'Chapter 99 measures such as Section 301, trade remedies, fees and legal notes may affect the final amount. A country selection alone does not establish an exemption or a final duty total.', label: 'Check official CBP duty guidance', url: 'https://www.cbp.gov/trade/programs-administration/determining-duty-rates' },
  }
  root.querySelector('[data-origin-controls]').hidden = false
  function updateOrigin() {
    const data = originGuidance[country.value] || originGuidance['']
    title.textContent = data.title; message.textContent = data.text; link.textContent = data.label + ' ↗'; link.href = data.url
  }
  country.addEventListener('change', updateOrigin)
  updateOrigin()
  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-code]')
    if (!button) return
    const code = button.dataset.copyCode
    clearTimeout(toastTimer)
    try {
      await navigator.clipboard.writeText(code)
      toast.textContent = 'Copied ' + code
      toastTimer = setTimeout(() => { toast.textContent = '' }, 3500)
    } catch {
      let label = root.querySelector('.copy-manual')
      if (!label) {
        label = document.createElement('label'); label.className = 'copy-manual'; label.textContent = 'Select and copy this 10-digit code:'
        const field = document.createElement('input'); field.readOnly = true; field.value = code; label.append(field)
        button.closest('.code-row').after(label)
      }
      label.querySelector('input').focus(); label.querySelector('input').select()
      toast.textContent = 'Automatic copy is unavailable. The code is selected for manual copying.'
    }
  })
  const links = Array.from(root.querySelectorAll('.side-nav a[href^="#"]'))
  const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean)
  let frame = 0
  function markSection() {
    frame = 0
    let current = sections[0]?.id
    for (const section of sections) if (section.getBoundingClientRect().top <= 155) current = section.id
    for (const anchor of links) {
      if (anchor.hash === '#' + current) anchor.setAttribute('aria-current', 'location')
      else anchor.removeAttribute('aria-current')
    }
  }
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(markSection) }, { passive: true })
  markSection()
}
