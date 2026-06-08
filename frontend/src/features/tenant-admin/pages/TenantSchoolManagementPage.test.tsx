import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TenantSchoolManagementPage } from './TenantSchoolManagementPage';
import type { TenantSchoolAdminSummary, TenantSchoolResponse } from '../api/tenantSchoolsApi';

function storageWithToken(token: string | null) {
  return {
    getItem: vi.fn(() => token),
  };
}

const branchSchool: TenantSchoolResponse = {
  id: 'school-1',
  tenantId: 'tenant-1',
  code: 'BRANCH',
  name: 'Branch School',
  primarySchool: false,
  active: true,
  maxSchools: 3,
  schoolsUsed: 2,
};

const branchAdmin: TenantSchoolAdminSummary = {
  tenantId: 'tenant-1',
  schoolId: 'school-1',
  userId: 'user-1',
  email: 'branch.principal@example.com',
  fullName: 'Branch Principal',
  role: 'SCHOOL_ADMIN',
  userStatus: 'INVITED',
  accessGrantId: 'access-1',
  primaryAccess: false,
  latestInvitationId: 'invitation-1',
  latestInvitationStatus: 'PENDING',
  latestInvitationExpiresAt: '2026-06-02T00:00:00Z',
};

describe('TenantSchoolManagementPage', () => {
  it('requires a logged-in Tenant Admin token before loading schools', async () => {
    const onListSchools = vi.fn();

    render(
      <TenantSchoolManagementPage
        onListSchools={onListSchools}
        storage={storageWithToken(null)}
      />,
    );

    expect(await screen.findByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onListSchools).not.toHaveBeenCalled();
  });

  it('creates, updates, and deactivates schools through drawer and confirmation flows', async () => {
    const onListSchools = vi.fn().mockResolvedValue([branchSchool]);
    const onCreateSchool = vi.fn().mockResolvedValue({
      ...branchSchool,
      id: 'school-2',
      code: 'EAST',
      name: 'East School',
      schoolsUsed: 3,
    });
    const onUpdateSchool = vi.fn().mockResolvedValue({
      ...branchSchool,
      name: 'Branch Renamed',
    });
    const onDeactivateSchool = vi.fn().mockResolvedValue({
      ...branchSchool,
      active: false,
    });

    render(
      <TenantSchoolManagementPage
        onCreateSchool={onCreateSchool}
        onDeactivateSchool={onDeactivateSchool}
        onListSchools={onListSchools}
        onUpdateSchool={onUpdateSchool}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    expect((await screen.findAllByText(/branch school/i)).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /add school/i }));
    fireEvent.change(screen.getByLabelText(/school code/i), { target: { value: 'east' } });
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'East School' } });
    fireEvent.click(screen.getByRole('button', { name: /create school/i }));

    await waitFor(() => expect(onCreateSchool).toHaveBeenCalledWith({
      code: 'east',
      name: 'East School',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/east school created \(3\/3\)\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'Branch Renamed' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(onUpdateSchool).toHaveBeenCalledWith('school-1', {
      name: 'Branch Renamed',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/branch renamed updated\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));
    fireEvent.click(screen.getByRole('button', { name: /deactivate school/i }));

    await waitFor(() => expect(onDeactivateSchool).toHaveBeenCalledWith('school-1', 'tenant-admin-token'));
    expect(await screen.findByText(/branch school deactivated\./i)).toBeInTheDocument();
  });

  it('loads, invites, resends, and revokes School Admin access for a selected school', async () => {
    const onListSchools = vi.fn().mockResolvedValue([branchSchool]);
    const onListSchoolAdmins = vi.fn().mockResolvedValue([branchAdmin]);
    const onInviteSchoolAdmin = vi.fn().mockResolvedValue({
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'user-2',
      email: 'new.principal@example.com',
      fullName: 'New Principal',
      role: 'SCHOOL_ADMIN',
      userStatus: 'INVITED',
      schoolAccessGranted: true,
      invitationCreated: true,
      invitationId: 'invitation-2',
      invitationExpiresAt: '2026-06-02T00:00:00Z',
      invitationToken: 'one-time-token',
      invitationAcceptUrl: '/invitations/accept?token=one-time-token',
    });
    const onResendSchoolAdminInvitation = vi.fn().mockResolvedValue({
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      userId: 'user-1',
      email: 'branch.principal@example.com',
      fullName: 'Branch Principal',
      role: 'SCHOOL_ADMIN',
      userStatus: 'INVITED',
      schoolAccessGranted: false,
      invitationCreated: true,
      invitationId: 'invitation-3',
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
        mode="admins"
        onInviteSchoolAdmin={onInviteSchoolAdmin}
        onListSchoolAdmins={onListSchoolAdmins}
        onListSchools={onListSchools}
        onResendSchoolAdminInvitation={onResendSchoolAdminInvitation}
        onRevokeSchoolAdminAccess={onRevokeSchoolAdminAccess}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    await waitFor(() => expect(onListSchools).toHaveBeenCalledWith('tenant-admin-token'));
    fireEvent.change(screen.getByLabelText(/^school$/i), { target: { value: 'school-1' } });

    await waitFor(() => expect(onListSchoolAdmins).toHaveBeenCalledWith('school-1', 'tenant-admin-token'));
    expect(await screen.findByText('b***@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /invite school admin/i })[0]);
    const drawer = screen.getByRole('dialog', { name: /invite school admin/i });
    fireEvent.change(within(drawer).getByLabelText(/school/i), { target: { value: 'school-1' } });
    fireEvent.change(within(drawer).getByLabelText(/admin full name/i), { target: { value: 'New Principal' } });
    fireEvent.change(within(drawer).getByLabelText(/admin email/i), { target: { value: 'new.principal@example.com' } });
    fireEvent.click(within(drawer).getByRole('button', { name: /invite school admin/i }));

    await waitFor(() => expect(onInviteSchoolAdmin).toHaveBeenCalledWith('school-1', {
      fullName: 'New Principal',
      email: 'new.principal@example.com',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/new.principal@example.com invited as school admin\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /resend/i }));
    await waitFor(() => expect(onResendSchoolAdminInvitation)
      .toHaveBeenCalledWith('school-1', 'user-1', 'tenant-admin-token'));

    fireEvent.click(screen.getByRole('button', { name: /revoke/i }));
    fireEvent.click(screen.getByRole('button', { name: /revoke access/i }));

    await waitFor(() => expect(onRevokeSchoolAdminAccess)
      .toHaveBeenCalledWith('school-1', 'user-1', 'tenant-admin-token'));
  });
});
