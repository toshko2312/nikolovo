'use server';

import { serviceClient } from '@/lib/data/supabase';
import { revalidateNewsPages } from '@/lib/revalidate';
import { slugify } from '@/lib/slug';
import type { Localized } from '@/lib/types';
import { requireSession } from './guard';

export type NewsInput = {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  title: Localized;
  description: Localized;
  /** Absolute http(s) URL, or null. */
  link: string | null;
};

/** Postgres unique-violation on news.slug. */
const UNIQUE_VIOLATION = '23505';

function normaliseLink(link: string | null): string | null {
  const trimmed = link?.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Link must be a valid http(s) URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Link must be a valid http(s) URL');
  }

  return url.toString();
}

function toRow(input: NewsInput) {
  const titleBg = input.title.bg.trim();
  const titleEn = input.title.en.trim();
  if (!titleBg || !titleEn) throw new Error('Both titles are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Invalid date');

  return {
    published_at: input.date,
    title_bg: titleBg,
    title_en: titleEn,
    description_bg: input.description.bg.trim() || null,
    description_en: input.description.en.trim() || null,
    link_url: normaliseLink(input.link),
  };
}

export async function createNews(input: NewsInput): Promise<{ slug: string }> {
  await requireSession();

  const row = toRow(input);
  const client = serviceClient();
  const baseSlug = slugify(row.title_bg, input.date);

  let slug = baseSlug;

  // Same title on the same date is possible; take the next free suffix rather than failing.
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const { error } = await client.from('news').insert({ ...row, slug, published: true });

    if (!error) {
      revalidateNewsPages();
      return { slug };
    }
    if (error.code !== UNIQUE_VIOLATION) throw new Error(`Could not create news: ${error.message}`);
    slug = `${baseSlug}-${attempt + 1}`;
  }

  throw new Error('Could not find a free slug for this news item');
}

export async function updateNews(id: string, input: NewsInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { error } = await client
    .from('news')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Could not update news: ${error.message}`);

  revalidateNewsPages();
}

export async function deleteNews(id: string): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { error } = await client.from('news').delete().eq('id', id);
  if (error) throw new Error(`Could not delete news: ${error.message}`);

  revalidateNewsPages();
}
