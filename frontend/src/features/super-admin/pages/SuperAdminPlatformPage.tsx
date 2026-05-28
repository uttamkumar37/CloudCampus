import { type FormEvent, type ReactElement, type ReactNode, useEffect, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import {
  createSuperAdminSubscriptionPlan,
  getSuperAdminAiUsage,
  getSuperAdminNotifications,
  getSuperAdminPlatformHealth,
  getSuperAdminReports,
  getSuperAdminRevenue,
  getSuperAdminSettings,
  listSuperAdminAuditLogs,
  listSuperAdminInvoices,
  listSuperAdminSchools,
  listSuperAdminSubscriptionPlans,
  listSuperAdminTenants,
  requestSuperAdminReportExport,
  updateSuperAdminSettings,
  updateSuperAdminTenantStatus,
  type AuditLogRow,
  type PageResponse,
  type PlatformSettings,
  type SuperAdminInvoice,
  type SuperAdminTenant,
} from '../api/platformApi';

type SuperAdminPlatformPageProps = {
  section: string;
};

type LoadState<T> = {
  status: 'loading' | 'ready' | 'error';
  data: T | null;
  error: string | null;
};

export function SuperAdminPlatformPage({ section }: SuperAdminPlatformPageProps) {
  const { accessToken } = useAuthState();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!accessToken) {
    return <PanelState title="Super Admin login required" detail="Sign in as SUPER_ADMIN to use the platform control center." />;
  }

  if (section === 'dashboard') {
    return <SuperAdminDashboard token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  if (section === 'tenants') {
    return <TenantManagement token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  if (section === 'schools') {
    return <SchoolDirectory token={accessToken} refreshKey={refreshKey} />;
  }
  if (section === 'subscriptions') {
    return <SubscriptionPlans token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  if (section === 'revenue') {
    return <RevenuePanel token={accessToken} refreshKey={refreshKey} />;
  }
  if (section === 'ai-usage') {
    return <AiUsagePanel token={accessToken} refreshKey={refreshKey} />;
  }
  if (section === 'reports') {
    return <ReportsPanel token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  if (section === 'audit') {
    return <AuditLogsPanel token={accessToken} refreshKey={refreshKey} />;
  }
  if (section === 'health') {
    return <PlatformHealthPanel token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }
  if (section === 'notifications') {
    return <NotificationsPanel token={accessToken} refreshKey={refreshKey} />;
  }
  if (section === 'settings') {
    return <SettingsPanel token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
  }

  return <PanelState title="Unknown section" detail="This Super Admin section is not configured." />;
}

function SuperAdminDashboard({
  token,
  refreshKey,
  onRefresh,
}: {
  token: string;
  refreshKey: number;
  onRefresh: () => void;
}) {
  const tenants = useLoader(() => listSuperAdminTenants(token), [token, refreshKey]);
  const schools = useLoader(() => listSuperAdminSchools(token), [token, refreshKey]);
  const revenue = useLoader(() => getSuperAdminRevenue(token), [token, refreshKey]);
  const health = useLoader(() => getSuperAdminPlatformHealth(token), [token, refreshKey]);
  const notifications = useLoader(() => getSuperAdminNotifications(token), [token, refreshKey]);

  const loading = [tenants, schools, revenue, health, notifications].some((state) => state.status === 'loading');
  const failed = [tenants, schools, revenue, health, notifications].find((state) => state.status === 'error');

  return (
    <section className="super-admin-panel" aria-labelledby="super-admin-dashboard-title">
      <PanelTitle
        eyebrow="CloudCampus Platform"
        title="Welcome back, CloudCampus Super Admin"
        detail="Platform-wide access"
        action={<button onClick={onRefresh} type="button">Refresh</button>}
      />
      {loading ? <PanelSkeleton /> : null}
      {failed ? <PanelState title="Dashboard could not load" detail={failed.error ?? 'One platform API failed.'} tone="error" /> : null}
      {!loading && !failed ? (
        <>
          <div className="super-admin-metrics">
            <Metric label="Platform access" value="Super Admin" detail="Full CloudCampus control center" />
            <Metric label="Organizations" value={tenants.data?.totalItems ?? 0} detail="Active customer accounts" />
            <Metric label="Schools" value={schools.data?.totalItems ?? 0} detail="Schools currently onboarded" />
            <Metric label="Users" value={(tenants.data?.items ?? []).reduce((total, tenant) => total + tenant.userCount, 0)} detail="Total platform users" />
            <Metric label="Health" value={health.data?.readiness === 'READY' ? 'Healthy' : health.data?.readiness ?? 'Healthy'} detail="Core services are online" />
            <Metric label="Security" value="Protected" detail="MFA and role-based access enabled" />
          </div>
          <div className="super-admin-grid">
            <TrendCard title="Growth and revenue" points={revenue.data?.monthlyTrend ?? []} formatter={money} />
            <RecordList
              title="Recent onboardings"
              empty="No organizations yet. Create your first tenant to begin onboarding a school."
              rows={(tenants.data?.items ?? []).slice(0, 5).map((tenant) => ({
                id: tenant.tenantId,
                title: tenant.name,
                detail: `${tenant.activeSchoolCount}/${tenant.schoolCount} active schools`,
                meta: tenant.status,
              }))}
            />
            <RecordList
              title="Subscription activity"
              empty="Revenue data will appear after subscription invoices are created."
              rows={[
                {
                  id: 'pending-invoices',
                  title: 'Pending invoices',
                  detail: `${revenue.data?.pendingInvoiceCount ?? 0} invoice${(revenue.data?.pendingInvoiceCount ?? 0) === 1 ? '' : 's'} awaiting action`,
                  meta: money(revenue.data?.monthlyRecurringRevenueCents ?? 0),
                },
                {
                  id: 'notification-delivery',
                  title: 'Notification delivery',
                  detail: `${notifications.data?.failedDeliveries ?? 0} failed deliveries`,
                  meta: (notifications.data?.failedDeliveries ?? 0) === 0 ? 'Healthy' : 'Needs review',
                },
              ]}
            />
            <RecordList
              title="Audit alerts"
              empty="No audit alerts need attention."
              rows={(health.data?.alerts ?? []).map((alert) => ({
                id: `${alert.title}-${alert.createdAt}`,
                title: alert.title,
                detail: alert.detail,
                meta: alert.severity,
              }))}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

function TenantManagement({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const tenants = useLoader(() => listSuperAdminTenants(token), [token, refreshKey]);
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function changeStatus(tenant: SuperAdminTenant) {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!globalThis.confirm(`Change ${tenant.name} to ${nextStatus}?`)) {
      return;
    }
    setSavingId(tenant.tenantId);
    try {
      await updateSuperAdminTenantStatus(tenant.tenantId, nextStatus, token);
      setMessage(`${tenant.name} is now ${nextStatus}.`);
      onRefresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Organizations" title="Organization management" detail="Manage customer accounts, school counts and subscription plans." />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteTable state={tenants} empty="No tenants found. Use the onboarding wizard to create the first tenant.">
        {(data) => (
          <table className="super-admin-table">
            <thead><tr><th>Organization</th><th>Status</th><th>Schools</th><th>Users</th><th>Plan</th><th>Action</th></tr></thead>
            <tbody>
              {data.items.map((tenant) => (
                <tr key={tenant.tenantId}>
                  <td><strong>{tenant.name}</strong><span>{tenant.code}</span></td>
                  <td><StatusBadge status={tenant.status} /></td>
                  <td>{tenant.activeSchoolCount}/{tenant.schoolCount}</td>
                  <td>{tenant.userCount}</td>
                  <td>{tenant.planName}</td>
                  <td>
                    <button disabled={savingId === tenant.tenantId} onClick={() => void changeStatus(tenant)} type="button">
                      {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RemoteTable>
    </section>
  );
}

function SchoolDirectory({ token, refreshKey }: { token: string; refreshKey: number }) {
  const schools = useLoader(() => listSuperAdminSchools(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="School directory" title="All schools" detail="View onboarded schools, organization ownership and recent activity." />
      <RemoteTable state={schools} empty="No schools yet. Schools will appear after organization onboarding is complete.">
        {(data) => (
          <table className="super-admin-table">
            <thead><tr><th>School</th><th>Organization</th><th>Status</th><th>Students</th><th>Staff</th><th>Activity</th></tr></thead>
            <tbody>
              {data.items.map((school) => (
                <tr key={school.schoolId}>
                  <td><strong>{school.schoolName}</strong><span>{school.schoolCode}{school.primarySchool ? ' · Primary' : ''}</span></td>
                  <td>{school.tenantName}</td>
                  <td><StatusBadge status={school.status} /></td>
                  <td>{school.studentCount}</td>
                  <td>{school.staffCount}</td>
                  <td>{school.lastActivityAt ? dateLabel(school.lastActivityAt) : 'No activity yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RemoteTable>
    </section>
  );
}

function SubscriptionPlans({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const plans = useLoader(() => listSuperAdminSubscriptionPlans(token), [token, refreshKey]);
  const [message, setMessage] = useState<string | null>(null);

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createSuperAdminSubscriptionPlan({
      code: String(form.get('code') ?? ''),
      name: String(form.get('name') ?? ''),
      description: String(form.get('description') ?? ''),
      status: 'ACTIVE',
      maxSchools: Number(form.get('maxSchools') ?? 1),
      maxStudents: Number(form.get('maxStudents') ?? 0),
      maxStaff: Number(form.get('maxStaff') ?? 0),
      monthlyPriceCents: Number(form.get('monthlyPriceCents') ?? 0),
      annualPriceCents: Number(form.get('annualPriceCents') ?? 0),
      currency: 'USD',
    }, token);
    setMessage('Subscription plan created.');
    onRefresh();
    event.currentTarget.reset();
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Subscriptions" title="Subscription plans" detail="Create and manage packages for customer organizations." />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteList state={plans} empty="No subscription plans yet.">
        {(items) => (
          <div className="super-admin-card-grid">
            {items.map((plan) => (
              <article className="super-admin-card" key={plan.id}>
                <span><StatusBadge status={plan.status} /></span>
                <h3>{plan.name}</h3>
                <p>{plan.description ?? 'No description provided.'}</p>
                <dl>
                  <div><dt>Schools</dt><dd>{plan.maxSchools}</dd></div>
                  <div><dt>Students</dt><dd>{plan.maxStudents}</dd></div>
                  <div><dt>Staff</dt><dd>{plan.maxStaff}</dd></div>
                  <div><dt>Monthly</dt><dd>{money(plan.monthlyPriceCents)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </RemoteList>
      <form className="super-admin-form" onSubmit={(event) => void createPlan(event)}>
        <h3>Create plan</h3>
        <input name="code" placeholder="PLAN_CODE" required />
        <input name="name" placeholder="Plan name" required />
        <input name="description" placeholder="Description" />
        <input min="1" name="maxSchools" placeholder="Schools" required type="number" />
        <input min="0" name="maxStudents" placeholder="Students" required type="number" />
        <input min="0" name="maxStaff" placeholder="Staff" required type="number" />
        <input min="0" name="monthlyPriceCents" placeholder="Monthly price cents" required type="number" />
        <input min="0" name="annualPriceCents" placeholder="Annual price cents" required type="number" />
        <button type="submit">Create plan</button>
      </form>
    </section>
  );
}

function RevenuePanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const revenue = useLoader(() => getSuperAdminRevenue(token), [token, refreshKey]);
  const invoices = useLoader(() => listSuperAdminInvoices(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Revenue" title="Platform revenue" detail="Track subscription activity, invoices and revenue trends." />
      <RemoteData state={revenue}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              <Metric label="MRR" value={money(data.monthlyRecurringRevenueCents)} detail="Assigned active subscriptions" />
              <Metric label="ARR estimate" value={money(data.annualRecurringRevenueEstimateCents)} detail="MRR x 12" />
              <Metric label="Total invoiced" value={money(data.totalInvoicedCents)} detail={`${data.issuedInvoiceCount} invoices`} />
              <Metric label="Overdue" value={data.overdueInvoiceCount} detail="Issued and past due" />
            </div>
            <TrendCard title="Monthly invoice trend" points={data.monthlyTrend} formatter={money} />
          </>
        )}
      </RemoteData>
      <RemoteTable state={invoices} empty="No invoices issued yet.">
        {(data) => (
          <table className="super-admin-table">
            <thead><tr><th>Invoice</th><th>Tenant</th><th>Plan</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>{data.items.map((invoice) => <InvoiceRow invoice={invoice} key={invoice.invoiceId} />)}</tbody>
          </table>
        )}
      </RemoteTable>
    </section>
  );
}

function AiUsagePanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const usage = useLoader(() => getSuperAdminAiUsage(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="AI governance" title="AI usage" detail="Review AI access, usage budgets and approvals." />
      <RemoteData state={usage}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              <Metric label="AI tenants" value={data.enabledTenantCount} detail="Entitlement enabled" />
              <Metric label="Monthly budget" value={data.totalMonthlyBudget} detail="Total allowed units" />
              <Metric label="Used this month" value={data.totalUnitsUsedThisMonth} detail="Authorized units" />
              <Metric label="Denied" value={data.deniedRequestsThisMonth} detail={`${data.budgetExceededRequestsThisMonth} budget related`} />
            </div>
            <div className="super-admin-card-grid">
              {data.tenants.map((tenant) => (
                <article className="super-admin-card" key={tenant.tenantId}>
                  <span><StatusBadge status={tenant.enabled ? 'ENABLED' : 'DISABLED'} /></span>
                  <h3>{tenant.tenantName}</h3>
                  <ProgressBar value={tenant.unitsUsedThisMonth} max={tenant.monthlyUnitBudget} />
                  <p>{tenant.remainingUnitsThisMonth} units remaining · Human approval {tenant.humanApprovalRequired ? 'required' : 'optional'}</p>
                </article>
              ))}
            </div>
            <RecordList
              title="Token-safe usage audit"
              empty="No AI usage audit rows yet."
              rows={data.usageAudit.map((audit) => ({
                id: audit.auditId,
                title: `${audit.feature} · ${audit.status}`,
                detail: `${audit.tenantName} · ${audit.estimatedUnits} units`,
                meta: dateLabel(audit.createdAt),
              }))}
            />
          </>
        )}
      </RemoteData>
    </section>
  );
}

function ReportsPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const reports = useLoader(() => getSuperAdminReports(token), [token, refreshKey]);
  const [message, setMessage] = useState<string | null>(null);

  async function requestExport() {
    await requestSuperAdminReportExport(token);
    setMessage('Export request accepted. Existing export jobs are shown below.');
    onRefresh();
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle
        eyebrow="Reports"
        title="Platform reports"
        detail="Exports across organizations, schools, invoices, AI usage and notifications."
        action={<button onClick={() => void requestExport()} type="button">Request export</button>}
      />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteData state={reports}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              {data.metrics.map((metric) => <Metric detail={metric.detail} key={metric.label} label={metric.label} value={metric.value} />)}
            </div>
            <RecordList
              title="Export jobs"
              empty="No export jobs yet."
              rows={data.exports.map((item) => ({
                id: item.exportId,
                title: `${item.reportType} · ${item.format}`,
                detail: `${item.tenantName} / ${item.schoolName}`,
                meta: item.status,
              }))}
            />
          </>
        )}
      </RemoteData>
    </section>
  );
}

function AuditLogsPanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const auditLogs = useLoader(() => listSuperAdminAuditLogs(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Audit" title="Audit logs" detail="Security and admin activity for platform operations." />
      <RemoteTable state={auditLogs} empty="No audit logs yet.">
        {(data) => (
          <table className="super-admin-table">
            <thead><tr><th>Action</th><th>Actor</th><th>Organization</th><th>Area</th><th>When</th></tr></thead>
            <tbody>
              {data.items.map((log: AuditLogRow) => (
                <tr key={log.auditLogId}>
                  <td><strong>{log.action}</strong><span>{log.summary}</span></td>
                  <td>{log.actorType}</td>
                  <td>{log.tenantName ?? 'CloudCampus Platform'}</td>
                  <td>{log.entityType}</td>
                  <td>{dateLabel(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RemoteTable>
    </section>
  );
}

function PlatformHealthPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const health = useLoader(() => getSuperAdminPlatformHealth(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Health" title="Platform health" detail="Monitor service readiness, background work and notifications." action={<button onClick={onRefresh} type="button">Refresh</button>} />
      <RemoteData state={health}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              <Metric label="Backend" value={data.backendHealth} detail="Service health" />
              <Metric label="Readiness" value={data.readiness} detail="Application readiness" />
              <Metric label="Database" value={data.databaseStatus} detail="Connection state" />
              <Metric label="Outbox pending" value={data.pendingOutboxCount} detail="Top 100 pending events" />
              <Metric label="Report jobs" value={data.pendingReportExportCount} detail="Queued or processing" />
              <Metric label="Notifications" value={data.notificationMode} detail="Email mode" />
            </div>
            <RecordList
              title="Alerts"
              empty="No active platform alerts."
              rows={data.alerts.map((alert) => ({
                id: `${alert.title}-${alert.createdAt}`,
                title: alert.title,
                detail: alert.detail,
                meta: alert.severity,
              }))}
            />
          </>
        )}
      </RemoteData>
    </section>
  );
}

function NotificationsPanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const notifications = useLoader(() => getSuperAdminNotifications(token), [token, refreshKey]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Notifications" title="Notification delivery" detail="Invitation and notification delivery activity." />
      <RemoteData state={notifications}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              <Metric label="Total" value={data.totalDeliveries} detail="All delivery events" />
              <Metric label="Sent" value={data.sentDeliveries} detail="Delivered notifications" />
              <Metric label="Logged" value={data.loggedDeliveries} detail="Recorded notifications" />
              <Metric label="Failed" value={data.failedDeliveries} detail="Needs attention" />
            </div>
            <RecordList
              title="Recent deliveries"
              empty="No delivery events yet. Invitation and notification activity will appear here."
              rows={data.recentDeliveries.map((delivery) => ({
                id: delivery.deliveryId,
                title: `${delivery.template} · ${delivery.status}`,
                detail: `${delivery.tenantName ?? 'Tenant'} · ${delivery.maskedRecipient}`,
                meta: delivery.channel,
              }))}
            />
          </>
        )}
      </RemoteData>
    </section>
  );
}

function SettingsPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const settings = useLoader(() => getSuperAdminSettings(token), [token, refreshKey]);
  const [message, setMessage] = useState<string | null>(null);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateSuperAdminSettings({
      platformName: String(form.get('platformName') ?? ''),
      supportEmail: String(form.get('supportEmail') ?? ''),
      defaultTimezone: String(form.get('defaultTimezone') ?? ''),
      maintenanceMode: form.get('maintenanceMode') === 'on',
    }, token);
    setMessage('Settings updated and audited.');
    onRefresh();
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Settings" title="Platform settings" detail="Manage CloudCampus support, timezone and maintenance preferences." />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteData state={settings}>
        {(data: PlatformSettings) => (
          <>
            <form className="super-admin-form" onSubmit={(event) => void saveSettings(event)}>
              <input defaultValue={data.platformName} name="platformName" placeholder="Platform name" />
              <input defaultValue={data.supportEmail} name="supportEmail" placeholder="Support email" type="email" />
              <input defaultValue={data.defaultTimezone} name="defaultTimezone" placeholder="Default timezone" />
              <label className="inline-check">
                <input defaultChecked={data.maintenanceMode} name="maintenanceMode" type="checkbox" />
                Maintenance mode
              </label>
              <button type="submit">Save settings</button>
            </form>
            <div className="super-admin-card-grid">
              <article className="super-admin-card"><h3>Support portal</h3><p>{data.publicFrontendUrl}</p></article>
              <article className="super-admin-card"><h3>Notification delivery</h3><p>{data.notificationMode === 'log' ? 'Activity logging' : data.notificationMode}</p></article>
              <article className="super-admin-card"><h3>AI policy</h3><p>{data.aiDefaultPolicy}</p></article>
              <article className="super-admin-card"><h3>Maintenance</h3><p>{data.maintenanceMode ? 'Enabled' : 'Disabled'}</p></article>
            </div>
            <DeveloperDetails>
              <span>Allowed origins: {data.corsAllowedOrigins.join(', ') || 'Not configured'}</span>
              <span>Runtime: {Object.values(data.runtime).join(' · ')}</span>
            </DeveloperDetails>
          </>
        )}
      </RemoteData>
    </section>
  );
}

function useLoader<T>(load: () => Promise<T>, deps: unknown[]): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null, error: null });
    load()
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null });
      })
      .catch((caught) => {
        if (active) {
          setState({
            status: 'error',
            data: null,
            error: caught instanceof Error ? caught.message : 'Request failed.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, deps);

  return state;
}

function RemoteData<T>({ state, children }: { state: LoadState<T>; children: (data: T) => ReactElement }) {
  if (state.status === 'loading') return <PanelSkeleton />;
  if (state.status === 'error') return <PanelState title="Could not load" detail={state.error ?? 'This information could not be loaded.'} tone="error" />;
  if (!state.data) return <PanelState title="No data yet" detail="Information will appear here when it is available." />;
  return children(state.data);
}

function RemoteList<T>({ state, empty, children }: { state: LoadState<T[]>; empty: string; children: (data: T[]) => ReactElement }) {
  return (
    <RemoteData state={state}>
      {(data) => (data.length === 0 ? <PanelState title="Nothing here yet" detail={empty} /> : children(data))}
    </RemoteData>
  );
}

function RemoteTable<T>({ state, empty, children }: { state: LoadState<PageResponse<T>>; empty: string; children: (data: PageResponse<T>) => ReactElement }) {
  return (
    <RemoteData state={state}>
      {(data) => (data.items.length === 0 ? <PanelState title="Nothing here yet" detail={empty} /> : children(data))}
    </RemoteData>
  );
}

function PanelTitle({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactElement;
}) {
  return (
    <div className="super-admin-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <span>{detail}</span>
      </div>
      {action}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="super-admin-skeleton" aria-label="Loading Super Admin data">
      <span />
      <span />
      <span />
    </div>
  );
}

function PanelState({ title, detail, tone = 'neutral' }: { title: string; detail: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`super-admin-state ${tone}`}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
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

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="super-admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`super-admin-status status-${status.toLowerCase()}`}>{status}</span>;
}

function TrendCard({
  title,
  points,
  formatter = String,
}: {
  title: string;
  points: Array<{ label: string; value: number }>;
  formatter?: (value: number) => string;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <article className="super-admin-card wide">
      <h3>{title}</h3>
      {points.length === 0 ? <p>Revenue data will appear after subscription invoices are created.</p> : null}
      <div className="super-admin-bars">
        {points.map((point) => (
          <div key={point.label}>
            <span style={{ height: `${Math.max((point.value / max) * 100, 4)}%` }} />
            <em>{point.label.slice(5)}</em>
            <strong>{formatter(point.value)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecordList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ id: string; title: string; detail: string; meta: string }>;
}) {
  return (
    <article className="super-admin-card wide">
      <h3>{title}</h3>
      {rows.length === 0 ? <p>{empty}</p> : null}
      <div className="super-admin-records">
        {rows.map((row) => (
          <div key={row.id}>
            <strong>{row.title}</strong>
            <span>{row.detail}</span>
            <em>{row.meta}</em>
          </div>
        ))}
      </div>
    </article>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max <= 0 ? 0 : Math.min((value / max) * 100, 100);
  return (
    <div className="super-admin-progress" aria-label={`${percentage.toFixed(0)} percent used`}>
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: SuperAdminInvoice }) {
  return (
    <tr>
      <td><strong>{invoice.invoiceNumber}</strong><span>{dateLabel(invoice.issuedAt)}</span></td>
      <td>{invoice.tenantName}</td>
      <td>{invoice.planCode}</td>
      <td>{money(invoice.amountCents)}</td>
      <td><StatusBadge status={invoice.status} /></td>
      <td>{invoice.dueAt ? dateLabel(invoice.dueAt) : 'No due date'}</td>
    </tr>
  );
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
}
