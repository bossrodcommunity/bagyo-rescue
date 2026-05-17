import { type SupabaseClient } from '../../_shared/supabase/client.ts';

export type RevokeSessionsDataArgs = {
  supabaseClient: SupabaseClient;
  userId?: string;
  sessionId?: string;
};

export const revokeSessionsData = async ({
  supabaseClient,
  userId,
  sessionId,
}: RevokeSessionsDataArgs) => {
  let query = supabaseClient.from('sessions').delete();

  if (sessionId) {
    query = query.eq('id', sessionId);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
};
