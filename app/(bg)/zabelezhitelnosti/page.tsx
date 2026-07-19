import type { Metadata } from 'next';
import AdminLandmarkControls from '@/components/admin/AdminLandmarkControls';
import JsonLd from '@/components/JsonLd';
import LandmarkCard from '@/components/LandmarkCard';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getLandmarkCards } from '@/lib/data/landmark-cards';
import { breadcrumbs } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';

/** Static while USE_SUPABASE is false; revalidates hourly once cards come from the database. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Забележителности в Николово — храм, музей, язовир Тракиец',
  description:
    'Какво да видите в село Николово, област Хасково: православният храм, музеят на селото, язовир Тракиец, селският площад и старите къщи.',
  keywords: [
    'забележителности Николово',
    'музей Николово',
    'храм Николово',
    'язовир Тракиец',
    'какво да видя в Николово',
  ],
  alternates: { canonical: '/zabelezhitelnosti', languages: languageAlternates('landmarks') },
  openGraph: {
    type: 'website',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'Забележителности в Николово — храм, музей, язовир Тракиец',
    description: 'Кътчетата, които си струва да видите в Николово.',
    url: '/zabelezhitelnosti',
    images: [{ url: '/favicon.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Забележителности в Николово',
    description: 'Храм, музей, язовир Тракиец, площад и старите къщи.',
    images: ['/favicon.svg'],
  },
};

const jsonLd = { '@context': 'https://schema.org', ...breadcrumbs('bg', 'landmarks') };

export default async function LandmarksPage() {
  const cards = await getLandmarkCards();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="landmarks" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Забележителности</p>
          <h1 className="page-title">Места в селото</h1>
          <p className="intro">
            Кътчетата, които си струва да видите в Николово.{' '}
            <span className="mono">(заместители — добави реални места и снимки)</span>
          </p>
        </div>

        <div className="page-body">
          <AdminLandmarkControls locale="bg" />

          <div className="cards">
            {cards.map((card) => (
              <LandmarkCard key={card.id} card={card} locale="bg" />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
