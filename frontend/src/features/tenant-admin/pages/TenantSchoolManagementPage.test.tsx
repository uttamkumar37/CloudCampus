import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { TenantSchoolManagementPage } from './TenantSchoolManagementPage';

describe('TenantSchoolManagementPage', () => {
  it('requires a logged-in Tenant Admin token before loading schools', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const onListSchools = vi.fn();

    render(<TenantSchoolManagementPage onListSchools={onListSchools} storage={storage} />);

    fireEvent.click(screen.getByRole('button', { name: /load schools/i }));

    expect(screen.getByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onListSchools).not.toHaveBeenCalled();
  });

  it('loads schools and School Admins with the stored Bearer token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('tenant-admin-token') };
    const onListSchools = vi.fn().mockResolvedValue([
      {
        id: 'school-1',
        tenantId: 'tenant-1',
        code: 'PRIMARY',
        name: 'Primary School',
        primarySchool: true,
        active: true,
        maxSchools: 3,
        schoolsUsed: 2,
      },
    ]);
    const onListSchoolAdmins = vi.fn().mockResolvedValue([
      {
        tenantId: 'tenant-1',
        schoolId: 'school-1',
        userId: 'user-1',
        email: 'principal@example.com',
        fullName: 'Branch Principal',
        role: 'SCHOOL_ADMIN',
        userStatus: 'INVITED',
        accessGrantId: 'access-1',
        primaryAccess: true,
        latestInvitationId: 'invitation-1',
        latestInvitationStatus: 'PENDING',
        latestInvitationExpiresAt: '2026-06-02T00:00:00Z',
      },
    ]);

    render(
      <TenantSchoolManagementPage
        onListSchools={onListSchools}
        onListSchoolAdmins={onListSchoolAdmins}
        storage={storage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /load schools/i }));

    await waitFor(() => expect(onListSchools).toHaveBeenCalledWith('tenant-admin-token'));
    expect(await screen.findByText(/primary school/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/school id for admins/i), { target: { value: 'school-1' } });
    fireEvent.click(screen.getByRole('button', { name: /load school admins/i }));

    await waitFor(() => expect(onListSchoolAdmins).toHaveBeenCalledWith('school-1', 'tenant-admin-token'));
    expect(await screen.findByText(/principal@example.com/i)).toBeInTheDocument();
  });

  it('updates, deactivates, resends and revokes through the management APIs', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('tenant-admin-token') };
    const onListSchools = vi.fn().mockResolvedValue([]);
    const onUpdateSchool = vi.fn().mockResolvedValue({
      id: 'school-1',
      tenantId: 'tenant-1',
      code: 'BRANCH',
      name: 'Branch Renamed',
      primarySchool: false,
      active: true,
      maxSchools: 3,
      schoolsUsed: 2,
    });
    const onDeactivateSchool = vi.fn().mockResolvedValue({
      id: 'school-1',
      tenantId: 'tenant-1',
      code: 'BRANCH',
      name: 'Branch Renamed',
      primarySchool: false,
      active: false,
      maxSchools: 3,
      schoolsUsed: 2,
    });
    const onResendSchoolAdminInvitation = vi.fn().mockResolvedValue({
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'user-1',
      email: 'principal@example.com',
      fullName: 'Branch Principal',
      role: 'SCHOOL_ADMIN',
      userStatus: 'INVITED',
      schoolAccessGranted: false,
      invitationCreated: true,
      invitationId: 'invitation-2',
      invitationExpiresAt: '2026-06-02T00:00:00Z',
      invitationToken: 'resent-token',
      invitationAcceptUrl: '/invitations/accept?token=resent-token',
    });
    const onRevokeSchoolAdminAccess = vi.fn().mockResolvedValue({
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'user-1',
      accessRevoked: true,
      remainingSchoolAdmins: 1,
    });

    render(
      <TenantSchoolManagementPage
        onListSchools={onListSchools}
        onUpdateSchool={onUpdateSchool}
        onDeactivateSchool={onDeactivateSchool}
        onResendSchoolAdminInvitation={onResendSchoolAdminInvitation}
        onRevokeSchoolAdminAccess={onRevokeSchoolAdminAccess}
        storage={storage}
      />,
    );

    fireEvent.change(screen.getByLabelText(/school id to update/i), { target: { value: 'school-1' } });
    fireEvent.change(screen.getByLabelText(/new school name/i), { target: { value: 'Branch Renamed' } });
    fireEvent.click(screen.getByRole('button', { name: /update school/i }));

    await waitFor(() => expect(onUpdateSchool).toHaveBeenCalledWith('school-1', {
      name: 'Branch Renamed',
    }, 'tenant-admin-token'));

    fireEvent.change(screen.getByLabelText(/school id to deactivate/i), { target: { value: 'school-1' } });
    fireEvent.click(screen.getByRole('button', { name: /deactivate school/i }));

    await waitFor(() => expect(onDeactivateSchool).toHaveBeenCalledWith('school-1', 'tenant-admin-token'));

    fireEvent.change(screen.getByLabelText(/school id for resend/i), { target: { value: 'school-1' } });
    fireEvent.change(screen.getAllByLabelText(/school admin user id/i)[0], { target: { value: 'user-1' } });
    fireEvent.click(screen.getByRole('button', { name: /resend invitation/i }));

    await waitFor(() => expect(onResendSchoolAdminInvitation)
      .toHaveBeenCalledWith('school-1', 'user-1', 'tenant-admin-token'));

    fireEvent.change(screen.getByLabelText(/school id for revoke/i), { target: { value: 'school-1' } });
    fireEvent.change(screen.getAllByLabelText(/school admin user id/i)[1], { target: { value: 'user-1' } });
    fireEvent.click(screen.getByRole('button', { name: /revoke access/i }));

    await waitFor(() => expect(onRevokeSchoolAdminAccess)
      .toHaveBeenCalledWith('school-1', 'user-1', 'tenant-admin-token'));
  });
});
