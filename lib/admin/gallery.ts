'use server';

import { revalidatePath } from 'next/cache';
import { IMAGE_BUCKET } from '@/lib/media';
import { serviceClient } from '@/lib/data/supabase';
import type { HomePostImage, Localized } from '@/lib/types';
import { requireSession } from './guard';

function revalidateGallery() {
  revalidatePath('/galeriya');
  revalidatePath('/en/gallery');
}

/**
 * Paths minted by prepareUploads always live in a folder (`<slug>/<stamp>-<i>-<name>`),
 * so a bare filename is one of the hand-seeded files that several tables share — the
 * gallery seed and a landmark card both point at `yazovir-trakiec.jpg`. Never delete
 * those, or removing one row blanks the image on another page.
 */
async function removeUploadedImage(path: string | null): Promise<void> {
  if (!path || !path.includes('/')) return;
  await serviceClient().storage.from(IMAGE_BUCKET).remove([path]);
}

export type GalleryPhotoInput = {
  image: HomePostImage;
  caption: Localized;
};

function toRow(input: GalleryPhotoInput) {
  const captionBg = input.caption.bg.trim();
  const captionEn = input.caption.en.trim();
  if (!captionBg || !captionEn) throw new Error('A tag in both languages is required');
  if (!input.image) throw new Error('A photo is required');

  return {
    image_path: input.image.path,
    image_width: input.image.width,
    image_height: input.image.height,
    caption_bg: captionBg,
    caption_en: captionEn,
  };
}

export async function createGalleryPhoto(input: GalleryPhotoInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { count } = await client.from('gallery_photos').select('id', { count: 'exact', head: true });

  const { error } = await client
    .from('gallery_photos')
    .insert({ ...toRow(input), sort_order: count ?? 0 });
  if (error) throw new Error(`Could not add photo: ${error.message}`);

  revalidateGallery();
}

export async function updateGalleryPhoto(id: string, input: GalleryPhotoInput): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('gallery_photos')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load photo: ${fetchError.message}`);

  const previousImagePath = current?.image_path as string | null;

  const { error } = await client
    .from('gallery_photos')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Could not update photo: ${error.message}`);

  if (previousImagePath && previousImagePath !== input.image.path) {
    await removeUploadedImage(previousImagePath);
  }

  revalidateGallery();
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: current, error: fetchError } = await client
    .from('gallery_photos')
    .select('image_path')
    .eq('id', id)
    .single();
  if (fetchError) throw new Error(`Could not load photo: ${fetchError.message}`);

  const { error } = await client.from('gallery_photos').delete().eq('id', id);
  if (error) throw new Error(`Could not delete photo: ${error.message}`);

  await removeUploadedImage(current?.image_path as string | null);

  revalidateGallery();
}
