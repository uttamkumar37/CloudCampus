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
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/v1/super-admin/search')) {
        return jsonResponse({
          results: [{
            id: 'user-1',
            type: 'USER',
            title: 'Ada Admin',
            detail: 'ada@example.com',
            navId: 'access-control',
            createdAt: '2026-06-01T00:00:00Z',
          }],
          page: 0,
          size: 10,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/super-admin/platform-metrics')) {
        return jsonResponse({
          totalTenantCount: 1,
          activeTenantCount: 1,
          totalSchoolCount: 1,
          activeSchoolCount: 1,
          totalStudentCount: 42,
          activeStudentCount: 40,
          totalStaffCount: 8,
          activeStaffCount: 8,
          totalUserCount: 3,
          activeUserCount: 3,
          pendingInvoiceCount: 1,
          overdueInvoiceCount: 0,
          paidInvoiceCount: 0,
          failedNotificationCount: 0,
          pendingOutboxCount: 0,
          pendingReportExportCount: 0,
          lastCalculatedAt: '2026-05-28T00:00:00Z',
        });
      }
      if (url.includes('/v1/super-admin/users')) {
        return jsonResponse({
          items: [{
            userId: 'user-1',
            tenantId: 'tenant-platform',
            tenantName: 'Platform Tenant',
            email: 'ada@example.com',
            displayName: 'Ada Admin',
            primaryRole: 'TENANT_ADMIN',
            status: 'ACTIVE',
            mfaRequired: true,
            activatedAt: '2026-06-01T00:00:00Z',
            roles: [],
            permissionOverrides: [],
            schoolAccess: [],
          }],
          page: 0,
          size: 25,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/super-admin/roles/') && url.includes('/permissions')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/super-admin/permissions')) {
        return jsonResponse([{
          code: 'TENANT_VIEW',
          name: 'Tenant View',
          description: null,
          category: 'TENANT',
          riskLevel: 'LOW',
          scopeType: 'TENANT',
          active: true,
        }]);
      }
      if (url.includes('/v1/super-admin/tenants')) {
        return jsonResponse({
          items: [{
            tenantId: 'tenant-platform',
            code: 'PLATFORM',
            name: 'Platform Tenant',
            status: 'ACTIVE',
            schoolCount: 1,
            activeSchoolCount: 1,
            userCount: 3,
            planCode: 'GROWTH',
            planName: 'Growth',
            createdAt: '2026-05-28T00:00:00Z',
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/super-admin/schools')) {
        return jsonResponse({
          items: [{
            schoolId: 'school-platform',
            schoolCode: 'MAIN',
            schoolName: 'Platform School',
            tenantId: 'tenant-platform',
            tenantCode: 'PLATFORM',
            tenantName: 'Platform Tenant',
            status: 'ACTIVE',
            primarySchool: true,
            studentCount: 42,
            staffCount: 8,
            createdAt: '2026-05-28T00:00:00Z',
            lastActivityAt: '2026-05-28T00:00:00Z',
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/super-admin/revenue/invoices')) {
        return jsonResponse({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 });
      }
      if (url.includes('/v1/super-admin/revenue/summary')) {
        return jsonResponse({
          monthlyRecurringRevenueCents: 250000,
          annualRecurringRevenueEstimateCents: 3000000,
          totalInvoicedCents: 250000,
          issuedInvoiceCount: 1,
          paidInvoiceCount: 0,
          pendingInvoiceCount: 1,
          overdueInvoiceCount: 0,
          monthlyTrend: [{ label: '2026-05', value: 250000 }],
          tenantBreakdown: [],
          planBreakdown: [],
        });
      }
      if (url.includes('/v1/super-admin/platform-health')) {
        return jsonResponse({
          backendHealth: 'UP',
          readiness: 'READY',
          databaseStatus: 'CONNECTED',
          migrationStatus: 'FLYWAY_ENABLED',
          notificationMode: 'log',
          pendingOutboxCount: 0,
          pendingReportExportCount: 0,
          aiEnabledTenantCount: 0,
          appVersion: '0.1.0-SNAPSHOT',
          checkedAt: '2026-05-28T00:00:00Z',
          alerts: [],
        });
      }
      if (url.includes('/v1/super-admin/notifications/summary')) {
        return jsonResponse({
          totalDeliveries: 0,
          sentDeliveries: 0,
          loggedDeliveries: 0,
          failedDeliveries: 0,
          disabledDeliveries: 0,
          recentDeliveries: [],
        });
      }
      if (url.includes('/v1/super-admin/subscriptions/plans')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/super-admin/ai/usage/summary')) {
        return jsonResponse({
          enabledTenantCount: 0,
          totalMonthlyBudget: 0,
          totalUnitsUsedThisMonth: 0,
          deniedRequestsThisMonth: 0,
          budgetExceededRequestsThisMonth: 0,
          tenants: [],
          usageAudit: [],
        });
      }
      if (url.includes('/v1/super-admin/reports/summary')) {
        return jsonResponse({ metrics: [], exports: [] });
      }
      if (url.includes('/v1/super-admin/audit-logs')) {
        return jsonResponse({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 });
      }
      if (url.includes('/v1/super-admin/settings')) {
        return jsonResponse({
          platformName: 'CloudCampus',
          supportEmail: 'support@cloudcampus.dev',
          defaultTimezone: 'UTC',
          publicFrontendUrl: 'http://localhost:5173',
          corsAllowedOrigins: ['http://localhost:5173'],
          notificationMode: 'log',
          aiDefaultPolicy: 'Tenant entitlement controls enabled.',
          maintenanceMode: false,
          runtime: { jwtSecret: 'configured/hidden' },
        });
      }
      if (url.includes('/v1/tenant-admin/schools') && url.includes('/admins')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/tenant-admin/schools')) {
        return jsonResponse([{
          id: 'school-tenant',
          tenantId: 'tenant-1',
          code: 'MAIN',
          name: 'Tenant Main School',
          primarySchool: true,
          active: true,
          maxSchools: 3,
          schoolsUsed: 1,
        }]);
      }
      if (url.includes('/v1/tenant-admin/reports/summary')) {
        return jsonResponse({
          tenantId: 'tenant-1',
          tenantName: 'Tenant One',
          schoolId: null,
          schoolName: null,
          totalSchools: 1,
          activeSchools: 1,
          totals: {
            totalStudents: 42,
            activeStudents: 40,
            totalFeeDemands: 2,
            amountDue: 1000,
            amountPaid: 600,
            outstandingAmount: 400,
          },
          schools: [{
            schoolId: 'school-tenant',
            code: 'MAIN',
            name: 'Tenant Main School',
            primarySchool: true,
            active: true,
            metrics: {
              totalStudents: 42,
              activeStudents: 40,
              totalFeeDemands: 2,
              amountDue: 1000,
              amountPaid: 600,
              outstandingAmount: 400,
            },
          }],
        });
      }
      if (url.includes('/v1/tenant-admin/subscription/usage')) {
        return jsonResponse({
          tenantId: 'tenant-1',
          tenantCode: 'TENANT',
          tenantName: 'Tenant One',
          tenantStatus: 'ACTIVE',
          planCode: 'GROWTH',
          maxSchools: 3,
          schoolsUsed: 1,
          activeSchools: 1,
          remainingSchools: 2,
          schoolAdmins: 1,
          teachers: 4,
          staff: 6,
          students: 42,
          schoolLimitReached: false,
        });
      }
      if (url.includes('/v1/tenant-admin/settings')) {
        return jsonResponse({
          tenantId: 'tenant-1',
          tenantCode: 'TENANT',
          tenantName: 'Tenant One',
          displayName: 'Tenant One Group',
          billingEmail: 'billing@tenant.test',
          supportEmail: 'support@tenant.test',
          timezone: 'Asia/Kolkata',
          locale: 'en-IN',
          updatedAt: '2026-05-28T00:00:00Z',
        });
      }
      if (url.includes('/dashboard/summary')) {
        return jsonResponse({ metrics: [], alerts: [], activity: [] });
      }
      if (url.includes('/v1/school-admin/parents')) {
        return jsonResponse({
          items: [{
            id: 'parent-link-1',
            fullName: 'Parent Example',
            parentEmail: 'parent@example.com',
            studentName: 'Asha Mehta',
            admissionNumber: 'ADM-001',
            active: true,
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/school-admin/teachers')) {
        return jsonResponse({
          items: [{
            id: 'teacher-profile-1',
            fullName: 'Ravi Sharma',
            email: 'ravi@example.com',
            role: 'TEACHER',
            active: true,
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/school-admin/staff')) {
        return jsonResponse({
          items: [{
            id: 'staff-profile-1',
            fullName: 'Neha Singh',
            email: 'neha@example.com',
            role: 'FINANCE_STAFF',
            active: true,
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/school-admin/settings')) {
        return jsonResponse({
          tenantId: 'tenant-1',
          schoolId: 'school-a',
          code: 'A',
          name: 'School A',
          active: true,
          primarySchool: true,
        });
      }
      if (url.includes('/v1/school-admin/students?')) {
        return jsonResponse({
          items: [],
          page: 0,
          size: 10,
          totalItems: 0,
          totalPages: 0,
        });
      }
      if (url.includes('/v1/school-admin/students')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/school-admin/fees/demands')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/school-admin/attendance/sessions')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/finance/fees/demands')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/finance/receipts')) {
        return jsonResponse({
          items: [{
            id: 'receipt-1',
            receiptNumber: 'RCP-001',
            studentName: 'Asha Mehta',
            amount: 500,
            paymentMethod: 'CASH',
            paidAt: '2026-05-28T00:00:00Z',
          }],
          page: 0,
          size: 50,
          totalItems: 1,
          totalPages: 1,
        });
      }
      if (url.includes('/v1/finance/reports/summary')) {
        return jsonResponse({
          totalDemanded: 1000,
          totalCollected: 500,
          totalOutstanding: 500,
          demandCount: 2,
          receiptCount: 1,
        });
      }
      if (url.includes('/v1/finance/reports/collections')) {
        return jsonResponse({
          items: [{ date: '2026-05-28', totalCollected: 500, receiptCount: 1 }],
        });
      }
      if (url.includes('/v1/teacher/assignments')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/parent/children')) {
        return jsonResponse([]);
      }
      if (url.includes('/v1/student/profile')) {
        return jsonResponse({ id: 'student-profile' });
      }
      return jsonResponse([]);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders only public login and invitation panels when unauthenticated', async () => {
    render(<App storage={storageWithToken()} />);

    expect(screen.getByRole('heading', { name: /run your school/i })).toBeInTheDocument();
    expect(screen.getByTestId('cloudcampus-shell')).toBeInTheDocument();
    expect(screen.getByText(/#1 modern school erp platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cloudcampus dashboard and mobile preview/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /everything a modern school needs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ready to transform your school/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /cloudcampus login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /accept school admin invitation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /school admin login/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in to access this protected route/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /super admin onboarding/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /tenant admin portal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /school admin scaffold/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('dialog', { name: /cloudcampus account access/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /welcome back/i })).toHaveLength(2);
    expect(screen.getByText(/one login works for super admin/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /accept invitation/i }));
    expect(screen.getByRole('heading', { name: /accept school admin invitation/i })).toBeInTheDocument();
  });

  it('clears an invalid stored token and returns to the public login screen', async () => {
    const storage = storageWithToken('expired-token');
    const authClient: Partial<AuthClient> = {
      activateSchool: vi.fn(),
      getCurrentUser: vi.fn().mockRejectedValue(new Error('expired')),
      getMySchools: vi.fn().mockResolvedValue([]),
      logout: vi.fn(),
    };

    render(<App authClient={authClient} storage={storage} />);

    expect(await screen.findByRole('heading', { name: /run your school/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /cloudcampus login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /accept school admin invitation/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in to access this protected route/i)).not.toBeInTheDocument();
    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('cloudcampus.auth.refreshToken');
  });

  it('shows only the Super Admin area to a Super Admin', async () => {
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

    expect((await screen.findAllByRole('heading', { name: /super admin dashboard/i })).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/breadcrumbs/i)).toHaveTextContent(/cloudcampus/i);
    expect(screen.getAllByRole('heading', { name: /^super admin dashboard$/i }).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/platform access/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/platform-wide access/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /account session/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/school access/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/server-derived from \/v1\/me/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/v1\/me/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not accepted from frontend input/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/developer details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tenant-platform/i)).not.toBeInTheDocument();
    expect((await screen.findAllByText(/Platform Tenant/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$2,500/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /platform access/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open profile menu/i }));
    expect(screen.getByRole('menu', { name: /profile menu/i })).toHaveTextContent(/last login: current session/i);
    expect(screen.getByRole('menu', { name: /profile menu/i })).toHaveTextContent(/super@example.com/i);
    expect(screen.getByRole('region', { name: /super admin area/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /super admin navigation/i })).toBeInTheDocument();
    const superAdminNav = screen.getByRole('navigation', { name: /super admin navigation/i });
    expect(within(superAdminNav).getByText(/overview/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByText(/manage/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByText(/business/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByText(/operations/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByText(/intelligence/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByText(/configuration/i)).toBeInTheDocument();
    expect(within(superAdminNav).getByRole('button', { name: /organizations/i })).toBeInTheDocument();
    expect(within(superAdminNav).getByRole('button', { name: /users & roles/i })).toBeInTheDocument();
    expect(within(superAdminNav).getByRole('button', { name: /^plans$/i })).toBeInTheDocument();
    expect(within(superAdminNav).getByRole('button', { name: /^health$/i })).toBeInTheDocument();
    expect(within(superAdminNav).getByRole('button', { name: /^audit$/i })).toBeInTheDocument();
    fireEvent.click(within(superAdminNav).getByRole('button', { name: /organizations/i }));
    expect((await screen.findAllByRole('heading', { name: /^organizations$/i })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog', { name: /create organization/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /create organization/i }));
    expect(screen.getByRole('dialog', { name: /create organization/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^create organization$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create school/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/your role cannot access this route/i)).not.toBeInTheDocument();
  });

  it('opens grouped Super Admin search results from the command palette', async () => {
    const user: CurrentUser = {
      userId: 'super-search',
      email: 'super-search@example.com',
      displayName: 'Super Search',
      role: 'SUPER_ADMIN',
      tenantId: 'platform',
      activeSchool: null,
      allowedSchools: [],
    };

    render(<App authClient={authClientFor(user, [])} storage={storageWithToken('super-token')} />);

    expect((await screen.findAllByRole('heading', { name: /^super admin dashboard$/i })).length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    const dialog = screen.getByRole('dialog', { name: /command palette/i });
    expect(within(dialog).getByText(/g d dashboard/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/g o organizations/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/g s schools/i)).toBeInTheDocument();

    fireEvent.change(within(dialog).getByPlaceholderText(/search organizations, schools, users/i), { target: { value: 'ada' } });
    expect((await within(dialog).findAllByText(/^Users$/i)).length).toBeGreaterThan(0);
    fireEvent.click(await within(dialog).findByRole('button', { name: /ada admin/i }));

    expect((await screen.findAllByRole('heading', { name: /users & roles/i })).length).toBeGreaterThan(0);
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

    expect(await screen.findByRole('heading', { name: /school admin dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /school admin navigation/i })).toBeInTheDocument();
    expect(screen.getByText(/your role/i)).toBeInTheDocument();
    expect(screen.getByText(/assigned schools/i)).toBeInTheDocument();
    expect(screen.getAllByText(/school a/i).length).toBeGreaterThan(0);
    const schoolAdminNav = screen.getByRole('navigation', { name: /school admin navigation/i });
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /parents/i }));
    expect(await screen.findByText(/parent example/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /link parent to student/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /staff/i }));
    expect(await screen.findByText(/neha singh/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /provision staff portal login/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /attendance/i }));
    expect(await screen.findByRole('heading', { name: /attendance sessions/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /academic setup/i }));
    expect(screen.getByRole('heading', { name: /^academic setup$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /academic assignments/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /students/i }));
    expect(screen.getByRole('heading', { name: /student import/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /settings/i }));
    expect(await screen.findByRole('heading', { name: /school settings/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bulk jobs/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /fees/i }));
    expect(screen.getByRole('heading', { name: /fee lifecycle/i })).toBeInTheDocument();
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /reports/i }));
    expect(screen.getByRole('heading', { name: /report exports/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
  });

  it('shows only the School Admin area to a School Admin', async () => {
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

    await screen.findByRole('heading', { name: /school admin dashboard/i });
    expect(screen.getByRole('region', { name: /school admin area/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create school/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/your role cannot access this route/i)).not.toBeInTheDocument();
  });

  it('shows only the production Principal portal modules to a Principal', async () => {
    const principalSchool: SchoolAccess = { ...schoolA, role: 'PRINCIPAL' };
    const user: CurrentUser = {
      userId: 'principal-1',
      email: 'principal@example.com',
      displayName: 'Principal',
      role: 'PRINCIPAL',
      tenantId: 'tenant-1',
      activeSchool: principalSchool,
      allowedSchools: [principalSchool],
    };

    render(<App authClient={authClientFor(user)} storage={storageWithToken('principal-token')} />);

    expect(await screen.findByRole('heading', { name: /principal dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /principal area/i })).toBeInTheDocument();

    const principalNav = screen.getByRole('navigation', { name: /principal navigation/i });
    ['Dashboard', 'Teachers', 'Students', 'Attendance Review', 'Exams', 'Results Approval', 'AI Approvals', 'Reports'].forEach((label) => {
      expect(within(principalNav).getByRole('button', { name: new RegExp(`^${label}$`, 'i') })).toBeInTheDocument();
    });
    expect(within(principalNav).queryByRole('button', { name: /tenants|subscriptions|billing|users|parents|staff|fees|settings/i })).not.toBeInTheDocument();

    fireEvent.click(within(principalNav).getByRole('button', { name: /^teachers$/i }));

    expect((await screen.findAllByRole('heading', { name: /^teachers$/i })).length).toBeGreaterThan(0);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/v1/school-admin/teachers?page=0&size=50',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer principal-token' }),
      }),
    ));

    fireEvent.click(within(principalNav).getByRole('button', { name: /^students$/i }));

    expect((await screen.findAllByRole('heading', { name: /^students$/i })).length).toBeGreaterThan(0);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/v1/school-admin/students?page=0&size=10',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer principal-token' }),
      }),
    ));
    expect(vi.mocked(fetch).mock.calls.some(([input]) => String(input).includes('/v1/super-admin'))).toBe(false);
  });

  it.each(['TEACHER', 'FINANCE_STAFF', 'PARENT', 'STUDENT', 'STAFF'] as const)(
    'shows only the %s portal shell for non-admin roles',
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

      const title = role
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
      const heading = role === 'TEACHER' ? /teacher overview/i : new RegExp(`${title} dashboard`, 'i');
      expect((await screen.findAllByRole('heading', { name: heading })).length).toBeGreaterThan(0);
      expect(screen.getByRole('region', { name: new RegExp(`${title} area`, 'i') })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /create school/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/your role cannot access this route/i)).not.toBeInTheDocument();
    },
  );

  it.each(['SUPER_ADMIN', 'TENANT_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'FINANCE_STAFF', 'PARENT', 'STUDENT', 'STAFF'] as const)(
    'does not show pending or missing navigation states for %s',
    async (role) => {
      const user: CurrentUser = {
        userId: `${role.toLowerCase()}-clean-nav`,
        email: `${role.toLowerCase()}@example.com`,
        displayName: role,
        role,
        tenantId: role === 'SUPER_ADMIN' ? 'platform' : 'tenant-1',
        activeSchool: role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN' ? null : schoolA,
        allowedSchools: role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN' ? [] : [schoolA],
      };

      render(<App authClient={authClientFor(user, user.allowedSchools)} storage={storageWithToken(`${role.toLowerCase()}-token`)} />);

      const title = role
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');

      const heading = role === 'TEACHER' ? /teacher overview/i : new RegExp(`${title} dashboard`, 'i');
      expect((await screen.findAllByRole('heading', { name: heading })).length).toBeGreaterThan(0);
      expect(screen.queryByText(/partial api/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^partial$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/missing api/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^missing$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/not live yet/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/notification list api pending/i)).not.toBeInTheDocument();
    },
  );

  it('shows a fee-focused workspace to Finance Staff', async () => {
    const user: CurrentUser = {
      userId: 'finance-1',
      email: 'finance@example.com',
      displayName: 'Finance Staff',
      role: 'FINANCE_STAFF',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };

    render(<App authClient={authClientFor(user)} storage={storageWithToken('finance-token')} />);

    expect(await screen.findByRole('heading', { name: /finance staff dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /finance staff area/i })).toBeInTheDocument();
    const financeNav = screen.getByRole('navigation', { name: /finance staff navigation/i });
    fireEvent.click(within(financeNav).getByRole('button', { name: /fee demands/i }));
    expect(screen.getByRole('heading', { name: /fee lifecycle/i })).toBeInTheDocument();
    fireEvent.click(within(financeNav).getByRole('button', { name: /reports/i }));
    expect(await screen.findByRole('heading', { name: /finance reports/i })).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/v1/finance/reports/summary',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer finance-token' }) }),
    ));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/v1/finance/receipts?size=50',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer finance-token' }) }),
    ));
    expect(screen.queryByRole('heading', { name: /academic setup/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
  });

  it('shows only the Tenant Admin area to a Tenant Admin', async () => {
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

    expect(await screen.findByRole('heading', { name: /tenant admin overview/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /tenant admin area/i })).toBeInTheDocument();
    const tenantNav = screen.getByRole('navigation', { name: /tenant admin navigation/i });
    fireEvent.click(within(tenantNav).getByRole('button', { name: /schools/i }));
    expect((await screen.findAllByRole('heading', { name: /^schools$/i })).length).toBeGreaterThan(0);
    expect(await screen.findByText(/tenant main school/i)).toBeInTheDocument();
    fireEvent.click(within(tenantNav).getByRole('button', { name: /school admins/i }));
    expect((await screen.findAllByRole('heading', { name: /school admins/i })).length).toBeGreaterThan(0);
    fireEvent.click(within(tenantNav).getByRole('button', { name: /settings/i }));
    expect((await screen.findAllByRole('heading', { name: /^settings$/i })).length).toBeGreaterThan(0);
    fireEvent.click(within(tenantNav).getByRole('button', { name: /subscription usage/i }));
    expect((await screen.findAllByRole('heading', { name: /subscription usage/i })).length).toBeGreaterThan(0);
    fireEvent.click(within(tenantNav).getByRole('button', { name: /reports/i }));
    expect((await screen.findAllByRole('heading', { name: /^reports$/i })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /create organization with first school/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/your role cannot access this route/i)).not.toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls.some(([input]) => String(input).includes('/v1/super-admin'))).toBe(false);
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

    expect(await screen.findByRole('heading', { name: /^current school$/i })).toBeInTheDocument();
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
    expect(await screen.findByRole('heading', { name: /school admin dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /school erp workspace/i })).toBeInTheDocument();
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

    expect(await screen.findByRole('heading', { name: /^current school$/i })).toBeInTheDocument();
    expect(screen.getByText(/2 assigned schools/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^school$/i), { target: { value: 'school-b' } });
    fireEvent.click(screen.getByRole('button', { name: /activate school/i }));

    expect(await screen.findByText(/school activation was denied/i)).toBeInTheDocument();
    expect(storage.setItem).not.toHaveBeenCalledWith('cloudcampus.auth.accessToken', 'activated-token');
    expect(screen.queryByRole('heading', { name: /link parent to student/i })).not.toBeInTheDocument();
  });

  it('calls real School Admin dashboard and module APIs with the Bearer token', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-api',
      email: 'api-admin@example.com',
      displayName: 'API Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };
    const fetchMock = vi.mocked(fetch);

    render(<App authClient={authClientFor(user)} storage={storageWithToken('school-admin-token')} />);

    expect(await screen.findByRole('heading', { name: /school admin dashboard/i })).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/dashboard/summary',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    const schoolAdminNav = screen.getByRole('navigation', { name: /school admin navigation/i });
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /students/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/students',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /fees/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/fees/demands',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /attendance/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/attendance/sessions',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /teachers/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/teachers?size=50',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /parents/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/parents?size=50',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));

    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /settings/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/school-admin/settings',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer school-admin-token' }),
      }),
    ));
  });

  it('shows API error and empty states instead of fake records', async () => {
    const user: CurrentUser = {
      userId: 'school-admin-error',
      email: 'error-admin@example.com',
      displayName: 'Error Admin',
      role: 'SCHOOL_ADMIN',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/v1/school-admin/students')) {
        return jsonResponse({ message: 'Students API failed' }, 500);
      }
      if (url.includes('/dashboard/summary')) {
        return jsonResponse({ metrics: [] });
      }
      return jsonResponse([]);
    }));

    render(<App authClient={authClientFor(user)} storage={storageWithToken('school-admin-token')} />);

    expect(await screen.findByRole('heading', { name: /school admin dashboard/i })).toBeInTheDocument();
    expect(screen.queryByText(/94.8%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/aarav sharma/i)).not.toBeInTheDocument();

    const schoolAdminNav = screen.getByRole('navigation', { name: /school admin navigation/i });
    fireEvent.click(within(schoolAdminNav).getByRole('button', { name: /students/i }));
    expect(await screen.findByText(/students api failed/i)).toBeInTheDocument();
  });

  it('lets a Teacher enter marks through the real teacher exam APIs', async () => {
    const user: CurrentUser = {
      userId: 'teacher-marks',
      email: 'teacher@example.com',
      displayName: 'Teacher',
      role: 'TEACHER',
      tenantId: 'tenant-1',
      activeSchool: schoolA,
      allowedSchools: [schoolA],
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/dashboard/summary')) {
        return jsonResponse({ metrics: [], alerts: [], activity: [] });
      }
      if (url.includes('/v1/teacher/assignments')) {
        return jsonResponse([{
          id: 'assignment-1',
          classLevelId: 'class-1',
          className: 'Class 8',
          subjectId: 'subject-1',
          subjectCode: 'MATH',
          subjectName: 'Mathematics',
          active: true,
        }]);
      }
      if (url.includes('/v1/teacher/exams/exam-1/roster')) {
        return jsonResponse([{
          studentId: 'student-1',
          admissionNumber: 'ADM-001',
          fullName: 'Asha Mehta',
          classLevelId: 'class-1',
          className: 'Class 8',
          sectionId: 'section-a',
          sectionName: 'A',
          rollNumber: '7',
          resultId: null,
          marksObtained: null,
          recordedAt: null,
        }]);
      }
      if (url.includes('/v1/teacher/exams?')) {
        return jsonResponse([{
          id: 'exam-1',
          tenantId: 'tenant-1',
          schoolId: 'school-a',
          classLevelId: 'class-1',
          className: 'Class 8',
          sectionId: 'section-a',
          sectionName: 'A',
          subjectId: 'subject-1',
          subjectCode: 'MATH',
          subjectName: 'Mathematics',
          title: 'Term One',
          examDate: '2026-07-10',
          maxMarks: 100,
          status: 'DRAFT',
          createdByUserId: 'admin-1',
          publishedByUserId: null,
          createdAt: '2026-07-01T00:00:00Z',
          publishedAt: null,
          results: [],
        }]);
      }
      if (url.includes('/v1/teacher/exams/exam-1/results') && init?.method === 'POST') {
        return jsonResponse({ id: 'exam-1', results: [{ studentId: 'student-1', marksObtained: 95 }] });
      }
      return jsonResponse([]);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App authClient={authClientFor(user)} storage={storageWithToken('teacher-token')} />);

    expect(await screen.findByRole('heading', { name: /teacher overview/i })).toBeInTheDocument();
    const teacherNav = screen.getByRole('navigation', { name: /teacher navigation/i });
    fireEvent.click(within(teacherNav).getByRole('button', { name: /marks/i }));

    expect((await screen.findAllByRole('heading', { name: /^marks$/i })).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/asha mehta/i)).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/assigned class and subject/i)).toHaveValue('assignment-1');
    expect(screen.getByLabelText(/exam/i)).toHaveValue('exam-1');

    fireEvent.change(screen.getByLabelText(/marks for asha mehta/i), { target: { value: '105' } });
    fireEvent.click(screen.getByRole('button', { name: /submit changed marks/i }));
    expect(await screen.findByText(/cannot exceed 100/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/marks for asha mehta/i), { target: { value: '95' } });
    fireEvent.click(screen.getByRole('button', { name: /submit changed marks/i }));

    const confirmDialog = await screen.findByRole('dialog', { name: /submit marks/i });
    fireEvent.click(within(confirmDialog).getByRole('button', { name: /^submit marks$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/v1/teacher/exams/exam-1/results',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer teacher-token' }),
        body: JSON.stringify({ studentId: 'student-1', marksObtained: 95 }),
      }),
    ));
    expect(await screen.findByText(/1 mark entry saved/i)).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  }));
}
