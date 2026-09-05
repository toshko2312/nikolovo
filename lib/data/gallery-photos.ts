import { galleryPhotos as localPhotos } from '@/content/gallery-photos';
import type { GalleryPhotoRecord, GalleryPhotoRow } from '@/lib/types';
import { anonClient, useSupabase } from './supabase';

const COLUMNS = 'id, sort_order, image_path, image_width, image_height, caption_bg, caption_en';

function toPhoto(row: GalleryPhotoRow): GalleryPhotoRecord {
  const caption = { bg: row.caption_bg, en: row.caption_en };

  return {
    id: row.id,
    sortOrder: row.sort_order,
    // The caption doubles as the alt text, so nothing downstream has to choose between them.
    image: {
      path: row.image_path,
      width: row.image_width,
      height: row.image_height,
      alt: caption,
    },
    caption,
  };
}

async function fetchFromSupabase(): Promise<GalleryPhotoRecord[]> {
  const client = anonClient();
  const { data, error } = await client.from('gallery_photos').select(COLUMNS).order('sort_order');
  if (error) throw new Error(`Failed to load gallery photos: ${error.message}`);

  return ((data ?? []) as unknown as GalleryPhotoRow[]).map(toPhoto);
}

export async function getGalleryPhotos(): Promise<GalleryPhotoRecord[]> {
  if (useSupabase()) return fetchFromSupabase();

  return localPhotos.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}
