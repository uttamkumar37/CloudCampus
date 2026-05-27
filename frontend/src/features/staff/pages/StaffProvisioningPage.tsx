import { FormEvent, useState } from 'react';

import {
  provisionStaff,
  StaffProvisioningRequest,
  StaffProvisioningResponse,
  StaffProvisioningRole,
} from '../api/staffProvisioningApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type StaffProvisioningPageProps = {
  onProvisionStaff?: (
    payload: StaffProvisioningRequest,
    accessToken: string,
  ) => Promise<StaffProvisioningResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function StaffProvisioningPage({
  onProvisionStaff = provisionStaff,
  storage = globalThis.sessionStorage,
}: StaffProvisioningPageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('School Admin login is required.');
      setMessage(null);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: StaffProvisioningRequest = {
      fullName: String(formData.get('fullName') ?? ''),
      email: String(formData.get('email') ?? ''),
      role: String(formData.get('role') ?? 'TEACHER') as StaffProvisioningRole,
      employeeNumber: optionalString(formData.get('employeeNumber')),
      department: optionalString(formData.get('department')),
      designation: optionalString(formData.get('designation')),
      portalLoginRequired: true,
    };

    setError(null);
    try {
      const result = await onProvisionStaff(payload, accessToken);
      setMessage(`${result.fullName} ${roleLabel(result.role)} invited`);
    } catch {
      setError('Staff provisioning failed.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="staff-provisioning-title">
      <p className="eyebrow">STAFF-001</p>
      <h2 id="staff-provisioning-title">Provision staff portal login</h2>

      <form className="workflow-form compact-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="fullName" placeholder="Teacher One" required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="teacher@example.com" required />
        </label>
        <label>
          Role
          <select name="role" defaultValue="TEACHER">
            <option value="TEACHER">Teacher</option>
            <option value="FINANCE_STAFF">Finance staff</option>
            <option value="STAFF">Staff</option>
          </select>
        </label>
        <label>
          Employee number
          <input name="employeeNumber" placeholder="T-100" />
        </label>
        <label>
          Department
          <input name="department" placeholder="Academics" />
        </label>
        <label>
          Designation
          <input name="designation" placeholder="Mathematics Teacher" />
        </label>
        <button type="submit">Send invitation</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

function roleLabel(role: StaffProvisioningRole) {
  return role.toLowerCase().replace('_', ' ');
}
