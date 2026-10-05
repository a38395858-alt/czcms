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

const local = (file: string) => `/assets/nl-template/images/${file}`;

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
  'hero-port-warehouse': generated('global-us-freight-hero-v1.jpg', 16208362),
  // German site: black-and-white Hamburg transshipment harbor (real photography).
  'de-hero-hafen': stock(27055613),
  // French site: colorful containers + cranes, poster-friendly (real photography).
  'fr-hero-port': stock(37914074),
  // Spanish site: port cranes at sunset — warm light that matches the Mediterranean palette.
  'es-hero-puerto': stock(16208362),
  // Italian site: container ship from the air on open water — the Mediterranean crossing.
  'it-hero-porto': stock(11820859),
  // Dutch site: container ship at the Port of Rotterdam, lit up at night (real photography).
  'nl-hero-haven': stock(15348180),
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
};

export function getMedia(id: string): MediaAsset {
  const entry = MEDIA[id];
  if (entry) return { id, ...entry };
  return { id: 'hero-port-warehouse', ...MEDIA['hero-port-warehouse'] };
}
