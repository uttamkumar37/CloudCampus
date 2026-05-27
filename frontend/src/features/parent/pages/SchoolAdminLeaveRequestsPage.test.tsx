import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SchoolAdminLeaveRequestsPage } from './SchoolAdminLeaveRequestsPage';

describe('SchoolAdminLeaveRequestsPage', () => {
  it('requires a logged-in School Admin token before loading requests', () => {
    const onList = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<SchoolAdminLeaveRequestsPage onList={onList} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /load requests/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onList).not.toHaveBeenCalled();
  });

  it('loads school leave requests and records an approval decision', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const pending = {
      id: 'leave-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      studentId: 'student-1',
      studentName: 'Meera Sharma',
      parentUserId: 'parent-1',
      parentEmail: 'parent@example.com',
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      reason: 'Family travel',
      status: 'PENDING' as const,
      adminNote: null,
      decidedByUserId: null,
      createdAt: '2026-05-27T00:00:00Z',
      decidedAt: null,
    };
    const approved = {
      ...pending,
      status: 'APPROVED' as const,
      adminNote: 'Approved',
      decidedByUserId: 'admin-1',
      decidedAt: '2026-05-27T01:00:00Z',
    };
    const onList = vi.fn().mockResolvedValue([pending]);
    const onDecide = vi.fn().mockResolvedValue(approved);
    render(<SchoolAdminLeaveRequestsPage onList={onList} onDecide={onDecide} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /load requests/i }));
    await waitFor(() => expect(onList).toHaveBeenCalledWith('signed-school-admin-token'));
    expect(screen.getByText(/PENDING/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/leave request id/i), {
      target: { value: 'leave-1' },
    });
    fireEvent.change(screen.getByLabelText(/admin note/i), {
      target: { value: 'Approved' },
    });
    fireEvent.click(screen.getByRole('button', { name: /record decision/i }));

    await waitFor(() => expect(onDecide).toHaveBeenCalledTimes(1));
    expect(onDecide).toHaveBeenCalledWith('leave-1', {
      status: 'APPROVED',
      adminNote: 'Approved',
    }, 'signed-school-admin-token');
    expect(screen.getByText(/APPROVED leave request for parent@example.com/i)).toBeInTheDocument();
  });
});
