import type { Metadata } from 'next';
import AdminEventControls from '@/components/admin/AdminEventControls';
import EventPost from '@/components/EventPost';
import JsonLd from '@/components/JsonLd';
import Pagination from '@/components/Pagination';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getEventsPaged } from '@/lib/data/events';
import { eventsJsonLd } from '@/lib/jsonld';
import { imageUrl } from '@/lib/media';
import { EVENTS_PER_PAGE, eventsPath, totalPages } from '@/lib/pagination';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await getEventsPaged({ page: 1, perPage: EVENTS_PER_PAGE });
  const latestImage = events[0]?.media.find((m) => m.kind === 'image');
  const image = latestImage
    ? { url: imageUrl(latestImage.path), width: latestImage.width, height: latestImage.height, alt: latestImage.alt.en }
    : { url: OG_IMAGES.events.url, width: OG_IMAGES.events.width, height: OG_IMAGES.events.height, alt: OG_IMAGES.events.alt.en };

  return {
    title: 'Events in the village of Nikolovo — news and celebrations | Haskovo Province',
    description:
      'Events from the village of Nikolovo, Haskovo Province — celebrations, fairs and moments from village life. How we marked 24 May at the community centre (chitalishte).',
    keywords: [
      'Nikolovo events',
      '24 May Nikolovo',
      'Nikolovo chitalishte',
      'Nikolovo news',
      'Nikolovo village celebrations',
    ],
    alternates: { canonical: '/en/events', languages: languageAlternates('events') },
    openGraph: {
      type: 'article',
      siteName: 'Nikolovo',
      locale: 'en_US',
      alternateLocale: 'bg_BG',
      title: 'Events in the village of Nikolovo',
      description:
        'Celebrations, fairs and moments from village life — how we marked 24 May at the community centre.',
      url: '/en/events',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Events in the village of Nikolovo',
      description: 'Celebrations and moments from village life.',
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

export default async function EnEventsPage() {
  const { events, total } = await getEventsPaged({ page: 1, perPage: EVENTS_PER_PAGE });
  const pages = totalPages(total);

  return (
    <>
      <JsonLd data={eventsJsonLd(events, 'en')} />
      <SiteHeader locale="en" current="events" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Events</p>
          <h1 className="page-title">Life in Nikolovo</h1>
          <p className="intro">
            News and moments from the village — celebrations, fairs and everyday life, told in
            photos and video.
          </p>
        </div>

        <div className="page-body">
          <AdminEventControls locale="en" />

          {events.map((event) => (
            <EventPost key={event.id} event={event} locale="en" />
          ))}
        </div>

        <Pagination
          locale="en"
          page={1}
          totalPages={pages}
          hrefFor={(num) => eventsPath('en', num)}
        />
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
