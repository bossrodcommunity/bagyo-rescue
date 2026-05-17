import { type SupabaseClient } from '../../_shared/supabase/client.ts';
import { ConflictError } from '../../_shared/utils/errors.ts';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  password_hash: string;
  created_at: string;
};

export type CreateUserDataArgs = {
  supabaseClient: SupabaseClient;
  email: string;
  username: string;
  name: string | null;
  passwordHash: string;
};

export const createUserData = async ({
  supabaseClient,
  email,
  username,
  name,
  passwordHash,
}: CreateUserDataArgs) => {
  const { data, error } = await supabaseClient
    .from('users')
    .insert({
      email,
      username,
      name,
      password_hash: passwordHash,
    })
    .select('id, email, username, name, password_hash, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ConflictError('Email or username is already in use.');
    }

    throw error;
  }

  return data as AuthUser;
};
