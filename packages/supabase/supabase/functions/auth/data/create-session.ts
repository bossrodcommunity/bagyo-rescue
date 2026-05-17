import { type SupabaseClient } from '../../_shared/supabase/client.ts';

export type SessionData = {
  id: string;
  user_id: string;
  refresh_token: string;
};

export type CreateSessionDataArgs = {
  supabaseClient: SupabaseClient;
  sessionId: string;
  userId: string;
  refreshToken: string;
};

export const createSessionData = async ({
  supabaseClient,
  sessionId,
  userId,
  refreshToken,
}: CreateSessionDataArgs) => {
  const { data, error } = await supabaseClient
    .from('sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      refresh_token: refreshToken,
    })
    .select('id, user_id, refresh_token')
    .single();

  if (error) {
    throw error;
  }

  return data as SessionData;
};
