import { FormEvent, useState } from 'react';

import {
  onboardTenant,
  TenantOnboardingRequest,
  TenantOnboardingResponse,
} from '../api/onboardingApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantOnboardingPageProps = {
  onSubmit?: (payload: TenantOnboardingRequest, accessToken: string) => Promise<TenantOnboardingResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantOnboardingPage({
  onSubmit = onboardTenant,
  storage = globalThis.sessionStorage,
}: TenantOnboardingPageProps) {
  const [result, setResult] = useState<TenantOnboardingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: TenantOnboardingRequest = {
      tenant: {
        code: String(formData.get('tenantCode') ?? ''),
        name: String(formData.get('tenantName') ?? ''),
      },
      firstSchool: {
        code: String(formData.get('schoolCode') ?? ''),
        name: String(formData.get('schoolName') ?? ''),
      },
      primaryAdmin: {
        fullName: String(formData.get('adminName') ?? ''),
        email: String(formData.get('adminEmail') ?? ''),
      },
    };

    if (payload.firstSchool.code.trim().toUpperCase() === 'MAIN') {
      setError('MAIN is reserved. Enter the real first school code.');
      setResult(null);
      return;
    }

    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('Super Admin login is required.');
      setResult(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      setResult(await onSubmit(payload, accessToken));
    } catch {
      setError('Organization onboarding failed.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="tenant-onboarding-title">
      <p className="eyebrow">Onboarding</p>
      <h2 id="tenant-onboarding-title">Create organization with first school</h2>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Organization code
          <input name="tenantCode" placeholder="SUNRISE_TRUST" required />
        </label>
        <label>
          Organization name
          <input name="tenantName" placeholder="Sunrise Education Trust" required />
        </label>
        <label>
          First school code
          <input name="schoolCode" placeholder="SUNRISE_PRIMARY" required />
        </label>
        <label>
          First school name
          <input name="schoolName" placeholder="Sunrise Public School" required />
        </label>
        <label>
          Primary admin name
          <input name="adminName" placeholder="Asha Mehta" required />
        </label>
        <label>
          Primary admin email
          <input name="adminEmail" placeholder="admin@school.edu" required type="email" />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create and invite admin'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <div className="form-result">
          <strong>{result.school.name}</strong>
          <span>Invitation ready for {result.schoolAdminInvitation.email}</span>
        </div>
      ) : null}
    </section>
  );
}
