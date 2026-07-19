'use server';

import { IMAGE_BUCKET, VIDEO_BUCKET } from '@/lib/media';
import { revalidateEventPages } from '@/lib/revalidate';
import { serviceClient } from '@/lib/data/supabase';
import { slugify } from '@/lib/slug';
import { requireSession } from './guard';

export type UploadRequest = {
  bucket: 'images' | 'videos';
  filename: string;
  slugHint: string;
};

export type UploadTarget = {
  bucket: string;
  path: string;
  signedUrl: string;
  token: string;
};

export type NewEventMedia =
  | {
      kind: 'image';
      path: string;
      width: number;
      height: number;
      altBg: string;
      altEn: string;
    }
  | {
      kind: 'video';
      path: string;
      posterPath: string;
      thumbnailPath: string;
      width: number;
      height: number;
      durationSeconds: number;
      titleBg: string;
      titleEn: string;
      descriptionBg: string;
      descriptionEn: string;
    };

export type NewEvent = {
  date: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  media: NewEventMedia[];
};

export type UpdateEvent = {
  id: string;
  date: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  /** event_media.id values to keep as-is; anything else attached to the event is removed. */
  keepMediaIds: string[];
  /** New files to append after the kept media. */
  newMedia: NewEventMedia[];
};

/** Keeps storage paths predictable and safe regardless of what the OS named the file. */
function safeName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase() : '';

  const cleanStem = slugify(stem).slice(0, 40) || 'file';
  const cleanExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  return `${cleanStem}.${cleanExt}`;
}

/**
 * Mints signed upload URLs so the browser can PUT files straight to Supabase Storage.
 * Routing the bytes through a server action would hit Vercel's 4.5 MB body limit.
 */
export async function prepareUploads(requests: UploadRequest[]): Promise<UploadTarget[]> {
  await requireSession();

  const client = serviceClient();
  const stamp = Date.now();

  return Promise.all(
    requests.map(async (request, index) => {
      const bucket = request.bucket === 'videos' ? VIDEO_BUCKET : IMAGE_BUCKET;
      const folder = slugify(request.slugHint) || 'event';
      const path = `${folder}/${stamp}-${index}-${safeName(request.filename)}`;

      const { data, error } = await client.storage.from(bucket).createSignedUploadUrl(path);
      if (error) throw new Error(`Could not prepare upload for ${request.filename}: ${error.message}`);

      return { bucket, path, signedUrl: data.signedUrl, token: data.token };
    }),
  );
}

function mediaToRows(eventId: string, media: NewEventMedia[], startOrder: number) {
  return media.map((item, index) =>
    item.kind === 'image'
      ? {
          event_id: eventId,
          kind: 'image',
          storage_path: item.path,
          width: item.width,
          height: item.height,
          alt_bg: item.altBg,
          alt_en: item.altEn,
          sort_order: startOrder + index,
        }
      : {
          event_id: eventId,
          kind: 'video',
          storage_path: item.path,
          poster_path: item.posterPath,
          thumbnail_path: item.thumbnailPath,
          width: item.width,
          height: item.height,
          duration_seconds: item.durationSeconds,
          title_bg: item.titleBg,
          title_en: item.titleEn,
          description_bg: item.descriptionBg,
          description_en: item.descriptionEn,
          sort_order: startOrder + index,
        },
  );
}

/** Deletes the actual files behind a set of event_media rows, grouped by bucket. */
async function removeMediaFiles(
  rows: { kind: string; storage_path: string; poster_path: string | null; thumbnail_path: string | null }[],
): Promise<void> {
  if (!rows.length) return;

  const client = serviceClient();
  const imagePaths: string[] = [];
  const videoPaths: string[] = [];

  for (const row of rows) {
    if (row.kind === 'video') {
      videoPaths.push(row.storage_path);
      if (row.poster_path) imagePaths.push(row.poster_path);
      if (row.thumbnail_path) imagePaths.push(row.thumbnail_path);
    } else {
      imagePaths.push(row.storage_path);
    }
  }

  if (imagePaths.length) await client.storage.from(IMAGE_BUCKET).remove(imagePaths);
  if (videoPaths.length) await client.storage.from(VIDEO_BUCKET).remove(videoPaths);
}

