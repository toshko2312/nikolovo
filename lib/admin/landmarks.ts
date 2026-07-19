'use server';

import { revalidatePath } from 'next/cache';
import { IMAGE_BUCKET } from '@/lib/media';
import { serviceClient } from '@/lib/data/supabase';
import type { HomePostImage, Localized } from '@/lib/types';
import { requireSession } from './guard';

function revalidateLandmarks() {
  revalidatePath('/zabelezhitelnosti');
  revalidatePath('/en/landmarks');
}

export type LandmarkInput = {
  title: Localized;
  text: Localized;
  image: HomePostImage | null;
};

function toRow(input: LandmarkInput) {
  const titleBg = input.title.bg.trim();
  const titleEn = input.title.en.trim();
  if (!titleBg || !titleEn) throw new Error('Both titles are required');

  return {
    title_bg: titleBg,
    title_en: titleEn,
    text_bg: input.text.bg.trim() || null,
    text_en: input.text.en.trim() || null,
    image_path: input.image?.path ?? null,
    image_width: input.image?.width ?? null,
    image_height: input.image?.height ?? null,
    image_alt_bg: input.image?.alt.bg.trim() || null,
    image_alt_en: input.image?.alt.en.trim() || null,
  };
}

export async function createLandmark(input: LandmarkInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { count } = await client.from('landmark_cards').select('id', { count: 'exact', head: true });

  const { error } = await client
    .from('landmark_cards')
    .insert({ ...toRow(input), sort_order: count ?? 0 });
  if (error) throw new Error(`Could not create card: ${error.message}`);

  revalidateLandmarks();
}

export async function updateLandmark(id: string, input: LandmarkInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('landmark_cards')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load card: ${fetchError.message}`);

  const previousImagePath = current?.image_path as string | null;
  const nextImagePath = input.image?.path ?? null;

  const { error } = await client
    .from('landmark_cards')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Could not update card: ${error.message}`);

  if (previousImagePath && previousImagePath !== nextImagePath) {
    await client.storage.from(IMAGE_BUCKET).remove([previousImagePath]);
  }

  revalidateLandmarks();
}

export async function deleteLandmark(id: string): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('landmark_cards')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load card: ${fetchError.message}`);

  const { error } = await client.from('landmark_cards').delete().eq('id', id);
  if (error) throw new Error(`Could not delete card: ${error.message}`);

  const imagePath = current?.image_path as string | null;
  if (imagePath) await client.storage.from(IMAGE_BUCKET).remove([imagePath]);

  revalidateLandmarks();
}
