import { type FormEvent, type ReactElement, type ReactNode, useEffect, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import {
  createSuperAdminSubscriptionPlan,
  approveSuperAdminAiRecommendation,
  assignSuperAdminUserRole,
  createSuperAdminAutomationRule,
  createSuperAdminPermissionOverride,
  executeSuperAdminAiRecommendation,
  getSuperAdminUser,
  getSuperAdminAiUsage,
  getSuperAdminNotifications,
  getSuperAdminPlatformMetrics,
  getSuperAdminPlatformHealth,
  getSuperAdminReports,
  getSuperAdminRevenue,
  getSuperAdminSettings,
  listSuperAdminAuditLogs,
  listSuperAdminAiPolicies,
  listSuperAdminAiRecommendations,
  listSuperAdminAutomationRules,
  listSuperAdminAutomationRuns,
  listSuperAdminInvoices,
  listSuperAdminNotificationDeliveries,
  listSuperAdminPermissions,
  listSuperAdminReportExports,
  listSuperAdminUsers,
  listSuperAdminSchools,
  listSuperAdminSubscriptionPlans,
  listSuperAdminTenants,
  rejectSuperAdminAiRecommendation,
  requestSuperAdminReportExport,
  updateSuperAdminAutomationRule,
  updateSuperAdminPermissionOverride,
  updateSuperAdminUserRole,
  updateSuperAdminSettings,
  updateSuperAdminTenantStatus,
  type AuditLogRow,
  type AccessControlUser,
  type AiRecommendation,
  type AutomationRule,
  type AutomationRun,
  type AiPolicy,
  type NotificationDelivery,
  type PageResponse,
  type Permission,
  type PlatformSettings,
  type ReportExport,
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

const ROLE_OPTIONS = [
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'TEACHER',
  'STUDENT',
  'PARENT',
  'FINANCE_STAFF',
  'OFFICE_STAFF',
  'GUEST',
  'SYSTEM',
  'AI_AGENT',
  'STAFF',
];

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
  if (section === 'access-control') {
    return <AccessControlPanel token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
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
  const metrics = useLoader(() => getSuperAdminPlatformMetrics(token), [token, refreshKey]);
  const recentTenants = useLoader(() => listSuperAdminTenants({ page: 0, size: 5 }, token), [token, refreshKey]);
  const revenue = useLoader(() => getSuperAdminRevenue(token), [token, refreshKey]);
  const health = useLoader(() => getSuperAdminPlatformHealth(token), [token, refreshKey]);
  const notifications = useLoader(() => getSuperAdminNotifications(token), [token, refreshKey]);

  const loading = [metrics, recentTenants, revenue, health, notifications].some((state) => state.status === 'loading');
  const failed = [metrics, recentTenants, revenue, health, notifications].find((state) => state.status === 'error');

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
            <Metric label="Organizations" value={metrics.data?.totalTenantCount ?? 0} detail={`${metrics.data?.activeTenantCount ?? 0} active`} />
            <Metric label="Schools" value={metrics.data?.totalSchoolCount ?? 0} detail={`${metrics.data?.activeSchoolCount ?? 0} active`} />
            <Metric label="Students" value={metrics.data?.totalStudentCount ?? 0} detail={`${metrics.data?.activeStudentCount ?? 0} active`} />
            <Metric label="Users" value={metrics.data?.totalUserCount ?? 0} detail={`${metrics.data?.activeUserCount ?? 0} active`} />
            <Metric label="Health" value={health.data?.readiness === 'READY' ? 'Healthy' : health.data?.readiness ?? 'Healthy'} detail="Core services are online" />
            <Metric label="Security" value="Protected" detail="MFA and role-based access enabled" />
          </div>
          <div className="super-admin-grid">
            <TrendCard title="Growth and revenue" points={revenue.data?.monthlyTrend ?? []} formatter={money} />
            <RecordList
              title="Recent onboardings"
              empty="No organizations yet. Create your first tenant to begin onboarding a school."
              rows={(recentTenants.data?.items ?? []).map((tenant) => ({
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
                  id: 'paid-invoices',
                  title: 'Paid invoices',
                  detail: `${revenue.data?.paidInvoiceCount ?? 0} paid invoices`,
                  meta: `${revenue.data?.overdueInvoiceCount ?? 0} overdue`,
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
  const [query, setQuery] = useState({ page: 0, size: 25, search: '', status: '' });
  const tenants = useLoader(() => listSuperAdminTenants(query, token), [token, refreshKey, query.page, query.size, query.search, query.status]);
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
      <QueryControls
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        searchPlaceholder="Search name or code"
        statusOptions={['ACTIVE', 'SUSPENDED']}
        values={query}
      />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteTable state={tenants} empty="No tenants found. Use the onboarding wizard to create the first tenant.">
        {(data) => (
          <>
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
            <PaginationControls
              data={data}
              onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
            />
          </>
        )}
      </RemoteTable>
    </section>
  );
}

function SchoolDirectory({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [query, setQuery] = useState({ page: 0, size: 25, search: '', status: '', tenantId: '' });
  const schools = useLoader(() => listSuperAdminSchools(query, token), [token, refreshKey, query.page, query.size, query.search, query.status, query.tenantId]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="School directory" title="All schools" detail="View onboarded schools, organization ownership and recent activity." />
      <QueryControls
        includeTenant
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        searchPlaceholder="Search school, code or organization"
        statusOptions={['ACTIVE', 'INACTIVE']}
        values={query}
      />
      <RemoteTable state={schools} empty="No schools yet. Schools will appear after organization onboarding is complete.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>School</th><th>Organization</th><th>Status</th><th>Students</th><th>Staff</th><th>Activity</th></tr></thead>
              <tbody>
                {data.items.map((school) => (
                  <tr key={school.schoolId}>
                    <td><strong>{school.schoolName}</strong><span>{school.schoolCode}{school.primarySchool ? ' - Primary' : ''}</span></td>
                    <td>{school.tenantName}</td>
                    <td><StatusBadge status={school.status} /></td>
                    <td>{school.studentCount}</td>
                    <td>{school.staffCount}</td>
                    <td>{school.lastActivityAt ? dateLabel(school.lastActivityAt) : 'No activity yet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              data={data}
              onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
            />
          </>
        )}
      </RemoteTable>
    </section>
  );
}

function AccessControlPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const [query, setQuery] = useState({ page: 0, size: 25, search: '', tenantId: '', schoolId: '', role: '', status: '' });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const users = useLoader(() => listSuperAdminUsers(query, token), [
    token,
    refreshKey,
    query.page,
    query.size,
    query.search,
    query.tenantId,
    query.schoolId,
    query.role,
    query.status,
  ]);
  const selected = useLoader(
    () => selectedUserId ? getSuperAdminUser(selectedUserId, token) : Promise.resolve(null),
    [selectedUserId, token, refreshKey],
  );
  const permissions = useLoader(() => listSuperAdminPermissions(token), [token, refreshKey]);

  async function assignRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    const form = new FormData(event.currentTarget);
    await assignSuperAdminUserRole(selectedUserId, {
      role: String(form.get('role') ?? ''),
      tenantId: optionalFormValue(form, 'tenantId'),
      schoolId: optionalFormValue(form, 'schoolId'),
      reason: optionalFormValue(form, 'reason'),
      primaryRole: form.get('primaryRole') === 'on',
    }, token);
    setMessage('Role assignment saved and audited.');
    onRefresh();
  }

  async function saveOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    const form = new FormData(event.currentTarget);
    await createSuperAdminPermissionOverride(selectedUserId, {
      permissionCode: String(form.get('permissionCode') ?? ''),
      allowed: String(form.get('allowed') ?? 'true') === 'true',
      tenantId: optionalFormValue(form, 'tenantId'),
      schoolId: optionalFormValue(form, 'schoolId'),
      reason: String(form.get('reason') ?? ''),
    }, token);
    setMessage('Permission override saved and audited.');
    onRefresh();
  }

  async function deactivateRole(user: AccessControlUser, roleAssignmentId: string) {
    await updateSuperAdminUserRole(user.userId, roleAssignmentId, { active: false, reason: 'Deactivated from Super Admin portal.' }, token);
    setMessage('Role assignment deactivated.');
    onRefresh();
  }

  async function revokeOverride(user: AccessControlUser, overrideId: string) {
    await updateSuperAdminPermissionOverride(user.userId, overrideId, { active: false, reason: 'Revoked from Super Admin portal.' }, token);
    setMessage('Permission override revoked.');
    onRefresh();
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Access Control" title="Users and roles" detail="Manage scoped roles, school access and permission overrides." />
      {message ? <p className="toast-message">{message}</p> : null}
      <form
        className="super-admin-filters"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setQuery((current) => ({
            ...current,
            page: 0,
            search: String(form.get('search') ?? ''),
            tenantId: String(form.get('tenantId') ?? ''),
            schoolId: String(form.get('schoolId') ?? ''),
            role: String(form.get('role') ?? ''),
            status: String(form.get('status') ?? ''),
          }));
        }}
      >
        <input aria-label="Search users" defaultValue={query.search} name="search" placeholder="Name or email" />
        <input aria-label="Tenant ID" defaultValue={query.tenantId} name="tenantId" placeholder="Tenant ID" />
        <input aria-label="School ID" defaultValue={query.schoolId} name="schoolId" placeholder="School ID" />
        <select aria-label="Role filter" defaultValue={query.role} name="role">
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <select aria-label="Status filter" defaultValue={query.status} name="status">
          <option value="">All statuses</option>
          {['ACTIVE', 'INVITED', 'SUSPENDED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select
          aria-label="Page size"
          onChange={(event) => setQuery((current) => ({ ...current, size: Number(event.target.value), page: 0 }))}
          value={query.size}
        >
          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} rows</option>)}
        </select>
        <button type="submit">Apply</button>
      </form>
      <div className="super-admin-grid">
        <RemoteTable state={users} empty="No users match these filters.">
          {(data) => (
            <>
              <table className="super-admin-table">
                <thead><tr><th>User</th><th>Role</th><th>Tenant</th><th>Status</th><th>MFA</th><th>Action</th></tr></thead>
                <tbody>
                  {data.items.map((user) => (
                    <tr key={user.userId}>
                      <td><strong>{user.displayName}</strong><span>{user.email}</span></td>
                      <td>{user.primaryRole}</td>
                      <td>{user.tenantName}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td>{user.mfaRequired ? 'Required' : 'Standard'}</td>
                      <td><button onClick={() => setSelectedUserId(user.userId)} type="button">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
            </>
          )}
        </RemoteTable>
        {selectedUserId ? (
          <RemoteData state={selected}>
            {(user) => user ? (
            <article className="super-admin-card wide">
              <h3>{user.displayName}</h3>
              <p>{user.email} - {user.primaryRole} - {user.tenantName}</p>
              <div className="super-admin-card-grid">
                <article className="super-admin-card"><h3>Roles</h3><p>{user.roles.length} assignments</p></article>
                <article className="super-admin-card"><h3>Overrides</h3><p>{user.permissionOverrides.length} active or historical rows</p></article>
                <article className="super-admin-card"><h3>Schools</h3><p>{user.schoolAccess.length} school grants</p></article>
              </div>
              <form className="super-admin-form" onSubmit={(event) => void assignRole(event)}>
                <h3>Assign role</h3>
                <select name="role" required>
                  {ROLE_OPTIONS.filter((role) => role !== 'STAFF').map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <input defaultValue={user.tenantId} name="tenantId" placeholder="Tenant ID" />
                <input name="schoolId" placeholder="School ID for school roles" />
                <input name="reason" placeholder="Reason" />
                <label className="inline-check"><input name="primaryRole" type="checkbox" /> Make primary login role</label>
                <button type="submit">Assign role</button>
              </form>
              <form className="super-admin-form" onSubmit={(event) => void saveOverride(event)}>
                <h3>Permission override</h3>
                <select name="permissionCode" required>
                  {(permissions.data ?? []).map((permission: Permission) => (
                    <option key={permission.code} value={permission.code}>{permission.code}</option>
                  ))}
                </select>
                <select name="allowed">
                  <option value="true">Grant</option>
                  <option value="false">Deny</option>
                </select>
                <input defaultValue={user.tenantId} name="tenantId" placeholder="Tenant ID" />
                <input name="schoolId" placeholder="School ID optional" />
                <input name="reason" placeholder="Required reason" required />
                <button type="submit">Save override</button>
              </form>
              <table className="super-admin-table">
                <thead><tr><th>Role</th><th>Scope</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {user.roles.map((role) => (
                    <tr key={role.roleAssignmentId}>
                      <td>{role.role}</td>
                      <td>{role.schoolName ?? role.tenantName ?? role.scopeType}</td>
                      <td><StatusBadge status={role.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                      <td><button disabled={!role.active} onClick={() => void deactivateRole(user, role.roleAssignmentId)} type="button">Deactivate</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="super-admin-table">
                <thead><tr><th>Permission</th><th>Decision</th><th>Scope</th><th>Action</th></tr></thead>
                <tbody>
                  {user.permissionOverrides.map((override) => (
                    <tr key={override.overrideId}>
                      <td><strong>{override.permissionCode}</strong><span>{override.reason ?? 'No reason'}</span></td>
                      <td>{override.allowed ? 'Grant' : 'Deny'}</td>
                      <td>{override.schoolName ?? override.tenantName ?? override.scopeType}</td>
                      <td><button disabled={!override.active} onClick={() => void revokeOverride(user, override.overrideId)} type="button">Revoke</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
            ) : (
              <PanelState title="Select a user" detail="Open a row to view roles, school access and overrides." />
            )}
          </RemoteData>
        ) : (
          <PanelState title="Select a user" detail="Open a row to view roles, school access and overrides." />
        )}
      </div>
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
  const [query, setQuery] = useState({ page: 0, size: 25, status: '' });
  const invoices = useLoader(() => listSuperAdminInvoices(query, token), [token, refreshKey, query.page, query.size, query.status]);
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
              <Metric label="Paid invoices" value={data.paidInvoiceCount} detail="Marked as paid" />
              <Metric label="Pending" value={data.pendingInvoiceCount} detail="Awaiting payment" />
              <Metric label="Overdue" value={data.overdueInvoiceCount} detail="Issued and past due" />
            </div>
            <TrendCard title="Monthly invoice trend" points={data.monthlyTrend} formatter={money} />
          </>
        )}
      </RemoteData>
      <QueryControls
        compact
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['ISSUED', 'PENDING', 'PAID', 'OVERDUE', 'FAILED', 'CANCELLED', 'VOID']}
        values={query}
      />
      <RemoteTable state={invoices} empty="No invoices issued yet.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Invoice</th><th>Tenant</th><th>Plan</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>{data.items.map((invoice) => <InvoiceRow invoice={invoice} key={invoice.invoiceId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
    </section>
  );
}

function AiUsagePanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const usage = useLoader(() => getSuperAdminAiUsage(token), [token, refreshKey]);
  const [query, setQuery] = useState({ page: 0, size: 25, tenantId: '', schoolId: '', status: '', type: '', riskLevel: '' });
  const [message, setMessage] = useState<string | null>(null);
  const recommendations = useLoader(() => listSuperAdminAiRecommendations(query, token), [
    token,
    refreshKey,
    query.page,
    query.size,
    query.tenantId,
    query.schoolId,
    query.status,
    query.type,
    query.riskLevel,
  ]);
  const rules = useLoader(() => listSuperAdminAutomationRules({ page: 0, size: 10 }, token), [token, refreshKey]);
  const runs = useLoader(() => listSuperAdminAutomationRuns({ page: 0, size: 10 }, token), [token, refreshKey]);
  const policies = useLoader(() => listSuperAdminAiPolicies({ page: 0, size: 10 }, token), [token, refreshKey]);

  async function approve(item: AiRecommendation) {
    await approveSuperAdminAiRecommendation(item.recommendationId, token);
    setMessage('Recommendation approved and audited.');
  }

  async function reject(item: AiRecommendation) {
    const reason = globalThis.prompt('Reason for rejection');
    if (!reason) return;
    await rejectSuperAdminAiRecommendation(item.recommendationId, reason, token);
    setMessage('Recommendation rejected and audited.');
  }

  async function execute(item: AiRecommendation) {
    await executeSuperAdminAiRecommendation(item.recommendationId, token);
    setMessage('Approved recommendation execution requested.');
  }

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createSuperAdminAutomationRule({
      tenantId: optionalFormValue(form, 'tenantId'),
      schoolId: optionalFormValue(form, 'schoolId'),
      code: String(form.get('code') ?? ''),
      name: String(form.get('name') ?? ''),
      description: optionalFormValue(form, 'description'),
      triggerType: String(form.get('triggerType') ?? 'SCHEDULED'),
      triggerConfigJson: '{}',
      actionType: String(form.get('actionType') ?? 'CREATE_RECOMMENDATION'),
      actionConfigJson: '{}',
      enabled: form.get('enabled') === 'on',
      requiresApproval: form.get('requiresApproval') === 'on',
      approvalRole: optionalFormValue(form, 'approvalRole'),
      riskLevel: String(form.get('riskLevel') ?? 'MEDIUM'),
    }, token);
    setMessage('Automation rule created and audited.');
  }

  async function toggleRule(item: AutomationRule) {
    await updateSuperAdminAutomationRule(item.ruleId, { enabled: !item.enabled }, token);
    setMessage(item.enabled ? 'Automation rule disabled.' : 'Automation rule enabled.');
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="AI governance" title="AI usage and automation" detail="Review AI access, recommendations, automation and policies." />
      {message ? <p className="toast-message">{message}</p> : null}
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
      <QueryControls
        compact
        extraFilterLabel="Risk"
        extraFilterName="riskLevel"
        extraFilterOptions={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']}
        includeTenant
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED', 'CANCELLED', 'FAILED']}
        values={query}
      />
      <RemoteTable state={recommendations} empty="No AI recommendations match these filters.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Recommendation</th><th>Scope</th><th>Risk</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {data.items.map((item: AiRecommendation) => (
                  <tr key={item.recommendationId}>
                    <td><strong>{item.title}</strong><span>{item.recommendationType} - {item.summary}</span></td>
                    <td>{item.schoolName ?? item.tenantName}</td>
                    <td><StatusBadge status={item.riskLevel} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <button disabled={item.status !== 'PENDING_REVIEW' && item.status !== 'DRAFT'} onClick={() => void approve(item)} type="button">Approve</button>
                      <button disabled={item.status !== 'PENDING_REVIEW' && item.status !== 'DRAFT'} onClick={() => void reject(item)} type="button">Reject</button>
                      <button disabled={item.status !== 'APPROVED'} onClick={() => void execute(item)} type="button">Execute</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
      <div className="super-admin-grid">
        <RemoteTable state={rules} empty="No automation rules yet.">
          {(data) => (
            <article className="super-admin-card wide">
              <h3>Automation rules</h3>
              <table className="super-admin-table">
                <thead><tr><th>Rule</th><th>Scope</th><th>Risk</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {data.items.map((item: AutomationRule) => (
                    <tr key={item.ruleId}>
                      <td><strong>{item.name}</strong><span>{item.code}</span></td>
                      <td>{item.schoolName ?? item.tenantName ?? 'Platform'}</td>
                      <td>{item.riskLevel}</td>
                      <td><StatusBadge status={item.enabled ? 'ENABLED' : 'DISABLED'} /></td>
                      <td><button onClick={() => void toggleRule(item)} type="button">{item.enabled ? 'Disable' : 'Enable'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          )}
        </RemoteTable>
        <form className="super-admin-form" onSubmit={(event) => void createRule(event)}>
          <h3>Create automation rule</h3>
          <input name="tenantId" placeholder="Tenant ID optional" />
          <input name="schoolId" placeholder="School ID optional" />
          <input name="code" placeholder="Rule code" required />
          <input name="name" placeholder="Rule name" required />
          <input name="description" placeholder="Description" />
          <select name="triggerType"><option value="SCHEDULED">SCHEDULED</option><option value="EVENT">EVENT</option></select>
          <select name="actionType"><option value="CREATE_RECOMMENDATION">CREATE_RECOMMENDATION</option><option value="DRAFT_MESSAGE">DRAFT_MESSAGE</option></select>
          <select name="riskLevel"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select>
          <input name="approvalRole" placeholder="Approval role optional" />
          <label className="inline-check"><input name="enabled" type="checkbox" /> Enabled</label>
          <label className="inline-check"><input defaultChecked name="requiresApproval" type="checkbox" /> Requires approval</label>
          <button type="submit">Create rule</button>
        </form>
        <RemoteTable state={runs} empty="No automation runs yet.">
          {(data) => (
            <RecordList
              title="Automation runs"
              empty="No automation runs yet."
              rows={data.items.map((item: AutomationRun) => ({
                id: item.runId,
                title: `${item.ruleName} - ${item.status}`,
                detail: item.schoolName ?? item.tenantName ?? 'Platform',
                meta: dateLabel(item.startedAt),
              }))}
            />
          )}
        </RemoteTable>
        <RemoteTable state={policies} empty="No AI policies yet. Tenant policies appear after entitlement setup.">
          {(data) => (
            <RecordList
              title="AI policies"
              empty="No AI policies yet."
              rows={data.items.map((item: AiPolicy) => ({
                id: item.policyId,
                title: item.tenantName,
                detail: `${item.monthlyBudgetUnits} units - approval ${item.humanApprovalRequiredDefault ? 'required' : 'optional'}`,
                meta: item.enabled ? 'Enabled' : 'Disabled',
              }))}
            />
          )}
        </RemoteTable>
      </div>
    </section>
  );
}

function ReportsPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const reports = useLoader(() => getSuperAdminReports(token), [token, refreshKey]);
  const [query, setQuery] = useState({ page: 0, size: 25, status: '', reportType: '' });
  const exports = useLoader(() => listSuperAdminReportExports(query, token), [token, refreshKey, query.page, query.size, query.status, query.reportType]);
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
          </>
        )}
      </RemoteData>
      <QueryControls
        compact
        extraFilterLabel="Report type"
        extraFilterName="reportType"
        extraFilterOptions={['PLATFORM_SUMMARY', 'TENANT_DIRECTORY', 'SCHOOL_DIRECTORY', 'INVOICE_SUMMARY', 'STUDENT_DIRECTORY', 'FEE_DEMANDS']}
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['QUEUED', 'VALIDATING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']}
        values={query}
      />
      <RemoteTable state={exports} empty="No export jobs yet.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Export</th><th>Scope</th><th>Status</th><th>Requested</th><th>Completed</th></tr></thead>
              <tbody>{data.items.map((item) => <ReportExportRow item={item} key={item.exportId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
    </section>
  );
}

function AuditLogsPanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [query, setQuery] = useState({ page: 0, size: 25, tenantId: '', role: '', action: '' });
  const auditLogs = useLoader(() => listSuperAdminAuditLogs(query, token), [token, refreshKey, query.page, query.size, query.tenantId, query.role, query.action]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Audit" title="Audit logs" detail="Security and admin activity for platform operations." />
      <QueryControls
        compact
        includeAction
        includeRole
        includeTenant
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        values={query}
      />
      <RemoteTable state={auditLogs} empty="No audit logs yet.">
        {(data) => (
          <>
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
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
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
  const [query, setQuery] = useState({ page: 0, size: 25, status: '', channel: '', tenantId: '' });
  const deliveries = useLoader(() => listSuperAdminNotificationDeliveries(query, token), [token, refreshKey, query.page, query.size, query.status, query.channel, query.tenantId]);
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
      <QueryControls
        compact
        extraFilterLabel="Channel"
        extraFilterName="channel"
        extraFilterOptions={['EMAIL']}
        includeTenant
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['PENDING', 'SENT', 'LOGGED', 'FAILED', 'DISABLED']}
        values={query}
      />
      <RemoteTable state={deliveries} empty="No delivery rows match these filters.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Delivery</th><th>Recipient</th><th>Tenant</th><th>Status</th><th>When</th></tr></thead>
              <tbody>{data.items.map((delivery) => <NotificationDeliveryRow delivery={delivery} key={delivery.deliveryId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
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

function QueryControls({
  compact = false,
  extraFilterLabel,
  extraFilterName,
  extraFilterOptions = [],
  includeAction = false,
  includeRole = false,
  includeTenant = false,
  onApply,
  onSizeChange,
  searchPlaceholder,
  statusOptions = [],
  values,
}: {
  compact?: boolean;
  extraFilterLabel?: string;
  extraFilterName?: string;
  extraFilterOptions?: string[];
  includeAction?: boolean;
  includeRole?: boolean;
  includeTenant?: boolean;
  onApply: (next: Record<string, string>) => void;
  onSizeChange: (size: number) => void;
  searchPlaceholder?: string;
  statusOptions?: string[];
  values: Record<string, string | number>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({
    search: String(values.search ?? ''),
    status: String(values.status ?? ''),
    tenantId: String(values.tenantId ?? ''),
    role: String(values.role ?? ''),
    action: String(values.action ?? ''),
    channel: String(values.channel ?? ''),
    reportType: String(values.reportType ?? ''),
  });

  function update(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className={`super-admin-filters ${compact ? 'compact' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
    >
      {searchPlaceholder ? (
        <input
          aria-label={searchPlaceholder}
          onChange={(event) => update('search', event.target.value)}
          placeholder={searchPlaceholder}
          value={draft.search}
        />
      ) : null}
      {includeTenant ? (
        <input
          aria-label="Tenant ID"
          onChange={(event) => update('tenantId', event.target.value)}
          placeholder="Tenant ID"
          value={draft.tenantId}
        />
      ) : null}
      {includeRole ? (
        <input
          aria-label="Actor role"
          onChange={(event) => update('role', event.target.value)}
          placeholder="Actor role"
          value={draft.role}
        />
      ) : null}
      {includeAction ? (
        <input
          aria-label="Audit action"
          onChange={(event) => update('action', event.target.value)}
          placeholder="Audit action"
          value={draft.action}
        />
      ) : null}
      {statusOptions.length > 0 ? (
        <select aria-label="Status filter" onChange={(event) => update('status', event.target.value)} value={draft.status}>
          <option value="">All statuses</option>
          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      ) : null}
      {extraFilterName && extraFilterOptions.length > 0 ? (
        <select
          aria-label={extraFilterLabel ?? extraFilterName}
          onChange={(event) => update(extraFilterName, event.target.value)}
          value={draft[extraFilterName] ?? ''}
        >
          <option value="">All {extraFilterLabel?.toLowerCase() ?? extraFilterName}</option>
          {extraFilterOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : null}
      <select
        aria-label="Page size"
        onChange={(event) => onSizeChange(Number(event.target.value))}
        value={String(values.size ?? 25)}
      >
        {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} rows</option>)}
      </select>
      <button type="submit">Apply</button>
    </form>
  );
}

function PaginationControls<T>({ data, onPageChange }: { data: PageResponse<T>; onPageChange: (page: number) => void }) {
  return (
    <div className="super-admin-pagination">
      <span>
        Page {data.totalPages === 0 ? 0 : data.page + 1} of {data.totalPages} - {data.totalItems} total
      </span>
      <div>
        <button disabled={data.page <= 0} onClick={() => onPageChange(data.page - 1)} type="button">Previous</button>
        <button disabled={data.page + 1 >= data.totalPages} onClick={() => onPageChange(data.page + 1)} type="button">Next</button>
      </div>
    </div>
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

function ReportExportRow({ item }: { item: ReportExport }) {
  return (
    <tr>
      <td><strong>{item.reportType}</strong><span>{item.format}</span></td>
      <td>{item.schoolName ?? item.tenantName ?? 'Platform-wide'}</td>
      <td><StatusBadge status={item.status} /></td>
      <td>{dateLabel(item.requestedAt)}</td>
      <td>{item.completedAt ? dateLabel(item.completedAt) : 'Not completed'}</td>
    </tr>
  );
}

function NotificationDeliveryRow({ delivery }: { delivery: NotificationDelivery }) {
  return (
    <tr>
      <td><strong>{delivery.template}</strong><span>{delivery.channel}</span></td>
      <td>{delivery.maskedRecipient}</td>
      <td>{delivery.tenantName ?? 'Tenant'}</td>
      <td><StatusBadge status={delivery.status} /></td>
      <td>{dateLabel(delivery.createdAt)}</td>
    </tr>
  );
}

function optionalFormValue(form: FormData, name: string) {
  const value = String(form.get(name) ?? '').trim();
  return value.length > 0 ? value : undefined;
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
