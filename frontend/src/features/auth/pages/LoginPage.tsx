import { FormEvent, useState } from 'react';

import { AuthSession, login, LoginRequest, verifyMfa } from '../api/authApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'cloudcampus.auth.refreshToken';

type LoginPageProps = {
  onSubmit?: (payload: LoginRequest) => Promise<AuthSession>;
  onVerifyMfa?: (challengeId: string, code: string) => Promise<AuthSession>;
  storage?: Pick<Storage, 'setItem'>;
};

export function LoginPage({
  onSubmit = login,
  onVerifyMfa = verifyMfa,
  storage = globalThis.sessionStorage,
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
      completeSession(nextSession);
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
      completeSession(nextSession);
      setMfaChallenge(null);
    } catch {
      setError('MFA verification failed.');
      setSession(null);
    } finally {
      setSubmitting(false);
    }
  }

  function completeSession(nextSession: AuthSession) {
    if (!nextSession.accessToken || !nextSession.user) {
      throw new Error('Authenticated session was not returned.');
    }
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextSession.accessToken);
    if (nextSession.refreshToken) {
      storage.setItem(REFRESH_TOKEN_STORAGE_KEY, nextSession.refreshToken);
    }
    setSession(nextSession);
  }

  return (
    <section className="workflow-panel" aria-labelledby="login-title">
      <p className="eyebrow">AUTH-004</p>
      <h2 id="login-title">School Admin login</h2>
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
