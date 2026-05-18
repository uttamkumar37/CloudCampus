/**
 * useSessionHydration — restores auth session at app boot.
 *
 * Flow:
 *  1. Read cached AuthUser from MMKV (synchronous — instant UI restore).
 *  2. Read refresh token from SecureStore (async).
 *  3. L-06: Prompt biometric re-authentication when hardware is enrolled.
 *     If the user cancels → clear auth (login screen shown).
 *  4. Exchange refresh token for a fresh access token via /v1/auth/refresh.
 *  5. If successful → hydrate Zustand store (app unlocks).
 *  6. If refresh fails → clearAuth (user sees login screen).
 *
 * Returns `{ ready }` — root layout waits until `ready === true` before
 * rendering navigation so the guard never flickers to login incorrectly.
 */
import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
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
        const cachedUser = await profileStore.getProfile();

        if (!storedRefreshToken || !cachedUser) {
          // No persisted session — go straight to login
          return;
        }

        // L-06: Require biometric re-auth before restoring the session.
        // Prevents session hijack if the device is handed to someone else.
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled  = await LocalAuthentication.isEnrolledAsync();
        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Verify your identity to continue',
            cancelLabel:   'Sign in instead',
            fallbackLabel: 'Use passcode',
          });
          if (!result.success) {
            if (!cancelled) clearAuth();
            return;
          }
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
