import { type SupabaseClient } from '../../_shared/supabase/client.ts';
import {
  getAccessTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../_shared/auth/jwt.ts';
import { UnauthorizedError } from '../../_shared/utils/errors.ts';
import { getSessionData } from '../data/get-session.ts';
import { updateSessionRefreshTokenData } from '../data/update-session-refresh-token.ts';

export type RefreshSessionServiceDependencies = {
  getSessionData: typeof getSessionData;
  updateSessionRefreshTokenData: typeof updateSessionRefreshTokenData;
};

export type RefreshSessionServiceArgs = {
  supabaseClient: SupabaseClient;
  refreshToken: string;
  dependencies?: RefreshSessionServiceDependencies;
};

export const refreshSessionService = async ({
  supabaseClient,
  refreshToken,
  dependencies = { getSessionData, updateSessionRefreshTokenData },
}: RefreshSessionServiceArgs) => {
  const payload = await verifyRefreshToken(refreshToken);
  const session = await dependencies.getSessionData({
    supabaseClient,
    sessionId: payload.session_id,
  });

  if (!session || session.user_id !== payload.sub || session.refresh_token !== refreshToken) {
    throw new UnauthorizedError('Invalid refresh token.');
  }

  const { data: user, error } = await supabaseClient
    .from('users')
    .select('id, email, username, name, created_at')
    .eq('id', session.user_id)
    .single();

  if (error) {
    throw error;
  }

  const nextRefreshToken = await signRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });
  await dependencies.updateSessionRefreshTokenData({
    supabaseClient,
    sessionId: session.id,
    refreshToken: nextRefreshToken,
  });

  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    expiresAt: getAccessTokenExpiresAt(accessToken),
    user,
  };
};
