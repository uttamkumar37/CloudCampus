import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

interface AuthStore {
  accessToken: string | null;
  /** Opaque UUID. In-memory only — never written to localStorage. */
  refreshToken: string | null;
  user: AuthUser | null;

  setTokens: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setTokens: (accessToken, refreshToken, user) =>
    set({ accessToken, refreshToken, user }),

  setAccessToken: (accessToken) =>
    set((state) => ({ ...state, accessToken })),

  clearAuth: () =>
    set({ accessToken: null, refreshToken: null, user: null }),
}));
