import { events as localEvents } from '@/content/events';
import type { EventMedia, EventMediaRow, EventRecord, EventRow } from '@/lib/types';
import { anonClient, useSupabase } from './supabase';

const MEDIA_COLUMNS =
  'id, event_id, kind, storage_path, poster_path, thumbnail_path, width, height, alt_bg, alt_en, title_bg, title_en, description_bg, description_en, duration_seconds, sort_order';

const EVENT_COLUMNS =
  'id, slug, event_date, published, title_bg, title_en, description_bg, description_en';

function toMedia(row: EventMediaRow): EventMedia {
  const base = {
    id: row.id,
    sortOrder: row.sort_order,
    path: row.storage_path,
    width: row.width,
    height: row.height,
  };

  if (row.kind === 'image') {
    return {
      ...base,
      kind: 'image',
      alt: { bg: row.alt_bg ?? '', en: row.alt_en ?? '' },
    };
  }

  return {
    ...base,
    kind: 'video',
    posterPath: row.poster_path ?? '',
    thumbnailPath: row.thumbnail_path ?? '',
    durationSeconds: row.duration_seconds ?? 0,
    title: { bg: row.title_bg ?? '', en: row.title_en ?? '' },
    description: { bg: row.description_bg ?? '', en: row.description_en ?? '' },
  };
}

function toEvent(row: EventRow, media: EventMediaRow[]): EventRecord {
  return {
    id: row.id,
    slug: row.slug,
    date: row.event_date,
    published: row.published,
    title: { bg: row.title_bg, en: row.title_en },
    description: { bg: row.description_bg ?? '', en: row.description_en ?? '' },
    media: media.sort((a, b) => a.sort_order - b.sort_order).map(toMedia),
  };
}

async function attachMedia(rows: EventRow[]): Promise<EventRecord[]> {
  if (!rows.length) return [];

  const client = anonClient();
  const { data: mediaRows, error: mediaError } = await client
    .from('event_media')
    .select(MEDIA_COLUMNS)
    .in(
      'event_id',
      rows.map((r) => r.id),
    );
  if (mediaError) throw new Error(`Failed to load event media: ${mediaError.message}`);

  const media = (mediaRows ?? []) as unknown as EventMediaRow[];
  return rows.map((row) =>
    toEvent(
      row,
      media.filter((m) => m.event_id === row.id),
    ),
  );
}

async function fetchFromSupabase(includeUnpublished: boolean): Promise<EventRecord[]> {
  const client = anonClient();

  let query = client.from('events').select(EVENT_COLUMNS).order('event_date', { ascending: false });
  if (!includeUnpublished) query = query.eq('published', true);

  const { data: eventRows, error } = await query;
  if (error) throw new Error(`Failed to load events: ${error.message}`);

  return attachMedia((eventRows ?? []) as unknown as EventRow[]);
}

/** Newest first. Unpublished events are only ever returned for authenticated admin calls. */
export async function getEvents({ includeUnpublished = false } = {}): Promise<EventRecord[]> {
  if (useSupabase()) return fetchFromSupabase(includeUnpublished);

  return localEvents
    .filter((event) => includeUnpublished || event.published)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type EventsPage = { events: EventRecord[]; total: number };

/** Same ordering as getEvents, sliced to one page — used by the events list pages. */
export async function getEventsPaged({
  page = 1,
  perPage = 10,
  includeUnpublished = false,
}: { page?: number; perPage?: number; includeUnpublished?: boolean } = {}): Promise<EventsPage> {
  const offset = (page - 1) * perPage;

  if (useSupabase()) {
    const client = anonClient();
    let query = client
      .from('events')
      .select(EVENT_COLUMNS, { count: 'exact' })
      .order('event_date', { ascending: false })
      .range(offset, offset + perPage - 1);
    if (!includeUnpublished) query = query.eq('published', true);

    const { data: eventRows, error, count } = await query;
    if (error) throw new Error(`Failed to load events: ${error.message}`);

    const events = await attachMedia((eventRows ?? []) as unknown as EventRow[]);
    return { events, total: count ?? events.length };
  }

  const all = localEvents
    .filter((event) => includeUnpublished || event.published)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return { events: all.slice(offset, offset + perPage), total: all.length };
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const all = await getEvents({ includeUnpublished: true });
  return all.find((event) => event.slug === slug) ?? null;
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  const all = await getEvents({ includeUnpublished: true });
  return all.find((event) => event.id === id) ?? null;
}
