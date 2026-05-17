import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentAccount,
  loginAccount,
  logoutAccount,
  refreshAccountSession,
  registerAccount,
  type LoginAccountPayload,
  type RegisterAccountPayload,
} from './auth-client';
import { clearStoredAuthSession, getStoredAuthSession, setStoredAuthSession } from './auth-storage';
import { type AuthSession, type AuthUser } from './types';

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (payload: RegisterAccountPayload) => Promise<AuthSession>;
  login: (payload: LoginAccountPayload) => Promise<AuthSession>;
  refresh: () => Promise<AuthSession | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAccessTokenFresh(session: AuthSession) {
  return session.expiresAt * 1000 > Date.now() + 30_000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
    setStoredAuthSession(nextSession);
    return nextSession;
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    clearStoredAuthSession();
  }, []);

  const refresh = useCallback(async () => {
    const storedSession = getStoredAuthSession();

    if (!storedSession?.refreshToken) {
      clearSession();
      return null;
    }

    try {
      return persistSession(await refreshAccountSession(storedSession.refreshToken));
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const storedSession = getStoredAuthSession();

      if (!storedSession) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const activeSession = isAccessTokenFresh(storedSession)
          ? storedSession
          : await refreshAccountSession(storedSession.refreshToken);
        const user = await getCurrentAccount(activeSession.accessToken);
        const verifiedSession = { ...activeSession, user };

        if (isMounted) {
          persistSession(verifiedSession);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      register: async payload => persistSession(await registerAccount(payload)),
      login: async payload => persistSession(await loginAccount(payload)),
      refresh,
      logout: async () => {
        const activeSession = session;
        clearSession();

        if (activeSession) {
          await logoutAccount(activeSession.accessToken).catch(() => undefined);
        }
      },
    }),
    [clearSession, isLoading, persistSession, refresh, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
