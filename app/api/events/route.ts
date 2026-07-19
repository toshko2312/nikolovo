import { requireAdmin, requireSupabase } from '@/lib/auth';
import { getEvents } from '@/lib/data/events';
import { serviceClient } from '@/lib/data/supabase';
import { revalidateEventPages } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const includeUnpublished = new URL(request.url).searchParams.get('all') === '1';

  if (includeUnpublished) {
    const denied = requireAdmin(request);
    if (denied) return denied;
  }

  try {
    const events = await getEvents({ includeUnpublished });
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request) ?? requireSupabase();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const required = ['slug', 'event_date', 'title_bg', 'title_en'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length) {
    return Response.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 });
  }

  const { media, ...eventFields } = body as { media?: unknown[] } & Record<string, unknown>;

  const { data: event, error } = await serviceClient()
    .from('events')
    .insert(eventFields)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });

  if (Array.isArray(media) && media.length) {
    const rows = media.map((item, index) => ({
      sort_order: index,
      ...(item as Record<string, unknown>),
      event_id: event.id,
    }));
    const { error: mediaError } = await serviceClient().from('event_media').insert(rows);
    if (mediaError) return Response.json({ error: mediaError.message }, { status: 400 });
  }

  revalidateEventPages();
  return Response.json({ event }, { status: 201 });
}
