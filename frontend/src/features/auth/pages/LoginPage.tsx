import { FormEvent, useState } from 'react';

import { AuthSession, login, LoginRequest, verifyMfa } from '../api/authApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'cloudcampus.auth.refreshToken';

type LoginPageProps = {
  className?: string;
  onSubmit?: (payload: LoginRequest) => Promise<AuthSession>;
  onAuthenticated?: (session: AuthSession) => Promise<void> | void;
  onVerifyMfa?: (challengeId: string, code: string) => Promise<AuthSession>;
  storage?: Pick<Storage, 'setItem'>;
  summary?: string;
  title?: string;
};

export function LoginPage({
  className = '',
  onAuthenticated,
  onSubmit = login,
  onVerifyMfa = verifyMfa,
  storage = globalThis.sessionStorage,
  summary = 'Use your CloudCampus account. You will see your portal based on your role.',
  title = 'CloudCampus Login',
}: LoginPageProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<{
    challengeId: string;
    scaffoldCode: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: LoginRequest = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };

    setSubmitting(true);
    setError(null);
    try {
      const nextSession = await onSubmit(payload);
      if (nextSession.mfaRequired && nextSession.mfaChallengeId) {
        setMfaChallenge({
          challengeId: nextSession.mfaChallengeId,
          scaffoldCode: nextSession.mfaCode,
        });
        setSession(null);
        return;
      }
      await completeSession(nextSession);
    } catch {
      setError('Login failed.');
      setSession(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mfaChallenge) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('mfaCode') ?? '');

    setSubmitting(true);
    setError(null);
    try {
      const nextSession = await onVerifyMfa(mfaChallenge.challengeId, code);
      await completeSession(nextSession);
      setMfaChallenge(null);
    } catch {
      setError('MFA verification failed.');
      setSession(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function completeSession(nextSession: AuthSession) {
    if (!nextSession.accessToken || !nextSession.user) {
      throw new Error('Authenticated session was not returned.');
    }
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextSession.accessToken);
    if (nextSession.refreshToken) {
      storage.setItem(REFRESH_TOKEN_STORAGE_KEY, nextSession.refreshToken);
    }
    setSession(nextSession);
    await onAuthenticated?.(nextSession);
  }

  return (
    <section className={`workflow-panel ${className}`.trim()} aria-labelledby="login-title">
      <p className="eyebrow">AUTH-004</p>
      <h2 id="login-title">{title}</h2>
      <p className="summary compact-summary">{summary}</p>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input autoComplete="username" name="email" required type="email" />
        </label>
        <label>
          Password
          <input autoComplete="current-password" name="password" required type="password" />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {import.meta.env.DEV ? (
        <div className="dev-login-hint" aria-label="Local development login hint">
          <strong>Dev Super Admin:</strong>
          <span>Email: superadmin@cloudcampus.dev</span>
          <span>Password: SuperAdmin123!</span>
        </div>
      ) : null}

      {mfaChallenge ? (
        <form className="workflow-form" onSubmit={handleMfaSubmit}>
          <label>
            MFA code
            <input autoComplete="one-time-code" inputMode="numeric" name="mfaCode" required />
          </label>
          {mfaChallenge.scaffoldCode ? (
            <p className="form-hint">Scaffold MFA code: {mfaChallenge.scaffoldCode}</p>
          ) : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {session ? (
        <div className="form-result">
          <strong>{session.user?.role}</strong>
          <span>{session.user?.email}</span>
          <span>Active school: {session.user?.activeSchool?.name ?? 'none'}</span>
        </div>
      ) : null}
    </section>
  );
}
