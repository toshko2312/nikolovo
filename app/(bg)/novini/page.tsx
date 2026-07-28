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
  alt: OG_IMAGES.hero.alt.bg,
};

export const metadata: Metadata = {
  title: 'Новини от село Николово | Област Хасково',
  description:
    'Новини и съобщения от село Николово, област Хасково — обяви на кметството, видео и публикации за селото.',
  keywords: [
    'Николово новини',
    'село Николово съобщения',
    'кметство Николово',
    'новини област Хасково',
  ],
  alternates: { canonical: '/novini', languages: languageAlternates('news') },
  openGraph: {
    type: 'article',
    siteName: 'Николово',
    locale: 'bg_BG',
    alternateLocale: 'en_US',
    title: 'Новини от село Николово',
    description: 'Съобщения, обяви и публикации за живота в селото.',
    url: '/novini',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Новини от село Николово',
    description: 'Съобщения, обяви и публикации за живота в селото.',
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
};

export default async function NewsPage() {
  const { news, total } = await getNewsPaged({ page: 1, perPage: NEWS_PER_PAGE });
  const pages = totalPages(total, NEWS_PER_PAGE);

  return (
    <>
      <JsonLd data={newsJsonLd(news, 'bg')} />
      <SiteHeader locale="bg" current="news" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Новини</p>
          <h1 className="page-title">Какво ново в Николово</h1>
          <p className="intro">
            Съобщения от кметството, публикации за селото и видео, което си струва да се види.
          </p>
        </div>

        <div className="page-body">
          <AdminNewsControls locale="bg" />

          {news.map((item) => (
            <NewsPost key={item.id} item={item} locale="bg" />
          ))}
        </div>

        <Pagination
          locale="bg"
          page={1}
          totalPages={pages}
          hrefFor={(num) => newsPath('bg', num)}
        />
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
