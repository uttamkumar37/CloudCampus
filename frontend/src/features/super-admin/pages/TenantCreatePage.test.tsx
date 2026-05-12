import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantCreatePage } from './TenantCreatePage';
import * as tenantApi from '../api/tenantApi';
import type { TenantResponse } from '../types/tenant';

vi.mock('../api/tenantApi');

// react-router-dom navigate mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <TenantCreatePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockCreated: TenantResponse = {
  id: '00000000-0000-0000-0000-000000000002',
  code: 'test-school',
  name: 'Test School',
  status: 'ACTIVE',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('TenantCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  it('renders code and name fields', () => {
    renderPage();
    expect(screen.getByLabelText(/tenant code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organisation name/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() => expect(screen.getByText(/code is required/i)).toBeInTheDocument());
  });

  it('shows validation error for invalid code', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/tenant code/i), '-bad-code-');
    await userEvent.type(screen.getByLabelText(/organisation name/i), 'Valid Name');
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() => {
      const alert = screen.getByRole('alert', { name: '' });
      expect(alert).toHaveTextContent(/cannot start or end with a hyphen/i);
    });
  });

  it('submits valid form and navigates to tenant list', async () => {
    vi.mocked(tenantApi.createTenant).mockResolvedValue(mockCreated);
    renderPage();
    await userEvent.type(screen.getByLabelText(/tenant code/i), 'test-school');
    await userEvent.type(screen.getByLabelText(/organisation name/i), 'Test School');
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/super-admin/tenants', { replace: true }),
    );
  });

  it('shows API error on failure', async () => {
    vi.mocked(tenantApi.createTenant).mockRejectedValue(new Error('Duplicate code'));
    renderPage();
    await userEvent.type(screen.getByLabelText(/tenant code/i), 'test-school');
    await userEvent.type(screen.getByLabelText(/organisation name/i), 'Test School');
    await userEvent.click(screen.getByRole('button', { name: /create tenant/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Duplicate code'));
  });
});
