import { Hono } from 'jsr:@hono/hono';
import { cors } from 'jsr:@hono/hono/cors';
import { zValidator } from 'jsr:@hono/zod-validator';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import {
  authenticationMiddleware,
  getAuthenticatedRequestContext,
} from '../_shared/auth/session.ts';
import { getDefaultCorsConfig } from '../_shared/http/cors.ts';
import { toErrorResponse } from '../_shared/http/error-response.ts';
import { createServiceRoleSupabaseClient } from '../_shared/supabase/client.ts';
import { loginAccountService } from './services/login-account.ts';
import { refreshSessionService } from './services/refresh-session.ts';
import { registerAccountService } from './services/register-account.ts';
import { revokeSessionsData } from './data/revoke-sessions.ts';

const functionName = 'auth';

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, or underscores only.')
  .transform(value => value.toLowerCase());

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform(value => value.toLowerCase()),
  username: usernameSchema,
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform(value => value || null),
  password: z.string().min(8).max(256),
});

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3)
    .max(320)
    .transform(value => value.toLowerCase()),
  password: z.string().min(1).max(256),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

function toAuthResponse(data: Awaited<ReturnType<typeof loginAccountService>>) {
  return {
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    expires_at: data.expiresAt,
    user: data.user,
  };
}

export function createApp() {
  const app = new Hono().basePath(`/${functionName}`);

  app.use(cors(getDefaultCorsConfig()));
  app.onError(toErrorResponse);
  app.options('*', context => context.json({ message: 'OK' }, 200));
  app.use('/me', authenticationMiddleware);
  app.use('/logout', authenticationMiddleware);

  app.post('/register', zValidator('json', registerSchema), async context => {
    const supabaseClient = createServiceRoleSupabaseClient();
    const input = context.req.valid('json');
    const data = await registerAccountService({
      supabaseClient,
      email: input.email,
      username: input.username,
      name: input.name,
      password: input.password,
    });

    return context.json(toAuthResponse(data), 201);
  });

  app.post('/login', zValidator('json', loginSchema), async context => {
    const supabaseClient = createServiceRoleSupabaseClient();
    const input = context.req.valid('json');
    const data = await loginAccountService({
      supabaseClient,
      identifier: input.identifier,
      password: input.password,
    });

    return context.json(toAuthResponse(data), 200);
  });

  app.post('/refresh', zValidator('json', refreshSchema), async context => {
    const supabaseClient = createServiceRoleSupabaseClient();
    const input = context.req.valid('json');
    const data = await refreshSessionService({
      supabaseClient,
      refreshToken: input.refresh_token,
    });

    return context.json(toAuthResponse(data), 200);
  });

  app.get('/me', async context => {
    const { user } = getAuthenticatedRequestContext(context);

    return context.json({ user }, 200);
  });

  app.delete('/logout', async context => {
    const { supabaseClient, session } = getAuthenticatedRequestContext(context);

    await revokeSessionsData({
      supabaseClient,
      sessionId: session.id,
    });

    return context.json({ message: 'Logged out.' }, 200);
  });

  return app;
}

const app = createApp();

if (import.meta.main) {
  Deno.serve(app.fetch);
}
