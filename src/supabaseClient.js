/**
 * Minimal Supabase client for front-end usage.
 * Uses global window config to avoid hardcoding keys in code.
 */

export function createSupabaseClient() {
  if (typeof window === 'undefined' || !window.supabase) {
    throw new Error('Supabase SDK not found on window.supabase');
  }

  const url = window.__SUPABASE_URL;
  const anonKey = window.__SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase config: __SUPABASE_URL / __SUPABASE_ANON_KEY');
  }

  return window.supabase.createClient(url, anonKey);
}

