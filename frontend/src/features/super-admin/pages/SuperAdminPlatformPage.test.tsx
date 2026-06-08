import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SuperAdminPlatformPage } from './SuperAdminPlatformPage';
import {
  assignSuperAdminTenantSubscription,
  assignSuperAdminUserRole,
  getSuperAdminTenantSubscription,
  getSuperAdminNotificationDelivery,
  getSuperAdminNotifications,
  getSuperAdminUser,
  listSuperAdminAuditLogs,
  listSuperAdminNotificationDeliveries,
  listSuperAdminPermissions,
  listSuperAdminRolePermissions,
  listSuperAdminSubscriptionPlans,
  listSuperAdminTenantSubscriptionInvoices,
  listSuperAdminUserPermissionOverrides,
  listSuperAdminUserRoles,
  listSuperAdminUsers,
} from '../api/platformApi';

vi.mock('../../auth/hooks/authState', () => ({
  useAuthState: () => ({ accessToken: 'super-token' }),
}));

vi.mock('../api/platformApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/platformApi')>();
  return {
    ...actual,
    assignSuperAdminTenantSubscription: vi.fn(),
    assignSuperAdminUserRole: vi.fn(),
    getSuperAdminTenantSubscription: vi.fn(),
    getSuperAdminNotifications: vi.fn(),
    getSuperAdminNotificationDelivery: vi.fn(),
    getSuperAdminUser: vi.fn(),
    listSuperAdminAuditLogs: vi.fn(),
    listSuperAdminNotificationDeliveries: vi.fn(),
    listSuperAdminPermissions: vi.fn(),
    listSuperAdminRolePermissions: vi.fn(),
    listSuperAdminSubscriptionPlans: vi.fn(),
    listSuperAdminTenantSubscriptionInvoices: vi.fn(),
    listSuperAdminUserPermissionOverrides: vi.fn(),
    listSuperAdminUserRoles: vi.fn(),
    listSuperAdminUsers: vi.fn(),
  };
});

const emptyPage = { items: [], page: 0, size: 25, totalItems: 0, totalPages: 0 };

