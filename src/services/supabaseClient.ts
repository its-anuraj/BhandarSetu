import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
};
