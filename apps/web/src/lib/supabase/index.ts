import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@/env';
import { type Database } from './types';

let supabaseClient: SupabaseClient<Database> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const envConfig = getEnvConfig();

  supabaseClient = createClient<Database>(envConfig.SUPABASE_URL, envConfig.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, property, receiver) {
    return Reflect.get(getSupabaseClient(), property, receiver);
  },
});
