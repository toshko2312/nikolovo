import type { NewsRecord } from '@/lib/types';

/**
 * Local fallback used when USE_SUPABASE is false. News has always lived in the
 * database, so there is nothing to seed here — the array only keeps local dev
 * building without a Supabase connection.
 */
export const news: NewsRecord[] = [];
