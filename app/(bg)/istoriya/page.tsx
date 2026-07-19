import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { breadcrumbs, placeAbout } from '@/lib/jsonld';
import { languageAlternates, paths } from '@/lib/routes';
import { abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'История на село Николово — от Ески кьой до днес',
  description:
    'Историята на село Николово, област Хасково: имената Ески кьой, Старо село и Николово (от 1950 г.), Никола Арнаудов и преданието за „Света Богородица“.',
  keywords: [
    'история на Николово',
    'Ески кьой',
    'Старо село',
    'Никола Арнаудов',
    'Николово област Хасково',
  ],
  alternates: { canonical: '/istoriya', languages: languageAlternates('history') },
  openGraph: {
    type: 'article',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'История на село Николово — от Ески кьой до днес',
    description: 'Имената на селото, Никола Арнаудов и преданието за „Света Богородица“.',
    url: '/istoriya',
    images: [{ url: '/favicon.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'История на село Николово',
    description: 'Ески кьой, Старо село, Николово — имената, хората и преданията.',
    images: ['/favicon.svg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'История на село Николово — от Ески кьой до днес',
      description: 'Имената на селото, Никола Арнаудов и преданието за „Света Богородица“.',
      inLanguage: 'bg',
      mainEntityOfPage: abs(paths.history.bg),
      about: placeAbout('bg'),
    },
    breadcrumbs('bg', 'history'),
  ],
};

export default function HistoryPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader locale="bg" current="history" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">История</p>
          <h1 className="page-title" style={{ maxWidth: 760 }}>
            Памет, имена и хора
          </h1>
          <p className="lede">
            Николово има интересна и интригуваща история, която вълнува неговите жители.
          </p>
        </div>

        <div className="page-body">
          <div className="hist-grid">
            <div>
              <h2>Имената на селото</h2>
              <p>
                До 1906 г. селото носи името <strong>Ески кьой</strong>. След това е преименувано на{' '}
                <strong>Старо село</strong>, а през 1950 г. получава днешното си име —{' '}
                <strong>Николово</strong>.
              </p>
              <p>
                Името е дадено в чест на Никола Арнаудов. Според разказите той се укривал около
                година в плевня край селото; обкръжен от полицията, сам сложил край на живота си.
              </p>
              <p>
                В селото живеят само православни християни, които пазят традициите и паметта на
                мястото.
              </p>

              <div className="quote">
                <span className="eyebrow">Предание</span>
                <p>
                  „Най-голямата църква в Хасково — „Света Богородица“ — е построена по проекта на
                  църквата в Николово.“
                </p>
              </div>
            </div>

            <aside>
              <div className="aside-media ph">
                <div className="chip" style={{ left: 14, bottom: 14 }}>
                  снимка · музеят / архив
                </div>
              </div>
              <p className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
                Хронология
              </p>
              <div className="timeline">
                <div className="t-item">
                  <div className="t-year">до 1906</div>
                  <div className="t-name">Ески кьой</div>
                </div>
                <div className="t-item">
                  <div className="t-year">1906 – 1950</div>
                  <div className="t-name">Старо село</div>
                </div>
                <div className="t-item now">
                  <div className="t-year">от 1950</div>
                  <div className="t-name">Николово</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
