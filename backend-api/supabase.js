const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

async function supabaseHealth() {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabase.from('playground_items').select('id').limit(1);
  if (error) {
    throw error;
  }

  return { count: data?.length ?? 0 };
}

module.exports = {
  supabase,
  supabaseHealth
};
