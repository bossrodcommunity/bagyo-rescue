import type { Context, MiddlewareHandler } from 'jsr:@hono/hono';
import type { SupabaseClient } from '../supabase/client.ts';
import { createServiceRoleSupabaseClient } from '../supabase/client.ts';
import { UnauthorizedError } from '../utils/errors.ts';
import { verifyAccessToken } from './jwt.ts';

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  created_at: string;
};

export type AuthenticatedSession = {
  id: string;
  user_id: string;
  refresh_token: string;
};

export type AuthenticatedRequestContext = {
  supabaseClient: SupabaseClient;
  session: AuthenticatedSession;
  accessToken: string;
  accessTokenPayload: Awaited<ReturnType<typeof verifyAccessToken>>;
  user: AuthenticatedUser;
};

type AuthContextEnv = {
  Variables: {
    authenticatedRequestContext: AuthenticatedRequestContext;
  };
};

async function authenticateRequest(request: Request): Promise<AuthenticatedRequestContext> {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Unauthorized');
  }

  const accessToken = authorization.slice('Bearer '.length).trim();
  const payload = await verifyAccessToken(accessToken);
  const supabaseClient = createServiceRoleSupabaseClient();

  const { data: session, error: sessionError } = await supabaseClient
    .from('sessions')
    .select('id, user_id, refresh_token')
    .eq('id', payload.session_id)
    .eq('user_id', payload.sub)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { data: user, error: userError } = await supabaseClient
    .from('users')
    .select('id, email, username, name, created_at')
    .eq('id', payload.sub)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new UnauthorizedError('Unauthorized');
  }

  return {
    supabaseClient,
    session: session as AuthenticatedSession,
    accessToken,
    accessTokenPayload: payload,
    user: user as AuthenticatedUser,
  };
}

export const authenticationMiddleware: MiddlewareHandler<AuthContextEnv> = async (
  context,
  next
) => {
  if (context.req.raw.method === 'OPTIONS') {
    await next();
    return;
  }

  context.set('authenticatedRequestContext', await authenticateRequest(context.req.raw));

  await next();
};

export function getAuthenticatedRequestContext(context: Context<AuthContextEnv>) {
  return context.get('authenticatedRequestContext');
}
