import { useEffect, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import { getDashboardSummary, type DashboardSummary } from '../../portal/api/dashboardApi';
import { TenantAdminPageTitle } from './TenantSchoolManagementPage';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';

type TenantAdminDashboardPageProps = {
  onLoadSummary?: (accessToken: string) => Promise<DashboardSummary>;
  onNavigate?: (navId: string) => void;
  storage?: Pick<Storage, 'getItem'>;
};

const QUICK_ACTIONS = [
  { id: 'schools', title: 'Add school', detail: 'Open the Schools screen and add a tenant-scoped school.' },
  { id: 'admins', title: 'Invite School Admin', detail: 'Select a school and invite a School Admin.' },
  { id: 'reports', title: 'View reports', detail: 'Review tenant and school-level summaries.' },
  { id: 'usage', title: 'Subscription usage', detail: 'Monitor school and user usage against limits.' },
];

export function TenantAdminDashboardPage({
  onLoadSummary = (accessToken) => getDashboardSummary('TENANT_ADMIN', accessToken),
  onNavigate,
  storage = globalThis.sessionStorage,
}: TenantAdminDashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSummary();
  }, []);

  async function loadSummary() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setStatus('error');
      setError('Tenant Admin login is required.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await onLoadSummary(token);
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
    <section className="tenant-admin-panel" aria-labelledby="tenant-admin-dashboard-title">
      <TenantAdminPageTitle
        action={<button className="secondary" disabled={status === 'loading'} onClick={() => void loadSummary()} type="button">Refresh</button>}
        detail="Tenant-scoped overview for schools, School Admin access, reports, usage, and organization settings."
        eyebrow="Tenant Admin"
        title="Tenant Admin Overview"
      />

      {status === 'loading' ? (
        <div className="tenant-admin-skeleton" aria-label="Loading Tenant Admin overview">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="tenant-admin-empty">
          <strong>Dashboard unavailable</strong>
          <span>{error ?? 'Tenant Admin overview could not be loaded.'}</span>
          <button onClick={() => void loadSummary()} type="button">Retry dashboard</button>
        </div>
      ) : null}

      {status === 'ready' ? (
        <>
          <div className="tenant-admin-metrics">
            {metrics.length > 0 ? metrics.map((metric) => (
              <article className="tenant-admin-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.detail ?? 'Tenant-scoped metric'}</em>
              </article>
            )) : (
              <article className="tenant-admin-metric">
                <span>Workspace</span>
                <strong>Ready</strong>
                <em>Metrics will appear after schools and users are added.</em>
              </article>
            )}
          </div>

          <div className="tenant-admin-dashboard-grid">
            <section className="tenant-admin-card" aria-labelledby="tenant-dashboard-actions">
              <div className="tenant-admin-card-heading">
                <div>
                  <h3 id="tenant-dashboard-actions">Quick actions</h3>
                  <span>Jump into implemented Tenant Admin workflows.</span>
                </div>
              </div>
              <div className="tenant-admin-action-list">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.id} onClick={() => onNavigate?.(action.id)} type="button">
                    <strong>{action.title}</strong>
                    <span>{action.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="tenant-admin-card" aria-labelledby="tenant-dashboard-alerts">
              <div className="tenant-admin-card-heading">
                <div>
                  <h3 id="tenant-dashboard-alerts">Alerts</h3>
                  <span>Tenant-visible warnings and operational notices.</span>
                </div>
              </div>
              {alerts.length === 0 ? (
                <div className="tenant-admin-empty compact">
                  <strong>No active alerts</strong>
                  <span>Subscription or school warnings will appear here when returned by the dashboard API.</span>
                </div>
              ) : (
                <div className="tenant-admin-record-list">
                  {alerts.map((alert) => (
                    <article key={alert.title}>
                      <strong>{alert.title}</strong>
                      <span>{alert.detail ?? 'Review this tenant alert.'}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="tenant-admin-card wide" aria-labelledby="tenant-dashboard-activity">
              <div className="tenant-admin-card-heading">
                <div>
                  <h3 id="tenant-dashboard-activity">Recent activity</h3>
                  <span>Activity is read-only and tenant-scoped.</span>
                </div>
              </div>
              {activity.length === 0 ? (
                <div className="tenant-admin-empty compact">
                  <strong>No recent activity</strong>
                  <span>School and admin activity will appear here as the backend returns dashboard events.</span>
                </div>
              ) : (
                <div className="tenant-admin-record-list">
                  {activity.map((item) => (
                    <article key={`${item.title}-${item.occurredAt ?? ''}`}>
                      <strong>{item.title}</strong>
                      <span>{item.detail ?? 'Tenant activity'}</span>
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
    if (caught.status === 403) return 'Permission denied for Tenant Admin dashboard.';
    return caught.message;
  }
  return caught instanceof Error ? caught.message : 'Tenant Admin overview could not be loaded.';
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
