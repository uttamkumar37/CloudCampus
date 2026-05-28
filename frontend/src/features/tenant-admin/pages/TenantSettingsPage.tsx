import { FormEvent, useState } from 'react';

import {
  getTenantSettings,
  getTenantUsage,
  TenantSettings,
  TenantSettingsRequest,
  TenantUsage,
  updateTenantSettings,
} from '../api/tenantSettingsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantSettingsPageProps = {
  onLoadSettings?: (accessToken: string) => Promise<TenantSettings>;
  onLoadUsage?: (accessToken: string) => Promise<TenantUsage>;
  onUpdateSettings?: (
    payload: TenantSettingsRequest,
    accessToken: string,
  ) => Promise<TenantSettings>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantSettingsPage({
  onLoadSettings = getTenantSettings,
  onLoadUsage = getTenantUsage,
  onUpdateSettings = updateTenantSettings,
  storage = globalThis.sessionStorage,
}: TenantSettingsPageProps) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad() {
    const token = accessToken();
    if (!token) {
      return;
    }

    setError(null);
    try {
      const [settingsResponse, usageResponse] = await Promise.all([
        onLoadSettings(token),
        onLoadUsage(token),
      ]);
      setSettings(settingsResponse);
      setUsage(usageResponse);
      setMessage(`${settingsResponse.displayName} settings loaded`);
    } catch {
      setError('Organization settings could not be loaded.');
      setMessage(null);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      displayName: String(formData.get('displayName') ?? ''),
      billingEmail: String(formData.get('billingEmail') ?? ''),
      supportEmail: String(formData.get('supportEmail') ?? ''),
      timezone: String(formData.get('timezone') ?? ''),
      locale: String(formData.get('locale') ?? ''),
    };

    setError(null);
    try {
      const response = await onUpdateSettings(payload, token);
      setSettings(response);
      setMessage(`${response.displayName} settings updated`);
    } catch {
      setError('Organization settings could not be updated.');
      setMessage(null);
    }
  }

  function accessToken() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      return null;
    }
    return token;
  }

  return (
    <section className="workflow-panel" aria-labelledby="tenant-settings-title">
      <p className="eyebrow">Organization settings</p>
      <h2 id="tenant-settings-title">Organization settings and usage</h2>

      <form className="workflow-form" onSubmit={(event) => {
        event.preventDefault();
        void handleLoad();
      }}>
        <button type="submit">Load organization settings</button>
      </form>

      {usage ? (
        <div className="form-result" aria-label="Tenant usage">
          <strong>{usage.planCode}</strong>
          <span>Schools: {usage.schoolsUsed}/{usage.maxSchools}</span>
          <span>Active schools: {usage.activeSchools}</span>
          <span>School Admins: {usage.schoolAdmins}</span>
          <span>Teachers: {usage.teachers}</span>
          <span>Staff: {usage.staff}</span>
          <span>Students: {usage.students}</span>
        </div>
      ) : null}

      <form
        className="workflow-form compact-form"
        key={settings?.updatedAt ?? settings?.tenantId ?? 'empty-settings'}
        onSubmit={handleUpdate}
      >
        <label>
          Display name
          <input
            name="displayName"
            placeholder="Organization display name"
            defaultValue={settings?.displayName ?? ''}
            required
          />
        </label>
        <label>
          Billing email
          <input
            name="billingEmail"
            placeholder="billing@example.com"
            defaultValue={settings?.billingEmail ?? ''}
            type="email"
          />
        </label>
        <label>
          Support email
          <input
            name="supportEmail"
            placeholder="support@example.com"
            defaultValue={settings?.supportEmail ?? ''}
            type="email"
          />
        </label>
        <label>
          Timezone
          <input name="timezone" placeholder="Asia/Kolkata" defaultValue={settings?.timezone ?? 'UTC'} required />
        </label>
        <label>
          Locale
          <input name="locale" placeholder="en-IN" defaultValue={settings?.locale ?? 'en-US'} required />
        </label>
        <button type="submit">Update organization settings</button>
      </form>

      {settings ? (
        <div className="result-list" aria-label="Organization settings">
          <article className="result-item">
            <strong>{settings.displayName}</strong>
            <span>{settings.tenantCode}</span>
            <span>{settings.timezone}</span>
            <span>{settings.locale}</span>
          </article>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}
    </section>
  );
}
