import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InvitationAcceptPage } from './InvitationAcceptPage';

describe('InvitationAcceptPage', () => {
  it('submits token and password for invitation acceptance', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      userId: 'user-1',
      tenantId: 'tenant-1',
      schoolId: 'school-1',
      role: 'SCHOOL_ADMIN',
      status: 'ACTIVE',
      schoolAccessGranted: true,
    });
    render(<InvitationAcceptPage onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/invitation token/i), {
      target: { value: 'secure-token' },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Asha Mehta' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'StrongerPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /set password/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      token: 'secure-token',
      displayName: 'Asha Mehta',
      password: 'StrongerPass123!',
    });
    expect(screen.getByText(/School access granted: yes/i)).toBeInTheDocument();
  });
});
