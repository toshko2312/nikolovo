import type { Metadata } from 'next';
import AdminGalleryControls from '@/components/admin/AdminGalleryControls';
import GalleryPhoto from '@/components/GalleryPhoto';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getGalleryPhotos } from '@/lib/data/gallery-photos';
import { breadcrumbs, villagePlace } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

/** Static while USE_SUPABASE is false; revalidates hourly once photos come from the database. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gallery — the village of Nikolovo in frames | Haskovo Province',
  description:
    'Photo gallery of the village of Nikolovo, Haskovo Province — panoramas, the church, the Trakiets Reservoir, the old houses, the museum and the nature around the village.',
  keywords: [
    'Nikolovo photos',
    'Nikolovo gallery',
    'Nikolovo village photographs',
    'Trakiets Reservoir photos',
  ],
  alternates: { canonical: '/en/gallery', languages: languageAlternates('gallery') },
  openGraph: {
    type: 'website',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'Gallery — the village of Nikolovo in frames',
    description: 'The village in frames — panoramas, church, reservoir, houses and nature.',
    url: '/en/gallery',
    images: [{ url: OG_IMAGES.hero.url }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery — the village of Nikolovo',
    description: 'The village in frames.',
    images: [OG_IMAGES.hero.url],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [villagePlace('en'), breadcrumbs('en', 'gallery')],
};

export default async function EnGalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="gallery" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Gallery</p>
          <h1 className="page-title">The village in frames</h1>
        </div>

        <div className="page-body">
          <AdminGalleryControls locale="en" />

          <div className="gallery">
            {photos.map((photo) => (
              <GalleryPhoto key={photo.id} photo={photo} locale="en" />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
