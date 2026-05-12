import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 s
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root provider tree.
 * Add new providers here (i18n, theme, etc.) as features are built.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
