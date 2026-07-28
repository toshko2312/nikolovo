import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import AdminNewsControls from '@/components/admin/AdminNewsControls';
import NewsPost from '@/components/NewsPost';
import Pagination from '@/components/Pagination';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getNewsPaged } from '@/lib/data/news';
import { NEWS_PER_PAGE, newsPath, totalPages } from '@/lib/pagination';
import { paths } from '@/lib/routes';

export const revalidate = 3600;

type Params = { params: Promise<{ num: string }> };

async function loadPage(numParam: string) {
  const page = Number(numParam);
  if (!Number.isInteger(page) || page < 1) return null;

  const { news, total } = await getNewsPaged({ page, perPage: NEWS_PER_PAGE });
  const pages = totalPages(total, NEWS_PER_PAGE);
  if (page > pages) return null;

  return { page, news, pages };
}

export async function generateStaticParams() {
  const { total } = await getNewsPaged({ page: 1, perPage: NEWS_PER_PAGE });
  const pages = totalPages(total, NEWS_PER_PAGE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ num: String(i + 2) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { num } = await params;
  const data = await loadPage(num);
  if (!data) return {};

  const canonical = newsPath('en', data.page);
  return {
    title: `News from the village of Nikolovo — page ${data.page} | Haskovo Province`,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        bg: newsPath('bg', data.page),
        en: canonical,
        'x-default': newsPath('bg', data.page),
      },
    },
  };
}

export default async function NewsPagedPage({ params }: Params) {
  const { num } = await params;

  if (num === '1') redirect(paths.news.en);

  const data = await loadPage(num);
  if (!data) notFound();

  return (
    <>
      <SiteHeader locale="en" current="news" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">News</p>
          <h1 className="page-title">What&rsquo;s new in Nikolovo</h1>
        </div>

        <div className="page-body">
          <AdminNewsControls locale="en" />

          {data.news.map((item) => (
            <NewsPost key={item.id} item={item} locale="en" />
          ))}
        </div>

        <Pagination
          locale="en"
          page={data.page}
          totalPages={data.pages}
          hrefFor={(n) => newsPath('en', n)}
        />
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
