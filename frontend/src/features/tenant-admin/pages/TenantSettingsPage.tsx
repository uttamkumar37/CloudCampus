import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import {
  getTenantSettings,
  getTenantUsage,
  type TenantSettings,
  type TenantSettingsRequest,
  type TenantUsage,
  updateTenantSettings,
} from '../api/tenantSettingsApi';
import { TenantAdminPageTitle } from './TenantSchoolManagementPage';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantSettingsPageProps = {
  onLoadSettings?: (accessToken: string) => Promise<TenantSettings>;
  onUpdateSettings?: (
    payload: TenantSettingsRequest,
    accessToken: string,
  ) => Promise<TenantSettings>;
  storage?: Pick<Storage, 'getItem'>;
};

type TenantUsagePageProps = {
  onLoadUsage?: (accessToken: string) => Promise<TenantUsage>;
  storage?: Pick<Storage, 'getItem'>;
};

type SettingsErrors = Partial<Record<keyof TenantSettingsRequest, string>>;

export function TenantSettingsPage({
  onLoadSettings = getTenantSettings,
  onUpdateSettings = updateTenantSettings,
  storage = globalThis.sessionStorage,
}: TenantSettingsPageProps) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [form, setForm] = useState<TenantSettingsRequest>({
    displayName: '',
    billingEmail: '',
    supportEmail: '',
    timezone: 'UTC',
    locale: 'en-US',
  });
  const [initialForm, setInitialForm] = useState<TenantSettingsRequest | null>(null);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => initialForm ? JSON.stringify(form) !== JSON.stringify(initialForm) : false, [form, initialForm]);

  useEffect(() => {
    void loadSettings({ quiet: true });
  }, []);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function loadSettings(options: { quiet?: boolean } = {}) {
    const token = accessToken();
    if (!token) return;

    setStatus('loading');
    setError(null);
    try {
      const response = await onLoadSettings(token);
      const nextForm = settingsToForm(response);
      setSettings(response);
      setForm(nextForm);
      setInitialForm(nextForm);
      setErrors({});
      setStatus('ready');
      if (!options.quiet) {
        setMessage(`${response.displayName} settings loaded.`);
      }
    } catch (caught) {
      setSettings(null);
      setStatus('error');
      setError(tenantSettingsError(caught, 'Organization settings could not be loaded.'));
      setMessage(null);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) return;

    const validation = validateSettings(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }
    if (!dirty) {
      setMessage('No settings changes to save.');
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await onUpdateSettings(form, token);
      const nextForm = settingsToForm(response);
      setSettings(response);
      setForm(nextForm);
      setInitialForm(nextForm);
      setErrors({});
      setMessage(`${response.displayName} settings updated.`);
    } catch (caught) {
      setError(tenantSettingsError(caught, 'Organization settings could not be updated.'));
      setMessage(null);
    } finally {
      setSaving(false);
    }
  }

  function accessToken() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setStatus('error');
      setError('Tenant Admin login is required.');
      setMessage(null);
      return null;
    }
    return token;
  }

  return (
    <section className="tenant-admin-panel" aria-labelledby="tenant-settings-title">
      <TenantAdminPageTitle
        action={<button className="secondary" disabled={status === 'loading'} onClick={() => void loadSettings()} type="button">Refresh</button>}
        detail="Update tenant-visible organization profile and contact preferences. Platform-only settings are intentionally not exposed here."
        eyebrow="Tenant Admin"
        title="Settings"
      />

      {message ? <p className="toast-message" role="status">{message}</p> : null}
      {error ? <p className="toast-message error" role="alert">{error}</p> : null}

      {status === 'loading' ? <TenantSettingsSkeleton /> : null}
      {status === 'error' ? (
        <div className="tenant-admin-empty">
          <strong>Settings unavailable</strong>
          <span>Settings require an active Tenant Admin session and tenant-scoped permissions.</span>
          <button onClick={() => void loadSettings()} type="button">Retry settings</button>
        </div>
      ) : null}

      {status === 'ready' ? (
        <form className="tenant-admin-settings-form" onSubmit={handleUpdate}>
          <section className="tenant-admin-card" aria-labelledby="tenant-profile-settings">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-profile-settings">Organization profile</h3>
                <span>{settings?.tenantCode} · {settings?.tenantName}</span>
              </div>
              {dirty ? <span className="tenant-admin-status status-pending">Unsaved changes</span> : <span className="tenant-admin-status status-active">Saved</span>}
            </div>
            <div className="tenant-admin-form-grid">
              <TenantSettingsField
                error={errors.displayName}
                label="Display name"
                name="displayName"
                onChange={(value) => setForm((current) => ({ ...current, displayName: value }))}
                placeholder="Organization display name"
                required
                value={form.displayName}
              />
            </div>
          </section>

          <section className="tenant-admin-card" aria-labelledby="tenant-contact-settings">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-contact-settings">Contact details</h3>
                <span>Shown in tenant workflows and operational communication.</span>
              </div>
            </div>
            <div className="tenant-admin-form-grid two">
              <TenantSettingsField
                error={errors.billingEmail}
                label="Billing email"
                name="billingEmail"
                onChange={(value) => setForm((current) => ({ ...current, billingEmail: value }))}
                placeholder="billing@example.com"
                type="email"
                value={form.billingEmail}
              />
              <TenantSettingsField
                error={errors.supportEmail}
                label="Support email"
                name="supportEmail"
                onChange={(value) => setForm((current) => ({ ...current, supportEmail: value }))}
                placeholder="support@example.com"
                type="email"
                value={form.supportEmail}
              />
            </div>
          </section>

          <section className="tenant-admin-card" aria-labelledby="tenant-operational-settings">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-operational-settings">Operational settings</h3>
                <span>Timezone and locale are applied inside tenant-scoped workflows.</span>
              </div>
            </div>
            <div className="tenant-admin-form-grid two">
              <TenantSettingsField
                error={errors.timezone}
                label="Timezone"
                name="timezone"
                onChange={(value) => setForm((current) => ({ ...current, timezone: value }))}
                placeholder="Asia/Kolkata"
                required
                value={form.timezone}
              />
              <TenantSettingsField
                error={errors.locale}
                label="Locale"
                name="locale"
                onChange={(value) => setForm((current) => ({ ...current, locale: value }))}
                placeholder="en-IN"
                required
                value={form.locale}
              />
            </div>
          </section>

          <section className="tenant-admin-card" aria-labelledby="tenant-security-settings">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-security-settings">Security and preferences</h3>
                <span>MFA is required for Tenant Admin accounts. High-risk endpoint MFA freshness is tracked as backend backlog.</span>
              </div>
            </div>
            <p className="tenant-admin-note">
              TODO: add endpoint-level MFA freshness checks before enabling high-risk tenant exports, finance actions, access-control expansions, or AI execution.
            </p>
          </section>

          <div className="tenant-admin-sticky-actions">
            <button className="secondary" disabled={!dirty || saving} onClick={() => initialForm ? setForm(initialForm) : undefined} type="button">Discard changes</button>
            <button disabled={!dirty || saving} type="submit">{saving ? 'Saving...' : 'Save settings'}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export function TenantUsagePage({
  onLoadUsage = getTenantUsage,
  storage = globalThis.sessionStorage,
}: TenantUsagePageProps) {
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadUsage();
  }, []);

  async function loadUsage() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setStatus('error');
      setError('Tenant Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await onLoadUsage(token);
      setUsage(response);
      setStatus('ready');
    } catch (caught) {
      setUsage(null);
      setStatus('error');
      setError(tenantSettingsError(caught, 'Subscription usage could not be loaded.'));
    }
  }

  return (
    <section className="tenant-admin-panel" aria-labelledby="tenant-usage-title">
      <TenantAdminPageTitle
        action={<button className="secondary" disabled={status === 'loading'} onClick={() => void loadUsage()} type="button">Refresh usage</button>}
        detail="View plan limits and tenant usage. Subscription changes are intentionally not available from Tenant Admin."
        eyebrow="Tenant Admin"
        title="Subscription Usage"
      />
      {error ? <p className="toast-message error" role="alert">{error}</p> : null}
      {status === 'loading' ? <TenantSettingsSkeleton /> : null}
      {status === 'error' ? (
        <div className="tenant-admin-empty">
          <strong>Usage unavailable</strong>
          <span>Usage data requires an active tenant subscription and Tenant Admin session.</span>
          <button onClick={() => void loadUsage()} type="button">Retry usage</button>
        </div>
      ) : null}
      {status === 'ready' && usage ? (
        <>
          <div className="tenant-admin-metrics">
            <TenantUsageMetric label="Plan" value={usage.planCode ?? 'Not assigned'} detail={usage.tenantStatus} />
            <TenantUsageMetric label="Schools used" value={`${usage.schoolsUsed}/${usage.maxSchools}`} detail={`${usage.remainingSchools} remaining`} />
            <TenantUsageMetric label="Students" value={usage.students} detail="Current tenant records" />
            <TenantUsageMetric label="Staff/admins" value={usage.staff + usage.schoolAdmins} detail={`${usage.schoolAdmins} School Admins`} />
          </div>
          <section className="tenant-admin-card" aria-labelledby="tenant-usage-limits">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-usage-limits">Plan limits</h3>
                <span>Warnings appear when usage reaches 80% of available capacity.</span>
              </div>
            </div>
            <TenantUsageBar label="Schools" value={usage.schoolsUsed} max={usage.maxSchools} />
            <TenantUsageBar label="Active schools" value={usage.activeSchools} max={usage.maxSchools} />
            <TenantUsageBar label="School Admins" value={usage.schoolAdmins} />
            <TenantUsageBar label="Teachers" value={usage.teachers} />
            <TenantUsageBar label="Staff" value={usage.staff} />
            <TenantUsageBar label="Students" value={usage.students} />
          </section>
          {usage.schoolLimitReached ? (
            <p className="toast-message error" role="alert">School limit reached. Contact Super Admin support before adding more schools.</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function TenantSettingsField({
  error,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}: {
  error?: string;
  label: string;
  name: keyof TenantSettingsRequest;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const id = `tenant-settings-${name}`;
  return (
    <div className="tenant-admin-field">
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true">*</span> : null}</label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </div>
  );
}

function TenantUsageMetric({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="tenant-admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function TenantUsageBar({ label, max, value }: { label: string; max?: number; value: number }) {
  const hasLimit = typeof max === 'number' && max > 0;
  const denominator = hasLimit ? max : Math.max(value, 1);
  const percentage = hasLimit ? Math.min(100, Math.round((value / denominator) * 100)) : 100;
  const warning = hasLimit && percentage >= 80;
  return (
    <div className="tenant-admin-usage-row">
      <div>
        <strong>{label}</strong>
        <span>{max ? `${value}/${max}` : `${value}`}</span>
      </div>
      <div className={`tenant-admin-progress ${warning ? 'warning' : ''}`} aria-label={`${label} ${percentage}% used`}>
        <span style={{ width: `${percentage}%` }} />
      </div>
      {warning ? <em>Near limit</em> : null}
    </div>
  );
}

function TenantSettingsSkeleton() {
  return (
    <div className="tenant-admin-skeleton" aria-label="Loading Tenant Admin data">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function settingsToForm(settings: TenantSettings): TenantSettingsRequest {
  return {
    displayName: settings.displayName ?? settings.tenantName,
    billingEmail: settings.billingEmail ?? '',
    supportEmail: settings.supportEmail ?? '',
    timezone: settings.timezone ?? 'UTC',
    locale: settings.locale ?? 'en-US',
  };
}

function validateSettings(payload: TenantSettingsRequest): SettingsErrors {
  const errors: SettingsErrors = {};
  if (!payload.displayName.trim()) {
    errors.displayName = 'Display name is required.';
  }
  if (payload.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.billingEmail)) {
    errors.billingEmail = 'Enter a valid billing email.';
  }
  if (payload.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.supportEmail)) {
    errors.supportEmail = 'Enter a valid support email.';
  }
  if (!payload.timezone.trim()) {
    errors.timezone = 'Timezone is required.';
  }
  if (!payload.locale.trim()) {
    errors.locale = 'Locale is required.';
  }
  return errors;
}

function tenantSettingsError(caught: unknown, fallback: string) {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Session expired. Sign in again.';
    if (caught.status === 403) return 'Permission denied for Tenant Admin settings.';
    return caught.message || fallback;
  }
  return caught instanceof Error ? caught.message : fallback;
}
