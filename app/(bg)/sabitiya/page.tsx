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
import { EVENTS_PER_PAGE, totalPages } from '@/lib/pagination';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

/** Static while USE_SUPABASE is false; revalidates hourly once events come from the database. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await getEventsPaged({ page: 1, perPage: EVENTS_PER_PAGE });
  const latestImage = events[0]?.media.find((m) => m.kind === 'image');
  const image = latestImage
    ? { url: imageUrl(latestImage.path), width: latestImage.width, height: latestImage.height, alt: latestImage.alt.bg }
    : { url: OG_IMAGES.events.url, width: OG_IMAGES.events.width, height: OG_IMAGES.events.height, alt: OG_IMAGES.events.alt.bg };

  return {
    title: 'Събития в село Николово — новини и празници | Област Хасково',
    description:
      'Събития от село Николово, област Хасково — празници, събори и мигове от живота в селото. Как отбелязахме 24 май в Читалището.',
    keywords: [
      'Николово събития',
      '24 май Николово',
      'Читалище Николово',
      'новини Николово',
      'село Николово празници',
    ],
    alternates: { canonical: '/sabitiya', languages: languageAlternates('events') },
    openGraph: {
      type: 'article',
      siteName: 'Николово',
      locale: 'bg_BG',
      alternateLocale: 'en_US',
      title: 'Събития в село Николово',
      description:
        'Празници, събори и мигове от живота в селото — как отбелязахме 24 май в Читалището.',
      url: '/sabitiya',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Събития в село Николово',
      description: 'Празници и мигове от живота в селото.',
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

export default async function EventsPage() {
  const { events, total } = await getEventsPaged({ page: 1, perPage: EVENTS_PER_PAGE });
  const pages = totalPages(total);

  return (
    <>
      <JsonLd data={eventsJsonLd(events, 'bg')} />
      <SiteHeader locale="bg" current="events" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Събития</p>
          <h1 className="page-title">Живот в Николово</h1>
          <p className="intro">
            Новини и мигове от селото — празници, събори и делник, разказани в снимки и видео.
          </p>
        </div>

        <div className="page-body">
          <AdminEventControls locale="bg" />

          {events.map((event) => (
            <EventPost key={event.id} event={event} locale="bg" />
          ))}
        </div>

        <Pagination locale="bg" page={1} totalPages={pages} />
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
