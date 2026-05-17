import { type SupabaseClient } from '../../_shared/supabase/client.ts';

export type UpdateSessionRefreshTokenDataArgs = {
  supabaseClient: SupabaseClient;
  sessionId: string;
  refreshToken: string;
};

export const updateSessionRefreshTokenData = async ({
  supabaseClient,
  sessionId,
  refreshToken,
}: UpdateSessionRefreshTokenDataArgs) => {
  const { data, error } = await supabaseClient
    .from('sessions')
    .update({
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('id, user_id, refresh_token')
    .single();

  if (error) {
    throw error;
  }

  return data;
};
