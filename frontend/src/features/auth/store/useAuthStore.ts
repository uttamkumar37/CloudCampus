import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

const AUTH_SESSION_KEY = 'cloudcampus.auth.session';

interface AuthStore {
  accessToken: string | null;
  /** Opaque UUID. Stored in sessionStorage so browser refresh keeps the session. */
  refreshToken: string | null;
  user: AuthUser | null;

  setTokens: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

type StoredAuthSession = Pick<AuthStore, 'accessToken' | 'refreshToken' | 'user'>;

function readStoredSession(): StoredAuthSession {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, user: null };
  }

  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      return { accessToken: null, refreshToken: null, user: null };
    }
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    return { accessToken: null, refreshToken: null, user: null };
  }
}

function writeStoredSession(session: StoredAuthSession): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function removeStoredSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

const initialSession = readStoredSession();

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: initialSession.accessToken,
  refreshToken: initialSession.refreshToken,
  user: initialSession.user,

  setTokens: (accessToken, refreshToken, user) => {
    writeStoredSession({ accessToken, refreshToken, user });
    set({ accessToken, refreshToken, user });
  },

  setAccessToken: (accessToken) =>
    set((state) => {
      const next = { ...state, accessToken };
      writeStoredSession({
        accessToken,
        refreshToken: next.refreshToken,
        user: next.user,
      });
      return next;
    }),

  clearAuth: () => {
    removeStoredSession();
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));
