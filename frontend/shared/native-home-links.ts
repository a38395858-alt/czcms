/** Keep form state when homepage URLs differ only by a trailing slash. */
export function sameDocumentAnchor(href: string, current: string): string | undefined {
  const destination = new URL(href, current);
  const page = new URL(current);
  const path = (value: string) => value.replace(/\/$/, '') || '/';
  if (destination.hash && destination.origin === page.origin && path(destination.pathname) === path(page.pathname)
    && (!destination.search || destination.search === page.search)) return destination.hash;
  return undefined;
}

/** Resolve the imported demos' routes to the CMS pages on each site's origin.
 * A fragment is used only for an actual section of the homepage. */
export function nativeHomeHref(to: string, context: {locale: string; languages: Record<string, string>}): string | undefined {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to)) return to;
  let path = to.startsWith('#/') ? to.slice(1) : to;
  if (!path.startsWith('/')) return to;
  const parts = path.split('/').filter(Boolean);
  const explicit = ['en','de','fr','es','it','nl'].includes(parts[0]);
  const locale = explicit ? parts.shift()! : context.locale;
  const base = (context.languages[locale] ?? context.languages[context.locale] ?? '/').replace(/\/$/, '');
  path = parts.join('/');
  if (!path) return `${base}/`;
  if (path.startsWith('#')) return `${base}/${path}`;
  const [first, ...rest] = parts;
  const tail = rest.join('/');
  const about: Record<string,string> = {en:'about',de:'ueber-uns',fr:'a-propos',es:'quienes-somos',it:'chi-siamo',nl:'over-ons'};
  const contact: Record<string,string> = {en:'contact',de:'kontakt',fr:'contact',es:'contacto',it:'contatti',nl:'contact'};
  const anchors: Record<string,string> = {aanvraag:'aanvraag',anfrage:'anfrage',demande:'demande',solicitud:'solicitud',richiesta:'richiesta',enquiry:'enquiry',proces:'proces',ablauf:'ablauf',methode:'methode',metodo:'metodo',process:'process'};
  if (anchors[path]) return `${base}/#${anchors[path]}`;
  if (['about','ueber-uns','a-propos','quienes-somos','chi-siamo','over-ons'].includes(path)) return `${base}/${about[locale]}`;
  if (['contact','contact-us','kontakt','contacto','contatti'].includes(path)) return `${base}/${contact[locale]}`;
  if (['guides','insights','ratgeber','guias','guide','bronnen'].includes(first)) {
    return `${base}/guides${tail==='ship-from-china-to-amazon-fba'?`/${tail}`:''}`;
  }
  if (['solutions','loesungen','soluciones','servizi','services','diensten'].includes(first)) {
    const sourcing = ['product-sourcing','sourcing-en-chine','busqueda-de-proveedores-en-china','ricerca-fornitori-in-cina','produktbeschaffung'];
    if (sourcing.includes(tail)) return `${base}/product-sourcing`;
    const aliases: Record<string,string> = {
      'emballage-et-image-de-marque':'packaging-branding','embalaje-y-marca':'packaging-branding','imballaggio-e-brand':'packaging-branding',
      'entreposage-et-logistique-e-commerce':'inventory-storage','almacenaje-y-logistica-e-commerce':'inventory-storage','magazzino-e-logistica-e-commerce':'inventory-storage',
      'warehousing-fulfillment':'inventory-storage','private-label':'private-white-label','marca-propia-y-marca-blanca':'private-white-label',
    };
    const native = ['bulk-procurement','packaging-branding','inventory-storage','private-white-label','worldwide-fulfillment'];
    const target = aliases[tail] ?? (native.includes(tail) ? tail : '');
    return `${base}/services${target?`/${target}`:''}`;
  }
  if (path==='product-sourcing') return `${base}/${path}`;
  if (['industries','secteurs','sectores','settori','sectoren','branchen'].includes(first)) {
    const aliases: Record<string,string> = {
      'biens-de-consommation':'consumer-goods','bienes-de-consumo':'consumer-goods','beni-di-consumo':'consumer-goods',
      'composants-industriels':'industrial-components','componentes-industriales':'industrial-components','componenti-industriali':'industrial-components',
      'e-commerce-et-distribution':'cross-border-ecommerce','e-commerce-y-retail':'cross-border-ecommerce','e-commerce-e-retail':'cross-border-ecommerce',
      'fret-urgent':'time-critical-cargo','carga-urgente':'time-critical-cargo','spedizioni-urgenti':'time-critical-cargo',
    };
    const native=['consumer-goods','industrial-components','cross-border-ecommerce','time-critical-cargo'];
    const target=aliases[tail]??(native.includes(tail)?tail:'');
    return `${base}/industries${target?`/${target}`:''}`;
  }
  const policyAliases: Record<string,string> = {juridisch:'bedrijfsgegevens',cookie:'cookies','politica-de-cookies':'cookies'};
  const policies=['privacy','datenschutz','confidentialite','privacidad','cookies','cookie','politica-de-cookies','terms','agb','cgv','condiciones','condizioni','voorwaarden','legal','impressum','mentions-legales','aviso-legal','note-legali','bedrijfsgegevens','juridisch'];
  if (policies.includes(path)) return `${base}/${policyAliases[path]??path}`;
  // Unknown demo routes must not silently become a different CMS content page.
  return undefined;
}
