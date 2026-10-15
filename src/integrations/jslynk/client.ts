import { createClient } from '@supabase/supabase-js';

const JSLYNK_SUPABASE_URL = 'https://ipqrxdozzlenmanykgoz.supabase.co';
const JSLYNK_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hV2iHEN9aiJUdz9r0MEJBQ_ZlL1DY0X';

export const jslynkAuth = createClient(JSLYNK_SUPABASE_URL, JSLYNK_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: true,
  },
});
