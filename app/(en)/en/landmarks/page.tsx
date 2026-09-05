import type { Metadata } from 'next';
import AdminLandmarkControls from '@/components/admin/AdminLandmarkControls';
import JsonLd from '@/components/JsonLd';
import LandmarkCard from '@/components/LandmarkCard';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getLandmarkCards } from '@/lib/data/landmark-cards';
import { breadcrumbs, villagePlace } from '@/lib/jsonld';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Landmarks in Nikolovo — church, museum, Trakiets Reservoir',
  description:
    'What to see in the village of Nikolovo, Haskovo Province: the Orthodox church, the village museum, the Trakiets Reservoir, the village square and the old houses.',
  keywords: [
    'Nikolovo landmarks',
    'Nikolovo museum',
    'Nikolovo church',
    'Trakiets Reservoir',
    'what to see in Nikolovo',
  ],
  alternates: { canonical: '/en/landmarks', languages: languageAlternates('landmarks') },
  openGraph: {
    type: 'website',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'Landmarks in Nikolovo — church, museum, Trakiets Reservoir',
    description: 'The spots worth seeing in Nikolovo.',
    url: '/en/landmarks',
    images: [{ url: OG_IMAGES.hero.url }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landmarks in Nikolovo',
    description: 'Church, museum, Trakiets Reservoir, square and the old houses.',
    images: [OG_IMAGES.hero.url],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [villagePlace('en'), breadcrumbs('en', 'landmarks')],
};

export default async function EnLandmarksPage() {
  const cards = await getLandmarkCards();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="landmarks" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Landmarks</p>
          <h1 className="page-title">Places in the village</h1>
          <p className="intro">The spots worth seeing in Nikolovo.</p>
        </div>

        <div className="page-body">
          <AdminLandmarkControls locale="en" />

          <div className="cards">
            {cards.map((card) => (
              <LandmarkCard key={card.id} card={card} locale="en" />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
