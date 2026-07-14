import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseStatus() {
  return {
    configured: Boolean(supabaseUrl && supabaseAnonKey),
    url: supabaseUrl || null,
    publishableKey: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 12)}...` : null
  };
}
