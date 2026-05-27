import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StaffProvisioningPage } from './StaffProvisioningPage';

describe('StaffProvisioningPage', () => {
  it('requires a logged-in School Admin token before provisioning staff', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onProvisionStaff = vi.fn();
    render(<StaffProvisioningPage onProvisionStaff={onProvisionStaff} storage={storage} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onProvisionStaff).not.toHaveBeenCalled();
  });

  it('provisions a portal-login teacher with the stored token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onProvisionStaff = vi.fn().mockResolvedValue({
      staffProfileId: 'staff-profile-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'teacher-1',
      email: 'teacher.one@example.com',
      fullName: 'Teacher One',
      role: 'TEACHER',
      userStatus: 'INVITED',
      employeeNumber: 'T-100',
      department: 'Academics',
      designation: 'Mathematics Teacher',
      portalLoginRequired: true,
      schoolAccessGranted: true,
      invitationCreated: true,
      invitationId: 'invitation-1',
      invitationExpiresAt: '2026-06-02T00:00:00Z',
      invitationToken: 'raw-token',
      invitationAcceptUrl: '/invitations/accept?token=raw-token',
    });
    render(<StaffProvisioningPage onProvisionStaff={onProvisionStaff} storage={storage} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => expect(onProvisionStaff).toHaveBeenCalledTimes(1));
    expect(onProvisionStaff).toHaveBeenCalledWith({
      fullName: 'Teacher One',
      email: 'teacher.one@example.com',
      role: 'TEACHER',
      employeeNumber: 'T-100',
      department: 'Academics',
      designation: 'Mathematics Teacher',
      portalLoginRequired: true,
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Teacher One teacher invited/i)).toBeInTheDocument();
  });

  it('can provision a finance staff portal login', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onProvisionStaff = vi.fn().mockResolvedValue({
      staffProfileId: 'staff-profile-2',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'finance-1',
      email: 'finance.one@example.com',
      fullName: 'Finance One',
      role: 'FINANCE_STAFF',
      userStatus: 'INVITED',
      employeeNumber: 'F-100',
      department: 'Finance',
      designation: 'Accountant',
      portalLoginRequired: true,
      schoolAccessGranted: true,
      invitationCreated: true,
    });
    render(<StaffProvisioningPage onProvisionStaff={onProvisionStaff} storage={storage} />);

    fillForm();
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'FINANCE_STAFF' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'finance.one@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Finance One' },
    });
    fireEvent.change(screen.getByLabelText(/employee number/i), {
      target: { value: 'F-100' },
    });
    fireEvent.change(screen.getByLabelText(/department/i), {
      target: { value: 'Finance' },
    });
    fireEvent.change(screen.getByLabelText(/designation/i), {
      target: { value: 'Accountant' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => expect(onProvisionStaff).toHaveBeenCalledTimes(1));
    expect(onProvisionStaff).toHaveBeenCalledWith({
      fullName: 'Finance One',
      email: 'finance.one@example.com',
      role: 'FINANCE_STAFF',
      employeeNumber: 'F-100',
      department: 'Finance',
      designation: 'Accountant',
      portalLoginRequired: true,
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Finance One finance staff invited/i)).toBeInTheDocument();
  });
});

function fillForm() {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: 'Teacher One' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'teacher.one@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/role/i), {
    target: { value: 'TEACHER' },
  });
  fireEvent.change(screen.getByLabelText(/employee number/i), {
    target: { value: 'T-100' },
  });
  fireEvent.change(screen.getByLabelText(/department/i), {
    target: { value: 'Academics' },
  });
  fireEvent.change(screen.getByLabelText(/designation/i), {
    target: { value: 'Mathematics Teacher' },
  });
}
