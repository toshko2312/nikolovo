import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { breadcrumbs } from '@/lib/jsonld';
import { languageAlternates, paths } from '@/lib/routes';
import {
  GEO,
  GOOGLE_MAPS_URL,
  OG_IMAGES,
  OSM_EMBED_URL,
  OSM_LARGE_MAP_URL,
  abs,
} from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to get to Nikolovo — 24 km from Haskovo',
  description:
    'How to get to the village of Nikolovo, Haskovo Province: by car (~24 km, about 30 minutes from Haskovo) or by bus. Map and coordinates of the village.',
  keywords: [
    'how to get to Nikolovo',
    'Nikolovo map',
    'Haskovo Nikolovo distance',
    'Nikolovo coordinates',
    'bus to Nikolovo',
  ],
  alternates: { canonical: '/en/getting-here', languages: languageAlternates('gettingHere') },
  openGraph: {
    type: 'website',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'How to get to Nikolovo — 24 km from Haskovo',
    description: 'By car or bus from Haskovo. Map and coordinates of the village.',
    url: '/en/getting-here',
    images: [{ url: OG_IMAGES.hero.url }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to get to Nikolovo',
    description: '24 km from Haskovo — by car or bus. Map and coordinates.',
    images: [OG_IMAGES.hero.url],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Place',
      name: 'Nikolovo',
      description: 'A village in Haskovo Province, Bulgaria, about 24 km from the town of Haskovo.',
      url: abs(paths.gettingHere.en),
      hasMap: GOOGLE_MAPS_URL,
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Haskovo Province',
        addressCountry: 'BG',
      },
    },
    breadcrumbs('en', 'gettingHere'),
  ],
};

export default function EnGettingHerePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="gettingHere" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Location</p>
          <h1 className="page-title">Getting here</h1>
          <p className="intro">
            Nikolovo is located in Haskovo Province, about 24 km from the town of Haskovo.
          </p>
        </div>

        <div className="page-body">
          <div className="loc-grid">
            <div className="loc-cards">
              <div className="info-card">
                <span className="eyebrow">By car</span>
                <p>
                  From Haskovo it is about 24 km, roughly 30 minutes along the road towards the
                  village.
                </p>
              </div>
              <div className="info-card">
                <span className="eyebrow">By bus</span>
                <p>
                  The Haskovo bus station runs intercity lines to the surrounding villages.{' '}
                  <span className="mono">(schedule TBC)</span>
                </p>
              </div>
              <div className="info-card">
                <span className="eyebrow">Coordinates</span>
                <p>
                  Haskovo Province, Bulgaria ·{' '}
                  <span className="mono" style={{ fontSize: 13 }}>
                    {GEO.latitude}° N, {GEO.longitude}° E
                  </span>
                </p>
              </div>
              <a className="btn-accent" href={GOOGLE_MAPS_URL} target="_blank" rel="noopener">
                <span style={{ fontSize: 18, lineHeight: 1 }}>➜</span> Navigate with Google Maps
              </a>
            </div>

            <div>
              <div className="map-frame">
                <iframe title="Map of Nikolovo" src={OSM_EMBED_URL} loading="lazy" />
              </div>
              <div className="map-meta">
                <span className="mono">Nikolovo, Haskovo Province.</span>
                <a className="link-accent" href={OSM_LARGE_MAP_URL} target="_blank" rel="noopener">
                  Open a larger map →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
