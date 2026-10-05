/**
 * Media registry. Section records reference media by `media_id`; alt text lives with the section
 * copy. Local assets are served from /public/images; each has a real-photo fallback so the page
 * never shows a broken image if a local asset is unavailable.
 */
export interface MediaAsset {
  id: string;
  src: string;
  srcSet?: string;
  fallbackSrc?: string;
  width: number;
  height: number;
}

type MediaEntry = Omit<MediaAsset, 'id'>;

const local = (file: string) => `./images/${file}`;

const pexelsUrl = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/** Real photography (Pexels) with responsive candidates at a 3:2 crop. */
const stock = (id: number): MediaEntry => ({
  src: pexelsUrl(id, 1400, 933),
  srcSet: [640, 960, 1400, 1800].map((w) => `${pexelsUrl(id, w, Math.round((w * 2) / 3))} ${w}w`).join(', '),
  width: 1400,
  height: 933,
});

const generated = (file: string, fallbackId: number): MediaEntry => ({
  src: local(file),
  fallbackSrc: pexelsUrl(fallbackId, 1400, 933),
  width: 1264,
  height: 848,
});

const MEDIA: Record<string, MediaEntry> = {
  /* ---------- English Global ---------- */
  'hero-port-warehouse': generated('global-us-freight-hero-v1.jpg', 16208362),
  'service-product-sourcing': generated('service-product-sourcing.jpg', 4968672),
  'service-ocean-freight': generated('service-ocean-freight.jpg', 3856433),
  'service-air-freight': generated('service-air-freight.jpg', 36622441),
  'service-customs': stock(7857567),
  'service-warehousing': generated('service-warehousing.jpg', 4483862),
  'service-packaging': generated('service-packaging.jpg', 7310095),
  'service-final-mile': generated('service-final-mile.jpg', 21838827),
  'service-private-label': generated('service-private-label.jpg', 4968613),
  'industry-receiving': generated('industry-receiving.jpg', 36696522),
  'industry-ecommerce': stock(4483862),
  'industry-consumer-goods': stock(6958455),
  'industry-industrial': stock(28752152),
  'industry-time-critical': stock(36194618),
  'guide-sourcing-brief': generated('guide-china-sourcing-brief.jpg', 4968672),
  'guide-ocean-air': stock(32307772),
  'guide-import-checklist': stock(6170452),
  'guide-packaging': stock(7310095),
  'guide-incoterms': stock(11820859),
  'guide-supplier-coordination': stock(4968613),

  /* ---------- Deutsch (Hanse Präzision) — authentic photography from Hamburg and North German logistics ---------- */
  'de-hero-hamburg': stock(30090435),
  'de-service-beschaffung': stock(4968672),
  'de-service-seefracht': stock(30733665),
  'de-service-luftfracht': stock(36622441),
  'de-service-zoll': stock(7857567),
  'de-service-lager': stock(4481529),
  'de-service-verpackung': stock(7310095),
  'de-service-nachlauf': stock(6169182),
  'de-service-private-label': stock(4968613),
  'de-industry-featured': stock(4483774),
  'de-industry-ecommerce': stock(4483862),
  'de-industry-konsumgueter': stock(6958455),
  'de-industry-industrie': stock(28752152),
  'de-industry-zeitkritisch': stock(36194618),
  'de-guide-checkliste': stock(6170452),
  'de-guide-verkehrstraeger': stock(30720851),
  'de-guide-sourcing': stock(4968672),
  'de-guide-verpackung': stock(7310095),
  'de-guide-incoterms': stock(30720853),
  'de-guide-lieferanten': stock(4968613),
  'de-about-speicherstadt': stock(29536801),
  'de-hafen-bw': stock(32201824),

  /* ---------- Français (Atelier Maritime) — real photography: ports, Seine-axis river freight, warehouses ---------- */
  'fr-hero-port': stock(24246926),
  'fr-service-sourcing': stock(4968672),
  'fr-service-maritime': stock(38941377),
  'fr-service-aerien': stock(36622441),
  'fr-service-douane': stock(7857567),
  'fr-service-entrepot': stock(4483774),
  'fr-service-emballage': stock(7310095),
  'fr-service-livraison': stock(6169182),
  'fr-service-mdd': stock(4968613),
  'fr-industry-featured': stock(1267329),
  'fr-industry-ecommerce': stock(4483862),
  'fr-industry-consommation': stock(6958455),
  'fr-industry-industrie': stock(28752152),
  'fr-industry-urgent': stock(36194618),
  'fr-guide-checklist': stock(6170452),
  'fr-guide-modes': stock(35871584),
  'fr-guide-sourcing': stock(4968672),
  'fr-guide-emballage': stock(7310095),
  'fr-guide-incoterms': stock(30115463),
  'fr-guide-fournisseurs': stock(4968613),
  'fr-about-havre': stock(29963097),

  /* ---------- Español (Mediterráneo) — real photography from the ports of Barcelona and Cádiz ---------- */
  'es-hero-puerto': stock(25381526),
  'es-service-proveedores': stock(5717895),
  'es-service-maritimo': stock(39269141),
  'es-service-aereo': stock(36622441),
  'es-service-aduana': stock(7680681),
  'es-service-almacen': stock(4487382),
  'es-service-embalaje': stock(7310095),
  'es-service-entrega': stock(21838827),
  'es-service-marca': stock(4968613),
  'es-industry-featured': stock(4483775),
  'es-industry-ecommerce': stock(4483862),
  'es-industry-consumo': stock(6958455),
  'es-industry-industria': stock(28752152),
  'es-industry-urgente': stock(36194618),
  'es-guide-checklist': stock(4506243),
  'es-guide-modos': stock(14776388),
  'es-guide-briefing': stock(4968672),
  'es-guide-embalaje': stock(7464382),
  'es-guide-incoterms': stock(38424254),
  'es-guide-proveedores': stock(4968613),
  'es-about-barcelona': stock(16857407),

  /* ---------- Italiano (Grafica Italiana) — real photography: Ligurian/Adriatic ports, terminals, warehouses ---------- */
  'it-hero-porto': stock(14989379),
  'it-service-fornitori': stock(5717895),
  'it-service-marittimo': stock(18998415),
  'it-service-aereo': stock(36622441),
  'it-service-dogana': stock(7680681),
  'it-service-magazzino': stock(4487364),
  'it-service-imballaggio': stock(7310095),
  'it-service-consegna': stock(6169182),
  'it-service-private-label': stock(4968613),
  'it-industry-featured': stock(24244234),
  'it-industry-ecommerce': stock(4483862),
  'it-industry-consumo': stock(6958455),
  'it-industry-industria': stock(28752152),
  'it-industry-urgente': stock(36194618),
  'it-guide-checklist': stock(6170452),
  'it-guide-modalita': stock(14776388),
  'it-guide-briefing': stock(4968672),
  'it-guide-imballaggio': stock(7310095),
  'it-guide-incoterms': stock(37978716),
  'it-guide-fornitori': stock(4968613),
  'it-about-porto': stock(33587048),
};

export function getMedia(id: string): MediaAsset {
  const entry = MEDIA[id];
  if (entry) return { id, ...entry };
  return { id: 'hero-port-warehouse', ...MEDIA['hero-port-warehouse'] };
}
