import { type SupabaseClient } from '../../_shared/supabase/client.ts';
import {
  getAccessTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
} from '../../_shared/auth/jwt.ts';
import { createSessionData } from '../data/create-session.ts';

type AuthSessionUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  created_at: string;
};

export type CreateAuthSessionServiceDependencies = {
  createSessionData: typeof createSessionData;
};

export type CreateAuthSessionServiceArgs = {
  supabaseClient: SupabaseClient;
  user: AuthSessionUser;
  dependencies?: CreateAuthSessionServiceDependencies;
};

export const createAuthSessionService = async ({
  supabaseClient,
  user,
  dependencies = { createSessionData },
}: CreateAuthSessionServiceArgs) => {
  const sessionId = crypto.randomUUID();
  const refreshToken = await signRefreshToken({
    userId: user.id,
    sessionId,
  });

  const session = await dependencies.createSessionData({
    supabaseClient,
    sessionId,
    userId: user.id,
    refreshToken,
  });
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken,
    expiresAt: getAccessTokenExpiresAt(accessToken),
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      created_at: user.created_at,
    },
  };
};
