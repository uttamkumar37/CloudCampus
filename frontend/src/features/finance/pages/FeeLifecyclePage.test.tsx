import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeeLifecyclePage } from './FeeLifecyclePage';

describe('FeeLifecyclePage', () => {
  it('requires a logged-in School Admin token before creating a demand', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onCreateDemand = vi.fn();

    render(<FeeLifecyclePage onCreateDemand={onCreateDemand} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /create fee demand/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onCreateDemand).not.toHaveBeenCalled();
  });

  it('creates a demand and records payment with the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const createdDemand = {
      id: 'demand-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      studentId: 'student-1',
      studentName: 'Fee Student',
      admissionNumber: 'ADM-1',
      description: 'Term 1 fee',
      amountDue: 1200,
      amountPaid: 0,
      outstandingAmount: 1200,
      dueDate: '2026-06-30',
      status: 'OPEN' as const,
      createdAt: '2026-05-26T00:00:00Z',
      payments: [],
    };
    const paidDemand = {
      ...createdDemand,
      amountPaid: 1200,
      outstandingAmount: 0,
      status: 'PAID' as const,
      payments: [{
        id: 'payment-1',
        amount: 1200,
        paymentMethod: 'CASH',
        receiptNumber: 'RCPT-1',
        paidAt: '2026-05-26T00:00:00Z',
        recordedByUserId: 'user-1',
      }],
    };
    const onCreateDemand = vi.fn().mockResolvedValue(createdDemand);
    const onRecordPayment = vi.fn().mockResolvedValue(paidDemand);

    render(
      <FeeLifecyclePage
        onCreateDemand={onCreateDemand}
        onRecordPayment={onRecordPayment}
        storage={storage}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^student id$/i), { target: { value: 'student-1' } });
    fireEvent.change(screen.getByLabelText(/^amount$/i), { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: /create fee demand/i }));

    await waitFor(() => expect(onCreateDemand).toHaveBeenCalledTimes(1));
    expect(onCreateDemand).toHaveBeenCalledWith({
      studentId: 'student-1',
      description: 'Term 1 fee',
      amount: 1200,
      dueDate: '2026-06-30',
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Fee demand created/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/payment amount/i), { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: /record payment/i }));

    await waitFor(() => expect(onRecordPayment).toHaveBeenCalledTimes(1));
    expect(onRecordPayment).toHaveBeenCalledWith('demand-1', {
      amount: 1200,
      paymentMethod: 'cash',
      paymentReference: undefined,
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Receipt issued/i)).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });
});
