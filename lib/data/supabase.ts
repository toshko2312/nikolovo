import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const useSupabase = () => process.env.USE_SUPABASE === 'true';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when USE_SUPABASE=true`);
  return value;
}

let anon: SupabaseClient | null = null;
let service: SupabaseClient | null = null;

/** Reads only. RLS limits this client to published events and their media. */
export function anonClient(): SupabaseClient {
  if (!anon) {
    anon = createClient(
      required('NEXT_PUBLIC_SUPABASE_URL'),
      required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      { auth: { persistSession: false } },
    );
  }
  return anon;
}

/** Bypasses RLS. Server-side writes and uploads only — never import from a client component. */
export function serviceClient(): SupabaseClient {
  if (!service) {
    service = createClient(
      required('NEXT_PUBLIC_SUPABASE_URL'),
      required('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } },
    );
  }
  return service;
}
