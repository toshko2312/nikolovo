import { requireAdmin, requireSupabase } from '@/lib/auth';
import { getEventById } from '@/lib/data/events';
import { serviceClient } from '@/lib/data/supabase';
import { revalidateEventPages } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const event = await getEventById(id);
    if (!event) return Response.json({ error: 'Not found' }, { status: 404 });

    // Unpublished drafts are admin-only.
    if (!event.published) {
      const denied = requireAdmin(request);
      if (denied) return denied;
    }

    return Response.json({ event });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request) ?? requireSupabase();
  if (denied) return denied;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = await serviceClient()
    .from('events')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 });

  revalidateEventPages();
  return Response.json({ event: data });
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = requireAdmin(request) ?? requireSupabase();
  if (denied) return denied;

  const { id } = await params;

  // event_media rows cascade with the parent event; storage objects are left in place.
  const { error } = await serviceClient().from('events').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  revalidateEventPages();
  return new Response(null, { status: 204 });
}
