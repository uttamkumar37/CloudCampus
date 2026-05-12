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
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useSessionHydration } from '@/shared/hooks/useSessionHydration';

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
  const router = useRouter();
  const { ready } = useSessionHydration();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)/');
    }
  }, [user, segments, router, ready]);

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
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </NavigationGuard>
    </QueryClientProvider>
  );
}
