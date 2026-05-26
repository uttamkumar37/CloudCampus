import { FormEvent, useState } from 'react';

import {
  linkParentToStudent,
  ParentLinkRequest,
  ParentLinkResponse,
} from '../api/parentLinksApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type SchoolAdminParentLinkPageProps = {
  onSubmit?: (payload: ParentLinkRequest, accessToken: string) => Promise<ParentLinkResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function SchoolAdminParentLinkPage({
  onSubmit = linkParentToStudent,
  storage = globalThis.sessionStorage,
}: SchoolAdminParentLinkPageProps) {
  const [result, setResult] = useState<ParentLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: ParentLinkRequest = {
      studentId: String(formData.get('studentId') ?? ''),
      parentFullName: String(formData.get('parentFullName') ?? ''),
      parentEmail: String(formData.get('parentEmail') ?? ''),
      parentMobile: String(formData.get('parentMobile') ?? ''),
      relationship: String(formData.get('relationship') ?? ''),
      primaryContact: formData.get('primaryContact') === 'on',
    };

    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setResult(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      setResult(await onSubmit(payload, accessToken));
    } catch {
      setError('Parent linking failed.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="parent-link-title">
      <p className="eyebrow">PAR-001</p>
      <h2 id="parent-link-title">Link parent to student</h2>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Student ID
          <input name="studentId" placeholder="student-uuid" required />
        </label>
        <label>
          Parent name
          <input name="parentFullName" placeholder="Riya Sharma" required />
        </label>
        <label>
          Parent email
          <input name="parentEmail" placeholder="parent@example.com" required type="email" />
        </label>
        <label>
          Parent mobile
          <input name="parentMobile" placeholder="+919876543210" />
        </label>
        <label>
          Relationship
          <input name="relationship" placeholder="Mother" required />
        </label>
        <label className="inline-check">
          <input name="primaryContact" type="checkbox" />
          Primary contact
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Linking...' : 'Link and invite parent'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <div className="form-result">
          <strong>{result.studentName}</strong>
          <span>
            {result.invitationCreated
              ? `Invitation ready for ${result.parentEmail}`
              : `${result.parentEmail} linked`}
          </span>
        </div>
      ) : null}
    </section>
  );
}
