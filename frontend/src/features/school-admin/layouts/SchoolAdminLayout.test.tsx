import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolAdminLayout } from '../layouts/SchoolAdminLayout';
import { SchoolAdminDashboardPage } from '../pages/SchoolAdminDashboardPage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { AuthUser } from '@/features/auth/types/auth';

// ── navigate mock ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    userId: 'admin-1',
    role: 'SCHOOL_ADMIN',
    tenantId: 'tenant-abc',
    schoolId: null,
    requiresPasswordChange: false,
    expiresIn: 900,
    features: [],
    ...overrides,
  };
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderShell(user: AuthUser | null = makeUser()) {
  if (user) useAuthStore.getState().setTokens('tok', 'ref', user);
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter initialEntries={['/school-admin/dashboard']}>
        <Routes>
          <Route path="/school-admin" element={<SchoolAdminLayout />}>
            <Route path="dashboard" element={<SchoolAdminDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SchoolAdminLayout', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    mockNavigate.mockReset();
  });

  it('renders the sidebar brand', () => {
    renderShell();
    expect(screen.getAllByText('CloudCampus').length).toBeGreaterThan(0);
  });

  it('renders the Dashboard nav link', () => {
    renderShell();
    const nav = screen.getAllByRole('navigation', { name: /school admin navigation/i })[0];
    expect(within(nav).getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders Settings nav link (no feature gate)', () => {
    renderShell();
    const nav = screen.getAllByRole('navigation', { name: /school admin navigation/i })[0];
    expect(within(nav).getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('hides feature-gated nav items when feature is absent', () => {
    renderShell(makeUser({ features: [] }));
    const nav = screen.getAllByRole('navigation', { name: /school admin navigation/i })[0];
    expect(within(nav).queryByRole('link', { name: /^classes$/i })).toBeNull();
    expect(within(nav).queryByRole('link', { name: /^subjects$/i })).toBeNull();
  });

  it('shows feature-gated nav items when feature is enabled', () => {
    renderShell(makeUser({ features: ['CLASS_MGMT', 'SUBJECT_MGMT'] }));
    const nav = screen.getAllByRole('navigation', { name: /school admin navigation/i })[0];
    expect(within(nav).getByRole('link', { name: /^classes$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^subjects$/i })).toBeInTheDocument();
  });

  it('clears auth and navigates to /login on sign out', async () => {
    renderShell();
    await userEvent.click(screen.getAllByRole('button', { name: /sign out/i })[0]);
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});

describe('SchoolAdminDashboardPage', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('renders dashboard heading', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('shows school admin identity in the shell', () => {
    renderShell(makeUser({ tenantId: 'my-school' }));
    expect(screen.getAllByText(/school admin/i).length).toBeGreaterThan(0);
  });

  it('renders all four stat card labels', () => {
    renderShell();
    const main = screen.getByRole('main');
    expect(within(main).getByTestId('stat-students')).toBeInTheDocument();
    expect(within(main).getByTestId('stat-staff')).toBeInTheDocument();
    expect(within(main).getByTestId('stat-classes')).toBeInTheDocument();
    expect(within(main).getByTestId('stat-notices')).toBeInTheDocument();
  });
});
