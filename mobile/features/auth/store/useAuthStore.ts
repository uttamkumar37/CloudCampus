import { create } from 'zustand';
import type { AuthUser } from '../types/auth';
import { tokenStore } from '@/shared/storage/tokenStore';
import { profileStore } from '@/shared/storage/profileStore';

interface AuthStore {
  /** Access token — in-memory only; NEVER persisted */
  accessToken: string | null;
  /** Refresh token — in-memory mirror; persisted to SecureStore on write */
  refreshToken: string | null;
  user: AuthUser | null;
  /** Called after successful login */
  setTokens: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  /** Called by 401 refresh interceptor after obtaining a new access token */
  setAccessToken: (accessToken: string) => void;
  /** Restores session from SecureStore + MMKV at app boot */
  hydrate: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  /** Clears all auth state and removes persisted data */
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setTokens: (accessToken, refreshToken, user) => {
    // Persist refresh token + user profile; access token stays in memory
    tokenStore.saveRefreshToken(refreshToken).catch(() => {/* silent */});
    profileStore.saveProfile(user);
    set({ accessToken, refreshToken, user });
  },

  setAccessToken: (accessToken) =>
    set((state) => ({ ...state, accessToken })),

  hydrate: (accessToken, refreshToken, user) =>
    set({ accessToken, refreshToken, user }),

  clearAuth: () => {
    tokenStore.deleteRefreshToken().catch(() => {/* silent */});
    profileStore.deleteProfile();
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));
