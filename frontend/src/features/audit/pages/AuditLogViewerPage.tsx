import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, ErrorState, PageHeader, SkeletonTable } from '@/shared/ui';
import { listAuditLogs, type AuditLogEntry, type AuditLogFilters, type AuditLogScope } from '../api/auditLogApi';

const PAGE_SIZE = 20;
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const CATEGORIES = ['AUTH', 'TENANT', 'PERMISSION', 'SECURITY', 'CONFIG', 'FINANCE', 'DATA', 'SYSTEM'];

const EVENT_TYPES = [
  'AUTH_LOGIN_SUCCESS',
  'AUTH_LOGIN_FAILED',
  'AUTH_LOGIN_BLOCKED',
  'AUTH_LOGOUT',
  'AUTH_TOKEN_REFRESHED',
  'AUTH_TOKEN_REFRESH_FAILED',
  'AUTH_PASSWORD_CHANGED',
  'AUTH_PASSWORD_RESET_REQUESTED',
  'AUTH_ACCOUNT_LOCKED',
  'AUTH_ALL_SESSIONS_REVOKED',
  'TENANT_CREATED',
  'TENANT_SUSPENDED',
  'TENANT_ARCHIVED',
  'TENANT_REACTIVATED',
  'PERMISSION_ROLE_ASSIGNED',
  'PERMISSION_ROLE_REVOKED',
  'SECURITY_MFA_ENROLLED',
  'SECURITY_SUSPICIOUS_ACCESS',
  'CONFIG_FEATURE_ENABLED',
  'CONFIG_FEATURE_DISABLED',
  'CONFIG_SCHOOL_SETTINGS_UPDATED',
  'CONFIG_ACADEMIC_YEAR_CURRENT_SET',
  'CONFIG_ACADEMIC_YEAR_CLOSED',
  'CONFIG_CUSTOM_DOMAIN_DELETED',
  'FINANCE_FEE_WAIVED',
  'FINANCE_FEE_PAYMENT_RECORDED',
  'FINANCE_PAYMENT_ORDER_CREATED',
  'FINANCE_PAYMENT_CAPTURED',
  'DATA_PURGE_COMPLETED',
  'DATA_STUDENT_PROFILE_UPDATED',
  'DATA_STUDENT_STATUS_CHANGED',
  'DATA_STAFF_STATUS_CHANGED',
  'DATA_STUDENT_BULK_PROMOTED',
  'DATA_PARENT_LINK_CREATED',
  'DATA_PARENT_LINK_DELETED',
  'DATA_MARKS_BULK_SAVED',
  'DATA_MARK_UPDATED',
  'DATA_MARK_DELETED',
  'DATA_RESULTS_GENERATED',
  'DATA_NOTICE_CREATED',
  'DATA_NOTICE_PUBLISHED',
  'DATA_NOTICE_DELETED',
  'DATA_LEAVE_REQUEST_CREATED',
  'DATA_LEAVE_REQUEST_APPROVED',
  'DATA_LEAVE_REQUEST_REJECTED',
  'DATA_LEAVE_REQUEST_CANCELLED',
  'DATA_AI_COPILOT_QUERIED',
  'SYSTEM_BOOTSTRAP',
  'SYSTEM_SCHEDULED_JOB',
];

const CATEGORY_BADGE: Record<string, BadgeVariant> = {
  AUTH: 'primary',
  TENANT: 'info',
  PERMISSION: 'warning',
  SECURITY: 'danger',
  CONFIG: 'default',
  FINANCE: 'success',
  DATA: 'info',
  SYSTEM: 'default',
};

interface Props {
  scope: AuditLogScope;
}

