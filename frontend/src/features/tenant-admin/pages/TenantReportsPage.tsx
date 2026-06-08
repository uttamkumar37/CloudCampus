import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import {
  getTenantReportSummary,
  getTenantSchoolReportSummary,
  type TenantReportMetrics,
  type TenantReportSchoolSummary,
  type TenantReportSummary,
} from '../api/tenantReportsApi';
import { TenantAdminPageTitle } from './TenantSchoolManagementPage';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantReportsPageProps = {
  onLoad?: (accessToken: string) => Promise<TenantReportSummary>;
  onDrilldown?: (schoolId: string, accessToken: string) => Promise<TenantReportSummary>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantReportsPage({
  onLoad = getTenantReportSummary,
  onDrilldown = getTenantSchoolReportSummary,
  storage = globalThis.sessionStorage,
}: TenantReportsPageProps) {
  const [summary, setSummary] = useState<TenantReportSummary | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolSummary, setSchoolSummary] = useState<TenantReportSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [schoolStatus, setSchoolStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSchool = useMemo(
    () => summary?.schools.find((school) => school.schoolId === selectedSchoolId) ?? null,
    [selectedSchoolId, summary?.schools],
  );

  useEffect(() => {
    void loadSummary({ quiet: true });
  }, []);

  async function loadSummary(options: { quiet?: boolean } = {}) {
    const token = accessToken();
    if (!token) return;

    setStatus('loading');
    setError(null);
    try {
      const response = await onLoad(token);
      setSummary(response);
      setSchoolSummary(null);
      setSelectedSchoolId('');
      setStatus('ready');
      if (!options.quiet) {
        setMessage(`Loaded ${response.totalSchools} schools.`);
      }
    } catch (caught) {
      setSummary(null);
      setStatus('error');
      setError(tenantReportError(caught, 'Organization reports could not be loaded.'));
      setMessage(null);
    }
  }

  async function loadSchoolDrilldown(schoolId = selectedSchoolId) {
    const token = accessToken();
    if (!token || !schoolId) return;

    setSchoolStatus('loading');
    setError(null);
    try {
      const response = await onDrilldown(schoolId, token);
      setSchoolSummary(response);
      setSchoolStatus('ready');
      setMessage(`${response.schoolName ?? 'School'} drilldown loaded.`);
    } catch (caught) {
      setSchoolSummary(null);
      setSchoolStatus('error');
      setError(tenantReportError(caught, 'School report summary could not be loaded.'));
      setMessage(null);
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
    <section className="tenant-admin-panel" aria-labelledby="tenant-reports-title">
      <TenantAdminPageTitle
        action={<button className="secondary" disabled title="Tenant report exports require a future audited export endpoint." type="button">Export unavailable</button>}
        detail="Review tenant-wide reporting totals and drill into school-level summaries using implemented read-only report APIs."
        eyebrow="Tenant Admin"
        title="Reports"
      />

      {message ? <p className="toast-message" role="status">{message}</p> : null}
      {error ? <p className="toast-message error" role="alert">{error}</p> : null}

      {status === 'loading' ? <TenantReportSkeleton /> : null}
      {status === 'error' ? (
        <TenantReportState
          action={<button onClick={() => void loadSummary()} type="button">Retry reports</button>}
          detail="Reports are tenant-scoped and require an active Tenant Admin session."
          title="Reports unavailable"
        />
      ) : null}
      {status === 'ready' && summary ? (
        <>
          <div className="tenant-admin-metrics">
            <TenantReportMetric label="Total schools" value={summary.totalSchools} detail={`${summary.activeSchools} active`} />
            <TenantReportMetric label="Active students" value={summary.totals.activeStudents} detail={`${summary.totals.totalStudents} total`} />
            <TenantReportMetric label="Fee demands" value={summary.totals.totalFeeDemands} detail={`${amount(summary.totals.amountDue)} due`} />
            <TenantReportMetric label="Outstanding" value={amount(summary.totals.outstandingAmount)} detail={`${amount(summary.totals.amountPaid)} paid`} />
          </div>

          <section className="tenant-admin-card" aria-labelledby="tenant-school-report-filter">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-school-report-filter">School report drilldown</h3>
                <span>Select one of this tenant's schools to load a scoped report summary.</span>
              </div>
              <button disabled={!selectedSchoolId || schoolStatus === 'loading'} onClick={() => void loadSchoolDrilldown()} type="button">
                {schoolStatus === 'loading' ? 'Loading...' : 'Load school report'}
              </button>
            </div>
            <div className="tenant-admin-toolbar">
              <label>
                School
                <select
                  onChange={(event) => {
                    setSelectedSchoolId(event.target.value);
                    setSchoolSummary(null);
                    setSchoolStatus('idle');
                  }}
                  value={selectedSchoolId}
                >
                  <option value="">All schools</option>
                  {summary.schools.map((school) => (
                    <option key={school.schoolId} value={school.schoolId}>{school.name} ({school.code})</option>
                  ))}
                </select>
              </label>
            </div>
            {!selectedSchoolId ? (
              <TenantReportState title="No school selected" detail="Tenant-wide totals are shown above. Choose a school to inspect its student and fee summary." />
            ) : null}
            {selectedSchoolId && schoolStatus === 'loading' ? <TenantReportSkeleton compact /> : null}
            {selectedSchoolId && schoolStatus === 'ready' && schoolSummary ? (
              <SchoolReportSummary school={selectedSchool} summary={schoolSummary} />
            ) : null}
          </section>

          <section className="tenant-admin-card" aria-labelledby="tenant-report-school-list">
            <div className="tenant-admin-card-heading">
              <div>
                <h3 id="tenant-report-school-list">School summaries</h3>
                <span>{summary.schools.length} school{summary.schools.length === 1 ? '' : 's'} included in this tenant report</span>
              </div>
            </div>
            {summary.schools.length === 0 ? (
              <TenantReportState title="No school report data" detail="School-level summaries will appear after schools and records exist for this tenant." />
            ) : (
              <div className="tenant-admin-table-shell" role="region" aria-label="Organization report schools" tabIndex={0}>
                <table className="tenant-admin-table">
                  <thead>
                    <tr>
                      <th scope="col">School</th>
                      <th scope="col">Students</th>
                      <th scope="col">Fee demands</th>
                      <th scope="col">Outstanding</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.schools.map((school) => (
                      <tr key={school.schoolId}>
                        <td>
                          <strong>{school.name}</strong>
                          <span>{school.code}</span>
                        </td>
                        <td>{school.metrics.activeStudents}/{school.metrics.totalStudents}</td>
                        <td>{school.metrics.totalFeeDemands}</td>
                        <td>{amount(school.metrics.outstandingAmount)}</td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() => {
                              setSelectedSchoolId(school.schoolId);
                              void loadSchoolDrilldown(school.schoolId);
                            }}
                            type="button"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="tenant-admin-note">
            TODO: enable report exports only after Tenant Admin export endpoints, audit logging, and MFA freshness checks exist.
          </p>
        </>
      ) : null}
    </section>
  );
}

function SchoolReportSummary({ school, summary }: { school: TenantReportSchoolSummary | null; summary: TenantReportSummary }) {
  return (
    <div className="tenant-admin-metrics compact" aria-label="School report summary">
      <TenantReportMetric label="School" value={summary.schoolName ?? school?.name ?? 'Selected school'} detail={school?.code ?? summary.schoolId ?? ''} />
      <TenantReportMetric label="Active students" value={summary.totals.activeStudents} detail={`${summary.totals.totalStudents} total`} />
      <TenantReportMetric label="Fee demands" value={summary.totals.totalFeeDemands} detail={`${amount(summary.totals.amountDue)} due`} />
      <TenantReportMetric label="Outstanding" value={amount(summary.totals.outstandingAmount)} detail={`${amount(summary.totals.amountPaid)} paid`} />
    </div>
  );
}

function TenantReportMetric({ detail, label, value }: { detail: string; label: string; value: number | string }) {
  return (
    <article className="tenant-admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function TenantReportSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`tenant-admin-skeleton ${compact ? 'compact' : ''}`} aria-label="Loading reports">
      <span />
      <span />
      <span />
      {!compact ? <span /> : null}
    </div>
  );
}

function TenantReportState({ action, detail, title }: { action?: ReactNode; detail: string; title: string }) {
  return (
    <div className="tenant-admin-empty">
      <strong>{title}</strong>
      <span>{detail}</span>
      {action}
    </div>
  );
}

function amount(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function tenantReportError(caught: unknown, fallback: string) {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Session expired. Sign in again.';
    if (caught.status === 403) return 'Permission denied for Tenant Admin reports.';
    if (caught.status === 404) return 'That school report is not available in this tenant.';
    return caught.message || fallback;
  }
  return caught instanceof Error ? caught.message : fallback;
}
