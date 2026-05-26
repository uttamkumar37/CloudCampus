import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SchoolAdminParentLinkPage } from './SchoolAdminParentLinkPage';

describe('SchoolAdminParentLinkPage', () => {
  it('requires a logged-in School Admin token before submitting', () => {
    const onSubmit = vi.fn();
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    render(<SchoolAdminParentLinkPage onSubmit={onSubmit} storage={storage} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /link and invite parent/i }));

    expect(screen.getByText(/School Admin login is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits parent link details with the stored access token', async () => {
    const storage = { getItem: vi.fn().mockReturnValue('signed-school-admin-token') };
    const onSubmit = vi.fn().mockResolvedValue({
      linkId: 'link-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      studentId: 'student-1',
      studentName: 'Meera Sharma',
      parentUserId: 'parent-1',
      parentEmail: 'parent@example.com',
      relationship: 'Mother',
      primaryContact: true,
      invitationCreated: true,
      invitationId: 'invitation-1',
      invitationExpiresAt: '2026-06-02T00:00:00Z',
      invitationToken: 'parent-token',
      acceptanceUrl: '/invitations/accept?token=parent-token',
    });
    render(<SchoolAdminParentLinkPage onSubmit={onSubmit} storage={storage} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /link and invite parent/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      studentId: 'student-1',
      parentFullName: 'Riya Sharma',
      parentEmail: 'parent@example.com',
      parentMobile: '+919876543210',
      relationship: 'Mother',
      primaryContact: true,
    }, 'signed-school-admin-token');
    expect(screen.getByText(/Invitation ready for parent@example.com/i)).toBeInTheDocument();
  });
});

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/student id/i), {
    target: { value: 'student-1' },
  });
  fireEvent.change(screen.getByLabelText(/parent name/i), {
    target: { value: 'Riya Sharma' },
  });
  fireEvent.change(screen.getByLabelText(/parent email/i), {
    target: { value: 'parent@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/parent mobile/i), {
    target: { value: '+919876543210' },
  });
  fireEvent.change(screen.getByLabelText(/relationship/i), {
    target: { value: 'Mother' },
  });
  fireEvent.click(screen.getByLabelText(/primary contact/i));
}
