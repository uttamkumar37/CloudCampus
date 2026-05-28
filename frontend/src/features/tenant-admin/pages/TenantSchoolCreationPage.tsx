import { FormEvent, useState } from 'react';

import {
  createTenantSchool,
  inviteTenantSchoolAdmin,
  TenantSchoolAdminInviteRequest,
  TenantSchoolAdminInviteResponse,
  TenantSchoolRequest,
  TenantSchoolResponse,
} from '../api/tenantSchoolsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantSchoolCreationPageProps = {
  onCreateSchool?: (payload: TenantSchoolRequest, accessToken: string) => Promise<TenantSchoolResponse>;
  onInviteSchoolAdmin?: (
    schoolId: string,
    payload: TenantSchoolAdminInviteRequest,
    accessToken: string,
  ) => Promise<TenantSchoolAdminInviteResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantSchoolCreationPage({
  onCreateSchool = createTenantSchool,
  onInviteSchoolAdmin = inviteTenantSchoolAdmin,
  storage = globalThis.sessionStorage,
}: TenantSchoolCreationPageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: TenantSchoolRequest = {
      code: String(formData.get('code') ?? ''),
      name: String(formData.get('name') ?? ''),
    };

    setError(null);
    try {
      const result = await onCreateSchool(payload, accessToken);
      setMessage(`${result.name} created (${result.schoolsUsed}/${result.maxSchools})`);
    } catch {
      setError('School creation failed.');
      setMessage(null);
    }
  }

  async function handleInviteSchoolAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const schoolId = String(formData.get('schoolId') ?? '');
    const payload: TenantSchoolAdminInviteRequest = {
      fullName: String(formData.get('fullName') ?? ''),
      email: String(formData.get('email') ?? ''),
    };

    setError(null);
    try {
      const result = await onInviteSchoolAdmin(schoolId, payload, accessToken);
      setMessage(`${result.email} invited as School Admin`);
    } catch {
      setError('School Admin invitation failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="tenant-school-create-title">
      <p className="eyebrow">School operations</p>
      <h2 id="tenant-school-create-title">Create school</h2>

      <form className="workflow-form compact-form" onSubmit={handleSubmit}>
        <label>
          School code
          <input name="code" placeholder="BRANCH-EAST" required />
        </label>
        <label>
          School name
          <input name="name" placeholder="Branch East" required />
        </label>
        <button type="submit">Create school</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleInviteSchoolAdmin}>
        <label>
          School
          <input name="schoolId" placeholder="Select a school from School Management" required />
        </label>
        <label>
          Admin full name
          <input name="fullName" placeholder="Branch Principal" required />
        </label>
        <label>
          Admin email
          <input name="email" placeholder="principal@example.com" required type="email" />
        </label>
        <button type="submit">Invite School Admin</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
