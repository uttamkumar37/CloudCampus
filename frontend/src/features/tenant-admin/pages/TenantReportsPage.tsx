import { useState } from 'react';

import {
  TenantReportSummary,
  getTenantReportSummary,
  getTenantSchoolReportSummary,
} from '../api/tenantReportsApi';

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad() {
    await withToken(async (accessToken) => {
      const response = await onLoad(accessToken);
      setSummary(response);
      setMessage(`Loaded ${response.totalSchools} schools`);
    });
  }

  async function handleDrilldown(schoolId: string) {
    await withToken(async (accessToken) => {
      const response = await onDrilldown(schoolId, accessToken);
      setSummary(response);
      setMessage(`${response.schoolName ?? 'School'} drilldown loaded`);
    });
  }

  async function withToken(action: (accessToken: string) => Promise<void>) {
    const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      return;
    }

    setError(null);
    try {
      await action(accessToken);
    } catch {
      setError('Organization reports could not be loaded.');
      setMessage(null);
    }
  }

  return (
    <section className="workflow-panel" aria-labelledby="tenant-reports-title">
      <p className="eyebrow">Reports</p>
      <h2 id="tenant-reports-title">Organization reports</h2>

      <form className="workflow-form" onSubmit={(event) => {
        event.preventDefault();
        void handleLoad();
      }}>
        <button type="submit">Load organization summary</button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-result">{message}</p> : null}

      {summary ? (
        <div className="form-result">
          <strong>{summary.schoolName ?? summary.tenantName}</strong>
          <span>Schools: {summary.activeSchools}/{summary.totalSchools}</span>
          <span>Students: {summary.totals.activeStudents}/{summary.totals.totalStudents}</span>
          <span>Fee demands: {summary.totals.totalFeeDemands}</span>
          <span>Outstanding: {money(summary.totals.outstandingAmount)}</span>
        </div>
      ) : null}

      {summary && summary.schools.length > 0 ? (
        <ul className="compact-list" aria-label="Organization report schools">
          {summary.schools.map((school) => (
            <li key={school.schoolId}>
              <span>{school.name} ({school.code})</span>
              <span>{school.metrics.totalStudents} students</span>
              <span>{money(school.metrics.outstandingAmount)} outstanding</span>
              <button type="button" onClick={() => void handleDrilldown(school.schoolId)}>
                View details
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}
