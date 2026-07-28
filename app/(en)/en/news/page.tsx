import type { Metadata } from 'next';
import AdminNewsControls from '@/components/admin/AdminNewsControls';
import JsonLd from '@/components/JsonLd';
import NewsPost from '@/components/NewsPost';
import Pagination from '@/components/Pagination';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getNewsPaged } from '@/lib/data/news';
import { newsJsonLd } from '@/lib/jsonld';
import { NEWS_PER_PAGE, newsPath, totalPages } from '@/lib/pagination';
import { languageAlternates } from '@/lib/routes';
import { OG_IMAGES } from '@/lib/site';

export const revalidate = 3600;

const OG_IMAGE = {
  url: OG_IMAGES.hero.url,
  width: OG_IMAGES.hero.width,
  height: OG_IMAGES.hero.height,
  alt: OG_IMAGES.hero.alt.en,
};

export const metadata: Metadata = {
  title: 'News from the village of Nikolovo | Haskovo Province',
  description:
    'News and announcements from the village of Nikolovo, Haskovo Province — notices from the town hall, video and coverage of the village.',
  keywords: [
    'Nikolovo news',
    'Nikolovo village announcements',
    'Nikolovo town hall',
    'Haskovo Province news',
  ],
  alternates: { canonical: '/en/news', languages: languageAlternates('news') },
  openGraph: {
    type: 'article',
    siteName: 'Nikolovo',
    locale: 'en_US',
    alternateLocale: 'bg_BG',
    title: 'News from the village of Nikolovo',
    description: 'Announcements, notices and coverage of life in the village.',
    url: '/en/news',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News from the village of Nikolovo',
    description: 'Announcements, notices and coverage of life in the village.',
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
};

export default async function NewsPage() {
  const { news, total } = await getNewsPaged({ page: 1, perPage: NEWS_PER_PAGE });
  const pages = totalPages(total, NEWS_PER_PAGE);

  return (
    <>
      <JsonLd data={newsJsonLd(news, 'en')} />
      <SiteHeader locale="en" current="news" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">News</p>
          <h1 className="page-title">What&rsquo;s new in Nikolovo</h1>
          <p className="intro">
            Notices from the town hall, coverage of the village, and video worth watching.
          </p>
        </div>

        <div className="page-body">
          <AdminNewsControls locale="en" />

          {news.map((item) => (
            <NewsPost key={item.id} item={item} locale="en" />
          ))}
        </div>

        <Pagination
          locale="en"
          page={1}
          totalPages={pages}
          hrefFor={(num) => newsPath('en', num)}
        />
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
