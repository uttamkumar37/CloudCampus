import { type FormEvent, type ReactElement, type ReactNode, useEffect, useId, useState } from 'react';

import { useAuthState } from '../../auth/hooks/authState';
import { TenantOnboardingPage } from './TenantOnboardingPage';
import {
  assignSuperAdminTenantSubscription,
  createSuperAdminSubscriptionPlan,
  createSuperAdminAiRecommendation,
  approveSuperAdminAiRecommendation,
  assignSuperAdminUserRole,
  createSuperAdminTeacherAssignment,
  createSuperAdminAutomationRule,
  createSuperAdminPermissionOverride,
  deleteSuperAdminPermissionOverride,
  deleteSuperAdminStudentGuardian,
  deleteSuperAdminTeacherAssignment,
  deleteSuperAdminUserRole,
  executeSuperAdminAiRecommendation,
  getSuperAdminAiEntitlement,
  getSuperAdminAiPolicy,
  getSuperAdminAiRecommendation,
  getSuperAdminNotificationDelivery,
  getSuperAdminReportExport,
  getSuperAdminTenantSubscription,
  getSuperAdminUser,
  getSuperAdminAiUsage,
  getSuperAdminNotifications,
  getSuperAdminPlatformMetrics,
  getSuperAdminPlatformHealth,
  getSuperAdminReports,
  getSuperAdminRevenue,
  getSuperAdminRevenueTrends,
  getSuperAdminTenantRevenue,
  getSuperAdminSettings,
  linkSuperAdminStudentGuardian,
  listSuperAdminAuditLogs,
  listSuperAdminAiEntitlements,
  listSuperAdminAiPolicies,
  listSuperAdminAiRecommendations,
  listSuperAdminAiTenantUsage,
  listSuperAdminAutomationRules,
  listSuperAdminAutomationRuns,
  listSuperAdminInvoices,
  listSuperAdminNotificationDeliveries,
  listSuperAdminPermissions,
  listSuperAdminReportSchools,
  listSuperAdminReportTenants,
  listSuperAdminReportExports,
  listSuperAdminRolePermissions,
  listSuperAdminUserPermissionOverrides,
  listSuperAdminUserRoles,
  listSuperAdminUsers,
  listSuperAdminSchools,
  listSuperAdminSubscriptionPlans,
  listSuperAdminTenantSubscriptionInvoices,
  listSuperAdminTenants,
  rejectSuperAdminAiRecommendation,
  requestSuperAdminReportExport,
  updateSuperAdminAiEntitlement,
  updateSuperAdminAiPolicy,
  updateSuperAdminAutomationRule,
  updateSuperAdminPermissionOverride,
  updateSuperAdminStudentGuardian,
  updateSuperAdminSubscriptionPlan,
  updateSuperAdminTeacherAssignment,
  updateSuperAdminUserRole,
  updateSuperAdminSettings,
  updateSuperAdminTenantStatus,
  type AuditLogRow,
  type AccessControlUser,
  type AiEntitlement,
  type AiRecommendation,
  type AutomationRule,
  type AutomationRun,
  type AiPolicy,
  type AiTenantUsage,
  type NotificationDelivery,
  type PageResponse,
  type Permission,
  type PlatformSettings,
  type ReportExport,
  type RevenueBreakdown,
  type SubscriptionPlan,
  type SuperAdminInvoice,
  type SuperAdminTenant,
  type TenantSubscription,
  type UserRoleAssignment,
  type PermissionOverride,
} from '../api/platformApi';

