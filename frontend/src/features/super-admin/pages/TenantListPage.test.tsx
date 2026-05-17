import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantListPage } from './TenantListPage';
import * as tenantApi from '../api/tenantApi';
import type { PageResponse } from '@/shared/types/api';
import type { TenantResponse } from '../types/tenant';

vi.mock('../api/tenantApi');

function makePageResponse(items: TenantResponse[]): PageResponse<TenantResponse> {
  return { items, offset: 0, limit: 20, total: items.length };
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <TenantListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockTenant: TenantResponse = {
  id: '00000000-0000-0000-0000-000000000001',
  code: 'springfield-high',
  name: 'Springfield High School',
  status: 'ACTIVE',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('TenantListPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state initially', () => {
    vi.mocked(tenantApi.listTenants).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading tenants');
  });

  it('renders tenant rows after successful fetch', async () => {
    vi.mocked(tenantApi.listTenants).mockResolvedValue(makePageResponse([mockTenant]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Springfield High School')).toBeInTheDocument());
    expect(screen.getByText('springfield-high')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows empty state when no tenants', async () => {
    vi.mocked(tenantApi.listTenants).mockResolvedValue(makePageResponse([]));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('tenant-empty-state')).toBeInTheDocument());
  });

  it('shows error message on fetch failure', async () => {
    vi.mocked(tenantApi.listTenants).mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/failed to load/i));
  });

  it('has a New Tenant link', async () => {
    vi.mocked(tenantApi.listTenants).mockResolvedValue(makePageResponse([mockTenant]));
    renderPage();
    await waitFor(() => screen.getByText('Springfield High School'));
    const link = screen.getByRole('link', { name: /new tenant/i });
    expect(link).toHaveAttribute('href', '/super-admin/tenants/new');
  });
});
