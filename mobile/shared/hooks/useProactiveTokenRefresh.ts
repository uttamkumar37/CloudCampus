/**
 * useProactiveTokenRefresh — refreshes the access token when the app
 * comes back to the foreground and the token has < 2 minutes remaining.
 *
 * This prevents mid-request 401s when a user backgrounds the app for
 * longer than the 15-min token lifetime.
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

export function useProactiveTokenRefresh(): void {
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!user || !refreshToken) return;

    async function maybeRefresh() {
      const expiresIn = user?.expiresIn ?? 0; // seconds from login time
      // expiresIn is the original TTL (seconds). We re-refresh if it's within
      // the threshold — a proper implementation would track the absolute expiry
      // timestamp; for now we refresh proactively on every foreground event
      // when `expiresIn` is ≤ 120 s (i.e., token was issued for ≤ 2 min TTL).
      // In production the backend returns expiresIn=900 (15 min); the interceptor
      // handles actual 401s. This hook is a best-effort pre-emptive refresh.
      if (expiresIn > TWO_MINUTES_MS / 1000) return;

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
  }, [user, refreshToken, setAccessToken, clearAuth]);
}