describe('SuperAdminPlatformPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listSuperAdminUsers).mockResolvedValue({
      ...emptyPage,
      items: [{
        userId: 'user-1',
        tenantId: 'tenant-1',
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
      totalItems: 1,
      totalPages: 1,
    });
    vi.mocked(getSuperAdminUser).mockResolvedValue({
      userId: 'user-1',
      tenantId: 'tenant-1',
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
    });
    vi.mocked(listSuperAdminUserRoles).mockResolvedValue([]);
    vi.mocked(listSuperAdminUserPermissionOverrides).mockResolvedValue([]);
    vi.mocked(listSuperAdminPermissions).mockResolvedValue([{
      code: 'TENANT_VIEW',
      name: 'Tenant View',
      description: null,
      category: 'TENANT',
      riskLevel: 'LOW',
      scopeType: 'TENANT',
      active: true,
    }]);
    vi.mocked(listSuperAdminRolePermissions).mockResolvedValue([]);
    vi.mocked(listSuperAdminAuditLogs).mockResolvedValue(emptyPage);
    vi.mocked(listSuperAdminSubscriptionPlans).mockResolvedValue([{
      id: 'plan-1',
      code: 'STARTER',
      name: 'Starter',
      description: 'Starter package',
      status: 'ACTIVE',
      maxSchools: 3,
      maxStudents: 500,
      maxStaff: 50,
      monthlyPriceCents: 25000,
      annualPriceCents: 250000,
      currency: 'USD',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    }]);
  });

  it('blocks SYSTEM and AI_AGENT as primary login role assignments before submit', async () => {
    render(<SuperAdminPlatformPage section="access-control" />);

    fireEvent.click(await screen.findByRole('button', { name: /view details/i }));
    fireEvent.click(await screen.findByRole('tab', { name: /roles/i }));

    const assignButton = await screen.findByRole('button', { name: /^assign role$/i });
    const form = assignButton.closest('form');
    expect(form).not.toBeNull();

    fireEvent.change(within(form as HTMLFormElement).getByRole('combobox'), { target: { value: 'SYSTEM' } });
    fireEvent.click(within(form as HTMLFormElement).getByLabelText(/make primary login role/i));
    fireEvent.click(assignButton);

    expect(await screen.findByText(/SYSTEM and AI_AGENT cannot be assigned as a normal login role/i)).toBeInTheDocument();
    expect(assignSuperAdminUserRole).not.toHaveBeenCalled();
  });

  it('opens notification delivery details from the real detail API', async () => {
    const delivery = {
      deliveryId: 'delivery-1',
      tenantId: 'tenant-1',
      tenantName: 'Platform Tenant',
      schoolId: null,
      schoolName: null,
      channel: 'EMAIL',
      template: 'SCHOOL_ADMIN_INVITATION',
      recipientRole: 'SCHOOL_ADMIN',
      maskedRecipient: 'a***@example.com',
      subject: 'Invitation',
      status: 'FAILED',
      provider: 'smtp',
      failureReason: 'smtp token rejected',
      createdAt: '2026-06-01T00:00:00Z',
      sentAt: null,
      failedAt: '2026-06-01T00:01:00Z',
    };
    vi.mocked(getSuperAdminNotifications).mockResolvedValue({
      totalDeliveries: 1,
      sentDeliveries: 0,
      loggedDeliveries: 0,
      failedDeliveries: 1,
      disabledDeliveries: 0,
      recentDeliveries: [delivery],
    });
    vi.mocked(listSuperAdminNotificationDeliveries).mockResolvedValue({
      ...emptyPage,
      items: [delivery],
      totalItems: 1,
      totalPages: 1,
    });
    vi.mocked(getSuperAdminNotificationDelivery).mockResolvedValue(delivery);

    render(<SuperAdminPlatformPage section="notifications" />);

    expect(await screen.findByText('a***@example.com')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /view details/i })[0]);

    await waitFor(() => expect(getSuperAdminNotificationDelivery).toHaveBeenCalledWith('delivery-1', 'super-token'));
    expect(await screen.findByText(/smtp \[redacted\] rejected/i)).toBeInTheDocument();
    expect(screen.getByText(/No Super Admin retry endpoint exists/i)).toBeInTheDocument();
  });

  it('loads and assigns tenant subscriptions from the visible subscription tab', async () => {
    const subscription = {
      tenantId: 'tenant-1',
      tenantCode: 'TENANT',
      tenantName: 'Tenant Trust',
      tenantStatus: 'ACTIVE',
      subscriptionAssigned: true,
      planId: 'plan-1',
      planCode: 'STARTER',
      planName: 'Starter',
      subscriptionStatus: 'ACTIVE',
      billingCycle: 'MONTHLY',
      maxSchools: 3,
      maxStudents: 500,
      maxStaff: 50,
      schoolsUsed: 1,
      remainingSchools: 2,
      currentPeriodStart: '2026-06-01T00:00:00Z',
      currentPeriodEnd: '2026-07-01T00:00:00Z',
      assignedByUserId: 'super-1',
      assignedAt: '2026-06-01T00:00:00Z',
      invoice: null,
    };
    vi.mocked(getSuperAdminTenantSubscription).mockResolvedValue(subscription);
    vi.mocked(listSuperAdminTenantSubscriptionInvoices).mockResolvedValue([{
      id: 'invoice-1',
      tenantId: 'tenant-1',
      planId: 'plan-1',
      planCode: 'STARTER',
      invoiceNumber: 'INV-001',
      billingCycle: 'MONTHLY',
      amountCents: 25000,
      currency: 'USD',
      status: 'ISSUED',
      issuedAt: '2026-06-01T00:00:00Z',
      dueAt: '2026-06-10T00:00:00Z',
    }]);
    vi.mocked(assignSuperAdminTenantSubscription).mockResolvedValue(subscription);

    render(<SuperAdminPlatformPage section="subscriptions" />);

    fireEvent.click(await screen.findByRole('tab', { name: /organization subscription/i }));
    fireEvent.change(screen.getAllByPlaceholderText(/organization id/i)[0], { target: { value: 'tenant-1' } });
    fireEvent.click(screen.getByRole('button', { name: /load subscription/i }));

    await waitFor(() => expect(getSuperAdminTenantSubscription).toHaveBeenCalledWith('tenant-1', 'super-token'));
    expect(await screen.findByText('Tenant Trust')).toBeInTheDocument();
    expect(await screen.findByText('INV-001')).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'STARTER' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /assign subscription/i }));

    await waitFor(() => expect(assignSuperAdminTenantSubscription).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({
        billingCycle: 'MONTHLY',
        issueInvoice: true,
        planCode: 'STARTER',
      }),
      'super-token',
    ));
  });
});
