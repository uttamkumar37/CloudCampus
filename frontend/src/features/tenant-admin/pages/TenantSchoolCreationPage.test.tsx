import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { TenantSchoolCreationPage } from './TenantSchoolCreationPage';

describe('TenantSchoolCreationPage', () => {
  it('requires a logged-in Tenant Admin token before creating a school', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onCreateSchool = vi.fn();

    render(<TenantSchoolCreationPage onCreateSchool={onCreateSchool} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/school code/i), { target: { value: 'branch-east' } });
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'Branch East' } });
    fireEvent.click(screen.getByRole('button', { name: /create school/i }));

    expect(screen.getByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onCreateSchool).not.toHaveBeenCalled();
  });

  it('sends the Bearer-backed request payload and shows usage after creation', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('tenant-admin-token') };
    const onCreateSchool = vi.fn().mockResolvedValue({
      id: 'school-2',
      tenantId: 'tenant-1',
      code: 'BRANCH-EAST',
      name: 'Branch East',
      primarySchool: false,
      active: true,
      maxSchools: 3,
      schoolsUsed: 2,
    });

    render(<TenantSchoolCreationPage onCreateSchool={onCreateSchool} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/school code/i), { target: { value: 'branch-east' } });
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'Branch East' } });
    fireEvent.click(screen.getByRole('button', { name: /create school/i }));

    await waitFor(() => expect(onCreateSchool).toHaveBeenCalledWith({
      code: 'branch-east',
      name: 'Branch East',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/branch east created \(2\/3\)/i)).toBeInTheDocument();
  });

  it('requires a logged-in Tenant Admin token before inviting a School Admin', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onInviteSchoolAdmin = vi.fn();

    render(<TenantSchoolCreationPage onInviteSchoolAdmin={onInviteSchoolAdmin} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/school id/i), { target: { value: 'school-2' } });
    fireEvent.change(screen.getByLabelText(/admin full name/i), { target: { value: 'Branch Principal' } });
    fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: 'principal@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invite school admin/i }));

    expect(screen.getByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onInviteSchoolAdmin).not.toHaveBeenCalled();
  });

  it('sends the Bearer-backed School Admin invitation payload', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('tenant-admin-token') };
    const onInviteSchoolAdmin = vi.fn().mockResolvedValue({
      tenantId: 'tenant-1',
      schoolId: 'school-2',
      userId: 'user-1',
      email: 'principal@example.com',
      fullName: 'Branch Principal',
      role: 'SCHOOL_ADMIN',
      userStatus: 'INVITED',
      schoolAccessGranted: true,
      invitationCreated: true,
      invitationId: 'invitation-1',
      invitationExpiresAt: '2026-06-02T00:00:00Z',
      invitationToken: 'one-time-token',
      invitationAcceptUrl: '/invitations/accept?token=one-time-token',
    });

    render(<TenantSchoolCreationPage onInviteSchoolAdmin={onInviteSchoolAdmin} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/school id/i), { target: { value: 'school-2' } });
    fireEvent.change(screen.getByLabelText(/admin full name/i), { target: { value: 'Branch Principal' } });
    fireEvent.change(screen.getByLabelText(/admin email/i), { target: { value: 'principal@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invite school admin/i }));

    await waitFor(() => expect(onInviteSchoolAdmin).toHaveBeenCalledWith('school-2', {
      fullName: 'Branch Principal',
      email: 'principal@example.com',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/principal@example.com invited as school admin/i)).toBeInTheDocument();
  });
});
