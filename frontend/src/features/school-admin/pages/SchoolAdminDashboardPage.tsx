import { useEffect, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import { useAuthState } from '../../auth/hooks/authState';
import { getDashboardSummary, type DashboardSummary } from '../../portal/api/dashboardApi';

type SchoolAdminDashboardPageProps = {
  onLoadSummary?: (accessToken: string) => Promise<DashboardSummary>;
  onNavigate?: (navId: string) => void;
};

const QUICK_ACTIONS = [
  {
    id: 'students',
    title: 'Student operations',
    detail: 'Review the roster and open the import workflow for admissions-ready data.',
  },
  {
    id: 'academic',
    title: 'Academic setup',
    detail: 'Maintain years, classes, sections, subjects, and teacher assignments.',
  },
  {
    id: 'attendance',
    title: 'Attendance sessions',
    detail: 'Audit school-scoped attendance sessions returned by the backend.',
  },
  {
    id: 'fees',
    title: 'Fee lifecycle',
    detail: 'Create fee demands and record payments through guarded workflows.',
  },
  {
    id: 'reports',
    title: 'Report exports',
    detail: 'Queue CSV exports for implemented School Admin report types.',
  },
  {
    id: 'settings',
    title: 'School settings',
    detail: 'Update school profile fields and monitor bulk job activity.',
  },
];

export function SchoolAdminDashboardPage({
  onLoadSummary = (accessToken) => getDashboardSummary('SCHOOL_ADMIN', accessToken),
  onNavigate,
}: SchoolAdminDashboardPageProps) {
  const { accessToken, currentUser } = useAuthState();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSummary();
  }, [accessToken]);

  async function loadSummary() {
    if (!accessToken) {
      setStatus('error');
      setError('School Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await onLoadSummary(accessToken);
      setSummary(response);
      setStatus('ready');
    } catch (caught) {
      setSummary(null);
      setStatus('error');
      setError(dashboardError(caught));
    }
  }

  const metrics = summary?.metrics ?? [];
  const alerts = summary?.alerts ?? [];
  const activity = summary?.activity ?? [];

  return (
    <section className="school-admin-panel school-admin-dashboard" aria-labelledby="school-admin-dashboard-title">
      <div className="school-admin-title">
        <div>
          <p className="eyebrow">School Admin</p>
          <h2 id="school-admin-dashboard-title">School Admin Overview</h2>
          <span>
            {currentUser?.activeSchool?.name ?? 'Active school'} operations, scoped to the current school and connected APIs.
          </span>
        </div>
        <div className="school-admin-title-actions">
          <button className="secondary" disabled={status === 'loading'} onClick={() => void loadSummary()} type="button">
            Refresh
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="school-admin-skeleton" aria-label="Loading School Admin overview">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="school-admin-empty" role="alert">
          <strong>Dashboard unavailable</strong>
          <span>{error ?? 'School Admin overview could not be loaded.'}</span>
          <button onClick={() => void loadSummary()} type="button">Retry dashboard</button>
        </div>
      ) : null}

      {status === 'ready' ? (
        <>
          <div className="school-admin-metrics" aria-label="School Admin metrics">
            {metrics.length > 0 ? metrics.map((metric) => (
              <article className="school-admin-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.detail ?? 'School-scoped metric'}</em>
              </article>
            )) : (
              <article className="school-admin-metric">
                <span>Workspace</span>
                <strong>Ready</strong>
                <em>Metrics will appear when the dashboard API returns school activity.</em>
              </article>
            )}
          </div>

          <div className="school-admin-dashboard-grid">
            <section className="school-admin-card" aria-labelledby="school-admin-workspace-title">
              <div className="school-admin-card-heading">
                <div>
                  <h3 id="school-admin-workspace-title">School Admin workspace</h3>
                  <span>Jump into implemented workflows without leaving the current school scope.</span>
                </div>
              </div>
              <div className="school-admin-action-list">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.id} onClick={() => onNavigate?.(action.id)} type="button">
                    <strong>{action.title}</strong>
                    <span>{action.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="school-admin-card" aria-labelledby="school-admin-alerts-title">
              <div className="school-admin-card-heading">
                <div>
                  <h3 id="school-admin-alerts-title">Alerts</h3>
                  <span>Operational warnings returned by the School Admin dashboard API.</span>
                </div>
              </div>
              {alerts.length === 0 ? (
                <div className="school-admin-empty compact">
                  <strong>No active alerts</strong>
                  <span>Alerts will appear here when the backend returns school-scoped warnings.</span>
                </div>
              ) : (
                <div className="school-admin-record-list">
                  {alerts.map((alert) => (
                    <article key={alert.title}>
                      <strong>{alert.title}</strong>
                      <span>{alert.detail ?? 'Review this school alert.'}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="school-admin-card wide" aria-labelledby="school-admin-activity-title">
              <div className="school-admin-card-heading">
                <div>
                  <h3 id="school-admin-activity-title">Recent activity</h3>
                  <span>Read-only activity from the dashboard summary endpoint.</span>
                </div>
              </div>
              {activity.length === 0 ? (
                <div className="school-admin-empty compact">
                  <strong>No recent activity</strong>
                  <span>Attendance, fee, academic, and communication activity will appear here as it is returned.</span>
                </div>
              ) : (
                <div className="school-admin-record-list">
                  {activity.map((item) => (
                    <article key={`${item.title}-${item.occurredAt ?? ''}`}>
                      <strong>{item.title}</strong>
                      <span>{item.detail ?? 'School activity'}</span>
                      {item.occurredAt ? <em>{dateLabel(item.occurredAt)}</em> : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

function dashboardError(caught: unknown) {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Session expired. Sign in again.';
    if (caught.status === 403) return 'Permission denied for School Admin dashboard.';
    return caught.message;
  }
  return caught instanceof Error ? caught.message : 'School Admin overview could not be loaded.';
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
