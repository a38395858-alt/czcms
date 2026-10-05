/**
 * English Global template fonts (Barlow Semi Condensed, IBM Plex Sans/Mono).
 * Loaded at runtime only while the English site is active so the German template never
 * triggers a third-party font request.
 */
const HREF =
  'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';

export function ensureEnFonts() {
  if (document.getElementById('fv-en-fonts')) return;
  const preconnect = (href: string, crossOrigin?: boolean) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', true);
  const stylesheet = document.createElement('link');
  stylesheet.id = 'fv-en-fonts';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = HREF;
  document.head.appendChild(stylesheet);
}
