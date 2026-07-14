const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey
};

export function getSupabaseStatus() {
  return {
    configured: Boolean(supabaseUrl && supabasePublishableKey),
    url: supabaseUrl || null,
    publishableKey: supabasePublishableKey ? `${supabasePublishableKey.slice(0, 12)}...` : null
  };
}
