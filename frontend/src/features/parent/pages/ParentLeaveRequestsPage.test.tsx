import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ParentLeaveRequestsPage } from './ParentLeaveRequestsPage';

describe('ParentLeaveRequestsPage', () => {
  it('requires a logged-in parent token before loading children', async () => {
    const onCreate = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<ParentLeaveRequestsPage onCreate={onCreate} storage={storage} />);

    expect(await screen.findByText(/Parent login is required/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('submits a leave request for the linked student and refreshes the list', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-parent-token') };
    const response = {
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
    const onCreate = vi.fn().mockResolvedValue(response);
    const onChildren = vi.fn().mockResolvedValue([{
      studentId: 'student-1',
      studentName: 'Meera Sharma',
      admissionNumber: 'ADM-001',
      relationship: 'Guardian',
      primaryContact: true,
    }]);
    const onList = vi.fn().mockResolvedValue([response]);
    render(
      <ParentLeaveRequestsPage
        onChildren={onChildren}
        onCreate={onCreate}
        onList={onList}
        storage={storage}
      />,
    );

    expect(await screen.findByRole('option', { name: /meera sharma - adm-001/i })).toBeInTheDocument();
    fillLeaveFields();
    fireEvent.click(screen.getByRole('button', { name: /request leave/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate).toHaveBeenCalledWith('student-1', {
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      reason: 'Family travel',
    }, 'signed-parent-token');
    expect(onChildren).toHaveBeenCalledWith('signed-parent-token');
    expect(onList).toHaveBeenCalledWith('student-1', 'signed-parent-token');
    expect(screen.getByText(/Leave request submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/PENDING leave request from 2026-06-01 to 2026-06-03/i)).toBeInTheDocument();
  });

  it('loads leave requests for the selected linked child', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-parent-token') };
    const onChildren = vi.fn().mockResolvedValue([
      {
        studentId: 'student-1',
        studentName: 'Meera Sharma',
        admissionNumber: 'ADM-001',
        relationship: 'Guardian',
        primaryContact: true,
      },
      {
        studentId: 'student-2',
        studentName: 'Kabir Sharma',
        admissionNumber: 'ADM-002',
        relationship: 'Guardian',
        primaryContact: false,
      },
    ]);
    const onList = vi.fn().mockResolvedValue([]);
    const onCreate = vi.fn().mockResolvedValue({
      id: 'leave-2',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      studentId: 'student-2',
      studentName: 'Kabir Sharma',
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
    });
    render(
      <ParentLeaveRequestsPage
        onChildren={onChildren}
        onCreate={onCreate}
        onList={onList}
        storage={storage}
      />,
    );

    const childSelector = await screen.findByLabelText(/linked child/i);
    fireEvent.change(childSelector, { target: { value: 'student-2' } });
    fillLeaveFields();
    fireEvent.click(screen.getByRole('button', { name: /request leave/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith('student-2', expect.any(Object), 'signed-parent-token'));
    expect(onList).toHaveBeenCalledWith('student-2', 'signed-parent-token');
  });
});

function fillLeaveFields() {
  fireEvent.change(screen.getByLabelText(/start date/i), {
    target: { value: '2026-06-01' },
  });
  fireEvent.change(screen.getByLabelText(/end date/i), {
    target: { value: '2026-06-03' },
  });
  fireEvent.change(screen.getByLabelText(/reason/i), {
    target: { value: 'Family travel' },
  });
}