/** Postgres unique-violation on events.slug. */
const UNIQUE_VIOLATION = '23505';

export async function createEvent(input: NewEvent): Promise<{ slug: string }> {
  await requireSession();

  const titleBg = input.titleBg.trim();
  const titleEn = input.titleEn.trim();
  if (!titleBg || !titleEn) throw new Error('Both titles are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Invalid date');

  const client = serviceClient();
  const baseSlug = slugify(titleBg, input.date);

  let slug = baseSlug;
  let eventId: string | null = null;

  // Same title on the same date is possible; take the next free suffix rather than failing.
  for (let attempt = 1; attempt <= 20 && !eventId; attempt += 1) {
    const { data, error } = await client
      .from('events')
      .insert({
        slug,
        event_date: input.date,
        published: true,
        title_bg: titleBg,
        title_en: titleEn,
        description_bg: input.descriptionBg.trim() || null,
        description_en: input.descriptionEn.trim() || null,
      })
      .select('id')
      .single();

    if (!error) {
      eventId = data.id as string;
      break;
    }
    if (error.code !== UNIQUE_VIOLATION) throw new Error(`Could not create event: ${error.message}`);
    slug = `${baseSlug}-${attempt + 1}`;
  }

  if (!eventId) throw new Error('Could not find a free slug for this event');

  if (input.media.length) {
    const rows = mediaToRows(eventId, input.media, 0);
    const { error } = await client.from('event_media').insert(rows);
    if (error) {
      // Don't leave an event with half its media attached.
      await client.from('events').delete().eq('id', eventId);
      throw new Error(`Could not attach media: ${error.message}`);
    }
  }

  revalidateEventPages();
  return { slug };
}

export async function updateEvent(input: UpdateEvent): Promise<void> {
  await requireSession();

  const titleBg = input.titleBg.trim();
  const titleEn = input.titleEn.trim();
  if (!titleBg || !titleEn) throw new Error('Both titles are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Invalid date');

  const client = serviceClient();

  const { data: currentMedia, error: mediaFetchError } = await client
    .from('event_media')
    .select('id, kind, storage_path, poster_path, thumbnail_path, sort_order')
    .eq('event_id', input.id);
  if (mediaFetchError) throw new Error(`Could not load existing media: ${mediaFetchError.message}`);

  const keep = new Set(input.keepMediaIds);
  const toRemove = (currentMedia ?? []).filter((row) => !keep.has(row.id));
  const kept = (currentMedia ?? []).filter((row) => keep.has(row.id));

  if (toRemove.length) {
    const { error } = await client
      .from('event_media')
      .delete()
      .in(
        'id',
        toRemove.map((row) => row.id),
      );
    if (error) throw new Error(`Could not remove media: ${error.message}`);
    await removeMediaFiles(toRemove);
  }

  if (input.newMedia.length) {
    const startOrder = kept.reduce((max, row) => Math.max(max, row.sort_order + 1), 0);
    const rows = mediaToRows(input.id, input.newMedia, startOrder);
    const { error } = await client.from('event_media').insert(rows);
    if (error) throw new Error(`Could not attach new media: ${error.message}`);
  }

  const { error } = await client
    .from('events')
    .update({
      event_date: input.date,
      title_bg: titleBg,
      title_en: titleEn,
      description_bg: input.descriptionBg.trim() || null,
      description_en: input.descriptionEn.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id);
  if (error) throw new Error(`Could not update event: ${error.message}`);

  revalidateEventPages();
}

export async function deleteEvent(id: string): Promise<void> {
  await requireSession();

  const client = serviceClient();
  const { data: media, error: mediaError } = await client
    .from('event_media')
    .select('kind, storage_path, poster_path, thumbnail_path')
    .eq('event_id', id);
  if (mediaError) throw new Error(`Could not load event media: ${mediaError.message}`);

  await removeMediaFiles(media ?? []);

  // event_media rows cascade with the event via the FK.
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) throw new Error(`Could not delete event: ${error.message}`);

  revalidateEventPages();
}
