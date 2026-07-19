import { landmarkCards as localCards } from '@/content/landmark-cards';
import type { LandmarkCardRecord, LandmarkCardRow } from '@/lib/types';
import { anonClient, useSupabase } from './supabase';

const COLUMNS =
  'id, sort_order, title_bg, title_en, text_bg, text_en, image_path, image_width, image_height, image_alt_bg, image_alt_en, chip_bg, chip_en';

function toCard(row: LandmarkCardRow): LandmarkCardRecord {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: { bg: row.title_bg, en: row.title_en },
    text: { bg: row.text_bg ?? '', en: row.text_en ?? '' },
    image:
      row.image_path && row.image_width && row.image_height
        ? {
            path: row.image_path,
            width: row.image_width,
            height: row.image_height,
            alt: { bg: row.image_alt_bg ?? '', en: row.image_alt_en ?? '' },
          }
        : null,
    chip: row.chip_bg && row.chip_en ? { bg: row.chip_bg, en: row.chip_en } : null,
  };
}

async function fetchFromSupabase(): Promise<LandmarkCardRecord[]> {
  const client = anonClient();
  const { data, error } = await client.from('landmark_cards').select(COLUMNS).order('sort_order');
  if (error) throw new Error(`Failed to load landmark cards: ${error.message}`);

  return ((data ?? []) as unknown as LandmarkCardRow[]).map(toCard);
}

export async function getLandmarkCards(): Promise<LandmarkCardRecord[]> {
  if (useSupabase()) return fetchFromSupabase();

  return localCards.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}
