import { type AuthSession } from './types';

const authSessionStorageKey = 'bagyo-rescue.auth-session';

export function getStoredAuthSession() {
  const storedValue = window.localStorage.getItem(authSessionStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(authSessionStorageKey);
    return null;
  }
}

export function setStoredAuthSession(session: AuthSession) {
  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(authSessionStorageKey);
}
