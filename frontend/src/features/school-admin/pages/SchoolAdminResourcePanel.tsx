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
};

type ResourceCopy = {
  detail: string;
  empty: string;
  eyebrow: string;
};

type ConfirmState = {
  id: string;
  title: string;
};

type UiRecord = {
  date: string;
  detail: string;
  id: string;
  raw: unknown;
  searchText: string;
  status: string;
  title: string;
};

const PAGE_SIZES = [10, 25, 50] as const;

const RESOURCE_COPY: Record<SchoolAdminResourceKey, ResourceCopy> = {
  students: {
    detail: 'Read-only student roster from the active school, with import handled by the student workflow.',
    empty: 'Students will appear here after imports or admissions create school-scoped records.',
    eyebrow: 'Roster',
  },
  parents: {
    detail: 'Guardian links and parent access records for the active school.',
    empty: 'Parent links will appear after guardians are connected to students.',
    eyebrow: 'Guardians',
  },
  teachers: {
    detail: 'Teacher accounts and profile records scoped to the selected school.',
    empty: 'Teacher records will appear after staff provisioning creates access.',
    eyebrow: 'People',
  },
  staff: {
    detail: 'Operational staff accounts, roles, and current activation status.',
    empty: 'Staff records will appear after provisioning is completed.',
    eyebrow: 'People',
  },
  attendance: {
    detail: 'Attendance sessions recorded through the School Admin attendance API.',
    empty: 'Attendance sessions will appear after class attendance is saved.',
    eyebrow: 'Daily operations',
  },
  homework: {
    detail: 'Homework assignments created for classes, sections, and subjects.',
    empty: 'Homework assignments will appear after teachers or admins create them.',
    eyebrow: 'Academics',
  },
  exams: {
    detail: 'Exam schedules and result records, including publish-capable exam flows.',
    empty: 'Exam records will appear after schedules are created.',
    eyebrow: 'Assessment',
  },
  fees: {
    detail: 'Fee demand records created through the fee lifecycle workflow.',
    empty: 'Fee demands will appear after school fees are created.',
    eyebrow: 'Finance',
  },
  notices: {
    detail: 'School notices and publication status returned by the notice API.',
    empty: 'Notices will appear after drafts are created.',
    eyebrow: 'Communication',
  },
  timetable: {
    detail: 'Timetable entries for the current school, class, section, and subject setup.',
    empty: 'Timetable entries will appear after slots are created.',
    eyebrow: 'Schedule',
  },
  documents: {
    detail: 'Document metadata and generated records available to the current school.',
    empty: 'Documents will appear after records are uploaded or generated.',
    eyebrow: 'Files',
  },
  website: {
    detail: 'Website builder pages and publication status for the active school site.',
    empty: 'Website pages will appear after page drafts are created.',
    eyebrow: 'Website',
  },
};

