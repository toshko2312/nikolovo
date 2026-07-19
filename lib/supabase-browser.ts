import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Anon-key client for the browser, used only to PUT files at signed upload URLs.
 * Deliberately separate from lib/data/supabase.ts so the service-role key is never
 * reachable from a module that ends up in the client bundle.
 */
let client: SupabaseClient | null = null;

export function browserClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase public env vars are missing');

    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
