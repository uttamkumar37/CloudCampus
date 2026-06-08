import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assignSuperAdminTenantSubscription,
  deleteSuperAdminPermissionOverride,
  deleteSuperAdminUserRole,
  getSuperAdminAiRecommendation,
  getSuperAdminNotificationDelivery,
  getSuperAdminTenantSubscription,
  listSuperAdminTenantSubscriptionInvoices,
  listSuperAdminSchools,
  listSuperAdminTenants,
  listSuperAdminUserRoles,
  requestSuperAdminReportExport,
  searchSuperAdmin,
  updateSuperAdminAiEntitlement,
  updateSuperAdminSubscriptionPlan,
} from './platformApi';
import { httpClient } from '../../../shared/api/httpClient';

vi.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('platformApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(httpClient.get).mockResolvedValue({ items: [], page: 0, size: 25, totalItems: 0, totalPages: 0 });
    vi.mocked(httpClient.post).mockResolvedValue({
      exportId: 'export-1',
      reportType: 'PLATFORM_SUMMARY',
      format: 'CSV',
      status: 'QUEUED',
    });
    vi.mocked(httpClient.patch).mockResolvedValue({
      id: 'plan-1',
      code: 'STARTER',
      name: 'Starter',
      status: 'ACTIVE',
    });
    vi.mocked(httpClient.put).mockResolvedValue({
      tenantId: 'tenant-1',
      enabled: true,
      monthlyUnitBudget: 500,
      enabledFeatures: ['NOTICE_DRAFTING'],
      humanApprovalRequired: true,
      retentionDays: 90,
    });
    vi.mocked(httpClient.delete).mockResolvedValue(undefined);
  });

  it('sends Super Admin list query params and bearer token', async () => {
    await listSuperAdminTenants({ page: 2, size: 100, search: 'Scale Alpha', status: 'ACTIVE' }, 'super-token');

    expect(httpClient.get).toHaveBeenCalledWith('/v1/super-admin/tenants?page=2&size=100&search=Scale+Alpha&status=ACTIVE', { accessToken: 'super-token' });
  });

  it('builds school filters and global search requests', async () => {
    await listSuperAdminSchools({ tenantId: 'tenant-1', search: 'Main School', status: 'ACTIVE' }, 'super-token');
    await searchSuperAdmin({ q: 'invoice 42', types: 'tenant,school,invoice', size: 10 }, 'super-token');

    expect(httpClient.get).toHaveBeenNthCalledWith(1, '/v1/super-admin/schools?page=0&size=25&tenantId=tenant-1&search=Main+School&status=ACTIVE', { accessToken: 'super-token' });
    expect(httpClient.get).toHaveBeenNthCalledWith(2, '/v1/super-admin/search?page=0&size=10&q=invoice+42&types=tenant%2Cschool%2Cinvoice', { accessToken: 'super-token' });
  });

  it('requests a real platform summary export job', async () => {
    await requestSuperAdminReportExport('super-token');

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v1/super-admin/reports/exports',
      { reportType: 'PLATFORM_SUMMARY', format: 'CSV' },
      { accessToken: 'super-token' },
    );
  });

  it('requests custom report exports with tenant and school filters', async () => {
    await requestSuperAdminReportExport({
      reportType: 'SCHOOL_DIRECTORY',
      format: 'CSV',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      filters: { dateFrom: '2026-06-01' },
    }, 'super-token');

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v1/super-admin/reports/exports',
      {
        reportType: 'SCHOOL_DIRECTORY',
        format: 'CSV',
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        filters: { dateFrom: '2026-06-01' },
      },
      { accessToken: 'super-token' },
    );
  });

  it('builds access control detail and delete endpoints', async () => {
    await listSuperAdminUserRoles('user-1', 'super-token');
    await deleteSuperAdminUserRole('user-1', 'role-1', 'super-token');
    await deleteSuperAdminPermissionOverride('user-1', 'override-1', 'super-token');

    expect(httpClient.get).toHaveBeenCalledWith('/v1/super-admin/users/user-1/roles', { accessToken: 'super-token' });
    expect(httpClient.delete).toHaveBeenNthCalledWith(1, '/v1/super-admin/users/user-1/roles/role-1', { accessToken: 'super-token' });
    expect(httpClient.delete).toHaveBeenNthCalledWith(2, '/v1/super-admin/users/user-1/permission-overrides/override-1', { accessToken: 'super-token' });
  });

  it('builds AI governance and notification detail endpoints', async () => {
    await getSuperAdminAiRecommendation('rec-1', 'super-token');
    await updateSuperAdminAiEntitlement('tenant-1', {
      enabled: true,
      monthlyUnitBudget: 500,
      enabledFeatures: ['NOTICE_DRAFTING'],
      humanApprovalRequired: true,
      retentionDays: 90,
    }, 'super-token');
    await getSuperAdminNotificationDelivery('delivery-1', 'super-token');

    expect(httpClient.get).toHaveBeenNthCalledWith(1, '/v1/super-admin/ai/recommendations/rec-1', { accessToken: 'super-token' });
    expect(httpClient.put).toHaveBeenCalledWith(
      '/v1/super-admin/ai/tenants/tenant-1/entitlement',
      {
        enabled: true,
        monthlyUnitBudget: 500,
        enabledFeatures: ['NOTICE_DRAFTING'],
        humanApprovalRequired: true,
        retentionDays: 90,
      },
      { accessToken: 'super-token' },
    );
    expect(httpClient.get).toHaveBeenNthCalledWith(2, '/v1/super-admin/notifications/deliveries/delivery-1', { accessToken: 'super-token' });
  });

  it('builds subscription plan and tenant assignment endpoints', async () => {
    await updateSuperAdminSubscriptionPlan('plan-1', {
      code: 'STARTER',
      name: 'Starter',
      maxSchools: 2,
      maxStudents: 100,
      maxStaff: 20,
      monthlyPriceCents: 25000,
      annualPriceCents: 250000,
      currency: 'USD',
      status: 'ACTIVE',
    }, 'super-token');
    await getSuperAdminTenantSubscription('tenant-1', 'super-token');
    await assignSuperAdminTenantSubscription('tenant-1', {
      planCode: 'STARTER',
      billingCycle: 'MONTHLY',
      issueInvoice: true,
    }, 'super-token');
    await listSuperAdminTenantSubscriptionInvoices('tenant-1', 'super-token');

    expect(httpClient.patch).toHaveBeenCalledWith(
      '/v1/super-admin/subscriptions/plans/plan-1',
      expect.objectContaining({ code: 'STARTER', status: 'ACTIVE' }),
      { accessToken: 'super-token' },
    );
    expect(httpClient.get).toHaveBeenNthCalledWith(1, '/v1/super-admin/subscriptions/tenants/tenant-1', { accessToken: 'super-token' });
    expect(httpClient.put).toHaveBeenCalledWith(
      '/v1/super-admin/subscriptions/tenants/tenant-1',
      { planCode: 'STARTER', billingCycle: 'MONTHLY', issueInvoice: true },
      { accessToken: 'super-token' },
    );
    expect(httpClient.get).toHaveBeenNthCalledWith(2, '/v1/super-admin/subscriptions/tenants/tenant-1/invoices', { accessToken: 'super-token' });
  });
});
