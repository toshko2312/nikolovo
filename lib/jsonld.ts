import { imageUrl, isoDuration, videoUrl } from './media';
import { navLabels, paths, type Locale } from './routes';
import type { EventRecord, NewsRecord } from './types';
import { GEO, GOOGLE_MAPS_URL, OG_IMAGES, VILLAGE, abs } from './site';

/** Every Place node on the site is this one entity, so they all share an @id. */
export const PLACE_ID = `${abs('/')}#place`;

const PLACE_DESCRIPTION: Record<Locale, string> = {
  bg: 'Село в област Хасково, България, край язовир Тракиец, на 24 км от Хасково.',
  en: 'A village in Haskovo Province, Bulgaria, by the Trakiets Reservoir, 24 km from Haskovo.',
};

/** Historical names, per the timeline on /istoriya: Ески кьой to 1906, Старо село 1906–1950. */
const ALSO_KNOWN_AS: Record<Locale, string[]> = {
  bg: ['Ески кьой', 'Старо село'],
  en: ['Eski Köy', 'Staro Selo'],
};

/**
 * Bare reference to the village node. Only valid on a page whose @graph also
 * contains villagePlace() — a dangling @id gives a single-page reader nothing.
 */
export function placeRef() {
  return { '@id': PLACE_ID };
}

/**
 * The one canonical village node. The same @id appears on every page, so the body
 * must not diverge between call sites: conflicting triples under one @id are worse
 * than no markup at all. sameAs/identifier are what separate this Николово from the
 * Ruse and Montana villages of the same name.
 */
export function villagePlace(locale: Locale) {
  const other: Locale = locale === 'bg' ? 'en' : 'bg';

  return {
    '@type': ['Place', 'TouristDestination'],
    '@id': PLACE_ID,
    name: VILLAGE.name[locale],
    alternateName: [...ALSO_KNOWN_AS[locale], VILLAGE.name[other]],
    description: PLACE_DESCRIPTION[locale],
    url: abs(paths.home[locale]),
    image: abs(OG_IMAGES.hero.url),
    // sameAs asserts identity, not language, so both sitelinks belong on both locales.
    sameAs: [
      VILLAGE.wikidata,
      encodeURI(VILLAGE.wikipedia[locale]),
      encodeURI(VILLAGE.wikipedia[other]),
    ],
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'https://www.wikidata.org/prop/direct/P3990',
      name: 'EKATTE',
      value: VILLAGE.ekatte,
    },
    geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
    address: {
      '@type': 'PostalAddress',
      addressLocality: VILLAGE.name[locale],
      addressRegion: VILLAGE.region[locale],
      postalCode: VILLAGE.postalCode,
      addressCountry: VILLAGE.country,
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      '@id': VILLAGE.municipality.wikidata,
      name: VILLAGE.municipality.name[locale],
      sameAs: VILLAGE.municipality.wikidata,
    },
    hasMap: GOOGLE_MAPS_URL,
  };
}

/** Home → current page trail, matching the BreadcrumbList on the original pages. */
export function breadcrumbs(locale: Locale, page: keyof typeof paths) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: navLabels.home[locale],
        item: abs(paths.home[locale]),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: navLabels[page][locale],
        item: abs(paths[page][locale]),
      },
    ],
  };
}

/** One BlogPosting per event, each carrying its videos as nested VideoObjects. */
export function eventsJsonLd(events: EventRecord[], locale: Locale) {
  const pageUrl = abs(paths.events[locale]);

  const postings = events.map((event) => {
    const firstImage = event.media.find((m) => m.kind === 'image');
    const videos = event.media.filter((m) => m.kind === 'video');

    return {
      '@type': 'BlogPosting',
      headline: event.title[locale],
      description: event.description[locale],
      inLanguage: locale,
      datePublished: event.date,
      dateModified: event.date,
      mainEntityOfPage: pageUrl,
      ...(firstImage ? { image: abs(imageUrl(firstImage.path)) } : {}),
      about: placeRef(),
      ...(videos.length
        ? {
            video: videos.map((video) => ({
              '@type': 'VideoObject',
              name: video.title[locale],
              description: video.description[locale],
              thumbnailUrl: abs(imageUrl(video.thumbnailPath)),
              uploadDate: event.date,
              contentUrl: abs(videoUrl(video.path)),
              duration: isoDuration(video.durationSeconds),
            })),
          }
        : {}),
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [...postings, villagePlace(locale), breadcrumbs(locale, 'events')],
  };
}

/** One BlogPosting per news item; a linked page becomes its `url`. */
export function newsJsonLd(items: NewsRecord[], locale: Locale) {
  const pageUrl = abs(paths.news[locale]);

  const postings = items.map((item) => ({
    '@type': 'BlogPosting',
    headline: item.title[locale],
    description: item.description[locale],
    inLanguage: locale,
    datePublished: item.date,
    dateModified: item.date,
    mainEntityOfPage: pageUrl,
    ...(item.link ? { url: item.link } : {}),
    about: placeRef(),
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [...postings, villagePlace(locale), breadcrumbs(locale, 'news')],
  };
}
