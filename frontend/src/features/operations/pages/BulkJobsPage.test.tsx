import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BulkJobsPage } from './BulkJobsPage';

describe('BulkJobsPage', () => {
  it('requires a logged-in School Admin token before creating a job', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onCreate = vi.fn();
    render(<BulkJobsPage onCreate={onCreate} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /create bulk job/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('creates loads and cancels bulk jobs with the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const createdJob = {
      id: 'job-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      jobType: 'STUDENT_IMPORT',
      requestedByUserId: 'user-1',
      status: 'QUEUED' as const,
      totalRecords: 12,
      processedRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      requestedAt: '2026-05-26T00:00:00Z',
      updatedAt: '2026-05-26T00:00:00Z',
    };
    const cancelledJob = { ...createdJob, status: 'CANCELLED' as const };
    const onCreate = vi.fn().mockResolvedValue(createdJob);
    const onLoad = vi.fn().mockResolvedValue([createdJob]);
    const onCancel = vi.fn().mockResolvedValue(cancelledJob);

    render(<BulkJobsPage onCreate={onCreate} onLoad={onLoad} onCancel={onCancel} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/total records/i), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /create bulk job/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith({
      jobType: 'STUDENT_IMPORT',
      totalRecords: 12,
      inputFileReference: undefined,
    }, 'signed-school-admin-token');
    expect(screen.getByText(/STUDENT_IMPORT queued/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /load jobs/i }));
    await waitFor(() => expect(onLoad).toHaveBeenCalledWith('signed-school-admin-token'));
    expect(screen.getByText('QUEUED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(onCancel).toHaveBeenCalledWith('job-1', 'signed-school-admin-token'));
    expect(screen.getByText(/STUDENT_IMPORT cancelled/i)).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });
});
