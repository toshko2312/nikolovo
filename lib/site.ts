import { imageUrl } from './media';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nikolovo.com';

export const GEO = {
  latitude: 41.82644947933966,
  longitude: 25.409095246009304,
} as const;

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/VVNS8qXDDmce1BBg8';

export const OSM_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=25.3691%2C41.8014%2C25.4491%2C41.8514&layer=mapnik&marker=41.82644947933966%2C25.409095246009304';

export const OSM_LARGE_MAP_URL =
  'https://www.openstreetmap.org/?mlat=41.82644947933966&mlon=25.409095246009304#map=14/41.8264/25.4091';

export const OG_IMAGES = {
  hero: {
    url: '/images/nikolovo-yazovir-trakiec.jpg',
    width: 1600,
    height: 1200,
    alt: {
      bg: 'Залез над язовир Тракиец край село Николово, област Хасково',
      en: 'Sunset over the Trakiets Reservoir near the village of Nikolovo, Haskovo Province',
    },
  },
  events: {
    // Fallback OG image if an event ever has no photo of its own. The file itself
    // only exists in Supabase Storage now, not in /public.
    url: imageUrl('24-mai-nikolovo-chitalishte-2026.jpg'),
    width: 1400,
    height: 1050,
    alt: {
      bg: 'Жени от Николово празнуват 24 май пред Читалището, област Хасково',
      en: 'Women from Nikolovo celebrating 24 May in front of the community centre, Haskovo Province',
    },
  },
} as const;

/** Absolute URL for JSON-LD and sitemap entries, which must not be relative. */
export function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}
