import { homePosts as localPosts } from '@/content/home-posts';
import type { HomePostImage, HomePostRecord, HomePostRow } from '@/lib/types';
import { anonClient, useSupabase } from './supabase';

const COLUMNS =
  'id, sort_order, eyebrow_bg, eyebrow_en, title_bg, title_en, body_bg, body_en, image_path, image_width, image_height, image_alt_bg, image_alt_en, link_page, link_text_bg, link_text_en';

function toPost(row: HomePostRow): HomePostRecord {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    eyebrow: { bg: row.eyebrow_bg, en: row.eyebrow_en },
    title: { bg: row.title_bg, en: row.title_en },
    body: { bg: row.body_bg ?? '', en: row.body_en ?? '' },
    image:
      row.image_path && row.image_width && row.image_height
        ? {
            path: row.image_path,
            width: row.image_width,
            height: row.image_height,
            alt: { bg: row.image_alt_bg ?? '', en: row.image_alt_en ?? '' },
          }
        : null,
    link:
      row.link_page && row.link_text_bg && row.link_text_en
        ? { page: row.link_page, text: { bg: row.link_text_bg, en: row.link_text_en } }
        : null,
  };
}

async function fetchFromSupabase(): Promise<HomePostRecord[]> {
  const client = anonClient();
  const { data, error } = await client.from('home_posts').select(COLUMNS).order('sort_order');
  if (error) throw new Error(`Failed to load home posts: ${error.message}`);

  return ((data ?? []) as unknown as HomePostRow[]).map(toPost);
}

export async function getHomePosts(): Promise<HomePostRecord[]> {
  if (useSupabase()) return fetchFromSupabase();

  return localPosts.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getHomePostById(id: string): Promise<HomePostRecord | null> {
  const all = await getHomePosts();
  return all.find((post) => post.id === id) ?? null;
}

/**
 * home_posts has no stable key — the local fallback ids are semantic while the database
 * mints uuids — so the museum post is found by its title in either language.
 */
const MUSEUM_TITLES = ['Музеят на селото', 'The village museum'];

/**
 * The history page's aside shows whatever photo the landing page's museum post is showing,
 * rather than a path of its own. Replacing that photo deletes the old storage object, so a
 * copied path here would silently break; reading it live never can.
 */
export async function getMuseumImage(): Promise<HomePostImage | null> {
  const posts = await getHomePosts();
  const museum = posts.find(
    (post) => MUSEUM_TITLES.includes(post.title.bg.trim()) || MUSEUM_TITLES.includes(post.title.en.trim()),
  );
  return museum?.image ?? null;
}
