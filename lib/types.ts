import type { Locale, PageKey } from './routes';

export type Localized = Record<Locale, string>;

interface MediaBase {
  id: string;
  sortOrder: number;
  /** Path inside the media bucket, e.g. `24-mai-nikolovo-2026-1.mp4`. */
  path: string;
  width: number;
  height: number;
}

export interface ImageMedia extends MediaBase {
  kind: 'image';
  alt: Localized;
}

export interface VideoMedia extends MediaBase {
  kind: 'video';
  /** Shown by the <video> element before playback — webp, so it never goes through next/image. */
  posterPath: string;
  /** jpg twin of the poster, used for schema.org thumbnailUrl (crawlers prefer jpg). */
  thumbnailPath: string;
  durationSeconds: number;
  title: Localized;
  description: Localized;
}

export type EventMedia = ImageMedia | VideoMedia;

export interface EventRecord {
  id: string;
  slug: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  published: boolean;
  title: Localized;
  description: Localized;
  media: EventMedia[];
}

/** Flat shapes mirroring the Supabase tables; mapped to the nested types above. */
export interface EventRow {
  id: string;
  slug: string;
  event_date: string;
  published: boolean;
  title_bg: string;
  title_en: string;
  description_bg: string | null;
  description_en: string | null;
}

export interface NewsRecord {
  id: string;
  slug: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  published: boolean;
  title: Localized;
  description: Localized;
  /** Absolute http(s) URL, or null. Turned into an embed by `lib/embed.ts` at render time. */
  link: string | null;
}

/** Flat shape mirroring the Supabase table. */
export interface NewsRow {
  id: string;
  slug: string;
  published_at: string;
  published: boolean;
  title_bg: string;
  title_en: string;
  description_bg: string | null;
  description_en: string | null;
  link_url: string | null;
}

/** Every page except the home page itself is a valid link target for a home post. */
export type LinkablePageKey = Exclude<PageKey, 'home'>;

export interface HomePostImage {
  path: string;
  width: number;
  height: number;
  alt: Localized;
}

export interface HomePostRecord {
  id: string;
  sortOrder: number;
  eyebrow: Localized;
  title: Localized;
  body: Localized;
  image: HomePostImage | null;
  link: { page: LinkablePageKey; text: Localized } | null;
}

/** Flat shape mirroring the Supabase table. */
export interface HomePostRow {
  id: string;
  sort_order: number;
  eyebrow_bg: string;
  eyebrow_en: string;
  title_bg: string;
  title_en: string;
  body_bg: string | null;
  body_en: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  image_alt_bg: string | null;
  image_alt_en: string | null;
  link_page: LinkablePageKey | null;
  link_text_bg: string | null;
  link_text_en: string | null;
}

export interface LandmarkCardRecord {
  id: string;
  sortOrder: number;
  title: Localized;
  text: Localized;
  image: HomePostImage | null;
  /** Label over the placeholder; only the originally seeded cards have one. */
  chip: Localized | null;
}

export interface LandmarkCardRow {
  id: string;
  sort_order: number;
  title_bg: string;
  title_en: string;
  text_bg: string | null;
  text_en: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  image_alt_bg: string | null;
  image_alt_en: string | null;
  chip_bg: string | null;
  chip_en: string | null;
}

export interface EventMediaRow {
  id: string;
  event_id: string;
  kind: 'image' | 'video';
  storage_path: string;
  poster_path: string | null;
  thumbnail_path: string | null;
  width: number;
  height: number;
  alt_bg: string | null;
  alt_en: string | null;
  title_bg: string | null;
  title_en: string | null;
  description_bg: string | null;
  description_en: string | null;
  duration_seconds: number | null;
  sort_order: number;
}
