import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frvgoelmcqpcqdemffwh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5FT0y4icao1iePZrc_UeUg_HHmPW56g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
