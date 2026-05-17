/**
 * Root layout — wraps the entire app in QueryClientProvider.
 *
 * Boot sequence (D2):
 *  1. useSessionHydration restores persisted refresh token from SecureStore
 *     and fetches a fresh access token. Shows a splash-like loader until done.
 *  2. NavigationGuard redirects based on auth state once hydration is ready.
 *  3. useProactiveTokenRefresh (mounted inside app group) pre-empts expiry on
 *     foreground transitions.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useSessionHydration } from '@/shared/hooks/useSessionHydration';
import { initDatabase } from '@/offline/database';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const { ready } = useSessionHydration();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inChangePassword = pathname.includes('change-password');

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && user.requiresPasswordChange && !inChangePassword) {
      // Force password change before accessing any app screen.
      router.replace('/(auth)/change-password');
    } else if (user && !user.requiresPasswordChange && inAuthGroup) {
      router.replace('/(app)/');
    }
  }, [user, segments, pathname, router, ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().finally(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </NavigationGuard>
    </QueryClientProvider>
  );
}
