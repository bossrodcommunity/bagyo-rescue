import {
  createClient,
  type SupabaseClient as BaseSupabaseClient,
} from 'npm:@supabase/supabase-js@2.105.4';
import { getEnvConfig } from '../env.ts';

export type SupabaseClient = BaseSupabaseClient;

export function createServiceRoleSupabaseClient() {
  const envConfig = getEnvConfig();

  return createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
