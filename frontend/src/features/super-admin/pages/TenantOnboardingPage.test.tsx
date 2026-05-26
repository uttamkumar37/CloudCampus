import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TenantOnboardingPage } from './TenantOnboardingPage';

describe('TenantOnboardingPage', () => {
  it('rejects MAIN as the first school code before calling the API', () => {
    const onSubmit = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue('signed-super-token') };
    render(<TenantOnboardingPage onSubmit={onSubmit} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/tenant code/i), {
      target: { value: 'DEMO' },
    });
    fireEvent.change(screen.getByLabelText(/tenant name/i), {
      target: { value: 'Demo Trust' },
    });
    fireEvent.change(screen.getByLabelText(/first school code/i), {
      target: { value: 'MAIN' },
    });
    fireEvent.change(screen.getByLabelText(/first school name/i), {
      target: { value: 'Main Placeholder' },
    });
    fireEvent.change(screen.getByLabelText(/primary admin name/i), {
      target: { value: 'Admin User' },
    });
    fireEvent.change(screen.getByLabelText(/primary admin email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create and invite admin/i }));

    expect(screen.getByText(/MAIN is reserved/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a logged-in Super Admin token before submitting', () => {
    const onSubmit = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<TenantOnboardingPage onSubmit={onSubmit} storage={storage} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create and invite admin/i }));

    expect(screen.getByText(/Super Admin login is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits first school and primary admin details', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-super-token') };
    const onSubmit = vi.fn().mockResolvedValue({
      tenant: { id: 'tenant-1', code: 'DEMO', name: 'Demo Trust', status: 'ACTIVE' },
      school: { id: 'school-1', code: 'REAL', name: 'Real School', primarySchool: true },
      schoolAdminInvitation: {
        invitationId: 'inv-1',
        userId: 'user-1',
        email: 'admin@example.com',
        role: 'SCHOOL_ADMIN',
        expiresAt: '2026-06-02T00:00:00Z',
        token: 'token',
        acceptanceUrl: '/invitations/accept?token=token',
      },
      schoolAccess: {
        userId: 'user-1',
        schoolId: 'school-1',
        role: 'SCHOOL_ADMIN',
        primaryAccess: true,
      },
    });
    render(<TenantOnboardingPage onSubmit={onSubmit} storage={storage} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create and invite admin/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      tenant: { code: 'demo', name: 'Demo Trust' },
      firstSchool: { code: 'real', name: 'Real School' },
      primaryAdmin: { fullName: 'Admin User', email: 'admin@example.com' },
    }, 'signed-super-token');
    expect(screen.getByText(/Invitation ready for admin@example.com/i)).toBeInTheDocument();
  });
});

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/tenant code/i), {
    target: { value: 'demo' },
  });
  fireEvent.change(screen.getByLabelText(/tenant name/i), {
    target: { value: 'Demo Trust' },
  });
  fireEvent.change(screen.getByLabelText(/first school code/i), {
    target: { value: 'real' },
  });
  fireEvent.change(screen.getByLabelText(/first school name/i), {
    target: { value: 'Real School' },
  });
  fireEvent.change(screen.getByLabelText(/primary admin name/i), {
    target: { value: 'Admin User' },
  });
  fireEvent.change(screen.getByLabelText(/primary admin email/i), {
    target: { value: 'admin@example.com' },
  });
}
