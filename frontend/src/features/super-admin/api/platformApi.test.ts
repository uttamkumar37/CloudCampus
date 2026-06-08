import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listSuperAdminSchools,
  listSuperAdminTenants,
  requestSuperAdminReportExport,
  searchSuperAdmin,
} from './platformApi';
import { httpClient } from '../../../shared/api/httpClient';

vi.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
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
});
