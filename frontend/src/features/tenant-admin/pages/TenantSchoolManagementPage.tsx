import { FormEvent, useState } from 'react';

import {
  deactivateTenantSchool,
  listTenantSchoolAdmins,
  listTenantSchools,
  resendTenantSchoolAdminInvitation,
  revokeTenantSchoolAdminAccess,
  TenantSchoolAdminAccessRevokeResponse,
  TenantSchoolAdminInviteResponse,
  TenantSchoolAdminSummary,
  TenantSchoolResponse,
  TenantSchoolUpdateRequest,
  updateTenantSchool,
} from '../api/tenantSchoolsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantSchoolManagementPageProps = {
  onListSchools?: (accessToken: string) => Promise<TenantSchoolResponse[]>;
  onUpdateSchool?: (
    schoolId: string,
    payload: TenantSchoolUpdateRequest,
    accessToken: string,
  ) => Promise<TenantSchoolResponse>;
  onDeactivateSchool?: (schoolId: string, accessToken: string) => Promise<TenantSchoolResponse>;
  onListSchoolAdmins?: (schoolId: string, accessToken: string) => Promise<TenantSchoolAdminSummary[]>;
  onResendSchoolAdminInvitation?: (
    schoolId: string,
    userId: string,
    accessToken: string,
  ) => Promise<TenantSchoolAdminInviteResponse>;
  onRevokeSchoolAdminAccess?: (
    schoolId: string,
    userId: string,
    accessToken: string,
  ) => Promise<TenantSchoolAdminAccessRevokeResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantSchoolManagementPage({
  onListSchools = listTenantSchools,
  onUpdateSchool = updateTenantSchool,
  onDeactivateSchool = deactivateTenantSchool,
  onListSchoolAdmins = listTenantSchoolAdmins,
  onResendSchoolAdminInvitation = resendTenantSchoolAdminInvitation,
  onRevokeSchoolAdminAccess = revokeTenantSchoolAdminAccess,
  storage = globalThis.sessionStorage,
}: TenantSchoolManagementPageProps) {
  const [schools, setSchools] = useState<TenantSchoolResponse[]>([]);
  const [admins, setAdmins] = useState<TenantSchoolAdminSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function accessToken() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      return null;
    }
    return token;
  }

  async function loadSchools() {
    const token = accessToken();
    if (!token) {
      return;
    }

    setError(null);
    try {
      const result = await onListSchools(token);
      setSchools(result);
      setMessage(`${result.length} schools loaded`);
    } catch {
      setError('School listing failed.');
      setMessage(null);
    }
  }

  async function handleUpdateSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const schoolId = String(formData.get('schoolId') ?? '');
    const payload = { name: String(formData.get('name') ?? '') };

    setError(null);
    try {
      const result = await onUpdateSchool(schoolId, payload, token);
      setMessage(`${result.name} updated`);
      await loadSchools();
    } catch {
      setError('School update failed.');
      setMessage(null);
    }
  }

  async function handleDeactivateSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) {
      return;
    }

    const schoolId = String(new FormData(event.currentTarget).get('schoolId') ?? '');

    setError(null);
    try {
      const result = await onDeactivateSchool(schoolId, token);
      setMessage(`${result.name} deactivated`);
      await loadSchools();
    } catch {
      setError('School deactivation failed.');
      setMessage(null);
    }
  }

  async function handleListAdmins(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) {
      return;
    }

    const schoolId = String(new FormData(event.currentTarget).get('schoolId') ?? '');

    setError(null);
    try {
      const result = await onListSchoolAdmins(schoolId, token);
      setAdmins(result);
      setMessage(`${result.length} School Admins loaded`);
    } catch {
      setError('School Admin listing failed.');
      setMessage(null);
    }
  }

  async function handleAdminAction(
    event: FormEvent<HTMLFormElement>,
    action: 'resend' | 'revoke',
  ) {
    event.preventDefault();
    const token = accessToken();
    if (!token) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const schoolId = String(formData.get('schoolId') ?? '');
    const userId = String(formData.get('userId') ?? '');

    setError(null);
    try {
      if (action === 'resend') {
        const result = await onResendSchoolAdminInvitation(schoolId, userId, token);
        setMessage(`${result.email} invitation resent`);
      } else {
        const result = await onRevokeSchoolAdminAccess(schoolId, userId, token);
        setMessage(`School Admin access revoked (${result.remainingSchoolAdmins} remain)`);
      }
    } catch {
      setError(action === 'resend' ? 'Invitation resend failed.' : 'Access revoke failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="tenant-school-management-title">
      <p className="eyebrow">School management</p>
      <h2 id="tenant-school-management-title">Manage schools</h2>

      <form className="workflow-form compact-form" onSubmit={(event) => {
        event.preventDefault();
        void loadSchools();
      }}>
        <button type="submit">Load schools</button>
      </form>

      <div className="result-list" aria-label="Tenant schools">
        {schools.map((school) => (
          <article className="result-item" key={school.id}>
            <strong>{school.name}</strong>
            <span>{school.code}</span>
            <span>{school.active ? 'Active' : 'Inactive'}</span>
            <span>{school.primarySchool ? 'Primary school' : 'Branch school'}</span>
          </article>
        ))}
      </div>

      <form className="workflow-form compact-form" onSubmit={handleUpdateSchool}>
        <label>
          School to update
          <input name="schoolId" placeholder="Select a school from the list above" required />
        </label>
        <label>
          New school name
          <input name="name" placeholder="Branch West" required />
        </label>
        <button type="submit">Update school</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleDeactivateSchool}>
        <label>
          School to deactivate
          <input name="schoolId" placeholder="Select a school from the list above" required />
        </label>
        <button type="submit">Deactivate school</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={handleListAdmins}>
        <label>
          School
          <input name="schoolId" placeholder="Select a school from the list above" required />
        </label>
        <button type="submit">Load School Admins</button>
      </form>

      <div className="result-list" aria-label="School Admins">
        {admins.map((admin) => (
          <article className="result-item" key={admin.accessGrantId}>
            <strong>{admin.fullName}</strong>
            <span>{admin.email}</span>
            <span>{admin.userStatus}</span>
            <span>{admin.latestInvitationStatus ?? 'No invitation'}</span>
          </article>
        ))}
      </div>

      <form className="workflow-form compact-form" onSubmit={(event) => void handleAdminAction(event, 'resend')}>
        <label>
          School
          <input name="schoolId" placeholder="Select a school" required />
        </label>
        <label>
          School Admin
          <input name="userId" placeholder="Select a School Admin" required />
        </label>
        <button type="submit">Resend invitation</button>
      </form>

      <form className="workflow-form compact-form" onSubmit={(event) => void handleAdminAction(event, 'revoke')}>
        <label>
          School
          <input name="schoolId" placeholder="Select a school" required />
        </label>
        <label>
          School Admin
          <input name="userId" placeholder="Select a School Admin" required />
        </label>
        <button type="submit">Revoke access</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
