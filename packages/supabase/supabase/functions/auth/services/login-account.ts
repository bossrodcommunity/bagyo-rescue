import { type SupabaseClient } from '../../_shared/supabase/client.ts';
import { UnauthorizedError } from '../../_shared/utils/errors.ts';
import { getUserByIdentifierData } from '../data/get-user-by-identifier.ts';
import { verifyPassword } from '../utils/password.ts';
import { createAuthSessionService } from './create-auth-session.ts';

export type LoginAccountServiceDependencies = {
  getUserByIdentifierData: typeof getUserByIdentifierData;
  createAuthSessionService: typeof createAuthSessionService;
};

export type LoginAccountServiceArgs = {
  supabaseClient: SupabaseClient;
  identifier: string;
  password: string;
  dependencies?: LoginAccountServiceDependencies;
};

export const loginAccountService = async ({
  supabaseClient,
  identifier,
  password,
  dependencies = { getUserByIdentifierData, createAuthSessionService },
}: LoginAccountServiceArgs) => {
  const user = await dependencies.getUserByIdentifierData({
    supabaseClient,
    identifier,
  });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new UnauthorizedError('Invalid email, username, or password.');
  }

  return await dependencies.createAuthSessionService({
    supabaseClient,
    user,
  });
};
