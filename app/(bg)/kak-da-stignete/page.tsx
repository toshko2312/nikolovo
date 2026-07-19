import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { breadcrumbs } from '@/lib/jsonld';
import { languageAlternates, paths } from '@/lib/routes';
import { GEO, GOOGLE_MAPS_URL, OSM_EMBED_URL, OSM_LARGE_MAP_URL, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Как да стигнете до Николово — на 24 км от Хасково',
  description:
    'Как да стигнете до село Николово, област Хасково: с автомобил (~24 км, около 30 минути от Хасково) или с автобус. Карта и координати на селото.',
  keywords: [
    'как да стигна до Николово',
    'Николово карта',
    'разстояние Хасково Николово',
    'Николово координати',
    'автобус до Николово',
  ],
  alternates: { canonical: '/kak-da-stignete', languages: languageAlternates('gettingHere') },
  openGraph: {
    type: 'website',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'Как да стигнете до Николово — на 24 км от Хасково',
    description: 'С автомобил или автобус от Хасково. Карта и координати на селото.',
    url: '/kak-da-stignete',
    images: [{ url: '/favicon.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Как да стигнете до Николово',
    description: 'На 24 км от Хасково — с автомобил или автобус. Карта и координати.',
    images: ['/favicon.svg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Place',
      name: 'Николово',
      description: 'Село в област Хасково, България, на около 24 км от град Хасково.',
      url: abs(paths.gettingHere.bg),
      hasMap: GOOGLE_MAPS_URL,
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Област Хасково',
        addressCountry: 'BG',
      },
    },
    breadcrumbs('bg', 'gettingHere'),
  ],
};

export default function GettingHerePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="gettingHere" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Местоположение</p>
          <h1 className="page-title">Как да стигнете</h1>
          <p className="intro">
            Николово се намира в област Хасково, на около 24 км от град Хасково.
          </p>
        </div>

        <div className="page-body">
          <div className="loc-grid">
            <div className="loc-cards">
              <div className="info-card">
                <span className="eyebrow">С автомобил</span>
                <p>
                  От Хасково се пътува около 24 км, приблизително 30 минути по пътя в посока селото.
                </p>
              </div>
              <div className="info-card">
                <span className="eyebrow">С автобус</span>
                <p>
                  От автогара Хасково има междуградски линии до околните села.{' '}
                  <span className="mono">(уточни разписание)</span>
                </p>
              </div>
              <div className="info-card">
                <span className="eyebrow">Координати</span>
                <p>
                  Област Хасково, България ·{' '}
                  <span className="mono" style={{ fontSize: 13 }}>
                    {GEO.latitude}° N, {GEO.longitude}° E
                  </span>
                </p>
              </div>
              <a className="btn-accent" href={GOOGLE_MAPS_URL} target="_blank" rel="noopener">
                <span style={{ fontSize: 18, lineHeight: 1 }}>➜</span> Навигирай с Google Карти
              </a>
            </div>

            <div>
              <div className="map-frame">
                <iframe title="Карта на Николово" src={OSM_EMBED_URL} loading="lazy" />
              </div>
              <div className="map-meta">
                <span className="mono">Николово, област Хасково.</span>
                <a
                  className="link-accent"
                  href={OSM_LARGE_MAP_URL}
                  target="_blank"
                  rel="noopener"
                >
                  Отвори по-голяма карта →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
