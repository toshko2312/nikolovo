'use server';

import { revalidatePath } from 'next/cache';
import { IMAGE_BUCKET } from '@/lib/media';
import { serviceClient } from '@/lib/data/supabase';
import type { LinkablePageKey, Localized } from '@/lib/types';
import { requireSession } from './guard';

function revalidateHome() {
  revalidatePath('/');
  revalidatePath('/en');
}

export type PostImageInput = { path: string; width: number; height: number; alt: Localized };

export type PostInput = {
  eyebrow: Localized;
  title: Localized;
  body: Localized;
  image: PostImageInput | null;
  link: { page: LinkablePageKey; text: Localized } | null;
};

function toRow(input: PostInput) {
  const titleBg = input.title.bg.trim();
  const titleEn = input.title.en.trim();
  const eyebrowBg = input.eyebrow.bg.trim();
  const eyebrowEn = input.eyebrow.en.trim();
  if (!titleBg || !titleEn) throw new Error('Both titles are required');
  if (!eyebrowBg || !eyebrowEn) throw new Error('Both sub-titles are required');

  return {
    eyebrow_bg: eyebrowBg,
    eyebrow_en: eyebrowEn,
    title_bg: titleBg,
    title_en: titleEn,
    body_bg: input.body.bg.trim() || null,
    body_en: input.body.en.trim() || null,
    image_path: input.image?.path ?? null,
    image_width: input.image?.width ?? null,
    image_height: input.image?.height ?? null,
    image_alt_bg: input.image?.alt.bg.trim() || null,
    image_alt_en: input.image?.alt.en.trim() || null,
    link_page: input.link?.page ?? null,
    link_text_bg: input.link?.text.bg.trim() || null,
    link_text_en: input.link?.text.en.trim() || null,
  };
}

export async function createPost(input: PostInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { count } = await client.from('home_posts').select('id', { count: 'exact', head: true });

  const { error } = await client.from('home_posts').insert({ ...toRow(input), sort_order: count ?? 0 });
  if (error) throw new Error(`Could not create post: ${error.message}`);

  revalidateHome();
}

export async function updatePost(id: string, input: PostInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('home_posts')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load post: ${fetchError.message}`);

  const previousImagePath = current?.image_path as string | null;
  const nextImagePath = input.image?.path ?? null;

  const { error } = await client
    .from('home_posts')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Could not update post: ${error.message}`);

  if (previousImagePath && previousImagePath !== nextImagePath) {
    await client.storage.from(IMAGE_BUCKET).remove([previousImagePath]);
  }

  revalidateHome();
}

export async function deletePost(id: string): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('home_posts')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load post: ${fetchError.message}`);

  const { error } = await client.from('home_posts').delete().eq('id', id);
  if (error) throw new Error(`Could not delete post: ${error.message}`);

  const imagePath = current?.image_path as string | null;
  if (imagePath) await client.storage.from(IMAGE_BUCKET).remove([imagePath]);

  revalidateHome();
}
