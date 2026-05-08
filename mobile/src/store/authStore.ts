import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthSession } from '../types/auth';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const SESSION_KEY = 'cc_auth_session';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,

  setSession: async (session) => {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({ session: null });
  },

  loadSession: async () => {
    try {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      set({
        session: stored ? (JSON.parse(stored) as AuthSession) : null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));

/** Call from outside React (e.g. Axios interceptor) */
export const getAuthSession = () => useAuthStore.getState().session;
