/**
 * Minimal Supabase client for front-end usage.
 * Uses global window config to avoid hardcoding keys in code.
 */

export function createSupabaseClient() {
  const url = window.__SUPABASE_URL;
  const anonKey = window.__SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase config: window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY');
  }

  if (typeof window === 'undefined' || !window.supabase) {
    throw new Error('Supabase SDK not found. Make sure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is loaded before this script.');
  }

  return window.supabase.createClient(url, anonKey);
}

