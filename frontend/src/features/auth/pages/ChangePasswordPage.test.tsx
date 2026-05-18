import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { AuthUser } from '@/features/auth/types/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

const activeUser: AuthUser = {
  userId: 'u-1',
  role: 'SCHOOL_ADMIN',
  tenantId: 't-1',
  schoolId: null,
  requiresPasswordChange: false,
  expiresIn: 900,
  features: [],
};

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillForm(current: string, next: string, confirm: string) {
  fireEvent.change(screen.getByLabelText(/current password/i), {
    target: { value: current },
  });
  fireEvent.change(screen.getByLabelText(/^new password$/i), {
    target: { value: next },
  });
  fireEvent.change(screen.getByLabelText(/confirm new password/i), {
    target: { value: confirm },
  });
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ChangePasswordPage — password validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().setTokens('tok', 'ref', activeUser);
  });

  it('renders all three password fields and submit button', () => {
    renderPage();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('submit button is disabled until all fields are filled', () => {
    renderPage();
    const btn = screen.getByRole('button', { name: /update password/i });
    expect(btn).toBeDisabled();
    fillForm('old', 'new', 'new');
    expect(btn).not.toBeDisabled();
  });

  it('shows error when new password is too short', async () => {
    renderPage();
    fillForm('oldPass1!', 'Short1!', 'Short1!');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });

  it('shows error when new password has no uppercase letter', async () => {
    renderPage();
    fillForm('oldPass1!', 'nouppercase1!', 'nouppercase1!');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/uppercase/i);
  });

  it('shows error when new password has no digit', async () => {
    renderPage();
    fillForm('oldPass1!', 'NoDigitHere!', 'NoDigitHere!');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/digit/i);
  });

  it('shows error when new password has no special character', async () => {
    renderPage();
    fillForm('oldPass1!', 'NoSpecial123', 'NoSpecial123');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/special character/i);
  });

  it('shows error when passwords do not match', async () => {
    renderPage();
    fillForm('oldPass1!', 'Strong1!Pass', 'Strong1!Typo');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i);
  });

  it('shows forced-change banner when requiresPasswordChange is true', () => {
    useAuthStore.getState().setTokens('tok', 'ref', {
      ...activeUser,
      requiresPasswordChange: true,
    });
    renderPage();
    expect(
      screen.getByText(/you must set a new password before continuing/i),
    ).toBeInTheDocument();
  });
});
