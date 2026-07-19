import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import ZoomableImage from '@/components/ZoomableImage';
import { breadcrumbs } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

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

const jsonLd = { '@context': 'https://schema.org', ...breadcrumbs('en', 'gallery') };

const leadingPlaceholders = [
  { chip: 'photo · panorama', height: 300 },
  { chip: 'photo · church', height: 220 },
];

const trailingPlaceholders = [
  { chip: 'photo · houses', height: 240 },
  { chip: 'photo · museum', height: 320 },
  { chip: 'photo · fair', height: 210 },
  { chip: 'photo · surroundings', height: 280 },
  { chip: 'photo · square', height: 230 },
  { chip: 'photo · nature', height: 300 },
];

export default function EnGalleryPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="gallery" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Gallery</p>
          <h1 className="page-title">The village in frames</h1>
          <p className="intro">Replace the placeholders with photos of Nikolovo.</p>
        </div>

        <div className="page-body">
          <div className="gallery">
            {leadingPlaceholders.map((item) => (
              <div className="gallery-item ph" style={{ height: item.height }} key={item.chip}>
                <div className="chip">{item.chip}</div>
              </div>
            ))}

            <div className="gallery-item">
              <ZoomableImage
                src="/images/yazovir-trakiec.jpg"
                width={675}
                height={348}
                alt="Aerial view of the Trakiets Reservoir near Nikolovo, Haskovo Province"
                sizes="(max-width: 700px) 100vw, 340px"
              />
            </div>

            {trailingPlaceholders.map((item) => (
              <div className="gallery-item ph" style={{ height: item.height }} key={item.chip}>
                <div className="chip">{item.chip}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
