/**
 * useSessionHydration — restores auth session at app boot.
 *
 * Flow:
 *  1. Read cached AuthUser from MMKV (synchronous — instant UI restore).
 *  2. Read refresh token from SecureStore (async).
 *  3. Exchange refresh token for a fresh access token via /v1/auth/refresh.
 *  4. If successful → hydrate Zustand store (app unlocks).
 *  5. If refresh fails → clearAuth (user sees login screen).
 *
 * Returns `{ ready }` — root layout waits until `ready === true` before
 * rendering navigation so the guard never flickers to login incorrectly.
 */
import { useEffect, useState } from 'react';
import authClient from '@/shared/api/authClient';
import { tokenStore } from '@/shared/storage/tokenStore';
import { profileStore } from '@/shared/storage/profileStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export function useSessionHydration(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const storedRefreshToken = await tokenStore.getRefreshToken();
        const cachedUser = profileStore.getProfile();

        if (!storedRefreshToken || !cachedUser) {
          // No persisted session — go straight to login
          return;
        }

        const { data } = await authClient.post<RefreshResponse>(
          '/v1/auth/refresh',
          { refreshToken: storedRefreshToken },
        );

        if (!cancelled) {
          // Persist the rotated refresh token (if server rotates)
          await tokenStore.saveRefreshToken(data.refreshToken);
          hydrate(data.accessToken, data.refreshToken, cachedUser);
        }
      } catch {
        // Refresh token expired or network error — force re-login
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => { cancelled = true; };
  }, [hydrate, clearAuth]);

  return { ready };
}
