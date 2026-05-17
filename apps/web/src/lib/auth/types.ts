export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  created_at: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type AuthSession = AuthTokens & {
  user: AuthUser;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
};
