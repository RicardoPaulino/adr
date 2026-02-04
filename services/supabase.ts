
import { createClient } from '@supabase/supabase-js';

const url = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || supabaseUrl;
const key = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || supabaseAnonKey;

export const supabase = createClient(url, key);