type SuperAdminPlatformPageProps = {
  onNavigate?: (section: string) => void;
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

const SCHOOL_SCOPED_ROLES = new Set(['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'FINANCE_STAFF', 'OFFICE_STAFF']);
const NON_HUMAN_ROLES = new Set(['SYSTEM', 'AI_AGENT']);
const AI_FEATURE_OPTIONS = [
  'NOTICE_DRAFTING',
  'HOMEWORK_DRAFTING',
  'LESSON_PLAN_DRAFTING',
  'REPORT_EXPLANATION',
  'NOTICE_TRANSLATION',
  'ADMISSION_ENQUIRY_ASSISTANT',
  'SCHOOL_POLICY_QA',
];
const AI_RECOMMENDATION_TYPES = [
  'LESSON_PLAN_SUGGESTION',
  'HOMEWORK_SUGGESTION',
  'STUDENT_RISK_ACADEMIC',
  'STUDENT_RISK_ATTENDANCE',
  'STUDENT_RISK_DISCIPLINE',
  'EXAM_PERFORMANCE_INSIGHT',
  'PARENT_MESSAGE_DRAFT',
  'FEE_REMINDER_SUGGESTION',
  'ADMISSION_FOLLOW_UP',
  'TIMETABLE_OPTIMIZATION',
  'STAFF_WORKLOAD_INSIGHT',
  'PLATFORM_HEALTH_INSIGHT',
  'SUBSCRIPTION_RISK_INSIGHT',
];
const REPORT_TYPES = ['PLATFORM_SUMMARY', 'TENANT_DIRECTORY', 'SCHOOL_DIRECTORY', 'INVOICE_SUMMARY', 'STUDENT_DIRECTORY', 'FEE_DEMANDS'];
type PlanFormField =
  | 'code'
  | 'name'
  | 'description'
  | 'maxSchools'
  | 'maxStudents'
  | 'maxStaff'
  | 'monthlyPriceCents'
  | 'annualPriceCents'
  | 'currency'
  | 'status';
type PlanFormErrors = Partial<Record<PlanFormField, string>>;

export function SuperAdminPlatformPage({ onNavigate, section }: SuperAdminPlatformPageProps) {
  const { accessToken } = useAuthState();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!accessToken) {
    return <PanelState title="Super Admin login required" detail="Sign in as SUPER_ADMIN to use the platform control center." />;
  }

  if (section === 'dashboard') {
    return <SuperAdminDashboard onNavigate={onNavigate} token={accessToken} refreshKey={refreshKey} onRefresh={() => setRefreshKey((key) => key + 1)} />;
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
  onNavigate,
  token,
  refreshKey,
  onRefresh,
}: {
  onNavigate?: (section: string) => void;
  token: string;
  refreshKey: number;
  onRefresh: () => void;
}) {
  const metrics = useLoader(() => getSuperAdminPlatformMetrics(token), [token, refreshKey]);
  const recentTenants = useLoader(() => listSuperAdminTenants({ page: 0, size: 5 }, token), [token, refreshKey]);
  const revenue = useLoader(() => getSuperAdminRevenue(token), [token, refreshKey]);
  const health = useLoader(() => getSuperAdminPlatformHealth(token), [token, refreshKey]);
  const notifications = useLoader(() => getSuperAdminNotifications(token), [token, refreshKey]);
  const reports = useLoader(() => getSuperAdminReports(token), [token, refreshKey]);
  const aiUsage = useLoader(() => getSuperAdminAiUsage(token), [token, refreshKey]);

  const loading = [metrics, recentTenants, revenue, health, notifications, reports, aiUsage].some((state) => state.status === 'loading');
  const failed = [metrics, recentTenants, revenue, health, notifications, reports, aiUsage].find((state) => state.status === 'error');
  const platformStatus = health.data?.readiness === 'READY' && (health.data.alerts?.length ?? 0) === 0 ? 'Healthy' : health.data?.readiness === 'READY' ? 'Warning' : 'Critical';
  const pendingAiApprovals = aiUsage.data?.usageAudit.filter((audit) => audit.status === 'DENIED' || audit.status === 'BUDGET_EXCEEDED').length;
  const pendingReportExports = health.data?.pendingReportExportCount ?? reports.data?.exports.filter((item) => ['QUEUED', 'PROCESSING'].includes(item.status)).length ?? 0;

  return (
    <section className="super-admin-panel" aria-labelledby="super-admin-dashboard-title">
      <PanelTitle
        eyebrow="Overview"
        title="Super Admin Dashboard"
        detail="Monitor platform health, schools, users, revenue, AI, and operations."
        action={(
          <div className="super-admin-title-actions">
            <button onClick={() => onNavigate?.('tenants')} type="button">Create organization</button>
            <button className="secondary" onClick={() => onNavigate?.('subscriptions')} type="button">Create plan</button>
            <button className="secondary" onClick={() => onNavigate?.('health')} type="button">View health</button>
          </div>
        )}
      />
      <div className="super-admin-status-strip" aria-label="Platform status">
        <span className={`status-chip ${platformStatus.toLowerCase()}`}><span className="live-dot" aria-hidden="true" />{platformStatus}</span>
        <span>Last refreshed {health.data?.checkedAt ? dateLabel(health.data.checkedAt) : metrics.data?.lastCalculatedAt ? dateLabel(metrics.data.lastCalculatedAt) : 'Not available'}</span>
        <button onClick={onRefresh} type="button">Refresh</button>
      </div>
      {loading ? <PanelSkeleton /> : null}
      {failed ? <PanelState title="Dashboard could not load" detail={failed.error ?? 'One platform API failed.'} tone="error" /> : null}
      {!loading && !failed ? (
        <>
          <div className="super-admin-metrics executive">
            <Metric action={() => onNavigate?.('tenants')} label="Organizations" value={metrics.data?.totalTenantCount ?? 0} detail={`${metrics.data?.activeTenantCount ?? 0} active organizations`} />
            <Metric action={() => onNavigate?.('schools')} label="Schools" value={metrics.data?.totalSchoolCount ?? 0} detail={`${metrics.data?.activeSchoolCount ?? 0} active schools`} />
            <Metric action={() => onNavigate?.('schools')} label="Students" value={metrics.data?.totalStudentCount ?? 0} detail={`${metrics.data?.activeStudentCount ?? 0} active students`} />
            <Metric action={() => onNavigate?.('access-control')} label="Users" value={metrics.data?.totalUserCount ?? 0} detail={`${metrics.data?.activeUserCount ?? 0} active users`} />
            <Metric action={() => onNavigate?.('revenue')} label="MRR" value={money(revenue.data?.monthlyRecurringRevenueCents ?? 0)} detail={`${revenue.data?.paidInvoiceCount ?? 0} paid invoices`} />
            <Metric action={() => onNavigate?.('health')} label="Platform Health" value={platformStatus} detail={`${health.data?.pendingOutboxCount ?? 0} outbox jobs pending`} />
          </div>
          <div className="super-admin-dashboard-layout">
            <RecordList
              title="Needs attention"
              empty="No urgent platform items need attention."
              rows={[
                {
                  id: 'failed-notifications',
                  title: 'Failed notifications',
                  detail: `${notifications.data?.failedDeliveries ?? 0} deliveries need review`,
                  meta: 'Notifications',
                },
                {
                  id: 'pending-reports',
                  title: 'Pending report exports',
                  detail: `${pendingReportExports} exports are queued or processing`,
                  meta: 'Reports',
                },
                {
                  id: 'overdue-invoices',
                  title: 'Overdue invoices',
                  detail: `${revenue.data?.overdueInvoiceCount ?? 0} customer invoices are overdue`,
                  meta: 'Revenue',
                },
                {
                  id: 'ai-review',
                  title: 'AI governance review',
                  detail: pendingAiApprovals === undefined ? 'Not available' : `${pendingAiApprovals} usage items need review`,
                  meta: 'AI',
                },
                {
                  id: 'platform-alerts',
                  title: 'Platform health warnings',
                  detail: `${health.data?.alerts.length ?? 0} alerts reported`,
                  meta: 'Health',
                },
              ].filter((row) => !row.detail.startsWith('0 '))}
            />
            <article className="super-admin-card wide">
              <h3>Quick actions</h3>
              <div className="super-admin-action-grid">
                <button onClick={() => onNavigate?.('tenants')} type="button">Create organization</button>
                <button onClick={() => onNavigate?.('schools')} type="button">Add school</button>
                <button onClick={() => onNavigate?.('access-control')} type="button">Invite admin</button>
                <button onClick={() => onNavigate?.('subscriptions')} type="button">Create subscription plan</button>
                <button onClick={() => onNavigate?.('reports')} type="button">Request report export</button>
                <button onClick={() => onNavigate?.('ai-usage')} type="button">Review AI governance</button>
              </div>
            </article>
            <RecordList
              title="Recent activity"
              empty="No organizations yet. Create your first organization and school to start onboarding."
              rows={(recentTenants.data?.items ?? []).map((tenant) => ({
                id: tenant.tenantId,
                title: tenant.name,
                detail: `${tenant.activeSchoolCount}/${tenant.schoolCount} active schools`,
                meta: tenant.status,
              }))}
            />
            <TrendCard title="Growth & revenue" points={revenue.data?.monthlyTrend ?? []} formatter={money} />
            <article className="super-admin-card wide">
              <h3>Platform health summary</h3>
              <dl>
                <div><dt>Readiness</dt><dd>{health.data?.readiness ?? 'Not available'}</dd></div>
                <div><dt>Database</dt><dd>{health.data?.databaseStatus ?? 'Not available'}</dd></div>
                <div><dt>Notification mode</dt><dd>{health.data?.notificationMode ?? 'Not available'}</dd></div>
                <div><dt>Pending jobs</dt><dd>{(health.data?.pendingOutboxCount ?? 0) + (health.data?.pendingReportExportCount ?? 0)}</dd></div>
              </dl>
            </article>
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
  const [wizardOpen, setWizardOpen] = useState(false);

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
      <PanelTitle
        eyebrow="Manage"
        title="Organizations"
        detail="Create and manage customer trusts, groups, and school organizations."
        action={<button onClick={() => setWizardOpen(true)} type="button">Create organization</button>}
      />
      <QueryControls
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        searchPlaceholder="Search organization name or code"
        statusOptions={['ACTIVE', 'SUSPENDED']}
        values={query}
      />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteTable state={tenants} empty="No organizations yet. Create your first organization and school to start onboarding.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Organization</th><th>Status</th><th>Schools</th><th>Users</th><th>Plan</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {data.items.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td><strong>{tenant.name}</strong><span>{tenant.code}</span></td>
                    <td><StatusBadge status={tenant.status} /></td>
                    <td>{tenant.activeSchoolCount}/{tenant.schoolCount}</td>
                    <td>{tenant.userCount}</td>
                    <td>{tenant.planName}</td>
                    <td>{dateLabel(tenant.createdAt)}</td>
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
      {wizardOpen ? (
        <div className="super-admin-modal" role="dialog" aria-modal="true" aria-label="Create organization">
          <button className="super-admin-modal-scrim" onClick={() => setWizardOpen(false)} type="button" aria-label="Close create organization wizard" />
          <section className="super-admin-modal-panel">
            <div className="super-admin-modal-head">
              <div>
                <p className="eyebrow">Guided setup</p>
                <h3>Create organization</h3>
                <span>Step through organization details, first school, admin invitation, and review.</span>
              </div>
              <button onClick={() => setWizardOpen(false)} type="button">Close</button>
            </div>
            <TenantOnboardingPage />
          </section>
        </div>
      ) : null}
    </section>
  );
}

function SchoolDirectory({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [query, setQuery] = useState({ page: 0, size: 25, search: '', status: '', tenantId: '' });
  const schools = useLoader(() => listSuperAdminSchools(query, token), [token, refreshKey, query.page, query.size, query.search, query.status, query.tenantId]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Manage" title="Schools" detail="View and manage all schools across the CloudCampus platform." />
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
  const [detailTab, setDetailTab] = useState<'summary' | 'roles' | 'overrides' | 'relationships' | 'audit'>('summary');
  const [rolePermissionRole, setRolePermissionRole] = useState('SUPER_ADMIN');
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
  const selectedRoles = useLoader(
    () => selectedUserId ? listSuperAdminUserRoles(selectedUserId, token) : Promise.resolve([]),
    [selectedUserId, token, refreshKey],
  );
  const selectedOverrides = useLoader(
    () => selectedUserId ? listSuperAdminUserPermissionOverrides(selectedUserId, token) : Promise.resolve([]),
    [selectedUserId, token, refreshKey],
  );
  const selectedAudit = useLoader(
    () => selected.data?.tenantId
      ? listSuperAdminAuditLogs({ page: 0, size: 10, tenantId: selected.data.tenantId }, token)
      : Promise.resolve(emptyPage<AuditLogRow>()),
    [selected.data?.tenantId, token, refreshKey],
  );
  const permissions = useLoader(() => listSuperAdminPermissions(token), [token, refreshKey]);
  const rolePermissions = useLoader(() => listSuperAdminRolePermissions(rolePermissionRole, token), [token, refreshKey, rolePermissionRole]);

  async function runAction(action: () => Promise<unknown>, success: string, form?: HTMLFormElement) {
    setActionError(null);
    try {
      await action();
      setMessage(success);
      form?.reset();
      onRefresh();
    } catch (caught) {
      setActionError(errorMessage(caught));
    }
  }

  async function assignRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    const target = event.currentTarget;
    const form = new FormData(target);
    const role = String(form.get('role') ?? '');
    const tenantId = optionalFormValue(form, 'tenantId');
    const schoolId = optionalFormValue(form, 'schoolId');
    const primaryRole = form.get('primaryRole') === 'on';
    if (role === 'STAFF') {
      setActionError('Use OFFICE_STAFF for new assignments; STAFF is a legacy alias.');
      return;
    }
    if (role !== 'SUPER_ADMIN' && !tenantId) {
      setActionError('Organization ID is required for organization and school scoped roles.');
      return;
    }
    if (SCHOOL_SCOPED_ROLES.has(role) && !schoolId) {
      setActionError('School ID is required for this role scope.');
      return;
    }
    if (primaryRole && NON_HUMAN_ROLES.has(role)) {
      setActionError('SYSTEM and AI_AGENT cannot be assigned as a normal login role.');
      return;
    }
    await runAction(
      () => assignSuperAdminUserRole(selectedUserId, {
        role,
        tenantId,
        schoolId,
        reason: optionalFormValue(form, 'reason'),
        primaryRole,
      }, token),
      'Role assignment saved and audited.',
      target,
    );
  }

  async function saveOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    const target = event.currentTarget;
    const form = new FormData(target);
    const reason = String(form.get('reason') ?? '').trim();
    if (!reason) {
      setActionError('Reason is required for permission override changes.');
      return;
    }
    await runAction(
      () => createSuperAdminPermissionOverride(selectedUserId, {
        permissionCode: String(form.get('permissionCode') ?? ''),
        allowed: String(form.get('allowed') ?? 'true') === 'true',
        tenantId: optionalFormValue(form, 'tenantId'),
        schoolId: optionalFormValue(form, 'schoolId'),
        reason,
      }, token),
      'Permission override saved and audited.',
      target,
    );
  }

  async function deactivateRole(user: AccessControlUser, roleAssignmentId: string) {
    await runAction(
      () => updateSuperAdminUserRole(user.userId, roleAssignmentId, { active: false, reason: 'Deactivated from Super Admin portal.' }, token),
      'Role assignment deactivated.',
    );
  }

  async function deleteRole(user: AccessControlUser, roleAssignmentId: string) {
    await runAction(
      () => deleteSuperAdminUserRole(user.userId, roleAssignmentId, token),
      'Role assignment removed.',
    );
  }

  async function revokeOverride(user: AccessControlUser, overrideId: string) {
    await runAction(
      () => updateSuperAdminPermissionOverride(user.userId, overrideId, { active: false, reason: 'Revoked from Super Admin portal.' }, token),
      'Permission override revoked.',
    );
  }

  async function deleteOverride(user: AccessControlUser, overrideId: string) {
    await runAction(
      () => deleteSuperAdminPermissionOverride(user.userId, overrideId, token),
      'Permission override removed.',
    );
  }

  async function saveTeacherAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const teacherUserId = String(form.get('teacherUserId') ?? '').trim();
    const assignmentId = String(form.get('assignmentId') ?? '').trim();
    const payload = {
      classSubjectAssignmentId: String(form.get('classSubjectAssignmentId') ?? '').trim(),
      sectionId: optionalFormValue(form, 'sectionId'),
      roleType: optionalFormValue(form, 'roleType'),
      active: form.get('active') === 'on',
      reason: optionalFormValue(form, 'reason'),
    };
    if (!teacherUserId) {
      setActionError('Teacher user ID is required.');
      return;
    }
    if (!assignmentId && !payload.classSubjectAssignmentId) {
      setActionError('Class-subject assignment ID is required when creating a teacher assignment.');
      return;
    }
    await runAction(
      () => assignmentId
        ? updateSuperAdminTeacherAssignment(teacherUserId, assignmentId, payload, token)
        : createSuperAdminTeacherAssignment(teacherUserId, payload, token),
      assignmentId ? 'Teacher assignment updated.' : 'Teacher assignment created.',
      target,
    );
  }

  async function removeTeacherAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const teacherUserId = String(form.get('teacherUserId') ?? '').trim();
    const assignmentId = String(form.get('assignmentId') ?? '').trim();
    if (!teacherUserId || !assignmentId) {
      setActionError('Teacher user ID and assignment ID are required to remove an assignment.');
      return;
    }
    await runAction(() => deleteSuperAdminTeacherAssignment(teacherUserId, assignmentId, token), 'Teacher assignment removed.', target);
  }

  async function saveGuardianLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const studentId = String(form.get('studentId') ?? '').trim();
    const guardianLinkId = String(form.get('guardianLinkId') ?? '').trim();
    const guardianUserId = String(form.get('guardianUserId') ?? '').trim();
    if (!studentId) {
      setActionError('Student ID is required for guardian links.');
      return;
    }
    if (!guardianLinkId && !guardianUserId) {
      setActionError('Guardian user ID is required when creating a guardian link.');
      return;
    }
    await runAction(
      () => guardianLinkId
        ? updateSuperAdminStudentGuardian(studentId, guardianLinkId, {
          relation: optionalFormValue(form, 'relation'),
          primaryContact: form.get('primaryContact') === 'on',
          canPickup: form.get('canPickup') === 'on',
          emergencyContact: form.get('emergencyContact') === 'on',
          active: form.get('active') === 'on',
        }, token)
        : linkSuperAdminStudentGuardian(studentId, {
          guardianUserId,
          relation: String(form.get('relation') ?? '').trim(),
          contactEmail: optionalFormValue(form, 'contactEmail'),
          contactMobile: optionalFormValue(form, 'contactMobile'),
          primaryContact: form.get('primaryContact') === 'on',
          canPickup: form.get('canPickup') === 'on',
          emergencyContact: form.get('emergencyContact') === 'on',
        }, token),
      guardianLinkId ? 'Guardian link updated.' : 'Guardian link created.',
      target,
    );
  }

  async function removeGuardianLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const studentId = String(form.get('studentId') ?? '').trim();
    const guardianLinkId = String(form.get('guardianLinkId') ?? '').trim();
    if (!studentId || !guardianLinkId) {
      setActionError('Student ID and guardian link ID are required to remove a guardian link.');
      return;
    }
    await runAction(() => deleteSuperAdminStudentGuardian(studentId, guardianLinkId, token), 'Guardian link removed.', target);
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Manage" title="Users & Roles" detail="Manage platform users, role assignments, school access, and permission overrides." />
      {message ? <p className="toast-message">{message}</p> : null}
      {actionError ? <PanelState title="Action blocked" detail={actionError} tone="error" /> : null}
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
        <input aria-label="Organization ID" defaultValue={query.tenantId} name="tenantId" placeholder="Organization ID" />
        <input aria-label="School ID" defaultValue={query.schoolId} name="schoolId" placeholder="School ID" />
        <select aria-label="Role filter" defaultValue={query.role} name="role">
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <select aria-label="Status filter" defaultValue={query.status} name="status">
          <option value="">All statuses</option>
          {['ACTIVE', 'INVITED', 'DISABLED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select
          aria-label="Page size"
          onChange={(event) => setQuery((current) => ({ ...current, size: Number(event.target.value), page: 0 }))}
          value={query.size}
        >
          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} rows</option>)}
        </select>
        <button type="submit">Apply filters</button>
      </form>
      <div className="super-admin-grid">
        <RemoteTable state={users} empty="No users match these filters.">
          {(data) => (
            <>
              <table className="super-admin-table">
                <thead><tr><th>User</th><th>Role</th><th>Organization</th><th>Status</th><th>MFA</th><th>Action</th></tr></thead>
                <tbody>
                  {data.items.map((user) => (
                    <tr key={user.userId}>
                      <td><strong>{user.displayName}</strong><span>{user.email}</span></td>
                      <td>{user.primaryRole}</td>
                      <td>{user.tenantName}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td>{user.mfaRequired ? 'Required' : 'Standard'}</td>
                      <td><button onClick={() => setSelectedUserId(user.userId)} type="button">View details</button></td>
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
              <div className="super-admin-tabs" role="tablist" aria-label="Access control detail tabs">
                {([
                  ['summary', 'Security'],
                  ['roles', 'Roles'],
                  ['overrides', 'Overrides'],
                  ['relationships', 'Assignments'],
                  ['audit', 'Recent audit'],
                ] as const).map(([id, label]) => (
                  <TabButton active={detailTab === id} key={id} onClick={() => setDetailTab(id)}>{label}</TabButton>
                ))}
              </div>
              {detailTab === 'summary' ? (
                <>
                  <div className="super-admin-card-grid">
                    <article className="super-admin-card"><h3>MFA</h3><p>{user.mfaRequired ? 'Required for this role' : 'Not required by current role policy'}</p></article>
                    <article className="super-admin-card"><h3>Session status</h3><p>{user.activatedAt ? `Activated ${dateLabel(user.activatedAt)}` : 'Invitation not activated'}</p></article>
                    <article className="super-admin-card"><h3>Schools</h3><p>{user.schoolAccess.length} school grants</p></article>
                  </div>
                  <table className="super-admin-table">
                    <thead><tr><th>School</th><th>Role</th><th>Primary</th></tr></thead>
                    <tbody>
                      {user.schoolAccess.length === 0 ? <tr><td colSpan={3}>No school access grants.</td></tr> : null}
                      {user.schoolAccess.map((access) => (
                        <tr key={`${access.schoolId}-${access.role}`}>
                          <td>{access.schoolName}</td>
                          <td>{access.role}</td>
                          <td>{access.primaryAccess ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : null}
              {detailTab === 'roles' ? (
                <>
                  <form className="super-admin-form" onSubmit={(event) => void assignRole(event)}>
                    <h3>Assign role</h3>
                    <select name="role" required>
                      {ROLE_OPTIONS.filter((role) => role !== 'STAFF').map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <input defaultValue={user.tenantId} name="tenantId" placeholder="Organization ID" />
                    <input name="schoolId" placeholder="School ID for school roles" />
                    <input name="reason" placeholder="Reason" />
                    <label className="inline-check"><input name="primaryRole" type="checkbox" /> Make primary login role</label>
                    <button type="submit">Assign role</button>
                  </form>
                  <div className="super-admin-inline-controls">
                    <select aria-label="Preview role permissions" onChange={(event) => setRolePermissionRole(event.target.value)} value={rolePermissionRole}>
                      {ROLE_OPTIONS.filter((role) => role !== 'STAFF').map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <span>{rolePermissionRole} permission preview</span>
                  </div>
                  <RemoteList state={rolePermissions} empty="No permissions are mapped to this role.">
                    {(items) => (
                      <div className="super-admin-records">
                        {items.slice(0, 8).map((permission) => (
                          <div key={permission.code}>
                            <strong>{permission.code}</strong>
                            <span>{permission.name} - {permission.scopeType}</span>
                            <em>{permission.riskLevel}</em>
                          </div>
                        ))}
                      </div>
                    )}
                  </RemoteList>
                  <RemoteList state={selectedRoles} empty="No role assignments for this user.">
                    {(items) => <RoleAssignmentsTable items={items} onDeactivate={(id) => void deactivateRole(user, id)} onDelete={(id) => void deleteRole(user, id)} />}
                  </RemoteList>
                </>
              ) : null}
              {detailTab === 'overrides' ? (
                <>
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
                    <input defaultValue={user.tenantId} name="tenantId" placeholder="Organization ID" />
                    <input name="schoolId" placeholder="School ID optional" />
                    <input name="reason" placeholder="Required reason" required />
                    <button type="submit">Save override</button>
                  </form>
                  <RemoteList state={selectedOverrides} empty="No permission overrides for this user.">
                    {(items) => <PermissionOverridesTable items={items} onDelete={(id) => void deleteOverride(user, id)} onRevoke={(id) => void revokeOverride(user, id)} />}
                  </RemoteList>
                </>
              ) : null}
              {detailTab === 'relationships' ? (
                <div className="super-admin-grid">
                  <form className="super-admin-form" onSubmit={(event) => void saveTeacherAssignment(event)}>
                    <h3>Teacher assignment</h3>
                    <input defaultValue={user.userId} name="teacherUserId" placeholder="Teacher user ID" required />
                    <input name="assignmentId" placeholder="Assignment ID to update" />
                    <input name="classSubjectAssignmentId" placeholder="Class-subject assignment ID" />
                    <input name="sectionId" placeholder="Section ID optional" />
                    <input defaultValue="SUBJECT_TEACHER" name="roleType" placeholder="Role type" />
                    <input name="reason" placeholder="Reason" />
                    <label className="inline-check"><input defaultChecked name="active" type="checkbox" /> Active</label>
                    <button type="submit">Save assignment</button>
                  </form>
                  <form className="super-admin-form" onSubmit={(event) => void removeTeacherAssignment(event)}>
                    <h3>Remove teacher assignment</h3>
                    <input defaultValue={user.userId} name="teacherUserId" placeholder="Teacher user ID" required />
                    <input name="assignmentId" placeholder="Assignment ID" required />
                    <button type="submit">Remove assignment</button>
                  </form>
                  <form className="super-admin-form" onSubmit={(event) => void saveGuardianLink(event)}>
                    <h3>Guardian link</h3>
                    <input name="studentId" placeholder="Student ID" required />
                    <input name="guardianLinkId" placeholder="Guardian link ID to update" />
                    <input defaultValue={user.userId} name="guardianUserId" placeholder="Guardian user ID" />
                    <input defaultValue="GUARDIAN" name="relation" placeholder="Relation" required />
                    <input name="contactEmail" placeholder="Contact email" type="email" />
                    <input name="contactMobile" placeholder="Contact mobile" />
                    <label className="inline-check"><input name="primaryContact" type="checkbox" /> Primary</label>
                    <label className="inline-check"><input name="canPickup" type="checkbox" /> Pickup</label>
                    <label className="inline-check"><input name="emergencyContact" type="checkbox" /> Emergency</label>
                    <label className="inline-check"><input defaultChecked name="active" type="checkbox" /> Active</label>
                    <button type="submit">Save guardian</button>
                  </form>
                  <form className="super-admin-form" onSubmit={(event) => void removeGuardianLink(event)}>
                    <h3>Remove guardian link</h3>
                    <input name="studentId" placeholder="Student ID" required />
                    <input name="guardianLinkId" placeholder="Guardian link ID" required />
                    <button type="submit">Remove guardian</button>
                  </form>
                </div>
              ) : null}
              {detailTab === 'audit' ? (
                <RemoteTable state={selectedAudit} empty="No recent organization audit rows for this user context.">
                  {(data) => (
                    <table className="super-admin-table">
                      <thead><tr><th>Action</th><th>Actor</th><th>Entity</th><th>When</th></tr></thead>
                      <tbody>
                        {data.items.map((log) => (
                          <tr key={log.auditLogId}>
                            <td><strong>{log.action}</strong><span>{log.summary}</span></td>
                            <td>{log.actorType}</td>
                            <td>{log.entityType}</td>
                            <td>{dateLabel(log.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </RemoteTable>
              ) : null}
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

function RoleAssignmentsTable({
  items,
  onDeactivate,
  onDelete,
}: {
  items: UserRoleAssignment[];
  onDeactivate: (roleAssignmentId: string) => void;
  onDelete: (roleAssignmentId: string) => void;
}) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Role</th><th>Scope</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {items.map((role) => (
          <tr key={role.roleAssignmentId}>
            <td><strong>{role.role}</strong><span>{role.reason ?? 'No reason recorded'}</span></td>
            <td>{role.schoolName ?? role.tenantName ?? role.scopeType}</td>
            <td>{role.expiresAt ? `Expires ${dateLabel(role.expiresAt)}` : 'No expiry'}</td>
            <td><StatusBadge status={role.active ? 'ACTIVE' : 'INACTIVE'} /></td>
            <td>
              <button disabled={!role.active} onClick={() => onDeactivate(role.roleAssignmentId)} type="button">Patch deactivate</button>
              <button disabled={!role.active} onClick={() => onDelete(role.roleAssignmentId)} type="button">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PermissionOverridesTable({
  items,
  onDelete,
  onRevoke,
}: {
  items: PermissionOverride[];
  onDelete: (overrideId: string) => void;
  onRevoke: (overrideId: string) => void;
}) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Permission</th><th>Decision</th><th>Scope</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {items.map((override) => (
          <tr key={override.overrideId}>
            <td><strong>{override.permissionCode}</strong><span>{override.reason ?? 'No reason'}</span></td>
            <td>{override.allowed ? 'Grant' : 'Deny'}</td>
            <td>{override.schoolName ?? override.tenantName ?? override.scopeType}</td>
            <td><StatusBadge status={override.active ? 'ACTIVE' : 'INACTIVE'} /></td>
            <td>
              <button disabled={!override.active} onClick={() => onRevoke(override.overrideId)} type="button">Patch revoke</button>
              <button disabled={!override.active} onClick={() => onDelete(override.overrideId)} type="button">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SubscriptionPlans({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const plans = useLoader(() => listSuperAdminSubscriptionPlans(token), [token, refreshKey]);
  const [activeTab, setActiveTab] = useState<'plans' | 'tenant'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [planErrors, setPlanErrors] = useState<PlanFormErrors>({});
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const tenantSubscription = useLoader(
    () => selectedTenantId ? getSuperAdminTenantSubscription(selectedTenantId, token) : Promise.resolve(null),
    [selectedTenantId, token, refreshKey],
  );
  const tenantInvoices = useLoader(
    () => selectedTenantId ? listSuperAdminTenantSubscriptionInvoices(selectedTenantId, token) : Promise.resolve([]),
    [selectedTenantId, token, refreshKey],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!planDrawerOpen || typeof document === 'undefined') {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePlanDrawer();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [planDrawerOpen, planSubmitting]);

  function openCreatePlan() {
    setSelectedPlan(null);
    setPlanErrors({});
    setActionError(null);
    setPlanDrawerOpen(true);
  }

  function openEditPlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setPlanErrors({});
    setActionError(null);
    setPlanDrawerOpen(true);
  }

  function closePlanDrawer() {
    if (planSubmitting) {
      return;
    }
    setPlanDrawerOpen(false);
    setSelectedPlan(null);
    setPlanErrors({});
  }

  function selectSubscriptionTab(tab: 'plans' | 'tenant') {
    setActiveTab(tab);
    if (tab !== 'plans') {
      closePlanDrawer();
    }
  }

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const validation = validatePlanForm(form);
    setPlanErrors(validation.errors);
    if (!validation.valid) {
      setActionError('Please fix the highlighted plan fields.');
      return;
    }
    setPlanSubmitting(true);
    try {
      const success = await runSubscriptionAction(
        () => createSuperAdminSubscriptionPlan(planPayloadFromForm(form), token),
        'Subscription plan created.',
        target,
      );
      if (success) {
        setPlanDrawerOpen(false);
        setSelectedPlan(null);
        setPlanErrors({});
      }
    } finally {
      setPlanSubmitting(false);
    }
  }

  async function updatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    const target = event.currentTarget;
    const form = new FormData(target);
    const validation = validatePlanForm(form);
    setPlanErrors(validation.errors);
    if (!validation.valid) {
      setActionError('Please fix the highlighted plan fields.');
      return;
    }
    setPlanSubmitting(true);
    try {
      const success = await runSubscriptionAction(
        () => updateSuperAdminSubscriptionPlan(selectedPlan.id, planPayloadFromForm(form), token),
        'Subscription plan updated.',
      );
      if (success) {
        setPlanDrawerOpen(false);
        setSelectedPlan(null);
        setPlanErrors({});
      }
    } finally {
      setPlanSubmitting(false);
    }
  }

  async function loadTenantSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTenantId = tenantId.trim();
    if (!nextTenantId) {
      setActionError('Organization ID is required to inspect a subscription.');
      return;
    }
    setActionError(null);
    setSelectedTenantId(nextTenantId);
  }

  async function assignTenantSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const targetTenantId = String(form.get('tenantId') ?? '').trim();
    const planCode = String(form.get('planCode') ?? '').trim();
    if (!targetTenantId || !planCode) {
      setActionError('Organization ID and plan code are required to assign a subscription.');
      return;
    }
    await runSubscriptionAction(
      () => assignSuperAdminTenantSubscription(targetTenantId, {
        planCode,
        billingCycle: optionalFormValue(form, 'billingCycle') ?? 'MONTHLY',
        currentPeriodStart: dateTimeFormValue(form, 'currentPeriodStart'),
        currentPeriodEnd: dateTimeFormValue(form, 'currentPeriodEnd'),
        issueInvoice: form.get('issueInvoice') === 'on',
        invoiceDueAt: dateTimeFormValue(form, 'invoiceDueAt'),
      }, token),
      'Organization subscription assigned.',
      target,
    );
    setTenantId(targetTenantId);
    setSelectedTenantId(targetTenantId);
  }

  async function runSubscriptionAction(action: () => Promise<unknown>, success: string, form?: HTMLFormElement) {
    setActionError(null);
    try {
      await action();
      setMessage(success);
      form?.reset();
      onRefresh();
      return true;
    } catch (caught) {
      setActionError(errorMessage(caught));
      return false;
    }
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle
        eyebrow="Business"
        title="Plans"
        detail="Define packages, limits, billing cycles, and customer subscription options."
        action={<button onClick={openCreatePlan} type="button">Create plan</button>}
      />
      {message ? <p className="toast-message" role="status">{message}</p> : null}
      {actionError && !planDrawerOpen ? <p className="toast-message error" role="alert">{actionError}</p> : null}
      <div className="super-admin-tabs" role="tablist" aria-label="Subscription tabs">
        <TabButton active={activeTab === 'plans'} onClick={() => selectSubscriptionTab('plans')}>Plans</TabButton>
        <TabButton active={activeTab === 'tenant'} onClick={() => selectSubscriptionTab('tenant')}>Organization subscription</TabButton>
      </div>

      {activeTab === 'plans' ? (
        <>
          {plans.status === 'ready' ? <SubscriptionPlanOverview items={plans.data ?? []} /> : null}
          <RemoteList state={plans} empty="No subscription plans yet.">
            {(items) => (
              <section className="super-admin-table-card" aria-labelledby="plan-catalog-title">
                <div className="super-admin-section-heading">
                  <div>
                    <h3 id="plan-catalog-title">Plan catalog</h3>
                    <span>{items.length} package{items.length === 1 ? '' : 's'} configured</span>
                  </div>
                  <button onClick={openCreatePlan} type="button">Create plan</button>
                </div>
                <SubscriptionPlanTable items={items} onSelect={openEditPlan} />
              </section>
            )}
          </RemoteList>
          {plans.status === 'ready' && (plans.data?.length ?? 0) === 0 ? (
            <div className="super-admin-empty-action">
              <button onClick={openCreatePlan} type="button">Create first plan</button>
            </div>
          ) : null}
          {planDrawerOpen ? (
            <SubscriptionPlanDrawer
              errors={planErrors}
              onClose={closePlanDrawer}
              onSubmit={selectedPlan ? updatePlan : createPlan}
              plan={selectedPlan}
              submitting={planSubmitting}
              submitError={actionError}
            />
          ) : null}
        </>
      ) : null}

      {activeTab === 'tenant' ? (
        <div className="super-admin-grid">
          <div>
            <form className="super-admin-form" onSubmit={(event) => void loadTenantSubscription(event)}>
              <h3>Inspect organization</h3>
              <input
                name="tenantId"
                onChange={(event) => setTenantId(event.target.value)}
                placeholder="Organization ID"
                required
                value={tenantId}
              />
              <button type="submit">Load subscription</button>
            </form>
            <TenantSubscriptionForm
              onSubmit={assignTenantSubscription}
              plans={plans.data ?? []}
              subscription={tenantSubscription.data}
              tenantId={selectedTenantId ?? tenantId}
            />
          </div>
          <div>
            {selectedTenantId ? (
              <>
                <RemoteData state={tenantSubscription}>
                  {(subscription) => subscription
                    ? <TenantSubscriptionSummary subscription={subscription} />
                    : <PanelState title="Organization subscription" detail="No subscription data returned for this organization." />}
                </RemoteData>
                <RemoteList state={tenantInvoices} empty="No subscription invoices have been issued for this organization.">
                  {(items) => <TenantSubscriptionInvoiceTable items={items} />}
                </RemoteList>
              </>
            ) : (
              <PanelState title="Organization subscription" detail="Load an organization to inspect assignment, usage limits and invoice history." />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SubscriptionPlanOverview({ items }: { items: SubscriptionPlan[] }) {
  const activePlans = items.filter((plan) => plan.status === 'ACTIVE');
  const archivedPlans = items.filter((plan) => plan.status === 'ARCHIVED');
  const monthlyPrices = activePlans.map((plan) => plan.monthlyPriceCents).filter((price) => price > 0);
  const annualPrices = activePlans.map((plan) => plan.annualPriceCents).filter((price) => price > 0);
  return (
    <div className="super-admin-plan-stats" aria-label="Plan summary">
      <article>
        <span>Total plans</span>
        <strong>{items.length}</strong>
        <em>{activePlans.length} active</em>
      </article>
      <article>
        <span>Archived</span>
        <strong>{archivedPlans.length}</strong>
        <em>Hidden from new assignments</em>
      </article>
      <article>
        <span>Monthly from</span>
        <strong>{monthlyPrices.length > 0 ? money(Math.min(...monthlyPrices)) : money(0)}</strong>
        <em>Lowest active plan</em>
      </article>
      <article>
        <span>Annual from</span>
        <strong>{annualPrices.length > 0 ? money(Math.min(...annualPrices)) : money(0)}</strong>
        <em>Lowest active plan</em>
      </article>
    </div>
  );
}

function SubscriptionPlanTable({ items, onSelect }: { items: SubscriptionPlan[]; onSelect: (plan: SubscriptionPlan) => void }) {
  return (
    <div className="super-admin-table-shell" role="region" aria-label="Plans table" tabIndex={0}>
      <table className="super-admin-table plans-table">
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Limits</th>
            <th scope="col">Billing</th>
            <th scope="col">Status</th>
            <th scope="col">Updated</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((plan) => (
            <tr key={plan.id}>
              <td>
                <strong>{plan.name}</strong>
                <span>{plan.code}</span>
                {plan.description ? <em>{plan.description}</em> : null}
              </td>
              <td>
                <div className="plan-limit-list">
                  <span>{plan.maxSchools} schools</span>
                  <span>{plan.maxStudents} students</span>
                  <span>{plan.maxStaff} staff</span>
                </div>
              </td>
              <td>
                <strong>{money(plan.monthlyPriceCents)} / mo</strong>
                <span>{money(plan.annualPriceCents)} / yr</span>
                <span>{plan.currency}</span>
              </td>
              <td><StatusBadge status={plan.status} /></td>
              <td>{dateLabel(plan.updatedAt)}</td>
              <td className="super-admin-table-actions">
                <button onClick={() => onSelect(plan)} type="button">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionPlanDrawer({
  errors,
  onClose,
  onSubmit,
  plan,
  submitting,
  submitError,
}: {
  errors: PlanFormErrors;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  plan: SubscriptionPlan | null;
  submitting: boolean;
  submitError: string | null;
}) {
  const titleId = useId();
  return (
    <div className="super-admin-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button className="super-admin-drawer-backdrop" aria-label="Close plan drawer" onClick={onClose} type="button" />
      <aside className="super-admin-drawer-panel">
        <header className="super-admin-drawer-header">
          <div>
            <p className="eyebrow">Subscription plan</p>
            <h3 id={titleId}>{plan ? 'Edit plan' : 'Create plan'}</h3>
            <span>{plan ? plan.code : 'New package'}</span>
          </div>
          <button className="secondary" disabled={submitting} onClick={onClose} type="button">Close</button>
        </header>
        <form className="super-admin-plan-form" noValidate onSubmit={(event) => onSubmit(event)}>
          <div className="super-admin-drawer-body">
            {submitError ? <p className="toast-message error" role="alert">{submitError}</p> : null}
            <fieldset className="plan-form-section">
              <legend>Basic details</legend>
              <PlanTextField
                error={errors.code}
                field="code"
                hint="Use uppercase letters, numbers, hyphens or underscores."
                label="Plan code"
                placeholder="ENTERPRISE_PLUS"
                required
                defaultValue={plan?.code ?? ''}
              />
              <PlanTextField
                error={errors.name}
                field="name"
                label="Plan name"
                placeholder="Enterprise Plus"
                required
                defaultValue={plan?.name ?? ''}
              />
              <PlanTextField
                error={errors.description}
                field="description"
                label="Description"
                placeholder="Best for multi-school groups"
                textarea
                defaultValue={plan?.description ?? ''}
              />
            </fieldset>
            <fieldset className="plan-form-section">
              <legend>Limits</legend>
              <div className="plan-form-grid">
                <PlanTextField
                  error={errors.maxSchools}
                  field="maxSchools"
                  label="Schools"
                  min={1}
                  placeholder="10"
                  required
                  type="number"
                  defaultValue={plan?.maxSchools ?? 1}
                />
                <PlanTextField
                  error={errors.maxStudents}
                  field="maxStudents"
                  label="Students"
                  min={0}
                  placeholder="5000"
                  required
                  type="number"
                  defaultValue={plan?.maxStudents ?? 0}
                />
                <PlanTextField
                  error={errors.maxStaff}
                  field="maxStaff"
                  label="Staff"
                  min={0}
                  placeholder="500"
                  required
                  type="number"
                  defaultValue={plan?.maxStaff ?? 0}
                />
              </div>
            </fieldset>
            <fieldset className="plan-form-section">
              <legend>Billing</legend>
              <div className="plan-form-grid">
                <PlanTextField
                  error={errors.monthlyPriceCents}
                  field="monthlyPriceCents"
                  hint="Enter cents. Example: 25000 = $250."
                  label="Monthly price"
                  min={0}
                  placeholder="25000"
                  required
                  type="number"
                  defaultValue={plan?.monthlyPriceCents ?? 0}
                />
                <PlanTextField
                  error={errors.annualPriceCents}
                  field="annualPriceCents"
                  hint="Enter cents. Example: 250000 = $2,500."
                  label="Annual price"
                  min={0}
                  placeholder="250000"
                  required
                  type="number"
                  defaultValue={plan?.annualPriceCents ?? 0}
                />
                <PlanTextField
                  error={errors.currency}
                  field="currency"
                  label="Currency"
                  maxLength={3}
                  minLength={3}
                  placeholder="USD"
                  required
                  defaultValue={plan?.currency ?? 'USD'}
                />
              </div>
            </fieldset>
            <fieldset className="plan-form-section">
              <legend>Status</legend>
              <PlanSelectField error={errors.status} field="status" label="Plan status" required defaultValue={plan?.status ?? 'ACTIVE'}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </PlanSelectField>
            </fieldset>
          </div>
          <footer className="super-admin-drawer-footer">
            <button className="secondary" disabled={submitting} onClick={onClose} type="button">Cancel</button>
            <button disabled={submitting} type="submit">{submitting ? 'Saving...' : plan ? 'Save plan' : 'Create plan'}</button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

function PlanTextField({
  defaultValue,
  error,
  field,
  hint,
  label,
  maxLength,
  min,
  minLength,
  placeholder,
  required = false,
  textarea = false,
  type = 'text',
}: {
  defaultValue: string | number;
  error?: string;
  field: PlanFormField;
  hint?: string;
  label: string;
  maxLength?: number;
  min?: number;
  minLength?: number;
  placeholder: string;
  required?: boolean;
  textarea?: boolean;
  type?: string;
}) {
  const inputId = `plan-${field}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="plan-form-field">
      <label htmlFor={inputId}>{label}{required ? <span aria-hidden="true">*</span> : null}</label>
      {textarea ? (
        <textarea
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          defaultValue={defaultValue}
          id={inputId}
          name={field}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          defaultValue={defaultValue}
          id={inputId}
          maxLength={maxLength}
          min={min}
          minLength={minLength}
          name={field}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      )}
      {hint ? <small id={hintId}>{hint}</small> : null}
      {error ? <em id={errorId}>{error}</em> : null}
    </div>
  );
}

function PlanSelectField({
  children,
  defaultValue,
  error,
  field,
  label,
  required = false,
}: {
  children: ReactNode;
  defaultValue: string;
  error?: string;
  field: PlanFormField;
  label: string;
  required?: boolean;
}) {
  const inputId = `plan-${field}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="plan-form-field">
      <label htmlFor={inputId}>{label}{required ? <span aria-hidden="true">*</span> : null}</label>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        defaultValue={defaultValue}
        id={inputId}
        name={field}
        required={required}
      >
        {children}
      </select>
      {error ? <em id={errorId}>{error}</em> : null}
    </div>
  );
}

function TenantSubscriptionForm({
  onSubmit,
  plans,
  subscription,
  tenantId,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  plans: SubscriptionPlan[];
  subscription: TenantSubscription | null;
  tenantId: string;
}) {
  const activePlanCodes = plans.filter((plan) => plan.status === 'ACTIVE').map((plan) => plan.code);
  const currentPlanCode = subscription?.planCode;
  const planCodes = Array.from(new Set([currentPlanCode, ...activePlanCodes].filter((code): code is string => Boolean(code))));
  return (
    <form className="super-admin-form" key={subscription?.tenantId ?? tenantId} onSubmit={(event) => onSubmit(event)}>
      <h3>Assign subscription</h3>
      <input defaultValue={subscription?.tenantId ?? tenantId} name="tenantId" placeholder="Organization ID" required />
      {planCodes.length > 0 ? (
        <select defaultValue={currentPlanCode ?? planCodes[0]} name="planCode">
          {planCodes.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      ) : (
        <input name="planCode" placeholder="Plan code" required />
      )}
      <select defaultValue={subscription?.billingCycle ?? 'MONTHLY'} name="billingCycle">
        <option value="MONTHLY">MONTHLY</option>
        <option value="ANNUAL">ANNUAL</option>
      </select>
      <input defaultValue={dateInputValue(subscription?.currentPeriodStart)} name="currentPeriodStart" type="date" />
      <input defaultValue={dateInputValue(subscription?.currentPeriodEnd)} name="currentPeriodEnd" type="date" />
      <input name="invoiceDueAt" type="date" />
      <label className="inline-check"><input defaultChecked name="issueInvoice" type="checkbox" /> Issue invoice</label>
      <button type="submit">Assign subscription</button>
    </form>
  );
}

function TenantSubscriptionSummary({ subscription }: { subscription: TenantSubscription }) {
  return (
    <article className="super-admin-card wide">
      <h3>{subscription.tenantName}</h3>
      <div className="super-admin-card-grid">
        <article className="super-admin-card"><h3>Plan</h3><p>{subscription.planName ?? 'Not assigned'}</p></article>
        <article className="super-admin-card"><h3>Status</h3><p>{subscription.subscriptionStatus ?? 'UNASSIGNED'}</p></article>
        <article className="super-admin-card"><h3>Schools</h3><p>{subscription.schoolsUsed}/{subscription.maxSchools} used</p></article>
      </div>
      <table className="super-admin-table">
        <tbody>
          <tr><th>Organization</th><td>{subscription.tenantCode} - {subscription.tenantStatus}</td></tr>
          <tr><th>Billing cycle</th><td>{subscription.billingCycle ?? 'Not assigned'}</td></tr>
          <tr><th>Period</th><td>{subscription.currentPeriodStart ? dateLabel(subscription.currentPeriodStart) : 'Not started'} to {subscription.currentPeriodEnd ? dateLabel(subscription.currentPeriodEnd) : 'open'}</td></tr>
          <tr><th>Remaining schools</th><td>{subscription.remainingSchools}</td></tr>
          <tr><th>Last assigned</th><td>{subscription.assignedAt ? dateLabel(subscription.assignedAt) : 'No assignment recorded'}</td></tr>
        </tbody>
      </table>
    </article>
  );
}

function TenantSubscriptionInvoiceTable({ items }: { items: Array<NonNullable<TenantSubscription['invoice']>> }) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Invoice</th><th>Plan</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
      <tbody>
        {items.map((invoice) => (
          <tr key={invoice.id}>
            <td><strong>{invoice.invoiceNumber}</strong><span>{dateLabel(invoice.issuedAt)}</span></td>
            <td>{invoice.planCode}</td>
            <td>{money(invoice.amountCents)}</td>
            <td><StatusBadge status={invoice.status} /></td>
            <td>{invoice.dueAt ? dateLabel(invoice.dueAt) : 'No due date'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function planPayloadFromForm(form: FormData): Partial<SubscriptionPlan> {
  return {
    code: String(form.get('code') ?? '').trim(),
    name: String(form.get('name') ?? '').trim(),
    description: optionalFormValue(form, 'description'),
    status: String(form.get('status') ?? 'ACTIVE'),
    maxSchools: Number(form.get('maxSchools') ?? 1),
    maxStudents: Number(form.get('maxStudents') ?? 0),
    maxStaff: Number(form.get('maxStaff') ?? 0),
    monthlyPriceCents: Number(form.get('monthlyPriceCents') ?? 0),
    annualPriceCents: Number(form.get('annualPriceCents') ?? 0),
    currency: String(form.get('currency') ?? 'USD').trim().toUpperCase(),
  };
}

function validatePlanForm(form: FormData): { errors: PlanFormErrors; valid: boolean } {
  const errors: PlanFormErrors = {};
  const code = String(form.get('code') ?? '').trim();
  const name = String(form.get('name') ?? '').trim();
  const currency = String(form.get('currency') ?? '').trim().toUpperCase();
  const maxSchools = Number(form.get('maxSchools') ?? 0);
  const maxStudents = Number(form.get('maxStudents') ?? 0);
  const maxStaff = Number(form.get('maxStaff') ?? 0);
  const monthlyPriceCents = Number(form.get('monthlyPriceCents') ?? -1);
  const annualPriceCents = Number(form.get('annualPriceCents') ?? -1);
  const status = String(form.get('status') ?? '');

  if (!code) {
    errors.code = 'Plan code is required.';
  } else if (!/^[A-Z0-9_-]+$/.test(code)) {
    errors.code = 'Enter uppercase letters, numbers, hyphens, or underscores only.';
  }
  if (!name) {
    errors.name = 'Plan name is required.';
  }
  if (!Number.isFinite(maxSchools) || maxSchools < 1) {
    errors.maxSchools = 'Allow at least one school.';
  }
  if (!Number.isFinite(maxStudents) || maxStudents < 0) {
    errors.maxStudents = 'Students cannot be negative.';
  }
  if (!Number.isFinite(maxStaff) || maxStaff < 0) {
    errors.maxStaff = 'Staff cannot be negative.';
  }
  if (!Number.isFinite(monthlyPriceCents) || monthlyPriceCents < 0) {
    errors.monthlyPriceCents = 'Monthly price cannot be negative.';
  }
  if (!Number.isFinite(annualPriceCents) || annualPriceCents < 0) {
    errors.annualPriceCents = 'Annual price cannot be negative.';
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Use a 3-letter currency code.';
  }
  if (!['ACTIVE', 'ARCHIVED'].includes(status)) {
    errors.status = 'Choose a valid plan status.';
  }

  return { errors, valid: Object.keys(errors).length === 0 };
}

function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function dateTimeFormValue(form: FormData, name: string) {
  const value = optionalFormValue(form, name);
  return value ? `${value}T00:00:00Z` : undefined;
}

function RevenuePanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const revenue = useLoader(() => getSuperAdminRevenue(token), [token, refreshKey]);
  const trends = useLoader(() => getSuperAdminRevenueTrends(token), [token, refreshKey]);
  const tenantRevenue = useLoader(() => getSuperAdminTenantRevenue(token), [token, refreshKey]);
  const [query, setQuery] = useState({ page: 0, size: 25, status: '', tenantId: '', from: '', to: '' });
  const [tenantQuery, setTenantQuery] = useState({ page: 0, size: 10, search: '', status: '' });
  const invoices = useLoader(() => listSuperAdminInvoices(query, token), [token, refreshKey, query.page, query.size, query.status, query.tenantId, query.from, query.to]);
  const tenantRevenuePage = pageLocalRows(
    (tenantRevenue.data?.tenantBreakdown ?? []).filter((row) => {
      const matchesSearch = !tenantQuery.search || `${row.label} ${row.id}`.toLowerCase().includes(tenantQuery.search.toLowerCase());
      const matchesStatus = !tenantQuery.status || row.invoiceCount > 0;
      return matchesSearch && matchesStatus;
    }),
    tenantQuery.page,
    tenantQuery.size,
  );
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Business" title="Revenue" detail="Track invoices, MRR, ARR, overdue payments, and customer billing." />
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
          </>
        )}
      </RemoteData>
      <RemoteData state={trends}>
        {(data) => <TrendCard title="Monthly invoice trend" points={data.monthlyTrend} formatter={money} />}
      </RemoteData>
      <QueryControls
        compact
        includeDates
        includeTenant
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['ISSUED', 'PENDING', 'PAID', 'OVERDUE', 'FAILED', 'CANCELLED', 'VOID']}
        values={query}
      />
      <RemoteTable state={invoices} empty="No invoices issued yet.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Invoice</th><th>Organization</th><th>Plan</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>{data.items.map((invoice) => <InvoiceRow invoice={invoice} key={invoice.invoiceId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
      <PanelTitle eyebrow="Revenue by customer" title="Customer revenue" detail="Organization-level invoice totals from the revenue API." />
      <QueryControls
        compact
        onApply={(next) => setTenantQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setTenantQuery((current) => ({ ...current, size, page: 0 }))}
        searchPlaceholder="Search customer revenue"
        statusOptions={['INVOICED']}
        values={tenantQuery}
      />
      <TenantRevenueTable data={tenantRevenuePage} onPageChange={(page) => setTenantQuery((current) => ({ ...current, page }))} />
    </section>
  );
}

function AiUsagePanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [activeTab, setActiveTab] = useState<'usage' | 'entitlements' | 'policies' | 'recommendations' | 'rules' | 'runs' | 'safety'>('usage');
  const usage = useLoader(() => getSuperAdminAiUsage(token), [token, refreshKey]);
  const tenantUsage = useLoader(() => listSuperAdminAiTenantUsage(token), [token, refreshKey]);
  const entitlements = useLoader(() => listSuperAdminAiEntitlements(token), [token, refreshKey]);
  const [recommendationQuery, setRecommendationQuery] = useState({ page: 0, size: 25, tenantId: '', schoolId: '', status: '', type: '', riskLevel: '' });
  const [ruleQuery, setRuleQuery] = useState({ page: 0, size: 25, tenantId: '', schoolId: '', enabled: '' });
  const [runQuery, setRunQuery] = useState({ page: 0, size: 25, tenantId: '', schoolId: '', status: '' });
  const [policyQuery, setPolicyQuery] = useState({ page: 0, size: 25, tenantId: '' });
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  const [selectedEntitlementTenantId, setSelectedEntitlementTenantId] = useState<string | null>(null);
  const [selectedPolicyTenantId, setSelectedPolicyTenantId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const recommendations = useLoader(() => listSuperAdminAiRecommendations(recommendationQuery, token), [
    token,
    refreshKey,
    recommendationQuery.page,
    recommendationQuery.size,
    recommendationQuery.tenantId,
    recommendationQuery.schoolId,
    recommendationQuery.status,
    recommendationQuery.type,
    recommendationQuery.riskLevel,
  ]);
  const selectedRecommendation = useLoader(
    () => selectedRecommendationId ? getSuperAdminAiRecommendation(selectedRecommendationId, token) : Promise.resolve(null),
    [selectedRecommendationId, token, refreshKey],
  );
  const rules = useLoader(() => listSuperAdminAutomationRules(ruleQuery, token), [
    token,
    refreshKey,
    ruleQuery.page,
    ruleQuery.size,
    ruleQuery.tenantId,
    ruleQuery.schoolId,
    ruleQuery.enabled,
  ]);
  const runs = useLoader(() => listSuperAdminAutomationRuns(runQuery, token), [
    token,
    refreshKey,
    runQuery.page,
    runQuery.size,
    runQuery.tenantId,
    runQuery.schoolId,
    runQuery.status,
  ]);
  const policies = useLoader(() => listSuperAdminAiPolicies(policyQuery, token), [
    token,
    refreshKey,
    policyQuery.page,
    policyQuery.size,
    policyQuery.tenantId,
  ]);
  const selectedEntitlement = useLoader(
    () => selectedEntitlementTenantId ? getSuperAdminAiEntitlement(selectedEntitlementTenantId, token) : Promise.resolve(null),
    [selectedEntitlementTenantId, token, refreshKey],
  );
  const selectedPolicy = useLoader(
    () => selectedPolicyTenantId ? getSuperAdminAiPolicy(selectedPolicyTenantId, token) : Promise.resolve(null),
    [selectedPolicyTenantId, token, refreshKey],
  );

  async function runAction(action: () => Promise<unknown>, success: string, form?: HTMLFormElement) {
    setActionError(null);
    try {
      await action();
      setMessage(success);
      form?.reset();
    } catch (caught) {
      setActionError(errorMessage(caught));
    }
  }

  async function approve(item: AiRecommendation) {
    await runAction(() => approveSuperAdminAiRecommendation(item.recommendationId, token), 'Recommendation approved and audited.');
  }

  async function reject(item: AiRecommendation) {
    const reason = globalThis.prompt('Reason for rejection');
    if (!reason) return;
    await runAction(() => rejectSuperAdminAiRecommendation(item.recommendationId, reason, token), 'Recommendation rejected and audited.');
  }

  async function execute(item: AiRecommendation) {
    if ((item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL') && !globalThis.confirm(`Execute ${item.riskLevel} AI recommendation?`)) {
      return;
    }
    await runAction(() => executeSuperAdminAiRecommendation(item.recommendationId, token), 'Approved recommendation execution requested.');
  }

  async function createRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    await runAction(
      () => createSuperAdminAiRecommendation({
        tenantId: String(form.get('tenantId') ?? '').trim(),
        schoolId: optionalFormValue(form, 'schoolId'),
        targetType: optionalFormValue(form, 'targetType') ?? 'GENERAL',
        targetId: optionalFormValue(form, 'targetId'),
        recommendationType: String(form.get('recommendationType') ?? 'PLATFORM_HEALTH_INSIGHT'),
        title: String(form.get('title') ?? '').trim(),
        summary: String(form.get('summary') ?? '').trim(),
        rationale: optionalFormValue(form, 'rationale'),
        riskLevel: String(form.get('riskLevel') ?? 'MEDIUM'),
        status: 'PENDING_REVIEW',
        createdByActorType: 'SUPER_ADMIN',
        approvalRequired: form.get('approvalRequired') === 'on',
        metadataJson: String(form.get('metadataJson') ?? '{}'),
      }, token),
      'AI recommendation created.',
      target,
    );
  }

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    await runAction(
      () => createSuperAdminAutomationRule({
        tenantId: optionalFormValue(form, 'tenantId'),
        schoolId: optionalFormValue(form, 'schoolId'),
        code: String(form.get('code') ?? ''),
        name: String(form.get('name') ?? ''),
        description: optionalFormValue(form, 'description'),
        triggerType: String(form.get('triggerType') ?? 'SCHEDULED'),
        triggerConfigJson: safeJsonInput(String(form.get('triggerConfigJson') ?? '{}')),
        actionType: String(form.get('actionType') ?? 'CREATE_RECOMMENDATION'),
        actionConfigJson: safeJsonInput(String(form.get('actionConfigJson') ?? '{}')),
        enabled: form.get('enabled') === 'on',
        requiresApproval: form.get('requiresApproval') === 'on',
        approvalRole: optionalFormValue(form, 'approvalRole'),
        riskLevel: String(form.get('riskLevel') ?? 'MEDIUM'),
      }, token),
      'Automation rule created and audited.',
      target,
    );
  }

  async function toggleRule(item: AutomationRule) {
    await runAction(
      () => updateSuperAdminAutomationRule(item.ruleId, { enabled: !item.enabled }, token),
      item.enabled ? 'Automation rule disabled.' : 'Automation rule enabled.',
    );
  }

  async function updateEntitlement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);
    const tenantId = String(form.get('tenantId') ?? '').trim();
    const enabledFeatures = form.getAll('enabledFeatures').map(String);
    if (!tenantId) {
      setActionError('Organization ID is required to update AI entitlement.');
      return;
    }
    if (form.get('enabled') === 'on' && enabledFeatures.length === 0) {
      setActionError('Enabled AI entitlements require at least one feature.');
      return;
    }
    await runAction(
      () => updateSuperAdminAiEntitlement(tenantId, {
        enabled: form.get('enabled') === 'on',
        monthlyUnitBudget: Number(form.get('monthlyUnitBudget') ?? 0),
        enabledFeatures,
        humanApprovalRequired: form.get('humanApprovalRequired') === 'on',
        retentionDays: Number(form.get('retentionDays') ?? 90),
      }, token),
      'AI entitlement updated.',
    );
  }

  async function updatePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const tenantId = String(form.get('tenantId') ?? '').trim();
    if (!tenantId) {
      setActionError('Organization ID is required to update AI policy.');
      return;
    }
    await runAction(
      () => updateSuperAdminAiPolicy(tenantId, {
        schoolId: optionalFormValue(form, 'schoolId'),
        enabled: form.get('enabled') === 'on',
        allowedFeaturesJson: safeJsonInput(String(form.get('allowedFeaturesJson') ?? '[]')),
        monthlyBudgetUnits: Number(form.get('monthlyBudgetUnits') ?? 0),
        humanApprovalRequiredDefault: form.get('humanApprovalRequiredDefault') === 'on',
        allowLowRiskAutoPublish: form.get('allowLowRiskAutoPublish') === 'on',
        allowFeeReminderAutoSend: form.get('allowFeeReminderAutoSend') === 'on',
        allowParentMessageAutoSend: form.get('allowParentMessageAutoSend') === 'on',
        retentionDays: Number(form.get('retentionDays') ?? 90),
      }, token),
      'AI policy updated.',
    );
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Intelligence" title="AI Governance" detail="Control AI usage, budgets, recommendations, automation, and safety across organizations." />
      {message ? <p className="toast-message">{message}</p> : null}
      {actionError ? <PanelState title="Action blocked" detail={actionError} tone="error" /> : null}
      <div className="super-admin-tabs" role="tablist" aria-label="AI governance tabs">
        {([
          ['usage', 'Usage summary'],
          ['entitlements', 'Entitlements'],
          ['policies', 'Policies'],
          ['recommendations', 'Recommendations'],
          ['rules', 'Automation rules'],
          ['runs', 'Automation runs'],
          ['safety', 'Audit notes'],
        ] as const).map(([id, label]) => (
          <TabButton active={activeTab === id} key={id} onClick={() => setActiveTab(id)}>{label}</TabButton>
        ))}
      </div>

      {activeTab === 'usage' ? (
        <RemoteData state={usage}>
          {(data) => (
            <>
              <div className="super-admin-metrics">
                <Metric label="AI organizations" value={data.enabledTenantCount} detail="Entitlement enabled" />
                <Metric label="Monthly budget" value={data.totalMonthlyBudget} detail="Total allowed units" />
                <Metric label="Used this month" value={data.totalUnitsUsedThisMonth} detail="Authorized units" />
                <Metric label="Denied" value={data.deniedRequestsThisMonth} detail={`${data.budgetExceededRequestsThisMonth} budget related`} />
              </div>
              <RemoteList state={tenantUsage} empty="No organization AI usage rows yet.">
                {(items) => <AiTenantUsageCards items={items} />}
              </RemoteList>
            </>
          )}
        </RemoteData>
      ) : null}

      {activeTab === 'entitlements' ? (
        <div className="super-admin-grid">
          <RemoteList state={entitlements} empty="No AI entitlements configured yet.">
            {(items) => <AiEntitlementTable items={items} onSelect={setSelectedEntitlementTenantId} />}
          </RemoteList>
          {selectedEntitlementTenantId ? (
            <RemoteData state={selectedEntitlement}>
              {(data) => data ? <AiEntitlementForm entitlement={data} onSubmit={updateEntitlement} /> : <PanelState title="Select an organization" detail="Open an entitlement row to edit it." />}
            </RemoteData>
          ) : (
            <AiEntitlementForm entitlement={null} onSubmit={updateEntitlement} />
          )}
        </div>
      ) : null}

      {activeTab === 'policies' ? (
        <>
          <QueryControls
            compact
            includeTenant
            onApply={(next) => setPolicyQuery((current) => ({ ...current, ...next, page: 0 }))}
            onSizeChange={(size) => setPolicyQuery((current) => ({ ...current, size, page: 0 }))}
            values={policyQuery}
          />
          <div className="super-admin-grid">
            <RemoteTable state={policies} empty="No AI policies yet. Organization policies appear after entitlement setup.">
              {(data) => (
                <>
                  <AiPoliciesTable items={data.items} onSelect={setSelectedPolicyTenantId} />
                  <PaginationControls data={data} onPageChange={(page) => setPolicyQuery((current) => ({ ...current, page }))} />
                </>
              )}
            </RemoteTable>
            {selectedPolicyTenantId ? (
              <RemoteData state={selectedPolicy}>
                {(data) => data ? <AiPolicyForm onSubmit={updatePolicy} policy={data} /> : <PanelState title="Select an organization" detail="Open a policy row to edit it." />}
              </RemoteData>
            ) : (
              <AiPolicyForm onSubmit={updatePolicy} policy={null} />
            )}
          </div>
        </>
      ) : null}

      {activeTab === 'recommendations' ? (
        <>
          <QueryControls
            compact
            extraFilterLabel="Type"
            extraFilterName="type"
            extraFilterOptions={AI_RECOMMENDATION_TYPES}
            includeSchool
            includeTenant
            onApply={(next) => setRecommendationQuery((current) => ({ ...current, ...next, page: 0 }))}
            onSizeChange={(size) => setRecommendationQuery((current) => ({ ...current, size, page: 0 }))}
            secondExtraFilterLabel="Risk"
            secondExtraFilterName="riskLevel"
            secondExtraFilterOptions={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']}
            statusOptions={['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED', 'CANCELLED', 'FAILED']}
            values={recommendationQuery}
          />
          <form className="super-admin-form" onSubmit={(event) => void createRecommendation(event)}>
            <h3>Create recommendation</h3>
            <input name="tenantId" placeholder="Organization ID" required />
            <input name="schoolId" placeholder="School ID optional" />
            <input defaultValue="GENERAL" name="targetType" placeholder="Target type" />
            <input name="targetId" placeholder="Target ID optional" />
            <select name="recommendationType">{AI_RECOMMENDATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
            <input name="title" placeholder="Title" required />
            <input name="summary" placeholder="Summary" required />
            <input name="rationale" placeholder="Rationale optional" />
            <select name="riskLevel"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select>
            <input defaultValue="{}" name="metadataJson" placeholder="Sanitized metadata JSON" />
            <label className="inline-check"><input defaultChecked name="approvalRequired" type="checkbox" /> Approval required</label>
            <button type="submit">Create recommendation</button>
          </form>
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
                          <button onClick={() => setSelectedRecommendationId(item.recommendationId)} type="button">View details</button>
                          <button disabled={item.status !== 'PENDING_REVIEW' && item.status !== 'DRAFT'} onClick={() => void approve(item)} type="button">Approve</button>
                          <button disabled={item.status !== 'PENDING_REVIEW' && item.status !== 'DRAFT'} onClick={() => void reject(item)} type="button">Reject</button>
                          <button disabled={item.status !== 'APPROVED'} onClick={() => void execute(item)} type="button">Execute</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls data={data} onPageChange={(page) => setRecommendationQuery((current) => ({ ...current, page }))} />
              </>
            )}
          </RemoteTable>
          {selectedRecommendationId ? (
            <RemoteData state={selectedRecommendation}>
              {(item) => item ? <AiRecommendationDetail item={item} /> : <PanelState title="Select recommendation" detail="Open a recommendation to inspect safe metadata." />}
            </RemoteData>
          ) : null}
        </>
      ) : null}

      {activeTab === 'rules' ? (
        <>
          <QueryControls
            compact
            extraFilterLabel="Enabled"
            extraFilterName="enabled"
            extraFilterOptions={['true', 'false']}
            includeSchool
            includeTenant
            onApply={(next) => setRuleQuery((current) => ({ ...current, ...next, page: 0 }))}
            onSizeChange={(size) => setRuleQuery((current) => ({ ...current, size, page: 0 }))}
            values={ruleQuery}
          />
          <div className="super-admin-grid">
            <RemoteTable state={rules} empty="No automation rules yet.">
              {(data) => (
                <>
                  <AutomationRulesTable items={data.items} onToggle={(item) => void toggleRule(item)} />
                  <PaginationControls data={data} onPageChange={(page) => setRuleQuery((current) => ({ ...current, page }))} />
                </>
              )}
            </RemoteTable>
            <form className="super-admin-form" onSubmit={(event) => void createRule(event)}>
              <h3>Create automation rule</h3>
              <input name="tenantId" placeholder="Organization ID optional" />
              <input name="schoolId" placeholder="School ID optional" />
              <input name="code" placeholder="Rule code" required />
              <input name="name" placeholder="Rule name" required />
              <input name="description" placeholder="Description" />
              <select name="triggerType"><option value="SCHEDULED">SCHEDULED</option><option value="EVENT">EVENT</option></select>
              <input defaultValue="{}" name="triggerConfigJson" placeholder="Trigger JSON" />
              <select name="actionType"><option value="CREATE_RECOMMENDATION">CREATE_RECOMMENDATION</option><option value="DRAFT_MESSAGE">DRAFT_MESSAGE</option></select>
              <input defaultValue="{}" name="actionConfigJson" placeholder="Action JSON" />
              <select name="riskLevel"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select>
              <input name="approvalRole" placeholder="Approval role optional" />
              <label className="inline-check"><input name="enabled" type="checkbox" /> Enabled</label>
              <label className="inline-check"><input defaultChecked name="requiresApproval" type="checkbox" /> Requires approval</label>
              <button type="submit">Create rule</button>
            </form>
          </div>
        </>
      ) : null}

      {activeTab === 'runs' ? (
        <>
          <QueryControls
            compact
            includeSchool
            includeTenant
            onApply={(next) => setRunQuery((current) => ({ ...current, ...next, page: 0 }))}
            onSizeChange={(size) => setRunQuery((current) => ({ ...current, size, page: 0 }))}
            statusOptions={['QUEUED', 'RUNNING', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED', 'CANCELLED']}
            values={runQuery}
          />
          <RemoteTable state={runs} empty="No automation runs yet.">
            {(data) => (
              <>
                <AutomationRunsTable items={data.items} />
                <PaginationControls data={data} onPageChange={(page) => setRunQuery((current) => ({ ...current, page }))} />
              </>
            )}
          </RemoteTable>
        </>
      ) : null}

      {activeTab === 'safety' ? (
        <RemoteData state={usage}>
          {(data) => (
            <RecordList
              title="AI audit and safety notes"
              empty="No AI usage audit rows yet."
              rows={data.usageAudit.map((audit) => ({
                id: audit.auditId,
                title: `${audit.feature} - ${audit.status}`,
                detail: `${audit.tenantName} - ${audit.estimatedUnits} units - prompt content hidden`,
                meta: audit.denialReason ? safeText(audit.denialReason) : dateLabel(audit.createdAt),
              }))}
            />
          )}
        </RemoteData>
      ) : null}
    </section>
  );
}

function AiTenantUsageCards({ items }: { items: AiTenantUsage[] }) {
  return (
    <div className="super-admin-card-grid">
      {items.map((tenant) => (
        <article className="super-admin-card" key={tenant.tenantId}>
          <span><StatusBadge status={tenant.enabled ? 'ENABLED' : 'DISABLED'} /></span>
          <h3>{tenant.tenantName}</h3>
          <ProgressBar value={tenant.unitsUsedThisMonth} max={tenant.monthlyUnitBudget} />
          <p>{tenant.remainingUnitsThisMonth} units remaining. Human approval {tenant.humanApprovalRequired ? 'required' : 'optional'}.</p>
          <small>{tenant.enabledFeatures.join(', ') || 'No features enabled'}</small>
        </article>
      ))}
    </div>
  );
}

function AiEntitlementTable({ items, onSelect }: { items: AiTenantUsage[]; onSelect: (tenantId: string) => void }) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Organization</th><th>Budget</th><th>Usage</th><th>Approval</th><th>Action</th></tr></thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.tenantId}>
            <td><strong>{item.tenantName}</strong><span>{item.tenantId}</span></td>
            <td>{item.monthlyUnitBudget}</td>
            <td>{item.unitsUsedThisMonth} used, {item.remainingUnitsThisMonth} left</td>
            <td>{item.humanApprovalRequired ? 'Required' : 'Optional'}</td>
            <td><button onClick={() => onSelect(item.tenantId)} type="button">Open entitlement</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AiEntitlementForm({
  entitlement,
  onSubmit,
}: {
  entitlement: AiEntitlement | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const enabledFeatures = new Set(entitlement?.enabledFeatures ?? ['NOTICE_DRAFTING']);
  return (
    <form className="super-admin-form" key={entitlement?.tenantId ?? 'new-entitlement'} onSubmit={(event) => onSubmit(event)}>
      <h3>{entitlement ? 'Update entitlement' : 'Configure entitlement'}</h3>
      <input defaultValue={entitlement?.tenantId ?? ''} name="tenantId" placeholder="Organization ID" required />
      <input defaultValue={entitlement?.monthlyUnitBudget ?? 1000} min="0" name="monthlyUnitBudget" placeholder="Monthly unit budget" type="number" />
      <input defaultValue={entitlement?.retentionDays ?? 90} min="1" name="retentionDays" placeholder="Retention days" type="number" />
      <label className="inline-check"><input defaultChecked={entitlement?.enabled ?? true} name="enabled" type="checkbox" /> Enabled</label>
      <label className="inline-check"><input defaultChecked={entitlement?.humanApprovalRequired ?? true} name="humanApprovalRequired" type="checkbox" /> Human approval</label>
      <div className="super-admin-checkbox-grid">
        {AI_FEATURE_OPTIONS.map((feature) => (
          <label className="inline-check" key={feature}>
            <input defaultChecked={enabledFeatures.has(feature)} name="enabledFeatures" type="checkbox" value={feature} />
            {feature}
          </label>
        ))}
      </div>
      <button type="submit">Save entitlement</button>
    </form>
  );
}

function AiPoliciesTable({ items, onSelect }: { items: AiPolicy[]; onSelect: (tenantId: string) => void }) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Organization</th><th>Budget</th><th>Automation</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.policyId}>
            <td><strong>{item.tenantName}</strong><span>{item.schoolName ?? 'Organization default'}</span></td>
            <td>{item.monthlyBudgetUnits}</td>
            <td>{item.allowLowRiskAutoPublish ? 'Low risk auto-publish' : 'Approval controlled'}</td>
            <td><StatusBadge status={item.enabled ? 'ENABLED' : 'DISABLED'} /></td>
            <td><button onClick={() => onSelect(item.tenantId)} type="button">Open policy</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AiPolicyForm({
  onSubmit,
  policy,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  policy: AiPolicy | null;
}) {
  return (
    <form className="super-admin-form" key={policy?.policyId ?? 'new-policy'} onSubmit={(event) => onSubmit(event)}>
      <h3>{policy ? 'Update policy' : 'Create policy'}</h3>
      <input defaultValue={policy?.tenantId ?? ''} name="tenantId" placeholder="Organization ID" required />
      <input defaultValue={policy?.schoolId ?? ''} name="schoolId" placeholder="School ID optional" />
      <input defaultValue={policy?.monthlyBudgetUnits ?? 1000} min="0" name="monthlyBudgetUnits" placeholder="Monthly budget units" type="number" />
      <input defaultValue={policy?.retentionDays ?? 90} min="1" name="retentionDays" placeholder="Retention days" type="number" />
      <input defaultValue={policy?.allowedFeaturesJson ?? '[]'} name="allowedFeaturesJson" placeholder="Allowed features JSON" />
      <label className="inline-check"><input defaultChecked={policy?.enabled ?? true} name="enabled" type="checkbox" /> Enabled</label>
      <label className="inline-check"><input defaultChecked={policy?.humanApprovalRequiredDefault ?? true} name="humanApprovalRequiredDefault" type="checkbox" /> Human approval</label>
      <label className="inline-check"><input defaultChecked={policy?.allowLowRiskAutoPublish ?? false} name="allowLowRiskAutoPublish" type="checkbox" /> Low risk auto-publish</label>
      <label className="inline-check"><input defaultChecked={policy?.allowFeeReminderAutoSend ?? false} name="allowFeeReminderAutoSend" type="checkbox" /> Fee reminders</label>
      <label className="inline-check"><input defaultChecked={policy?.allowParentMessageAutoSend ?? false} name="allowParentMessageAutoSend" type="checkbox" /> Parent messages</label>
      <button type="submit">Save policy</button>
    </form>
  );
}

function AiRecommendationDetail({ item }: { item: AiRecommendation }) {
  return (
    <article className="super-admin-card wide">
      <h3>{item.title}</h3>
      <div className="super-admin-card-grid">
        <article className="super-admin-card"><h3>Approval</h3><p>{item.approvalRequired ? 'Required' : 'Not required'} - {item.status}</p></article>
        <article className="super-admin-card"><h3>Risk</h3><p>{item.riskLevel}</p></article>
        <article className="super-admin-card"><h3>Scope</h3><p>{item.schoolName ?? item.tenantName}</p></article>
      </div>
      <p>{item.summary}</p>
      {item.rationale ? <p>{item.rationale}</p> : null}
      <pre className="super-admin-json">{safeJsonSummary(item.metadataJson)}</pre>
    </article>
  );
}

function AutomationRulesTable({ items, onToggle }: { items: AutomationRule[]; onToggle: (item: AutomationRule) => void }) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Rule</th><th>Scope</th><th>Risk</th><th>Approval</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.ruleId}>
            <td><strong>{item.name}</strong><span>{item.code}</span></td>
            <td>{item.schoolName ?? item.tenantName ?? 'Platform'}</td>
            <td>{item.riskLevel}</td>
            <td>{item.requiresApproval ? item.approvalRole ?? 'Required' : 'Not required'}</td>
            <td><StatusBadge status={item.enabled ? 'ENABLED' : 'DISABLED'} /></td>
            <td><button onClick={() => onToggle(item)} type="button">{item.enabled ? 'Disable' : 'Enable'}</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AutomationRunsTable({ items }: { items: AutomationRun[] }) {
  return (
    <table className="super-admin-table">
      <thead><tr><th>Run</th><th>Scope</th><th>Status</th><th>Output</th><th>When</th></tr></thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.runId}>
            <td><strong>{item.ruleName}</strong><span>{item.triggeredByActorType}</span></td>
            <td>{item.schoolName ?? item.tenantName ?? 'Platform'}</td>
            <td><StatusBadge status={item.status} /></td>
            <td>{item.errorMessage ? safeJsonSummary(item.errorMessage) : safeJsonSummary(item.outputSummaryJson)}</td>
            <td>{dateLabel(item.startedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportsPanel({ token, refreshKey, onRefresh }: { token: string; refreshKey: number; onRefresh: () => void }) {
  const reports = useLoader(() => getSuperAdminReports(token), [token, refreshKey]);
  const [query, setQuery] = useState({ page: 0, size: 25, status: '', reportType: '' });
  const [tenantQuery, setTenantQuery] = useState({ page: 0, size: 10 });
  const [schoolQuery, setSchoolQuery] = useState({ page: 0, size: 10 });
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const exports = useLoader(() => listSuperAdminReportExports(query, token), [token, refreshKey, query.page, query.size, query.status, query.reportType]);
  const tenants = useLoader(() => listSuperAdminReportTenants(tenantQuery, token), [token, refreshKey, tenantQuery.page, tenantQuery.size]);
  const schools = useLoader(() => listSuperAdminReportSchools(schoolQuery, token), [token, refreshKey, schoolQuery.page, schoolQuery.size]);
  const selectedExport = useLoader(
    () => selectedExportId ? getSuperAdminReportExport(selectedExportId, token) : Promise.resolve(null),
    [selectedExportId, token, refreshKey],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function requestExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setActionError(null);
    try {
      await requestSuperAdminReportExport({
        reportType: String(form.get('reportType') ?? 'PLATFORM_SUMMARY'),
        format: 'CSV',
        tenantId: optionalFormValue(form, 'tenantId'),
        schoolId: optionalFormValue(form, 'schoolId'),
        filters: {
          requestedFrom: 'super-admin-portal',
          dateFrom: optionalFormValue(form, 'dateFrom'),
          dateTo: optionalFormValue(form, 'dateTo'),
        },
      }, token);
      setMessage('Export request accepted. Existing export jobs are shown below.');
      event.currentTarget.reset();
      onRefresh();
    } catch (caught) {
      setActionError(errorMessage(caught));
    }
  }

  return (
    <section className="super-admin-panel">
      <PanelTitle
        eyebrow="Business"
        title="Reports"
        detail="Request, monitor, and download platform exports."
      />
      {message ? <p className="toast-message">{message}</p> : null}
      {actionError ? <PanelState title="Export request failed" detail={actionError} tone="error" /> : null}
      <RemoteData state={reports}>
        {(data) => (
          <>
            <div className="super-admin-metrics">
              {data.metrics.map((metric) => <Metric detail={metric.detail} key={metric.label} label={metric.label} value={metric.value} />)}
            </div>
          </>
        )}
      </RemoteData>
      <form className="super-admin-form" onSubmit={(event) => void requestExport(event)}>
        <h3>Create export</h3>
        <select name="reportType">{REPORT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <input name="tenantId" placeholder="Organization ID optional" />
        <input name="schoolId" placeholder="School ID optional" />
        <input name="dateFrom" placeholder="Date from" type="date" />
        <input name="dateTo" placeholder="Date to" type="date" />
        <span className="super-admin-warning">Exports can contain sensitive platform data. Share completed files only through approved channels.</span>
        <button type="submit">Create export</button>
      </form>
      <QueryControls
        compact
        extraFilterLabel="Report type"
        extraFilterName="reportType"
        extraFilterOptions={REPORT_TYPES}
        onApply={(next) => setQuery((current) => ({ ...current, ...next, page: 0 }))}
        onSizeChange={(size) => setQuery((current) => ({ ...current, size, page: 0 }))}
        statusOptions={['QUEUED', 'VALIDATING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']}
        values={query}
      />
      <RemoteTable state={exports} empty="No export jobs yet.">
        {(data) => (
          <>
            <table className="super-admin-table">
              <thead><tr><th>Export</th><th>Scope</th><th>Status</th><th>Requested</th><th>Completed</th><th>Action</th></tr></thead>
              <tbody>{data.items.map((item) => <ReportExportRow item={item} key={item.exportId} onOpen={setSelectedExportId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
      {selectedExportId ? (
        <RemoteData state={selectedExport}>
          {(item) => item ? <ReportExportDetail item={item} /> : <PanelState title="Select an export" detail="Open an export job to view its current status." />}
        </RemoteData>
      ) : null}
      <div className="super-admin-grid">
        <RemoteTable state={tenants} empty="No organization report rows.">
          {(data) => (
            <article className="super-admin-card wide">
              <h3>Organization reports</h3>
              <table className="super-admin-table">
                <thead><tr><th>Organization</th><th>Status</th><th>Schools</th><th>Users</th></tr></thead>
                <tbody>{data.items.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td><strong>{tenant.name}</strong><span>{tenant.code}</span></td>
                    <td><StatusBadge status={tenant.status} /></td>
                    <td>{tenant.activeSchoolCount}/{tenant.schoolCount}</td>
                    <td>{tenant.userCount}</td>
                  </tr>
                ))}</tbody>
              </table>
              <PaginationControls data={data} onPageChange={(page) => setTenantQuery((current) => ({ ...current, page }))} />
            </article>
          )}
        </RemoteTable>
        <RemoteTable state={schools} empty="No school report rows.">
          {(data) => (
            <article className="super-admin-card wide">
              <h3>School reports</h3>
              <table className="super-admin-table">
                <thead><tr><th>School</th><th>Organization</th><th>Status</th><th>Students</th></tr></thead>
                <tbody>{data.items.map((school) => (
                  <tr key={school.schoolId}>
                    <td><strong>{school.schoolName}</strong><span>{school.schoolCode}</span></td>
                    <td>{school.tenantName}</td>
                    <td><StatusBadge status={school.status} /></td>
                    <td>{school.studentCount}</td>
                  </tr>
                ))}</tbody>
              </table>
              <PaginationControls data={data} onPageChange={(page) => setSchoolQuery((current) => ({ ...current, page }))} />
            </article>
          )}
        </RemoteTable>
      </div>
    </section>
  );
}

function AuditLogsPanel({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [query, setQuery] = useState({ page: 0, size: 25, tenantId: '', role: '', action: '' });
  const auditLogs = useLoader(() => listSuperAdminAuditLogs(query, token), [token, refreshKey, query.page, query.size, query.tenantId, query.role, query.action]);
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Operations" title="Audit Logs" detail="Investigate platform actions, security events, and sensitive changes." />
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
      <PanelTitle eyebrow="Operations" title="Platform Health" detail="Monitor readiness, database, outbox, report jobs, notification mode, and AI availability." action={<button onClick={onRefresh} type="button">Refresh</button>} />
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
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const deliveries = useLoader(() => listSuperAdminNotificationDeliveries(query, token), [token, refreshKey, query.page, query.size, query.status, query.channel, query.tenantId]);
  const selectedDelivery = useLoader(
    () => selectedDeliveryId ? getSuperAdminNotificationDelivery(selectedDeliveryId, token) : Promise.resolve(null),
    [selectedDeliveryId, token, refreshKey],
  );
  return (
    <section className="super-admin-panel">
      <PanelTitle eyebrow="Operations" title="Notifications" detail="Monitor email, SMS, push, and system notification delivery." />
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
                detail: `${delivery.tenantName ?? 'Organization'} · ${delivery.maskedRecipient}`,
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
              <thead><tr><th>Delivery</th><th>Recipient</th><th>Organization</th><th>Status</th><th>When</th><th>Action</th></tr></thead>
              <tbody>{data.items.map((delivery) => <NotificationDeliveryRow delivery={delivery} key={delivery.deliveryId} onOpen={setSelectedDeliveryId} />)}</tbody>
            </table>
            <PaginationControls data={data} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
          </>
        )}
      </RemoteTable>
      {selectedDeliveryId ? (
        <RemoteData state={selectedDelivery}>
          {(delivery) => delivery ? <NotificationDeliveryDetail delivery={delivery} /> : <PanelState title="Select delivery" detail="Open a delivery row to inspect safe details." />}
        </RemoteData>
      ) : null}
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
      <PanelTitle eyebrow="Configuration" title="Settings" detail="Manage safe platform preferences and runtime visibility." />
      {message ? <p className="toast-message">{message}</p> : null}
      <RemoteData state={settings}>
        {(data: PlatformSettings) => (
          <>
            <form className="super-admin-form" onSubmit={(event) => void saveSettings(event)}>
              <h3>General</h3>
              <input defaultValue={data.platformName} name="platformName" placeholder="Platform name" />
              <input defaultValue={data.defaultTimezone} name="defaultTimezone" placeholder="Default timezone" />
              <h3>Support</h3>
              <input defaultValue={data.supportEmail} name="supportEmail" placeholder="Support email" type="email" />
              <h3>Maintenance</h3>
              <label className="inline-check">
                <input defaultChecked={data.maintenanceMode} name="maintenanceMode" type="checkbox" />
                Maintenance mode
              </label>
              <p className="super-admin-warning">Settings changes are audited. Runtime secrets are never displayed here.</p>
              <button type="submit">Save settings</button>
            </form>
            <div className="super-admin-card-grid">
              <article className="super-admin-card"><h3>Support</h3><p>{data.publicFrontendUrl}</p><span>{data.supportEmail}</span></article>
              <article className="super-admin-card"><h3>Runtime</h3><p>{runtimeSecretSummary(data.runtime)}</p><span>Configured values are hidden.</span></article>
              <article className="super-admin-card"><h3>AI defaults</h3><p>{data.aiDefaultPolicy}</p></article>
              <article className="super-admin-card"><h3>Notification delivery</h3><p>{data.notificationMode === 'log' ? 'Activity logging' : data.notificationMode}</p></article>
              <article className="super-admin-card"><h3>Maintenance</h3><p>{data.maintenanceMode ? 'Enabled' : 'Disabled'}</p></article>
            </div>
            <DeveloperDetails>
              <span>Allowed origins: {data.corsAllowedOrigins.join(', ') || 'Not configured'}</span>
              <span>Runtime keys: {Object.keys(data.runtime).join(', ') || 'Not configured'}</span>
            </DeveloperDetails>
          </>
        )}
      </RemoteData>
    </section>
  );
}

function runtimeSecretSummary(runtime: Record<string, string>) {
  const entries = Object.entries(runtime);
  if (entries.length === 0) {
    return 'Not configured';
  }
  const configured = entries.filter(([, value]) => /configured|hidden/i.test(value)).length;
  return `${configured} configured · ${entries.length - configured} not configured`;
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
  secondExtraFilterLabel,
  secondExtraFilterName,
  secondExtraFilterOptions = [],
  includeAction = false,
  includeDates = false,
  includeRole = false,
  includeSchool = false,
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
  secondExtraFilterLabel?: string;
  secondExtraFilterName?: string;
  secondExtraFilterOptions?: string[];
  includeAction?: boolean;
  includeDates?: boolean;
  includeRole?: boolean;
  includeSchool?: boolean;
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
    schoolId: String(values.schoolId ?? ''),
    role: String(values.role ?? ''),
    action: String(values.action ?? ''),
    channel: String(values.channel ?? ''),
    reportType: String(values.reportType ?? ''),
    type: String(values.type ?? ''),
    riskLevel: String(values.riskLevel ?? ''),
    enabled: String(values.enabled ?? ''),
    from: String(values.from ?? ''),
    to: String(values.to ?? ''),
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
          aria-label="Organization ID"
          onChange={(event) => update('tenantId', event.target.value)}
          placeholder="Organization ID"
          value={draft.tenantId}
        />
      ) : null}
      {includeSchool ? (
        <input
          aria-label="School ID"
          onChange={(event) => update('schoolId', event.target.value)}
          placeholder="School ID"
          value={draft.schoolId}
        />
      ) : null}
      {includeDates ? (
        <>
          <input
            aria-label="From date"
            onChange={(event) => update('from', event.target.value)}
            type="date"
            value={draft.from}
          />
          <input
            aria-label="To date"
            onChange={(event) => update('to', event.target.value)}
            type="date"
            value={draft.to}
          />
        </>
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
      {secondExtraFilterName && secondExtraFilterOptions.length > 0 ? (
        <select
          aria-label={secondExtraFilterLabel ?? secondExtraFilterName}
          onChange={(event) => update(secondExtraFilterName, event.target.value)}
          value={draft[secondExtraFilterName] ?? ''}
        >
          <option value="">All {secondExtraFilterLabel?.toLowerCase() ?? secondExtraFilterName}</option>
          {secondExtraFilterOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : null}
      <select
        aria-label="Page size"
        onChange={(event) => onSizeChange(Number(event.target.value))}
        value={String(values.size ?? 25)}
      >
        {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} rows</option>)}
      </select>
      <button type="submit">Apply filters</button>
      <button
        className="secondary"
        onClick={() => {
          const cleared = Object.fromEntries(Object.keys(draft).map((key) => [key, '']));
          setDraft(cleared);
          onApply(cleared);
        }}
        type="button"
      >
        Reset
      </button>
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

function Metric({ action, label, value, detail }: { action?: () => void; label: string; value: string | number; detail: string }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </>
  );

  if (action) {
    return (
      <button className="super-admin-metric interactive" onClick={action} type="button">
        {content}
      </button>
    );
  }

  return <article className="super-admin-metric">{content}</article>;
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

function TenantRevenueTable({ data, onPageChange }: { data: PageResponse<RevenueBreakdown>; onPageChange: (page: number) => void }) {
  if (data.items.length === 0) {
    return <PanelState title="No customer revenue" detail="Organization invoice totals will appear after invoices are issued." />;
  }
  return (
    <>
      <table className="super-admin-table">
        <thead><tr><th>Organization</th><th>Invoices</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.label}</strong><span>{item.id}</span></td>
              <td>{item.invoiceCount}</td>
              <td>{money(item.amountCents)}</td>
              <td><StatusBadge status={item.invoiceCount > 0 ? 'INVOICED' : 'EMPTY'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls data={data} onPageChange={onPageChange} />
    </>
  );
}

function ReportExportRow({ item, onOpen }: { item: ReportExport; onOpen: (jobId: string) => void }) {
  return (
    <tr>
      <td><strong>{item.reportType}</strong><span>{item.format}</span></td>
      <td>{item.schoolName ?? item.tenantName ?? 'Platform-wide'}</td>
      <td><StatusBadge status={item.status} /></td>
      <td>{dateLabel(item.requestedAt)}</td>
      <td>{item.completedAt ? dateLabel(item.completedAt) : 'Not completed'}</td>
      <td><button onClick={() => onOpen(item.exportId)} type="button">View details</button></td>
    </tr>
  );
}

function ReportExportDetail({ item }: { item: ReportExport }) {
  const ready = item.status === 'COMPLETED';
  return (
    <article className="super-admin-card wide">
      <h3>{item.reportType} export</h3>
      <div className="super-admin-card-grid">
        <article className="super-admin-card"><h3>Status</h3><p>{item.status}</p></article>
        <article className="super-admin-card"><h3>Scope</h3><p>{item.schoolName ?? item.tenantName ?? 'Platform-wide'}</p></article>
        <article className="super-admin-card"><h3>Download</h3><p>{ready ? 'File is ready, but no Super Admin download endpoint exists in code.' : 'Available after completion when a download API exists.'}</p></article>
      </div>
      <span className="super-admin-warning">Sensitive export. Verify recipient and retention policy before sharing generated files.</span>
    </article>
  );
}

function NotificationDeliveryRow({ delivery, onOpen }: { delivery: NotificationDelivery; onOpen: (deliveryId: string) => void }) {
  return (
    <tr>
      <td><strong>{delivery.template}</strong><span>{delivery.channel}</span></td>
      <td>{delivery.maskedRecipient}</td>
      <td>{delivery.tenantName ?? 'Organization'}</td>
      <td><StatusBadge status={delivery.status} /></td>
      <td>{dateLabel(delivery.createdAt)}</td>
      <td><button onClick={() => onOpen(delivery.deliveryId)} type="button">View details</button></td>
    </tr>
  );
}

function NotificationDeliveryDetail({ delivery }: { delivery: NotificationDelivery }) {
  return (
    <article className="super-admin-card wide">
      <h3>{delivery.template}</h3>
      <div className="super-admin-card-grid">
        <article className="super-admin-card"><h3>Recipient</h3><p>{delivery.maskedRecipient}</p></article>
        <article className="super-admin-card"><h3>Status</h3><p>{delivery.status}</p></article>
        <article className="super-admin-card"><h3>Provider</h3><p>{delivery.provider ?? 'Not assigned'}</p></article>
      </div>
      <table className="super-admin-table">
        <tbody>
          <tr><th>Organization</th><td>{delivery.tenantName ?? delivery.tenantId}</td></tr>
          <tr><th>School</th><td>{delivery.schoolName ?? delivery.schoolId ?? 'Platform'}</td></tr>
          <tr><th>Subject</th><td>{safeText(delivery.subject)}</td></tr>
          <tr><th>Failure reason</th><td>{delivery.failureReason ? safeText(delivery.failureReason) : 'No safe failure reason recorded'}</td></tr>
          <tr><th>Retry</th><td>No Super Admin retry endpoint exists in the backend.</td></tr>
        </tbody>
      </table>
    </article>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button aria-selected={active} className={active ? 'is-active' : ''} onClick={onClick} role="tab" type="button">
      {children}
    </button>
  );
}

function emptyPage<T>(): PageResponse<T> {
  return { items: [], page: 0, size: 0, totalItems: 0, totalPages: 0 };
}

function pageLocalRows<T>(items: T[], page: number, size: number): PageResponse<T> {
  const safeSize = Math.max(size, 1);
  const safePage = Math.max(page, 0);
  const start = safePage * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    page: safePage,
    size: safeSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / safeSize),
  };
}

function errorMessage(caught: unknown) {
  return caught instanceof Error ? caught.message : 'The request failed. Check the form values and try again.';
}

function safeText(value: string) {
  return value
    .replace(/token|password|secret|apiKey|privateKey|accessToken|refreshToken|rawPrompt/gi, '[redacted]')
    .slice(0, 220);
}

function safeJsonInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '{}';
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    return '{}';
  }
}

function safeJsonSummary(value: string) {
  try {
    const parsed = JSON.parse(value || '{}') as Record<string, unknown>;
    const safeEntries = Object.entries(parsed).filter(([key]) => !/token|password|secret|apiKey|privateKey|accessToken|refreshToken|rawPrompt/i.test(key));
    return JSON.stringify(Object.fromEntries(safeEntries), null, 2);
  } catch {
    return safeText(value || '{}');
  }
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
