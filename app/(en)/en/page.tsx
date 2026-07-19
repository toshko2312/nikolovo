import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AdminPostControls from '@/components/admin/AdminPostControls';
import HomePost from '@/components/HomePost';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getHomePosts } from '@/lib/data/home-posts';
import { languageAlternates, paths } from '@/lib/routes';
import { GEO, GOOGLE_MAPS_URL, OG_IMAGES, abs } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Nikolovo — a village in Haskovo Province by the Trakiets Reservoir',
  description:
    'Nikolovo — a village in Haskovo Province, Bulgaria, 24 km from Haskovo by the Trakiets Reservoir. History, landmarks, gallery and how to get to the village.',
  keywords: [
    'Nikolovo',
    'Nikolovo village',
    'Haskovo Province',
    'Trakiets Reservoir',
    'Eski Köy',
    'history of Nikolovo',
    'Nikolovo landmarks',
  ],
  alternates: { canonical: '/en', languages: languageAlternates('home') },
  openGraph: {
    type: 'website',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'Nikolovo — a village in Haskovo Province by the Trakiets Reservoir',
    description:
      'A village with a long memory by the Trakiets Reservoir, 24 km from Haskovo. History, landmarks and how to get there.',
    url: '/en',
    images: [
      {
        url: OG_IMAGES.hero.url,
        width: OG_IMAGES.hero.width,
        height: OG_IMAGES.hero.height,
        alt: OG_IMAGES.hero.alt.en,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nikolovo — a village in Haskovo Province',
    description:
      'A village by the Trakiets Reservoir, 24 km from Haskovo. History, landmarks and how to get there.',
    images: [{ url: OG_IMAGES.hero.url, alt: OG_IMAGES.hero.alt.en }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${abs('/')}#website`,
      url: abs('/en'),
      name: 'Nikolovo',
      description: 'Official website of the village of Nikolovo, Haskovo Province.',
      inLanguage: 'en',
    },
    {
      '@type': ['Place', 'TouristDestination'],
      '@id': `${abs('/')}#place`,
      name: 'Nikolovo',
      description:
        'A village in Haskovo Province, Bulgaria, by the Trakiets Reservoir, 24 km from Haskovo.',
      url: abs('/en'),
      image: abs(OG_IMAGES.hero.url),
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Haskovo Province',
        addressCountry: 'BG',
      },
      hasMap: GOOGLE_MAPS_URL,
    },
  ],
};

export default async function EnHomePage() {
  const posts = await getHomePosts();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="home" />

      <main className="fade">
        <div className="container hero">
          <div className="hero-media">
            <Image
              className="hero-img"
              src="/images/nikolovo-yazovir-trakiec.jpg"
              width={1600}
              height={1200}
              alt={OG_IMAGES.hero.alt.en}
              priority
              sizes="100vw"
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="eyebrow hero-eyebrow">Haskovo Province · Bulgaria</p>
              <h1 className="hero-title">Nikolovo</h1>
              <p className="hero-sub">
                A village with a long memory by the Trakiets Reservoir, 24 km from Haskovo.
              </p>
            </div>
          </div>
        </div>

        <AdminPostControls locale="en" />

        {posts.map((post, index) => (
          <HomePost key={post.id} post={post} locale="en" index={index} isFirst={index === 0} />
        ))}

        <section className="cta">
          <div className="cta-inner">
            <div>
              <h2 className="cta-title">Come to Nikolovo</h2>
              <p className="cta-sub">24 km from Haskovo — see how to get here.</p>
            </div>
            <Link className="btn-light" href={paths.gettingHere.en}>
              Getting here →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
