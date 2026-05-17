import { type SupabaseClient } from '../../_shared/supabase/client.ts';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  password_hash: string;
  created_at: string;
};

export type GetUserByIdentifierDataArgs = {
  supabaseClient: SupabaseClient;
  identifier: string;
};

export const getUserByIdentifierData = async ({
  supabaseClient,
  identifier,
}: GetUserByIdentifierDataArgs) => {
  const column = identifier.includes('@') ? 'email' : 'username';
  const { data, error } = await supabaseClient
    .from('users')
    .select('id, email, username, name, password_hash, created_at')
    .eq(column, identifier)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AuthUser | null;
};
