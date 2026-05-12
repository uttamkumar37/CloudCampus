import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { AuthUser } from '@/features/auth/types/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

const mockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  userId: 'u1',
  role: 'SCHOOL_ADMIN',
  tenantId: 't1',
  requiresPasswordChange: false,
  expiresIn: 900,
  features: ['ATTENDANCE_QR'],
  ...overrides,
});

function renderGuard(
  props: { roles?: AuthUser['role'][]; feature?: string },
  children = <p>Protected Content</p>,
) {
  return render(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <ProtectedRoute {...props}>{children}</ProtectedRoute>
    </MemoryRouter>,
  );
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('redirects to /login when not authenticated', () => {
    const { container } = renderGuard({});
    // Navigate renders nothing in MemoryRouter — protected content absent
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders children when authenticated with no role/feature constraint', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser());
    renderGuard({});
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser({ role: 'SUPER_ADMIN' }));
    renderGuard({ roles: ['SUPER_ADMIN'] });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /403 when role does not match', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser({ role: 'TEACHER' }));
    const { container } = renderGuard({ roles: ['SUPER_ADMIN'] });
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders children when tenant has required feature', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser({ features: ['ATTENDANCE_QR'] }));
    renderGuard({ feature: 'ATTENDANCE_QR' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /plan-upgrade when feature is missing', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser({ features: [] }));
    const { container } = renderGuard({ feature: 'ATTENDANCE_QR' });
    expect(container.querySelector('p')).toBeNull();
  });

  it('SUPER_ADMIN bypasses feature check', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser({ role: 'SUPER_ADMIN', features: [] }));
    renderGuard({ feature: 'ATTENDANCE_QR' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