export function SchoolAdminResourcePanel({ resource }: SchoolAdminResourcePanelProps) {
  const { accessToken: token } = useAuthState();
  const config = SCHOOL_ADMIN_RESOURCE_CONFIG[resource];
  const copy = RESOURCE_COPY[resource];
  const [items, setItems] = useState<unknown[]>([]);
  const [payload, setPayload] = useState(() => JSON.stringify(config.samplePayload ?? {}, null, 2));
  const [publishId, setPublishId] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [page, setPage] = useState(0);
  const [confirmPublish, setConfirmPublish] = useState<ConfirmState | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canCreate = Boolean(config.createPath);
  const canPublish = Boolean(config.publishPath);

  const records = useMemo(() => items.map((item, index) => toUiRecord(item, index)), [items]);
  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set(records.map((item) => item.status));
    return ['all', ...Array.from(uniqueStatuses).sort()];
  }, [records]);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((item) => {
      const matchesQuery = !normalizedQuery || item.searchText.includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, records, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleItems = filteredRecords.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  useEffect(() => {
    setPayload(JSON.stringify(config.samplePayload ?? {}, null, 2));
    setPublishId('');
    setQuery('');
    setStatusFilter('all');
    setPage(0);
    void loadItems();
  }, [resource]);

  useEffect(() => {
    setPage(0);
  }, [pageSize, query, statusFilter]);

  async function loadItems() {
    if (!token) {
      setStatus('idle');
      setError('School login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      setItems(await listSchoolAdminResource(resource, token));
      setPage(0);
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
      setError('School login is required.');
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
      await loadItems();
      setMessage(`${config.label} saved through the backend API.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${config.label} save failed.`);
    } finally {
      setStatus('idle');
    }
  }

  function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!publishId.trim()) {
      setError('Enter the record ID to publish.');
      return;
    }
    setConfirmPublish({ id: publishId.trim(), title: publishId.trim() });
  }

  function requestPublish(record: UiRecord) {
    if (!record.id || record.id === 'No ID') {
      setError('This record does not include an ID that can be published.');
      return;
    }
    setConfirmPublish({ id: record.id, title: record.title });
  }

  async function confirmPublishRecord() {
    if (!confirmPublish) return;
    if (!token) {
      setError('School login is required.');
      setConfirmPublish(null);
      return;
    }
    setStatus('saving');
    setError(null);
    try {
      await publishSchoolAdminResource(resource, confirmPublish.id, token);
      setPublishId('');
      setConfirmPublish(null);
      await loadItems();
      setMessage(`${config.label} record published.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${config.label} publish failed.`);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <>
      <section className="school-admin-panel school-admin-resource-panel" aria-labelledby={`${resource}-api-title`} data-testid={`${resource}-api-panel`}>
        <div className="school-admin-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 id={`${resource}-api-title`}>{config.label}</h2>
            <span>{copy.detail}</span>
          </div>
          <div className="school-admin-title-actions">
            <button className="secondary" disabled={status === 'loading'} onClick={() => void loadItems()} type="button">
              Refresh
            </button>
          </div>
        </div>

        {error && items.length > 0 ? <p className="form-error" role="alert">{error}</p> : null}
        {message ? <p className="form-result" role="status">{message}</p> : null}

        <div className="school-admin-toolbar" aria-label={`${config.label} controls`}>
          <label htmlFor={`${resource}-search`}>
            Search records
            <input
              id={`${resource}-search`}
              placeholder={`Search ${config.label.toLowerCase()} by name, status, ID, or detail`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label htmlFor={`${resource}-status`}>
            Status
            <select id={`${resource}-status`} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option === 'all' ? 'All statuses' : humanize(option)}</option>
              ))}
            </select>
          </label>
          <label htmlFor={`${resource}-page-size`}>
            Rows
            <select
              id={`${resource}-page-size`}
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value) as (typeof PAGE_SIZES)[number])}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size} rows</option>
              ))}
            </select>
          </label>
        </div>

        <section className="school-admin-card wide" aria-labelledby={`${resource}-records-title`}>
          <div className="school-admin-card-heading">
            <div>
              <h3 id={`${resource}-records-title`}>Records</h3>
              <span>
                {filteredRecords.length} of {records.length} records shown from {config.listPath}
              </span>
            </div>
          </div>

          {status === 'loading' ? <ApiSkeleton /> : null}

          {status !== 'loading' && error ? (
            <div className="school-admin-empty">
              <strong>{config.label} could not be loaded</strong>
              <span>{error}</span>
              <button onClick={() => void loadItems()} type="button">Retry</button>
            </div>
          ) : null}

          {status !== 'loading' && !error && records.length === 0 ? (
            <div className="school-admin-empty">
              <strong>No records yet</strong>
              <span>{copy.empty}</span>
              <button onClick={() => void loadItems()} type="button">Refresh</button>
            </div>
          ) : null}

          {status !== 'loading' && !error && records.length > 0 && filteredRecords.length === 0 ? (
            <div className="school-admin-empty">
              <strong>No matching records</strong>
              <span>Adjust search or status filters to review more {config.label.toLowerCase()}.</span>
              <button className="secondary" onClick={() => { setQuery(''); setStatusFilter('all'); }} type="button">Clear filters</button>
            </div>
          ) : null}

          {status !== 'loading' && !error && visibleItems.length > 0 ? (
            <>
              <div className="school-admin-table-shell">
                <table className="school-admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Record</th>
                      <th scope="col">Status</th>
                      <th scope="col">Detail</th>
                      <th scope="col">Date</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((item) => (
                      <tr key={item.id === 'No ID' ? item.searchText : item.id}>
                        <td>
                          <strong>{item.title}</strong>
                          <span>{item.id}</span>
                        </td>
                        <td>
                          <span className={`school-admin-status status-${statusClass(item.status)}`}>{humanize(item.status)}</span>
                        </td>
                        <td>{item.detail}</td>
                        <td>{item.date}</td>
                        <td>
                          <div className="school-admin-actions">
                            {canPublish ? (
                              <button disabled={status === 'saving'} onClick={() => requestPublish(item)} type="button">
                                Publish
                              </button>
                            ) : null}
                            <DeveloperDetails>
                              <code>{item.id}</code>
                              <pre>{safeJson(item.raw)}</pre>
                            </DeveloperDetails>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="school-admin-pagination">
                <span>
                  Page {currentPage + 1} of {pageCount}
                </span>
                <div>
                  <button className="secondary" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} type="button">
                    Previous
                  </button>
                  <button className="secondary" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} type="button">
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>

        {(canCreate || canPublish) && !isLocalDevelopment() ? (
          <div className="school-admin-api-note">
            <strong>Connected backend capability</strong>
            <span>
              {canCreate ? 'Create API is available for this module. ' : ''}
              {canPublish ? 'Publish API is guarded by confirmation when record IDs are available. ' : ''}
              Production entry forms are shown only where typed workflows are implemented.
            </span>
          </div>
        ) : null}

        {canCreate && isLocalDevelopment() ? (
          <form className="school-admin-dev-form" onSubmit={handleCreate}>
            <div>
              <p className="eyebrow">Developer API payload</p>
              <h3>Create {config.label}</h3>
              <span>This local-only tool posts JSON to {config.createPath}.</span>
            </div>
            <label htmlFor={`${resource}-payload`}>
              JSON payload
              <textarea
                id={`${resource}-payload`}
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
          <form className="school-admin-dev-form compact" onSubmit={handlePublish}>
            <div>
              <p className="eyebrow">Developer publish</p>
              <h3>Publish by record ID</h3>
              <span>This local-only tool confirms before calling the publish API.</span>
            </div>
            <label htmlFor={`${resource}-publish-id`}>
              Record reference
              <input id={`${resource}-publish-id`} value={publishId} onChange={(event) => setPublishId(event.target.value)} />
            </label>
            <button disabled={status === 'saving'} type="submit">Publish</button>
          </form>
        ) : null}
      </section>

      {confirmPublish ? (
        <SchoolAdminConfirmDialog
          busy={status === 'saving'}
          confirmLabel={status === 'saving' ? 'Publishing...' : 'Publish record'}
          detail={`This will publish "${confirmPublish.title}" through the active school API. Published content may become visible to the intended audience.`}
          onCancel={() => setConfirmPublish(null)}
          onConfirm={() => void confirmPublishRecord()}
          title={`Publish ${config.label} record?`}
        />
      ) : null}
    </>
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
  const detailParts = [
    firstString(record, ['email', 'parentEmail', 'studentEmail', 'admissionNumber']),
    firstString(record, ['studentName', 'className', 'sectionName', 'subjectName', 'role']),
    firstString(record, ['audience', 'dueDate', 'examDate', 'attendanceDate', 'weekday', 'slug', 'fileName']),
  ].filter(Boolean);
  return detailParts.length > 0 ? detailParts.join(' / ') : 'Ready';
}

function toUiRecord(item: unknown, index: number): UiRecord {
  const id = recordKey(item, index);
  const title = recordTitle(item, index);
  const detail = recordDetail(item);
  const status = recordStatus(item);
  const date = recordDate(item);
  return {
    date,
    detail,
    id,
    raw: item,
    searchText: [id, title, detail, status, date].join(' ').toLowerCase(),
    status,
    title,
  };
}

function recordStatus(item: unknown) {
  if (typeof item !== 'object' || item === null) {
    return 'READY';
  }

  const record = item as Record<string, unknown>;
  if (typeof record.status === 'string') return record.status;
  if (typeof record.state === 'string') return record.state;
  if (typeof record.active === 'boolean') return record.active ? 'ACTIVE' : 'INACTIVE';
  if (typeof record.published === 'boolean') return record.published ? 'PUBLISHED' : 'DRAFT';
  return 'READY';
}

function recordDate(item: unknown) {
  if (typeof item !== 'object' || item === null) {
    return 'Not dated';
  }

  const record = item as Record<string, unknown>;
  const dateValue = firstString(record, ['updatedAt', 'createdAt', 'requestedAt', 'completedAt', 'dueDate', 'examDate', 'attendanceDate']);
  return dateValue ? dateLabel(dateValue) : 'Not dated';
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function humanize(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function dateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(parsed);
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function DeveloperDetails({ children }: { children: ReactNode }) {
  if (!isLocalDevelopment()) {
    return null;
  }

  return (
    <details className="developer-details school-admin-row-details">
      <summary>Developer details</summary>
      <div>{children}</div>
    </details>
  );
}

function SchoolAdminConfirmDialog({
  busy,
  confirmLabel,
  detail,
  onCancel,
  onConfirm,
  title,
}: {
  busy: boolean;
  confirmLabel: string;
  detail: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="school-admin-confirm" role="presentation">
      <button aria-label="Close confirmation" className="school-admin-confirm-scrim" onClick={onCancel} type="button" />
      <section aria-labelledby="school-admin-confirm-title" aria-modal="true" className="school-admin-confirm-panel" role="dialog">
        <div>
          <p className="eyebrow">Confirm action</p>
          <h3 id="school-admin-confirm-title">{title}</h3>
          <span>{detail}</span>
        </div>
        <div className="school-admin-confirm-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy} onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function isLocalDevelopment() {
  return import.meta.env.DEV && import.meta.env.MODE === 'development';
}
