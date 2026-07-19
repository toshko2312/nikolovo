export const IMAGE_BUCKET = 'images';
export const VIDEO_BUCKET = 'videos';

/** Uploaded filenames are unique, so the bytes behind a path never change. */
export const MEDIA_CACHE_CONTROL = '31536000';

/**
 * Client components (the admin dialogs) only ever see NEXT_PUBLIC_* variables, so the
 * flag is mirrored publicly. Without it the dialogs resolve media to local /images paths
 * and 404 while the site itself is serving from Supabase.
 */
const usingSupabase = () =>
  (process.env.NEXT_PUBLIC_USE_SUPABASE ?? process.env.USE_SUPABASE) === 'true';

/**
 * Resolves a media path to a URL. While USE_SUPABASE is false the files are served
 * from /public at the same paths the static site used, so nothing about the public
 * URLs changes when the data later moves to Supabase Storage.
 */
export function mediaUrl(bucket: string, path: string): string {
  if (!usingSupabase()) return `/${bucket}/${path}`;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required when USE_SUPABASE=true');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const imageUrl = (path: string) => mediaUrl(IMAGE_BUCKET, path);
export const videoUrl = (path: string) => mediaUrl(VIDEO_BUCKET, path);

/** Seconds → ISO 8601 duration, the format schema.org VideoObject expects. */
export function isoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `PT${minutes > 0 ? `${minutes}M` : ''}${rest}S`;
}
