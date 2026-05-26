import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TenantReportsPage } from './TenantReportsPage';
import type { TenantReportSummary } from '../api/tenantReportsApi';

function storageWithToken(token: string | null) {
  return {
    getItem: vi.fn(() => token),
  };
}

const tenantSummary: TenantReportSummary = {
  tenantId: 'tenant-1',
  tenantName: 'Tenant One',
  schoolId: null,
  schoolName: null,
  totalSchools: 2,
  activeSchools: 2,
  totals: {
    totalStudents: 3,
    activeStudents: 3,
    totalFeeDemands: 2,
    amountDue: 350,
    amountPaid: 280,
    outstandingAmount: 70,
  },
  schools: [
    {
      schoolId: 'school-a',
      code: 'A',
      name: 'Alpha School',
      primarySchool: true,
      active: true,
      metrics: {
        totalStudents: 2,
        activeStudents: 2,
        totalFeeDemands: 1,
        amountDue: 100,
        amountPaid: 30,
        outstandingAmount: 70,
      },
    },
    {
      schoolId: 'school-b',
      code: 'B',
      name: 'Beta School',
      primarySchool: false,
      active: true,
      metrics: {
        totalStudents: 1,
        activeStudents: 1,
        totalFeeDemands: 1,
        amountDue: 250,
        amountPaid: 250,
        outstandingAmount: 0,
      },
    },
  ],
};

describe('TenantReportsPage', () => {
  it('loads tenant summary and drills into a school with the stored bearer token', async () => {
    const onLoad = vi.fn().mockResolvedValue(tenantSummary);
    const onDrilldown = vi.fn().mockResolvedValue({
      ...tenantSummary,
      schoolId: 'school-b',
      schoolName: 'Beta School',
      totalSchools: 1,
      activeSchools: 1,
      schools: [tenantSummary.schools[1]],
      totals: tenantSummary.schools[1].metrics,
    });

    render(
      <TenantReportsPage
        onLoad={onLoad}
        onDrilldown={onDrilldown}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /load tenant summary/i }));

    await waitFor(() => expect(onLoad).toHaveBeenCalledWith('tenant-admin-token'));
    expect(await screen.findByText(/loaded 2 schools/i)).toBeInTheDocument();
    expect(screen.getByText(/tenant one/i)).toBeInTheDocument();
    expect(screen.getByText(/students: 3\/3/i)).toBeInTheDocument();
    expect(screen.getByText(/alpha school \(a\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /drilldown/i })[1]);

    await waitFor(() => expect(onDrilldown).toHaveBeenCalledWith('school-b', 'tenant-admin-token'));
    expect(await screen.findByText(/beta school drilldown loaded/i)).toBeInTheDocument();
    expect(screen.getByText(/schools: 1\/1/i)).toBeInTheDocument();
  });

  it('requires a Tenant Admin token before loading reports', () => {
    const onLoad = vi.fn();

    render(<TenantReportsPage onLoad={onLoad} storage={storageWithToken(null)} />);

    fireEvent.click(screen.getByRole('button', { name: /load tenant summary/i }));

    expect(screen.getByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onLoad).not.toHaveBeenCalled();
  });
});
