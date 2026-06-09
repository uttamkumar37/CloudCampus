import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import { ReportExportsPage } from './ReportExportsPage';

function storageWithToken(token: string | null = 'school-admin-token') {
  return {
    getItem: vi.fn(() => token),
  };
}

describe('ReportExportsPage', () => {
  it('requests and lists report exports with the stored bearer token', async () => {
    const onRequest = vi.fn().mockResolvedValue({
      id: 'export-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      requestedByUserId: 'admin-1',
      bulkJobId: 'bulk-1',
      reportType: 'STUDENT_DIRECTORY',
      format: 'CSV',
      status: 'QUEUED',
      fileName: null,
      contentType: null,
      sizeBytes: null,
      checksumSha256: null,
      requestedAt: '2026-05-26T10:00:00Z',
      completedAt: null,
    });
    const onLoad = vi.fn().mockResolvedValue([
      {
        id: 'export-2',
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        requestedByUserId: 'admin-1',
        bulkJobId: 'bulk-2',
        reportType: 'FEE_DEMANDS',
        format: 'CSV',
        status: 'COMPLETED',
        fileName: 'fee_demands-export-2.csv',
        contentType: 'text/csv',
        sizeBytes: 128,
        checksumSha256: 'a'.repeat(64),
        requestedAt: '2026-05-26T10:00:00Z',
        completedAt: '2026-05-26T10:01:00Z',
      },
    ]);
    const onDownload = vi.fn().mockResolvedValue('csv');

    render(
      <ReportExportsPage
        onRequest={onRequest}
        onLoad={onLoad}
        onDownload={onDownload}
        storage={storageWithToken()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /request export/i }));
    const dialog = screen.getByRole('dialog', { name: /queue report export/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /queue export/i }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledWith(
      { reportType: 'STUDENT_DIRECTORY', format: 'CSV' },
      'school-admin-token',
    ));
    expect(await screen.findByText(/student directory export queued/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /load exports/i }));
    await waitFor(() => expect(onLoad).toHaveBeenCalledWith('school-admin-token'));
    expect(await screen.findByText(/fee_demands-export-2.csv/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    await waitFor(() => expect(onDownload).toHaveBeenCalledWith('export-2', 'school-admin-token'));
  });

  it('shows login required when no token is present', async () => {
    const onRequest = vi.fn();

    render(<ReportExportsPage onRequest={onRequest} storage={storageWithToken(null)} />);

    fireEvent.click(screen.getByRole('button', { name: /request export/i }));
    fireEvent.click(within(screen.getByRole('dialog', { name: /queue report export/i })).getByRole('button', { name: /queue export/i }));

    expect(await screen.findByText(/school admin login is required/i)).toBeInTheDocument();
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('can be scoped to finance fee-demand exports', async () => {
    const onRequest = vi.fn().mockResolvedValue({
      id: 'finance-export-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      requestedByUserId: 'finance-1',
      bulkJobId: 'bulk-1',
      reportType: 'FEE_DEMANDS',
      format: 'CSV',
      status: 'QUEUED',
      fileName: null,
      contentType: null,
      sizeBytes: null,
      checksumSha256: null,
      requestedAt: '2026-05-26T10:00:00Z',
      completedAt: null,
    });

    render(
      <ReportExportsPage
        initialReportType="FEE_DEMANDS"
        loginRequiredMessage="Finance Staff login is required."
        onRequest={onRequest}
        reportTypes={[{ value: 'FEE_DEMANDS', label: 'Fee demands' }]}
        storage={storageWithToken('finance-token')}
        title="Finance exports"
      />,
    );

    expect(screen.getByRole('heading', { name: /finance exports/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /student directory/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /request export/i }));
    fireEvent.click(within(screen.getByRole('dialog', { name: /queue report export/i })).getByRole('button', { name: /queue export/i }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledWith(
      { reportType: 'FEE_DEMANDS', format: 'CSV' },
      'finance-token',
    ));
    expect(await screen.findByText(/fee demands export queued/i)).toBeInTheDocument();
  });
});
