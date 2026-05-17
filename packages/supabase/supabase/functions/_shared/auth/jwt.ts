import { jwtVerify, SignJWT } from 'npm:jose@^5.9.6';
import { getEnvConfig } from '../env.ts';
import { UnauthorizedError } from '../utils/errors.ts';

const accessTokenLifetimeSeconds = 60 * 5;
const refreshTokenLifetimeSeconds = 60 * 60 * 24 * 30;
const textEncoder = new TextEncoder();

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  session_id: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  session_id: string;
  type: 'refresh';
};

function getAccessSecret() {
  return textEncoder.encode(getEnvConfig().APP_AUTH_ACCESS_TOKEN_SECRET);
}

function getRefreshSecret() {
  return textEncoder.encode(getEnvConfig().APP_AUTH_REFRESH_TOKEN_SECRET);
}

function getExpirationTimeFromNow(seconds: number) {
  return Math.floor(Date.now() / 1000) + seconds;
}

export async function signAccessToken(args: {
  userId: string;
  email: string;
  username: string;
  sessionId: string;
}) {
  return await new SignJWT({
    email: args.email,
    username: args.username,
    session_id: args.sessionId,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(args.userId)
    .setIssuedAt()
    .setExpirationTime(getExpirationTimeFromNow(accessTokenLifetimeSeconds))
    .sign(getAccessSecret());
}

export async function signRefreshToken(args: { userId: string; sessionId: string }) {
  return await new SignJWT({
    session_id: args.sessionId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(args.userId)
    .setIssuedAt()
    .setExpirationTime(getExpirationTimeFromNow(refreshTokenLifetimeSeconds))
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.session_id !== 'string' ||
      payload.type !== 'access'
    ) {
      throw new UnauthorizedError('Invalid access token.');
    }

    return payload as unknown as AccessTokenPayload & { exp: number };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError('Invalid or expired access token.');
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.session_id !== 'string' ||
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedError('Invalid refresh token.');
    }

    return payload as unknown as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError('Invalid or expired refresh token.');
  }
}

export function getAccessTokenExpiresAt(accessToken: string) {
  const [, encodedPayload] = accessToken.split('.');

  if (!encodedPayload) {
    throw new UnauthorizedError('Invalid access token.');
  }

  const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  const paddedPayload =
    normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4 || 4)) % 4);
  const decodedPayload = atob(paddedPayload);
  const payload = JSON.parse(decodedPayload) as { exp?: number };

  if (typeof payload.exp !== 'number') {
    throw new UnauthorizedError('Invalid access token.');
  }

  return payload.exp;
}
