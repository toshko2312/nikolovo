import { requireAdmin, requireSupabase } from '@/lib/auth';
import { serviceClient } from '@/lib/data/supabase';
import { IMAGE_BUCKET, VIDEO_BUCKET } from '@/lib/media';

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set([IMAGE_BUCKET, VIDEO_BUCKET]);

/**
 * Hands back a signed URL the client PUTs the file to directly.
 * Proxying the bytes through this route would hit Vercel's 4.5 MB request body limit,
 * which the event videos already exceed.
 */
export async function POST(request: Request) {
  const denied = requireAdmin(request) ?? requireSupabase();
  if (denied) return denied;

  let body: { bucket?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { bucket, path } = body;
  if (!bucket || !ALLOWED_BUCKETS.has(bucket)) {
    return Response.json(
      { error: `bucket must be one of: ${[...ALLOWED_BUCKETS].join(', ')}` },
      { status: 400 },
    );
  }
  if (!path || path.includes('..') || path.startsWith('/')) {
    return Response.json({ error: 'path must be a relative filename' }, { status: 400 });
  }

  const { data, error } = await serviceClient().storage.from(bucket).createSignedUploadUrl(path);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({
    bucket,
    path,
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl: serviceClient().storage.from(bucket).getPublicUrl(path).data.publicUrl,
  });
}
