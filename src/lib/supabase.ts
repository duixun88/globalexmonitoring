import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client. Null when env vars are absent — the app then runs in
 * static/local-only mode (holidays from bundled seed disabled, notes in
 * localStorage). Read is anon; note writes require Supabase Auth login.
 */
export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

export const hasSupabase = !!supabase;
