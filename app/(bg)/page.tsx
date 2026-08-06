import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AdminPostControls from '@/components/admin/AdminPostControls';
import HomePost from '@/components/HomePost';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getHomePosts } from '@/lib/data/home-posts';
import { placeRef, villagePlace } from '@/lib/jsonld';
import { languageAlternates, paths } from '@/lib/routes';
import { OG_IMAGES, abs } from '@/lib/site';

/** Static while USE_SUPABASE is false; revalidates hourly once posts come from the database. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Николово — село в област Хасково край язовир Тракиец',
  description:
    'Николово — село в област Хасково, България, на 24 км от Хасково край язовир Тракиец. История, забележителности, галерия и как да стигнете до селото.',
  keywords: [
    'Николово',
    'село Николово',
    'област Хасково',
    'язовир Тракиец',
    'Ески кьой',
    'история на Николово',
    'забележителности Николово',
  ],
  alternates: { canonical: '/', languages: languageAlternates('home') },
  openGraph: {
    type: 'website',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'Николово — село в област Хасково край язовир Тракиец',
    description:
      'Село с дълга памет край язовир Тракиец, на 24 км от Хасково. История, забележителности и как да стигнете.',
    url: '/',
    images: [
      {
        url: OG_IMAGES.hero.url,
        width: OG_IMAGES.hero.width,
        height: OG_IMAGES.hero.height,
        alt: OG_IMAGES.hero.alt.bg,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Николово — село в област Хасково',
    description:
      'Село край язовир Тракиец, на 24 км от Хасково. История, забележителности и как да стигнете.',
    images: [{ url: OG_IMAGES.hero.url, alt: OG_IMAGES.hero.alt.bg }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${abs('/')}#website`,
      url: abs('/'),
      name: 'Николово',
      description: 'Официален сайт за село Николово, област Хасково.',
      inLanguage: 'bg',
      about: placeRef(),
    },
    villagePlace('bg'),
  ],
};

export default async function HomePage() {
  const posts = await getHomePosts();

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="home" />

      <main className="fade">
        <div className="container hero">
          <div className="hero-media">
            <Image
              className="hero-img"
              src="/images/nikolovo-yazovir-trakiec.jpg"
              width={1600}
              height={1200}
              alt={OG_IMAGES.hero.alt.bg}
              priority
              sizes="100vw"
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="eyebrow hero-eyebrow">Област Хасково · България</p>
              <h1 className="hero-title">Николово</h1>
              <p className="hero-sub">
                Село с дълга памет край язовир Тракиец, на 24 км от Хасково.
              </p>
            </div>
          </div>
        </div>

        <AdminPostControls locale="bg" />

        {posts.map((post, index) => (
          <HomePost key={post.id} post={post} locale="bg" index={index} isFirst={index === 0} />
        ))}

        <section className="cta">
          <div className="cta-inner">
            <div>
              <h2 className="cta-title">Елате до Николово</h2>
              <p className="cta-sub">На 24 км от Хасково — вижте как да стигнете.</p>
            </div>
            <Link className="btn-light" href={paths.gettingHere.bg}>
              Как да стигнете →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
