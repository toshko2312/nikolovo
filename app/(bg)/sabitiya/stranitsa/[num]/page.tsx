import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import AdminEventControls from '@/components/admin/AdminEventControls';
import EventPost from '@/components/EventPost';
import Pagination from '@/components/Pagination';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getEventsPaged } from '@/lib/data/events';
import { EVENTS_PER_PAGE, eventsPath, totalPages } from '@/lib/pagination';
import { paths } from '@/lib/routes';

export const revalidate = 3600;

type Params = { params: Promise<{ num: string }> };

async function loadPage(numParam: string) {
  const page = Number(numParam);
  if (!Number.isInteger(page) || page < 1) return null;

  const { events, total } = await getEventsPaged({ page, perPage: EVENTS_PER_PAGE });
  const pages = totalPages(total);
  if (page > pages) return null;

  return { page, events, pages };
}

export async function generateStaticParams() {
  const { total } = await getEventsPaged({ page: 1, perPage: EVENTS_PER_PAGE });
  const pages = totalPages(total);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ num: String(i + 2) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { num } = await params;
  const data = await loadPage(num);
  if (!data) return {};

  const canonical = eventsPath('bg', data.page);
  return {
    title: `Събития в село Николово — страница ${data.page} | Област Хасково`,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        bg: canonical,
        en: eventsPath('en', data.page),
        'x-default': canonical,
      },
    },
  };
}

export default async function EventsPagedPage({ params }: Params) {
  const { num } = await params;

  if (num === '1') redirect(paths.events.bg);

  const data = await loadPage(num);
  if (!data) notFound();

  return (
    <>
      <SiteHeader locale="bg" current="events" />

      <main className="fade">
        <div className="page-head">
          <p className="page-eyebrow eyebrow">Събития</p>
          <h1 className="page-title">Живот в Николово</h1>
        </div>

        <div className="page-body">
          <AdminEventControls locale="bg" />

          {data.events.map((event) => (
            <EventPost key={event.id} event={event} locale="bg" />
          ))}
        </div>

        <Pagination
          locale="bg"
          page={data.page}
          totalPages={data.pages}
          hrefFor={(num) => eventsPath('bg', num)}
        />
      </main>

      <SiteFooter locale="bg" />
    </>
  );
}
