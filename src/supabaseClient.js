/**
 * Minimal Supabase client for front-end usage.
 * Uses global window config to avoid hardcoding keys in code.
 */

const SUPABASE_CLIENT_KEY = '__norahsprintSupabaseClient';
let supabaseClient = null;

export function createSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be created in the browser.');
  }

  if (supabaseClient) return supabaseClient;
  if (window[SUPABASE_CLIENT_KEY]) {
    supabaseClient = window[SUPABASE_CLIENT_KEY];
    return supabaseClient;
  }

  const url = window.__SUPABASE_URL;
  const anonKey = window.__SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase config: window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY');
  }

  if (!window.supabase) {
    throw new Error('Supabase SDK not found. Make sure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is loaded before this script.');
  }

  supabaseClient = window.supabase.createClient(url, anonKey);
  window[SUPABASE_CLIENT_KEY] = supabaseClient;
  return supabaseClient;
}

window.createSupabaseClient = createSupabaseClient;