interface FilterFormState {
  tenantId: string;
  category: string;
  eventType: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: FilterFormState = {
  tenantId: '',
  category: '',
  eventType: '',
  actorId: '',
  resourceType: '',
  resourceId: '',
  from: '',
  to: '',
};

export function AuditLogViewerPage({ scope }: Props) {
  const isSuperAdmin = scope === 'super-admin';
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const query = useQuery({
    queryKey: ['audit-logs', scope, page, filters],
    queryFn: () => listAuditLogs(scope, { ...filters, page, size: PAGE_SIZE }),
    staleTime: 30 * 1000,
  });

  const entries = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = query.data ? (page + 1) * PAGE_SIZE < total : false;

  const title = isSuperAdmin ? 'Platform Audit Logs' : 'Audit Logs';
  const subtitle = isSuperAdmin ? 'Cross-tenant activity history' : 'Tenant activity history';

  const hasFilters = useMemo(
    () => Object.values(filters).some((value) => typeof value === 'string' && value.trim()),
    [filters],
  );

  function updateForm(key: keyof FilterFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setFilters({
      tenantId: isSuperAdmin ? form.tenantId : undefined,
      category: form.category,
      eventType: form.eventType,
      actorId: form.actorId,
      resourceType: form.resourceType,
      resourceId: form.resourceId,
      from: toIso(form.from),
      to: toIso(form.to),
    });
  }

  function resetFilters() {
    setForm(EMPTY_FILTERS);
    setFilters({});
    setPage(0);
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={hasFilters ? <Button variant="secondary" size="sm" onClick={resetFilters}>Reset</Button> : undefined}
      />

      <form onSubmit={applyFilters} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isSuperAdmin && (
            <TextFilter
              label="Tenant ID"
              value={form.tenantId}
              onChange={(value) => updateForm('tenantId', value)}
              placeholder="UUID"
            />
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Category</span>
            <select
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Event</span>
            <select
              value={form.eventType}
              onChange={(event) => updateForm('eventType', event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              {EVENT_TYPES.map((eventType) => (
                <option key={eventType} value={eventType}>{eventType}</option>
              ))}
            </select>
          </label>

          <TextFilter
            label="Actor ID"
            value={form.actorId}
            onChange={(value) => updateForm('actorId', value)}
            placeholder="UUID"
          />

          <TextFilter
            label="Resource Type"
            value={form.resourceType}
            onChange={(value) => updateForm('resourceType', value)}
            placeholder="Student"
          />

          <TextFilter
            label="Resource ID"
            value={form.resourceId}
            onChange={(value) => updateForm('resourceId', value)}
            placeholder="ID"
          />

          <DateTimeFilter
            label="From"
            value={form.from}
            onChange={(value) => updateForm('from', value)}
          />

          <DateTimeFilter
            label="To"
            value={form.to}
            onChange={(value) => updateForm('to', value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{total.toLocaleString('en-IN')} entries</p>
          <Button type="submit" size="sm" loading={query.isFetching}>
            Apply
          </Button>
        </div>
      </form>

      {query.isLoading && <SkeletonTable rows={8} cols={7} />}

      {query.isError && (
        <ErrorState
          title="Failed to load audit logs"
          description="Refresh the table and try again."
          onRetry={() => query.refetch()}
        />
      )}

      {!query.isLoading && !query.isError && (
        <>
          <AuditLogTable entries={entries} showTenant={isSuperAdmin} />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!canPrev}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!canNext}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AuditLogTable({ entries, showTenant }: { entries: AuditLogEntry[]; showTenant: boolean }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-gray-700">No audit entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Time</th>
            {showTenant && <th className="px-4 py-3">Tenant</th>}
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Resource</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Metadata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateTime(entry.createdAt)}</td>
              {showTenant && (
                <td className="max-w-[170px] truncate px-4 py-3 font-mono text-xs text-gray-500" title={entry.tenantId ?? undefined}>
                  {shortId(entry.tenantId)}
                </td>
              )}
              <td className="px-4 py-3">
                <Badge variant={CATEGORY_BADGE[entry.category] ?? 'default'}>{entry.category}</Badge>
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 font-medium text-gray-800" title={entry.eventType}>
                {entry.eventType}
              </td>
              <td className="max-w-[220px] px-4 py-3 text-gray-600">
                <div className="truncate" title={entry.actorUsername ?? undefined}>{entry.actorUsername ?? 'System'}</div>
                <div className="truncate font-mono text-xs text-gray-400" title={entry.actorId ?? undefined}>{shortId(entry.actorId)}</div>
              </td>
              <td className="max-w-[220px] px-4 py-3 text-gray-600">
                <div className="truncate">{entry.resourceType ?? '-'}</div>
                <div className="truncate font-mono text-xs text-gray-400" title={entry.resourceId ?? undefined}>{entry.resourceId ?? '-'}</div>
              </td>
              <td className="max-w-[260px] truncate px-4 py-3 text-gray-600" title={entry.description ?? undefined}>
                {entry.description ?? '-'}
              </td>
              <td className="max-w-[260px] truncate px-4 py-3 font-mono text-xs text-gray-500" title={metadataText(entry.metadata)}>
                {metadataText(entry.metadata)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextFilter({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </label>
  );
}

function DateTimeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </label>
  );
}

function toIso(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function shortId(value: string | null) {
  if (!value) return '-';
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}

function metadataText(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) return '-';
  return JSON.stringify(metadata);
}
