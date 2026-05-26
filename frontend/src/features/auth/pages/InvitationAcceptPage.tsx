import { FormEvent, useState } from 'react';

import {
  acceptInvitation,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
} from '../api/invitationsApi';

type InvitationAcceptPageProps = {
  onSubmit?: (payload: AcceptInvitationRequest) => Promise<AcceptInvitationResponse>;
};

export function InvitationAcceptPage({
  onSubmit = acceptInvitation,
}: InvitationAcceptPageProps) {
  const [result, setResult] = useState<AcceptInvitationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: AcceptInvitationRequest = {
      token: String(formData.get('token') ?? ''),
      password: String(formData.get('password') ?? ''),
      displayName: String(formData.get('displayName') ?? ''),
    };

    setSubmitting(true);
    setError(null);
    try {
      setResult(await onSubmit(payload));
    } catch {
      setError('Invitation acceptance failed.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="invitation-accept-title">
      <p className="eyebrow">AUTH-001</p>
      <h2 id="invitation-accept-title">Accept School Admin invitation</h2>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Invitation token
          <input name="token" required />
        </label>
        <label>
          Display name
          <input name="displayName" placeholder="Asha Mehta" />
        </label>
        <label>
          New password
          <input minLength={12} name="password" required type="password" />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Activating...' : 'Set password'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <div className="form-result">
          <strong>{result.role}</strong>
          <span>School access granted: {result.schoolAccessGranted ? 'yes' : 'no'}</span>
        </div>
      ) : null}
    </section>
  );
}
