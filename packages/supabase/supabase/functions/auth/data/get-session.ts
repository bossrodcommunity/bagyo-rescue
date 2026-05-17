import { type SupabaseClient } from '../../_shared/supabase/client.ts';

export type SessionData = {
  id: string;
  user_id: string;
  refresh_token: string;
};

export type GetSessionDataArgs = {
  supabaseClient: SupabaseClient;
  sessionId: string;
};

export const getSessionData = async ({ supabaseClient, sessionId }: GetSessionDataArgs) => {
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('id, user_id, refresh_token')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SessionData | null;
};
