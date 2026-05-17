import { type SupabaseClient } from '../../_shared/supabase/client.ts';
import { createUserData } from '../data/create-user.ts';
import { hashPassword } from '../utils/password.ts';
import { createAuthSessionService } from './create-auth-session.ts';

export type RegisterAccountServiceDependencies = {
  createUserData: typeof createUserData;
  createAuthSessionService: typeof createAuthSessionService;
};

export type RegisterAccountServiceArgs = {
  supabaseClient: SupabaseClient;
  email: string;
  username: string;
  name: string | null;
  password: string;
  dependencies?: RegisterAccountServiceDependencies;
};

export const registerAccountService = async ({
  supabaseClient,
  email,
  username,
  name,
  password,
  dependencies = { createUserData, createAuthSessionService },
}: RegisterAccountServiceArgs) => {
  const passwordHash = await hashPassword(password);
  const user = await dependencies.createUserData({
    supabaseClient,
    email,
    username,
    name,
    passwordHash,
  });

  return await dependencies.createAuthSessionService({
    supabaseClient,
    user,
  });
};
