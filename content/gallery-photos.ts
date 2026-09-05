import type { GalleryPhotoRecord } from '@/lib/types';

/**
 * Local source of truth while USE_SUPABASE is false. Mirrors the seed row in
 * supabase/migrations/20260905000001_gallery_photos.sql so the page looks the same
 * either way.
 */
export const galleryPhotos: GalleryPhotoRecord[] = [
  {
    id: 'yazovir-trakiec',
    sortOrder: 0,
    image: {
      path: 'yazovir-trakiec.jpg',
      width: 675,
      height: 348,
      alt: { bg: 'язовир Тракиец', en: 'Trakiets Reservoir' },
    },
    caption: { bg: 'язовир Тракиец', en: 'Trakiets Reservoir' },
  },
];
