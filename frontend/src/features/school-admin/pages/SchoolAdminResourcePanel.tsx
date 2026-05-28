import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import {
  createSchoolAdminResource,
  listSchoolAdminResource,
  publishSchoolAdminResource,
  SCHOOL_ADMIN_RESOURCE_CONFIG,
  type SchoolAdminResourceKey,
} from '../api/schoolAdminResourcesApi';
import { useAuthState } from '../../auth/hooks/authState';

type SchoolAdminResourcePanelProps = {
  resource: SchoolAdminResourceKey;
  storage?: Pick<Storage, 'getItem'>;
};

export function SchoolAdminResourcePanel({
  resource,
  storage: _storage = globalThis.sessionStorage,
}: SchoolAdminResourcePanelProps) {
  const { accessToken: token } = useAuthState();
  const config = SCHOOL_ADMIN_RESOURCE_CONFIG[resource];
  const [items, setItems] = useState<unknown[]>([]);
  const [payload, setPayload] = useState(() => JSON.stringify(config.samplePayload ?? {}, null, 2));
  const [publishId, setPublishId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canCreate = Boolean(config.createPath);
  const canPublish = Boolean(config.publishPath);

  const visibleItems = useMemo(() => items.slice(0, 10), [items]);

  useEffect(() => {
    void loadItems();
  }, [resource]);

  async function loadItems() {
    if (!token) {
      setStatus('idle');
      setError('School Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      setItems(await listSchoolAdminResource(resource, token));
      setMessage(null);
    } catch (caught) {
      setItems([]);
      setError(caught instanceof Error ? caught.message : `${config.label} could not be loaded.`);
    } finally {
      setStatus('idle');
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('School Admin login is required.');
      return;
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError('Payload must be valid JSON.');
      return;
    }

    setStatus('saving');
    setError(null);
    try {
      await createSchoolAdminResource(resource, parsedPayload, token);
      setMessage(`${config.label} saved through the backend API.`);
      await loadItems();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${config.label} save failed.`);
    } finally {
      setStatus('idle');
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('School Admin login is required.');
      return;
    }
    if (!publishId.trim()) {
      setError('Enter the record ID to publish.');
      return;
    }

    setStatus('saving');
    setError(null);
    try {
      await publishSchoolAdminResource(resource, publishId.trim(), token);
      setMessage(`${config.label} record published.`);
      await loadItems();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${config.label} publish failed.`);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="workflow-panel api-workspace" aria-labelledby={`${resource}-api-title`} data-testid={`${resource}-api-panel`}>
      <div className="panel-heading">
        <div>
      <p className="eyebrow">Ready</p>
          <h2 id={`${resource}-api-title`}>{config.label}</h2>
        </div>
        <button onClick={() => void loadItems()} type="button">Refresh</button>
      </div>

      {status === 'loading' ? <ApiSkeleton /> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {status !== 'loading' && !error && items.length === 0 ? (
        <div className="api-empty-state">
          <strong>No records yet</strong>
          <span>New {config.label.toLowerCase()} activity will appear here when it is available.</span>
        </div>
      ) : null}

      {visibleItems.length > 0 ? (
        <div className="api-record-list" aria-label={`${config.label} records`}>
          {visibleItems.map((item, index) => (
            <article key={recordKey(item, index)}>
              <strong>{recordTitle(item, index)}</strong>
              <span>{recordDetail(item)}</span>
              <DeveloperDetails><span>{recordId(item)}</span></DeveloperDetails>
            </article>
          ))}
        </div>
      ) : null}

      {canCreate && isLocalDevelopment() ? (
        <form className="workflow-form" onSubmit={handleCreate}>
          <label>
            Developer payload
            <textarea
              rows={10}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
            />
          </label>
          <button disabled={status === 'saving'} type="submit">
            {status === 'saving' ? 'Saving...' : `Create ${config.label}`}
          </button>
        </form>
      ) : null}

      {canPublish && isLocalDevelopment() ? (
        <form className="workflow-form compact-form" onSubmit={handlePublish}>
          <label>
            Record reference
            <input value={publishId} onChange={(event) => setPublishId(event.target.value)} />
          </label>
          <button disabled={status === 'saving'} type="submit">Publish</button>
        </form>
      ) : null}
    </section>
  );
}

function ApiSkeleton() {
  return (
    <div className="api-skeleton" aria-label="Loading records">
      <span />
      <span />
      <span />
    </div>
  );
}

function recordKey(item: unknown, index: number) {
  const id = recordId(item);
  return id === 'No ID' ? `record-${index}` : id;
}

function recordId(item: unknown) {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return String((item as { id?: unknown }).id ?? 'No ID');
  }
  return 'No ID';
}

function recordTitle(item: unknown, index: number) {
  if (typeof item !== 'object' || item === null) {
    return `Record ${index + 1}`;
  }

  const record = item as Record<string, unknown>;
  return String(record.fullName ?? record.title ?? record.name ?? record.description ?? `Record ${index + 1}`);
}

function recordDetail(item: unknown) {
  if (typeof item !== 'object' || item === null) {
    return String(item);
  }

  const record = item as Record<string, unknown>;
  const detail = record.status ?? record.admissionNumber ?? record.audience ?? record.dueDate ?? record.createdAt;
  return detail ? String(detail) : 'Ready';
}

function DeveloperDetails({ children }: { children: ReactNode }) {
  if (!isLocalDevelopment()) {
    return null;
  }

  return (
    <details className="developer-details">
      <summary>Developer details</summary>
      <div>{children}</div>
    </details>
  );
}

function isLocalDevelopment() {
  return import.meta.env.DEV && import.meta.env.MODE === 'development';
}
