/**
 * useProactiveTokenRefresh — refreshes the access token when the app
 * comes back to the foreground and the token has < 2 minutes remaining.
 *
 * L-05: decodes the JWT `exp` claim to get the absolute expiry time instead
 * of comparing against the original TTL (which was always > 120 s and caused
 * the hook to always no-op).
 */
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import authClient from '@/shared/api/authClient';
import { tokenStore } from '@/shared/storage/tokenStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const TWO_MINUTES_MS = 2 * 60 * 1000;

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

function getTokenExpiryMs(jwt: string): number | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1])) as Record<string, unknown>;
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useProactiveTokenRefresh(): void {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!user || !refreshToken || !accessToken) return;

    async function maybeRefresh() {
      if (!accessToken) return;
      const expiresAtMs = getTokenExpiryMs(accessToken);
      if (expiresAtMs === null) return;
      // Only refresh when within 2 minutes of actual expiry
      if (expiresAtMs - Date.now() > TWO_MINUTES_MS) return;

      try {
        const stored = await tokenStore.getRefreshToken();
        if (!stored) return;
        const { data } = await authClient.post<RefreshResponse>(
          '/v1/auth/refresh',
          { refreshToken: stored },
        );
        await tokenStore.saveRefreshToken(data.refreshToken);
        setAccessToken(data.accessToken);
      } catch {
        clearAuth();
      }
    }

    function handleAppStateChange(state: AppStateStatus) {
      if (state === 'active') {
        void maybeRefresh();
      }
    }

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [user, accessToken, refreshToken, setAccessToken, clearAuth]);
}
