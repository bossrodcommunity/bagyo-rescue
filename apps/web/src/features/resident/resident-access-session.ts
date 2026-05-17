import { useEffect, useState } from 'react';
import { type ResidentAccessMethod } from '@/lib/dexie';
import { type ResidentSessionData } from './_data';

export type ResidentAccessSession = {
  session: ResidentSessionData;
  accessMethod: ResidentAccessMethod;
};

const residentAccessStorageKey = 'bagyo-rescue.resident-access-session';
const residentAccessStorageEvent = 'bagyo-rescue:resident-access-session';

export function getStoredResidentAccessSession() {
  if (typeof window === 'undefined') return null;

  const storedValue = window.localStorage.getItem(residentAccessStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as ResidentAccessSession;
  } catch {
    window.localStorage.removeItem(residentAccessStorageKey);
    return null;
  }
}

export function setStoredResidentAccessSession(access: ResidentAccessSession) {
  window.localStorage.setItem(residentAccessStorageKey, JSON.stringify(access));
  window.dispatchEvent(new Event(residentAccessStorageEvent));
}

export function clearStoredResidentAccessSession() {
  window.localStorage.removeItem(residentAccessStorageKey);
  window.dispatchEvent(new Event(residentAccessStorageEvent));
}

export function useResidentAccessSession() {
  const [access, setAccessState] = useState<ResidentAccessSession | null>(() =>
    getStoredResidentAccessSession()
  );

  useEffect(() => {
    function handleStorageChange() {
      setAccessState(getStoredResidentAccessSession());
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(residentAccessStorageEvent, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(residentAccessStorageEvent, handleStorageChange);
    };
  }, []);

  return {
    access,
    setAccess: (nextAccess: ResidentAccessSession) => {
      setStoredResidentAccessSession(nextAccess);
      setAccessState(nextAccess);
    },
    endSession: () => {
      clearStoredResidentAccessSession();
      setAccessState(null);
    },
  };
}
