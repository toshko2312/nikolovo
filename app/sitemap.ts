import type { MetadataRoute } from 'next';
import { getEvents } from '@/lib/data/events';
import { imageUrl, videoUrl } from '@/lib/media';
import { PAGE_ORDER, languageAlternates, paths, type Locale, type PageKey } from '@/lib/routes';
import { abs } from '@/lib/site';

export const revalidate = 3600;

const STATIC_LASTMOD = '2026-07-01';

const HERO_IMAGES = [
  abs('/images/nikolovo-yazovir-trakiec.jpg'),
  abs('/images/yazovir-trakiec.jpg'),
];

const RESERVOIR_IMAGE = [abs('/images/yazovir-trakiec.jpg')];

const pageMeta: Record<
  PageKey,
  { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; images?: string[] }
> = {
  home: { changeFrequency: 'monthly', priority: 1.0, images: HERO_IMAGES },
  events: { changeFrequency: 'weekly', priority: 0.9 },
  history: { changeFrequency: 'yearly', priority: 0.8 },
  landmarks: { changeFrequency: 'monthly', priority: 0.8, images: RESERVOIR_IMAGE },
  gettingHere: { changeFrequency: 'yearly', priority: 0.7 },
  gallery: { changeFrequency: 'monthly', priority: 0.7, images: RESERVOIR_IMAGE },
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const eventsLastmod = events[0]?.date ?? STATIC_LASTMOD;

  const eventImages = events.flatMap((event) =>
    event.media.filter((m) => m.kind === 'image').map((m) => abs(imageUrl(m.path))),
  );

  const entries: MetadataRoute.Sitemap = [];

  for (const key of PAGE_ORDER) {
    const meta = pageMeta[key];

    for (const locale of ['bg', 'en'] as Locale[]) {
      const isEvents = key === 'events';

      entries.push({
        url: abs(paths[key][locale]),
        lastModified: isEvents ? eventsLastmod : STATIC_LASTMOD,
        changeFrequency: meta.changeFrequency,
        priority: meta.priority,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languageAlternates(key)).map(([lang, path]) => [lang, abs(path)]),
          ),
        },
        ...(isEvents
          ? {
              images: eventImages,
              videos: events.flatMap((event) =>
                event.media
                  .filter((m) => m.kind === 'video')
                  .map((video) => ({
                    title: video.title[locale],
                    thumbnail_loc: abs(imageUrl(video.thumbnailPath)),
                    description: video.description[locale],
                    content_loc: abs(videoUrl(video.path)),
                    duration: video.durationSeconds,
                    publication_date: event.date,
                  })),
              ),
            }
          : {}),
        ...(!isEvents && meta.images ? { images: meta.images } : {}),
      });
    }
  }

  return entries;
}
