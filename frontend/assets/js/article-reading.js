/* Core anchors/navigation are server rendered; JS only tracks reading position. */
(() => {
  const page = document.querySelector('[data-reading-page]');
  if (!page) return;
  const contents = page.querySelector('.reading-contents');
  const links = Array.from(page.querySelectorAll('.reading-contents a'));
  const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  const compact = matchMedia('(max-width:960px)');
  const adapt = () => { if (contents) contents.open = !compact.matches; };
  adapt(); compact.addEventListener('change', adapt);
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.isIntersecting);
    if (!entry) return;
    for (const link of links) {
      if (decodeURIComponent(link.hash.slice(1)) === entry.target.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin:'-100px 0px -55% 0px', threshold:0 });
  headings.forEach(heading => observer.observe(heading));
})();
