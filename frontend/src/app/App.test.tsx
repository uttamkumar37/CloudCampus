import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import { App } from './App';
import type { CurrentUser, SchoolAccess } from '../features/auth/api/authApi';
import type { AuthClient } from '../features/auth/hooks/authState';

const schoolA: SchoolAccess = {
  schoolId: 'school-a',
  code: 'A',
  name: 'School A',
  role: 'SCHOOL_ADMIN',
  primaryAccess: true,
};

const schoolB: SchoolAccess = {
  schoolId: 'school-b',
  code: 'B',
  name: 'School B',
  role: 'SCHOOL_ADMIN',
  primaryAccess: false,
};

function storageWithToken(token: string | null = null) {
  const values = new Map<string, string>();
  if (token) {
    values.set('cloudcampus.auth.accessToken', token);
  }
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

function authClientFor(user: CurrentUser, schools: SchoolAccess[] = user.allowedSchools): Partial<AuthClient> {
  return {
    activateSchool: vi.fn().mockResolvedValue({
      accessToken: 'activated-token',
      refreshToken: null,
      tokenType: 'Bearer',
      expiresAt: '2026-05-26T11:00:00Z',
      user: { ...user, activeSchool: schools[0] ?? null, allowedSchools: schools },
      mfaRequired: false,
      mfaChallengeId: null,
      mfaCode: null,
      mfaExpiresAt: null,
    }),
    getCurrentUser: vi.fn().mockResolvedValue(user),
    getMySchools: vi.fn().mockResolvedValue(schools),
    logout: vi.fn().mockResolvedValue({ message: 'Logged out' }),
  };
}

describe('App', () => {
  it('renders public login/invitation panels and blocks protected routes when unauthenticated', async () => {
    render(<App storage={storageWithToken()} />);

    expect(
      screen.getByRole('heading', {
        name: /clean single-school onboarding/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cloudcampus-shell')).toBeInTheDocument();
    expect(screen.getByText(/backend api shell/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /accept school admin invitation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /school admin login/i })).toBeInTheDocument();
    expect(await screen.findAllByText(/sign in to access this protected route/i)).toHaveLength(3);
    expect(screen.queryByRole('heading', { name: /create tenant with first real school/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
  });

  it('clears an invalid stored token and returns to login-required protected routes', async () => {
    const storage = storageWithToken('expired-token');
    const authClient: Partial<AuthClient> = {
      activateSchool: vi.fn(),
      getCurrentUser: vi.fn().mockRejectedValue(new Error('expired')),
      getMySchools: vi.fn().mockResolvedValue([]),
      logout: vi.fn(),
    };

    render(<App authClient={authClient} storage={storage} />);

    expect(await screen.findAllByText(/sign in to access this protected route/i)).toHaveLength(3);
    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.refreshToken');
  });

  it('allows a Super Admin to access onboarding', async () => {
    const user: CurrentUser = {
      userId: 'super-1',
      email: 'super@example.com',
      displayName: 'Super Admin',
      role: 'SUPER_ADMIN',
      tenantId: 'platform',
      activeSchool: null,
      allowedSchools: [],
    };

    render(<App authClient={authClientFor(user, [])} storage={storageWithToken('super-token')} />);

    expect(await screen.findByRole('heading', { name: /create tenant with first real school/i })).toBeInTheDocument();
    expect(screen.getAllByText(/your role cannot access this route/i)).toHaveLength(2);
  });

  it('allows a School Admin to access the active-school scaffold', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-1',
      email: 'admin@example.com',
      displayName: 'School Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };

    render(<App authClient={authClientFor(user)} storage={storageWithToken('school-admin-token')} />);

    expect(await screen.findByRole('heading', { name: /link parent to student/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /provision staff portal login/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /academic setup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /academic assignments/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /student import/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bulk jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fee lifecycle/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /report exports/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create tenant with first real school/i })).not.toBeInTheDocument();
  });

  it('does not allow a School Admin to access Super Admin onboarding', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-2',
      email: 'admin2@example.com',
      displayName: 'School Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };

    render(<App authClient={authClientFor(user)} storage={storageWithToken('school-admin-token')} />);

    await screen.findByRole('heading', { name: /link parent to student/i });
    const superAdminPanel = screen.getByRole('heading', { name: /super admin onboarding/i }).closest('section');
    expect(superAdminPanel).not.toBeNull();
    expect(within(superAdminPanel as HTMLElement).getByText(/your role cannot access this route/i)).toBeInTheDocument();
  });

  it.each(['TEACHER', 'PARENT', 'STUDENT', 'STAFF'] as const)(
    'does not allow %s to access admin-only panels',
    async (role) => {
      const user: CurrentUser = {
        userId: `${role.toLowerCase()}-1`,
        email: `${role.toLowerCase()}@example.com`,
        displayName: role,
        role,
        tenantId: 'tenant-1',
        activeSchool: schoolA,
        allowedSchools: [schoolA],
      };

      render(<App authClient={authClientFor(user)} storage={storageWithToken(`${role.toLowerCase()}-token`)} />);

      expect(await screen.findAllByText(/your role cannot access this route/i)).toHaveLength(3);
      expect(screen.queryByRole('heading', { name: /create tenant with first real school/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
    },
  );

  it('allows a Tenant Admin to access tenant school creation', async () => {
    const user: CurrentUser = {
      userId: 'tenant-admin-1',
      email: 'tenant@example.com',
      displayName: 'Tenant Admin',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: null,
      allowedSchools: [],
    };

    render(<App authClient={authClientFor(user, [])} storage={storageWithToken('tenant-admin-token')} />);

    expect(await screen.findByRole('heading', { name: /create tenant school/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tenant settings and usage/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tenant reports/i })).toBeInTheDocument();
  });

  it('activates a selected school through the current-user school API', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-3',
      email: 'admin3@example.com',
      displayName: 'School Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: null,
      allowedSchools: [schoolA, schoolB],
    };
    const storage = storageWithToken('school-admin-token');
    const authClient = authClientFor(user, [schoolA, schoolB]);

    render(<App authClient={authClient} storage={storage} />);

    expect(await screen.findByRole('heading', { name: /active school/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^school$/i), { target: { value: 'school-b' } });
    fireEvent.click(screen.getByRole('button', { name: /activate school/i }));

    await waitFor(() => expect(authClient.activateSchool).toHaveBeenCalledWith('school-admin-token', 'school-b'));
    expect(storage.setItem).toHaveBeenCalledWith('cloudcampus.auth.accessToken', 'activated-token');
  });

  it('auto-activates the only assigned school and opens active-school panels', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-4',
      email: 'admin4@example.com',
      displayName: 'School Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: null,
      allowedSchools: [schoolA],
    };
    const authClient = {
      ...authClientFor(user, [schoolA]),
      getCurrentUser: vi.fn()
        .mockResolvedValueOnce(user)
        .mockResolvedValue({ ...user, activeSchool: schoolA, allowedSchools: [schoolA] }),
    };

    render(<App authClient={authClient} storage={storageWithToken('school-admin-token')} />);

    await waitFor(() => expect(authClient.activateSchool).toHaveBeenCalledTimes(1));
    expect(authClient.activateSchool).toHaveBeenCalledWith('school-admin-token', 'school-a');
    expect(await screen.findByRole('heading', { name: /link parent to student/i })).toBeInTheDocument();
  });

  it('shows a clear error when school activation is denied', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-5',
      email: 'admin5@example.com',
      displayName: 'School Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: null,
      allowedSchools: [schoolA, schoolB],
    };
    const storage = storageWithToken('school-admin-token');
    const authClient = {
      ...authClientFor(user, [schoolA, schoolB]),
      activateSchool: vi.fn().mockRejectedValue(new Error('denied')),
    };

    render(<App authClient={authClient} storage={storage} />);

    expect(await screen.findByRole('heading', { name: /active school/i })).toBeInTheDocument();
    expect(screen.getByText(/2 assigned schools/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^school$/i), { target: { value: 'school-b' } });
    fireEvent.click(screen.getByRole('button', { name: /activate school/i }));

    expect(await screen.findByText(/school activation was denied/i)).toBeInTheDocument();
    expect(storage.setItem).not.toHaveBeenCalledWith('cloudcampus.auth.accessToken', 'activated-token');
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
  });
});
