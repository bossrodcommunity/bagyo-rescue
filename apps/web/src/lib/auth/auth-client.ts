import { envConfig } from '@/env';
import { type AuthResponse, type AuthSession, type AuthUser } from './types';

export type RegisterAccountPayload = {
  email: string;
  username: string;
  name: string | null;
  password: string;
};

export type LoginAccountPayload = {
  identifier: string;
  password: string;
};

function getAuthEndpoint(path: string) {
  return new URL(`/functions/v1/auth${path}`, envConfig.SUPABASE_URL).toString();
}

async function parseAuthResponse(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | AuthResponse
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(
      body && 'error' in body ? body.error?.message : 'Authentication request failed.'
    );
  }

  const authBody = body as AuthResponse;

  return {
    accessToken: authBody.access_token,
    refreshToken: authBody.refresh_token,
    expiresAt: authBody.expires_at,
    user: authBody.user,
  } satisfies AuthSession;
}

async function parseUserResponse(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { user: AuthUser }
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(
      body && 'error' in body ? body.error?.message : 'Authentication request failed.'
    );
  }

  if (!body || !('user' in body)) {
    throw new Error('Authentication request failed.');
  }

  return body.user;
}

export async function registerAccount(payload: RegisterAccountPayload) {
  const response = await fetch(getAuthEndpoint('/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await parseAuthResponse(response);
}

export async function loginAccount(payload: LoginAccountPayload) {
  const response = await fetch(getAuthEndpoint('/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await parseAuthResponse(response);
}

export async function refreshAccountSession(refreshToken: string) {
  const response = await fetch(getAuthEndpoint('/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  return await parseAuthResponse(response);
}

export async function getCurrentAccount(accessToken: string) {
  const response = await fetch(getAuthEndpoint('/me'), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await parseUserResponse(response);
}

export async function logoutAccount(accessToken: string) {
  const response = await fetch(getAuthEndpoint('/logout'), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? 'Unable to log out.');
  }
}
