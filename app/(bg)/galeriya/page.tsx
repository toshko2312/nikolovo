import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import ZoomableImage from '@/components/ZoomableImage';
import { breadcrumbs } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';

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

const jsonLd = { '@context': 'https://schema.org', ...breadcrumbs('bg', 'gallery') };

const leadingPlaceholders = [
  { chip: 'снимка · панорама', height: 300 },
  { chip: 'снимка · храм', height: 220 },
];

const trailingPlaceholders = [
  { chip: 'снимка · къщи', height: 240 },
  { chip: 'снимка · музей', height: 320 },
  { chip: 'снимка · събор', height: 210 },
  { chip: 'снимка · околности', height: 280 },
  { chip: 'снимка · площад', height: 230 },
  { chip: 'снимка · природа', height: 300 },
];

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="gallery" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Галерия</p>
          <h1 className="page-title">Селото в кадри</h1>
          <p className="intro">Замести плейсхолдерите със снимки на Николово.</p>
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
                alt="Язовир Тракиец край село Николово, област Хасково"
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

      <SiteFooter locale="bg" />
    </>
  );
}
