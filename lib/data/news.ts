import { news as localNews } from '@/content/news';
import type { NewsRecord, NewsRow } from '@/lib/types';
import { anonClient, useSupabase } from './supabase';

const NEWS_COLUMNS =
  'id, slug, published_at, published, title_bg, title_en, description_bg, description_en, link_url';

function toNews(row: NewsRow): NewsRecord {
  return {
    id: row.id,
    slug: row.slug,
    date: row.published_at,
    published: row.published,
    title: { bg: row.title_bg, en: row.title_en },
    description: { bg: row.description_bg ?? '', en: row.description_en ?? '' },
    link: row.link_url,
  };
}

function localSorted(includeUnpublished: boolean): NewsRecord[] {
  return localNews
    .filter((item) => includeUnpublished || item.published)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Newest first. Unpublished items are only ever returned for authenticated admin calls. */
export async function getNews({ includeUnpublished = false } = {}): Promise<NewsRecord[]> {
  if (!useSupabase()) return localSorted(includeUnpublished);

  const client = anonClient();
  let query = client.from('news').select(NEWS_COLUMNS).order('published_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load news: ${error.message}`);

  return ((data ?? []) as unknown as NewsRow[]).map(toNews);
}

export type NewsPage = { news: NewsRecord[]; total: number };

/** Same ordering as getNews, sliced to one page — used by the news list pages. */
export async function getNewsPaged({
  page = 1,
  perPage = 10,
  includeUnpublished = false,
}: { page?: number; perPage?: number; includeUnpublished?: boolean } = {}): Promise<NewsPage> {
  const offset = (page - 1) * perPage;

  if (useSupabase()) {
    const client = anonClient();
    let query = client
      .from('news')
      .select(NEWS_COLUMNS, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + perPage - 1);
    if (!includeUnpublished) query = query.eq('published', true);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to load news: ${error.message}`);

    const items = ((data ?? []) as unknown as NewsRow[]).map(toNews);
    return { news: items, total: count ?? items.length };
  }

  const all = localSorted(includeUnpublished);
  return { news: all.slice(offset, offset + perPage), total: all.length };
}
