/**
 * Uploads the media referenced by content/events.ts into Supabase Storage and inserts the
 * matching rows. Idempotent: files that already exist are skipped and event rows are upserted
 * on `slug`, so re-running changes nothing.
 *
 *   npm run migrate:supabase
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Run it before flipping
 * USE_SUPABASE to true.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { events } from '../content/events';
import { IMAGE_BUCKET, VIDEO_BUCKET } from '../lib/media';
import type { EventRecord } from '../lib/types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it in .env.local before running the migration.`);
    process.exit(1);
  }
  return value;
}

const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } },
);

async function uploadFile(bucket: string, filePath: string): Promise<void> {
  const localPath = path.join(PUBLIC_DIR, bucket, filePath);
  const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) throw new Error(`Unknown content type for ${filePath}`);

  const body = await readFile(localPath);
  const { error } = await supabase.storage.from(bucket).upload(filePath, body, {
    contentType,
    upsert: false,
  });

  if (error) {
    // A duplicate means a previous run already uploaded it.
    if (error.message.toLowerCase().includes('exists')) {
      console.log(`  = ${bucket}/${filePath} (already uploaded)`);
      return;
    }
    throw error;
  }
  console.log(`  + ${bucket}/${filePath}`);
}

async function uploadEventMedia(event: EventRecord): Promise<void> {
  for (const item of event.media) {
    if (item.kind === 'image') {
      await uploadFile(IMAGE_BUCKET, item.path);
    } else {
      await uploadFile(VIDEO_BUCKET, item.path);
      await uploadFile(IMAGE_BUCKET, item.posterPath);
      await uploadFile(IMAGE_BUCKET, item.thumbnailPath);
    }
  }
}

async function upsertEvent(event: EventRecord): Promise<string> {
  const { data, error } = await supabase
    .from('events')
    .upsert(
      {
        slug: event.slug,
        event_date: event.date,
        published: event.published,
        title_bg: event.title.bg,
        title_en: event.title.en,
        description_bg: event.description.bg,
        description_en: event.description.en,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

async function replaceMediaRows(eventId: string, event: EventRecord): Promise<void> {
  const { error: deleteError } = await supabase
    .from('event_media')
    .delete()
    .eq('event_id', eventId);
  if (deleteError) throw deleteError;

  const rows = event.media.map((item) => ({
    event_id: eventId,
    kind: item.kind,
    storage_path: item.path,
    width: item.width,
    height: item.height,
    sort_order: item.sortOrder,
    ...(item.kind === 'image'
      ? { alt_bg: item.alt.bg, alt_en: item.alt.en }
      : {
          poster_path: item.posterPath,
          thumbnail_path: item.thumbnailPath,
          duration_seconds: item.durationSeconds,
          title_bg: item.title.bg,
          title_en: item.title.en,
          description_bg: item.description.bg,
          description_en: item.description.en,
        }),
  }));

  const { error } = await supabase.from('event_media').insert(rows);
  if (error) throw error;
}

async function main(): Promise<void> {
  console.log(`Migrating ${events.length} event(s) to Supabase\n`);

  for (const event of events) {
    console.log(`${event.slug}:`);
    await uploadEventMedia(event);
    const id = await upsertEvent(event);
    await replaceMediaRows(id, event);
    console.log(`  ✓ ${event.media.length} media row(s)\n`);
  }

  console.log('Done. Set USE_SUPABASE=true and redeploy to serve from Supabase.');
}

main().catch((error) => {
  console.error('\nMigration failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
