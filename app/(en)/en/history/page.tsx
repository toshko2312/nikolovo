import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { breadcrumbs, placeRef, villagePlace } from '@/lib/jsonld';
import { languageAlternates, paths } from '@/lib/routes';
import { OG_IMAGES, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'History of the village of Nikolovo — from Eski Köy to today',
  description:
    'The history of the village of Nikolovo, Haskovo Province: the names Eski Köy, Staro Selo and Nikolovo (from 1950), Nikola Arnaudov and the legend of “Sveta Bogoroditsa”.',
  keywords: [
    'history of Nikolovo',
    'Eski Köy',
    'Staro Selo',
    'Nikola Arnaudov',
    'Nikolovo Haskovo Province',
  ],
  alternates: { canonical: '/en/history', languages: languageAlternates('history') },
  openGraph: {
    type: 'article',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'History of the village of Nikolovo — from Eski Köy to today',
    description: 'The names of the village, Nikola Arnaudov and the legend of “Sveta Bogoroditsa”.',
    url: '/en/history',
    images: [{ url: OG_IMAGES.hero.url }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'History of the village of Nikolovo',
    description: 'Eski Köy, Staro Selo, Nikolovo — the names, the people and the legends.',
    images: [OG_IMAGES.hero.url],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'History of the village of Nikolovo — from Eski Köy to today',
      description: 'The names of the village, Nikola Arnaudov and the legend of “Sveta Bogoroditsa”.',
      inLanguage: 'en',
      mainEntityOfPage: abs(paths.history.en),
      about: placeRef(),
    },
    villagePlace('en'),
    breadcrumbs('en', 'history'),
  ],
};

export default function EnHistoryPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="en" current="history" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">History</p>
          <h1 className="page-title" style={{ maxWidth: 760 }}>
            Memory, names and people
          </h1>
          <p className="lede">
            Nikolovo has an interesting and intriguing history that stirs its residents.
          </p>
        </div>

        <div className="page-body">
          <div className="hist-grid">
            <div>
              <h2>The names of the village</h2>
              <p>
                Until 1906 the village was named <strong>Eski Köy</strong>. It was then renamed{' '}
                <strong>Staro Selo</strong> (“Old Village”), and in 1950 it received its present
                name — <strong>Nikolovo</strong>.
              </p>
              <p>
                The name was given in honour of Nikola Arnaudov. As the story goes, he hid for about
                a year in a barn near the village; surrounded by the police, he took his own life.
              </p>
              <p>
                The village is home only to Orthodox Christians, who keep the traditions and the
                memory of the place.
              </p>

              <div className="quote">
                <span className="eyebrow">Legend</span>
                <p>
                  “The largest church in Haskovo — ‘Sveta Bogoroditsa’ — was built to the design of
                  the church in Nikolovo.”
                </p>
              </div>
            </div>

            <aside>
              <div className="aside-media ph">
                <div className="chip" style={{ left: 14, bottom: 14 }}>
                  photo · museum / archive
                </div>
              </div>
              <p className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
                Timeline
              </p>
              <div className="timeline">
                <div className="t-item">
                  <div className="t-year">until 1906</div>
                  <div className="t-name">Eski Köy</div>
                </div>
                <div className="t-item">
                  <div className="t-year">1906 – 1950</div>
                  <div className="t-name">Staro Selo</div>
                </div>
                <div className="t-item now">
                  <div className="t-year">from 1950</div>
                  <div className="t-name">Nikolovo</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
