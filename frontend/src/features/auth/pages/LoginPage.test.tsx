import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('submits credentials and stores the access token in session storage', async () => {
    const storage = { setItem: vi.fn() };
    const onSubmit = vi.fn().mockResolvedValue({
      accessToken: 'signed-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresAt: '2026-05-26T11:00:00Z',
      mfaRequired: false,
      mfaChallengeId: null,
      mfaCode: null,
      mfaExpiresAt: null,
      user: {
        userId: 'user-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'SCHOOL_ADMIN',
        tenantId: 'tenant-1',
        activeSchool: {
          schoolId: 'school-1',
          code: 'REAL',
          name: 'Real School',
          role: 'SCHOOL_ADMIN',
          primaryAccess: true,
        },
        allowedSchools: [],
      },
    });

    render(<LoginPage onSubmit={onSubmit} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'StrongerPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'StrongerPass123!',
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      'cloudcampus.auth.accessToken',
      'signed-token',
    );
    expect(storage.setItem).toHaveBeenCalledWith(
      'cloudcampus.auth.refreshToken',
      'refresh-token',
    );
    expect(screen.getByText(/active school: real school/i)).toBeInTheDocument();
  });

  it('verifies an MFA challenge before storing tokens', async () => {
    const storage = { setItem: vi.fn() };
    const onSubmit = vi.fn().mockResolvedValue({
      accessToken: null,
      refreshToken: null,
      tokenType: 'Bearer',
      expiresAt: null,
      user: null,
      mfaRequired: true,
      mfaChallengeId: 'challenge-1',
      mfaCode: '123456',
      mfaExpiresAt: '2026-05-26T11:00:00Z',
    });
    const onVerifyMfa = vi.fn().mockResolvedValue({
      accessToken: 'signed-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresAt: '2026-05-26T11:00:00Z',
      mfaRequired: false,
      mfaChallengeId: null,
      mfaCode: null,
      mfaExpiresAt: null,
      user: {
        userId: 'user-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'SCHOOL_ADMIN',
        tenantId: 'tenant-1',
        activeSchool: null,
        allowedSchools: [],
      },
    });

    render(<LoginPage onSubmit={onSubmit} onVerifyMfa={onVerifyMfa} storage={storage} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'StrongerPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/scaffold mfa code: 123456/i)).toBeInTheDocument();
    expect(storage.setItem).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/mfa code/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => expect(onVerifyMfa).toHaveBeenCalledWith('challenge-1', '123456'));
    expect(storage.setItem).toHaveBeenCalledWith(
      'cloudcampus.auth.accessToken',
      'signed-token',
    );
  });
});
