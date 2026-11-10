/* A direct WhatsApp handoff; no messages or personal data are collected here. */
(() => {
  const contact = document.querySelector('[data-whatsapp-contact]');
  if (!contact) return;
  const mobile = navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile) contact.href = contact.dataset.mobileHref;

  // Keep the compact mobile entry above a visible cookie preference prompt.
  const compact = window.matchMedia('(max-width: 640px)');
  let pending = false;
  const resize = new ResizeObserver(schedule);
  const observed = new WeakSet();
  function position() {
    pending = false;
    if (!compact.matches) return;
    let bottom = 24;
    for (const prompt of document.querySelectorAll('[role="region"][aria-label]')) {
      if (!observed.has(prompt)) { resize.observe(prompt); observed.add(prompt); }
      const rect = prompt.getBoundingClientRect();
      if (getComputedStyle(prompt).position === 'fixed' && rect.height > 0
        && rect.bottom >= innerHeight - 24 && rect.right > innerWidth - 80) {
        bottom = Math.max(bottom, innerHeight - rect.top + 12);
      }
    }
    const value = `${Math.min(bottom, innerHeight - 140)}px`;
    if (contact.style.getPropertyValue('--fv-whatsapp-bottom') !== value) contact.style.setProperty('--fv-whatsapp-bottom', value);
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(position); }
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
})();
