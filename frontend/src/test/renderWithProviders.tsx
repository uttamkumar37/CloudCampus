import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { ToastProvider } from '@/shared/ui';

type ProviderRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
  route?: string;
  router?: Pick<MemoryRouterProps, 'initialEntries' | 'initialIndex'>;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    route = '/',
    router,
    ...renderOptions
  }: ProviderRenderOptions = {},
) {
  const initialEntries = router?.initialEntries ?? [route];

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={initialEntries} initialIndex={router?.initialIndex}>
            {children}
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
