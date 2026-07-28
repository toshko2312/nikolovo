import { imageUrl, isoDuration, videoUrl } from './media';
import { navLabels, paths, type Locale } from './routes';
import type { EventRecord, NewsRecord } from './types';
import { SITE_URL, abs } from './site';

const REGION: Record<Locale, string> = { bg: 'Област Хасково', en: 'Haskovo Province' };
const VILLAGE: Record<Locale, string> = { bg: 'Николово', en: 'Nikolovo' };

function absolute(url: string): string {
  return url.startsWith('http') ? url : new URL(url, SITE_URL).toString();
}

export function placeAbout(locale: Locale) {
  return {
    '@type': 'Place',
    name: VILLAGE[locale],
    address: {
      '@type': 'PostalAddress',
      addressRegion: REGION[locale],
      addressCountry: 'BG',
    },
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
      ...(firstImage ? { image: absolute(imageUrl(firstImage.path)) } : {}),
      about: placeAbout(locale),
      ...(videos.length
        ? {
            video: videos.map((video) => ({
              '@type': 'VideoObject',
              name: video.title[locale],
              description: video.description[locale],
              thumbnailUrl: absolute(imageUrl(video.thumbnailPath)),
              uploadDate: event.date,
              contentUrl: absolute(videoUrl(video.path)),
              duration: isoDuration(video.durationSeconds),
            })),
          }
        : {}),
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [...postings, breadcrumbs(locale, 'events')],
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
    about: placeAbout(locale),
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [...postings, breadcrumbs(locale, 'news')],
  };
}
