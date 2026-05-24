import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AuthUser } from '@/features/auth/types/auth';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { DemoEnvironmentBanner } from './DemoEnvironmentBanner';
import { DEMO_TENANT_ID } from './demoTenant';

const baseUser: AuthUser = {
  userId: 'user-1',
  role: 'SCHOOL_ADMIN',
  tenantId: 'tenant-regular',
  schoolId: 'school-1',
  requiresPasswordChange: false,
  expiresIn: 3600,
  features: [],
};

describe('DemoEnvironmentBanner', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    window.sessionStorage.clear();
  });

  it('shows demo reset warning for the demo tenant', () => {
    useAuthStore.getState().setTokens('access', 'refresh', {
      ...baseUser,
      tenantId: DEMO_TENANT_ID,
    });

    render(<DemoEnvironmentBanner />);

    expect(screen.getByTestId('demo-environment-banner')).toHaveTextContent('Demo-only tenant');
    expect(screen.getByText(/resets nightly at 02:00/i)).toBeInTheDocument();
  });

  it('stays hidden for non-demo tenants', () => {
    useAuthStore.getState().setTokens('access', 'refresh', baseUser);

    render(<DemoEnvironmentBanner />);

    expect(screen.queryByTestId('demo-environment-banner')).not.toBeInTheDocument();
  });
});
