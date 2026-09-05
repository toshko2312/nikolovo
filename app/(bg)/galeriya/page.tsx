import type { Metadata } from 'next';
import AdminGalleryControls from '@/components/admin/AdminGalleryControls';
import GalleryPhoto from '@/components/GalleryPhoto';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getGalleryPhotos } from '@/lib/data/gallery-photos';
import { breadcrumbs, villagePlace } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';

/** Static while USE_SUPABASE is false; revalidates hourly once photos come from the database. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Галерия — село Николово в кадри | Област Хасково',
  description:
    'Фотогалерия на село Николово, област Хасково — панорами, храмът, язовир Тракиец, старите къщи, музеят и природата около селото.',
  keywords: [
    'Николово снимки',
    'галерия Николово',
    'село Николово фотографии',
    'язовир Тракиец снимки',
  ],
  alternates: { canonical: '/galeriya', languages: languageAlternates('gallery') },
  openGraph: {
    type: 'website',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'Галерия — село Николово в кадри',
    description: 'Селото в кадри — панорами, храм, язовир, къщи и природа.',
    url: '/galeriya',
    images: [{ url: '/favicon.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Галерия — село Николово',
    description: 'Селото в кадри.',
    images: ['/favicon.svg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [villagePlace('bg'), breadcrumbs('bg', 'gallery')],
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="gallery" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Галерия</p>
          <h1 className="page-title">Селото в кадри</h1>
        </div>

        <div className="page-body">
          <AdminGalleryControls locale="bg" />

          <div className="gallery">
            {photos.map((photo) => (
              <GalleryPhoto key={photo.id} photo={photo} locale="bg" />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
