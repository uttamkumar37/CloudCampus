import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TenantSchoolCreationPage } from './TenantSchoolCreationPage';

function storageWithToken(token: string | null) {
  return {
    getItem: vi.fn(() => token),
  };
}

describe('TenantSchoolCreationPage', () => {
  it('requires a logged-in Tenant Admin token before creating a school', async () => {
    const onCreateSchool = vi.fn();
    const onListSchools = vi.fn();

    render(
      <TenantSchoolCreationPage
        onCreateSchool={onCreateSchool}
        onListSchools={onListSchools}
        storage={storageWithToken(null)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /add school/i }));
    fireEvent.change(screen.getByLabelText(/school code/i), { target: { value: 'branch-east' } });
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'Branch East' } });
    fireEvent.click(screen.getByRole('button', { name: /create school/i }));

    expect(await screen.findByText(/tenant admin login is required/i)).toBeInTheDocument();
    expect(onCreateSchool).not.toHaveBeenCalled();
    expect(onListSchools).not.toHaveBeenCalled();
  });

  it('creates a tenant-scoped school from the drawer with the stored token', async () => {
    const onListSchools = vi.fn().mockResolvedValue([]);
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

    render(
      <TenantSchoolCreationPage
        onCreateSchool={onCreateSchool}
        onListSchools={onListSchools}
        storage={storageWithToken('tenant-admin-token')}
      />,
    );

    await waitFor(() => expect(onListSchools).toHaveBeenCalledWith('tenant-admin-token'));
    fireEvent.click(screen.getByRole('button', { name: /add school/i }));
    fireEvent.change(screen.getByLabelText(/school code/i), { target: { value: 'branch-east' } });
    fireEvent.change(screen.getByLabelText(/school name/i), { target: { value: 'Branch East' } });
    fireEvent.click(screen.getByRole('button', { name: /create school/i }));

    await waitFor(() => expect(onCreateSchool).toHaveBeenCalledWith({
      code: 'branch-east',
      name: 'Branch East',
    }, 'tenant-admin-token'));
    expect(await screen.findByText(/branch east created \(2\/3\)\./i)).toBeInTheDocument();
  });
});
