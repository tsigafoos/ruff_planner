import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// These should be set as environment variables in production
// For now, using placeholder values - user will need to configure these
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Web: recover session from magic-link / OAuth redirects in the URL hash
    detectSessionInUrl: Platform.OS === 'web',
  },
});
