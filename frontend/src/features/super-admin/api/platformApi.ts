import { httpClient } from '../../../shared/api/httpClient';

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type PageQuery = {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  tenantId?: string;
  reportType?: string;
  channel?: string;
  role?: string;
  action?: string;
  types?: string;
  q?: string;
  schoolId?: string;
  type?: string;
  riskLevel?: string;
  assignedTo?: string;
  enabled?: boolean | string;
};

export type SuperAdminTenant = {
  tenantId: string;
  code: string;
  name: string;
  status: string;
  schoolCount: number;
  activeSchoolCount: number;
  userCount: number;
  planCode: string;
  planName: string;
  createdAt: string;
};

export type SuperAdminSchool = {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  status: string;
  primarySchool: boolean;
  studentCount: number;
  staffCount: number;
  createdAt: string;
  lastActivityAt: string | null;
};

export type SuperAdminInvoice = {
  invoiceId: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planCode: string;
  billingCycle: string;
  amountCents: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string | null;
};

export type RevenueSummary = {
  monthlyRecurringRevenueCents: number;
  annualRecurringRevenueEstimateCents: number;
  totalInvoicedCents: number;
  issuedInvoiceCount: number;
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
  overdueInvoiceCount: number;
  monthlyTrend: Array<{ label: string; value: number }>;
  tenantBreakdown: Array<{ id: string; label: string; amountCents: number; invoiceCount: number }>;
  planBreakdown: Array<{ id: string; label: string; amountCents: number; invoiceCount: number }>;
};

export type PlatformMetrics = {
  totalTenantCount: number;
  activeTenantCount: number;
  totalSchoolCount: number;
  activeSchoolCount: number;
  totalStudentCount: number;
  activeStudentCount: number;
  totalStaffCount: number;
  activeStaffCount: number;
  totalUserCount: number;
  activeUserCount: number;
  pendingInvoiceCount: number;
  overdueInvoiceCount: number;
  paidInvoiceCount: number;
  failedNotificationCount: number;
  pendingOutboxCount: number;
  pendingReportExportCount: number;
  lastCalculatedAt: string;
};

export type AiUsageSummary = {
  enabledTenantCount: number;
  totalMonthlyBudget: number;
  totalUnitsUsedThisMonth: number;
  deniedRequestsThisMonth: number;
  budgetExceededRequestsThisMonth: number;
  tenants: Array<{
    tenantId: string;
    tenantName: string;
    enabled: boolean;
    monthlyUnitBudget: number;
    unitsUsedThisMonth: number;
    remainingUnitsThisMonth: number;
    humanApprovalRequired: boolean;
    enabledFeatures: string[];
    updatedAt: string | null;
  }>;
  usageAudit: Array<{
    auditId: string;
    tenantId: string;
    tenantName: string;
    userRole: string;
    feature: string;
    status: string;
    estimatedUnits: number;
    estimatedCostCents: number;
    denialReason: string | null;
    createdAt: string;
  }>;
};

export type ReportSummary = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  exports: ReportExport[];
};

export type ReportExport = {
  exportId: string;
  tenantId: string;
  tenantName: string;
  schoolId: string;
  schoolName: string;
  reportType: string;
  format: string;
  status: string;
  requestedAt: string;
  completedAt: string | null;
};

export type SuperAdminSearchResponse = {
  results: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    navId: string;
    createdAt: string;
  }>;
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type AuditLogRow = {
  auditLogId: string;
  tenantId: string;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadataJson: string | null;
  createdAt: string;
};

export type PlatformHealth = {
  backendHealth: string;
  readiness: string;
  databaseStatus: string;
  migrationStatus: string;
  notificationMode: string;
  pendingOutboxCount: number;
  pendingReportExportCount: number;
  aiEnabledTenantCount: number;
  appVersion: string;
  checkedAt: string;
  alerts: Array<{ title: string; detail: string; severity: string; createdAt: string }>;
};

export type NotificationSummary = {
  totalDeliveries: number;
  sentDeliveries: number;
  loggedDeliveries: number;
  failedDeliveries: number;
  disabledDeliveries: number;
  recentDeliveries: NotificationDelivery[];
};

export type NotificationDelivery = {
  deliveryId: string;
  tenantId: string;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  channel: string;
  template: string;
  recipientRole: string;
  maskedRecipient: string;
  subject: string;
  status: string;
  provider: string | null;
  failureReason: string | null;
  createdAt: string;
  sentAt: string | null;
  failedAt: string | null;
};

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  publicFrontendUrl: string;
  corsAllowedOrigins: string[];
  notificationMode: string;
  aiDefaultPolicy: string;
  maintenanceMode: boolean;
  runtime: Record<string, string>;
};

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  maxSchools: number;
  maxStudents: number;
  maxStaff: number;
  monthlyPriceCents: number;
  annualPriceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type AccessControlUser = {
  userId: string;
  tenantId: string;
  tenantName: string;
  email: string;
  displayName: string;
  primaryRole: string;
  status: string;
  mfaRequired: boolean;
  activatedAt: string | null;
  roles: UserRoleAssignment[];
  permissionOverrides: PermissionOverride[];
  schoolAccess: Array<{ schoolId: string; schoolName: string; role: string; primaryAccess: boolean }>;
};

export type UserRoleAssignment = {
  roleAssignmentId: string;
  role: string;
  tenantId: string | null;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  scopeType: string;
  scopeId: string | null;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  reason: string | null;
  createdAt: string;
};

export type Permission = {
  code: string;
  name: string;
  description: string | null;
  category: string;
  riskLevel: string;
  scopeType: string;
  active: boolean;
};

export type PermissionOverride = {
  overrideId: string;
  userId: string;
  permissionCode: string;
  permissionName: string;
  allowed: boolean;
  tenantId: string | null;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  scopeType: string;
  scopeId: string | null;
  active: boolean;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type AiRecommendation = {
  recommendationId: string;
  tenantId: string;
  tenantName: string;
  schoolId: string | null;
  schoolName: string | null;
  targetType: string;
  targetId: string | null;
  recommendationType: string;
  title: string;
  summary: string;
  rationale: string | null;
  confidenceScore: number | null;
  riskLevel: string;
  status: string;
  createdByActorType: string;
  assignedToUserId: string | null;
  assignedToName: string | null;
  approvalRequired: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  executedAt: string | null;
  failureReason: string | null;
  expiresAt: string | null;
  sourceUsageAuditId: string | null;
  metadataJson: string;
  createdAt: string;
};

export type AutomationRule = {
  ruleId: string;
  tenantId: string | null;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  code: string;
  name: string;
  description: string | null;
  triggerType: string;
  actionType: string;
  enabled: boolean;
  requiresApproval: boolean;
  approvalRole: string | null;
  riskLevel: string;
  createdAt: string;
};

export type AutomationRun = {
  runId: string;
  ruleId: string;
  ruleName: string;
  tenantId: string | null;
  tenantName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  status: string;
  triggeredByActorType: string;
  inputSummaryJson: string;
  outputSummaryJson: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type AiPolicy = {
  policyId: string;
  tenantId: string;
  tenantName: string;
  schoolId: string | null;
  schoolName: string | null;
  enabled: boolean;
  allowedFeaturesJson: string;
  monthlyBudgetUnits: number;
  humanApprovalRequiredDefault: boolean;
  allowLowRiskAutoPublish: boolean;
  allowFeeReminderAutoSend: boolean;
  allowParentMessageAutoSend: boolean;
  retentionDays: number;
  updatedAt: string | null;
};

function queryString(params: PageQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export function listSuperAdminTenants(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminTenant>>(`/v1/super-admin/tenants${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function updateSuperAdminTenantStatus(tenantId: string, status: string, accessToken?: string | null) {
  return httpClient.patch<SuperAdminTenant>(
    `/v1/super-admin/tenants/${encodeURIComponent(tenantId)}/status`,
    { status },
    { accessToken },
  );
}

export function listSuperAdminSchools(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminSchool>>(`/v1/super-admin/schools${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getSuperAdminPlatformMetrics(accessToken?: string | null) {
  return httpClient.get<PlatformMetrics>('/v1/super-admin/platform-metrics', { accessToken });
}

export function getSuperAdminRevenue(accessToken?: string | null) {
  return httpClient.get<RevenueSummary>('/v1/super-admin/revenue/summary', { accessToken });
}

export function listSuperAdminInvoices(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminInvoice>>(`/v1/super-admin/revenue/invoices${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getSuperAdminAiUsage(accessToken?: string | null) {
  return httpClient.get<AiUsageSummary>('/v1/super-admin/ai/usage/summary', { accessToken });
}

export function getSuperAdminReports(accessToken?: string | null) {
  return httpClient.get<ReportSummary>('/v1/super-admin/reports/summary', { accessToken });
}

export function requestSuperAdminReportExport(accessToken?: string | null) {
  return httpClient.post<ReportExport>(
    '/v1/super-admin/reports/exports',
    { reportType: 'PLATFORM_SUMMARY', format: 'CSV' },
    { accessToken },
  );
}

export function listSuperAdminReportExports(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<ReportExport>>(`/v1/super-admin/reports/exports${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function listSuperAdminAuditLogs(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AuditLogRow>>(`/v1/super-admin/audit-logs${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getSuperAdminPlatformHealth(accessToken?: string | null) {
  return httpClient.get<PlatformHealth>('/v1/super-admin/platform-health', { accessToken });
}

export function getSuperAdminNotifications(accessToken?: string | null) {
  return httpClient.get<NotificationSummary>('/v1/super-admin/notifications/summary', { accessToken });
}

export function listSuperAdminNotificationDeliveries(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<NotificationDelivery>>(`/v1/super-admin/notifications/deliveries${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getSuperAdminSettings(accessToken?: string | null) {
  return httpClient.get<PlatformSettings>('/v1/super-admin/settings', { accessToken });
}

export function updateSuperAdminSettings(payload: Partial<PlatformSettings>, accessToken?: string | null) {
  return httpClient.patch<PlatformSettings>('/v1/super-admin/settings', payload, { accessToken });
}

export function listSuperAdminSubscriptionPlans(accessToken?: string | null) {
  return httpClient.get<SubscriptionPlan[]>('/v1/super-admin/subscriptions/plans', { accessToken });
}

export function createSuperAdminSubscriptionPlan(payload: Partial<SubscriptionPlan>, accessToken?: string | null) {
  return httpClient.post<SubscriptionPlan>('/v1/super-admin/subscriptions/plans', payload, { accessToken });
}

export function searchSuperAdmin(params: PageQuery, accessToken?: string | null) {
  return httpClient.get<SuperAdminSearchResponse>(`/v1/super-admin/search${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function listSuperAdminUsers(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AccessControlUser>>(`/v1/super-admin/users${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function getSuperAdminUser(userId: string, accessToken?: string | null) {
  return httpClient.get<AccessControlUser>(`/v1/super-admin/users/${encodeURIComponent(userId)}`, { accessToken });
}

export function listSuperAdminPermissions(accessToken?: string | null) {
  return httpClient.get<Permission[]>('/v1/super-admin/permissions', { accessToken });
}

export function listSuperAdminRolePermissions(role: string, accessToken?: string | null) {
  return httpClient.get<Permission[]>(`/v1/super-admin/roles/${encodeURIComponent(role)}/permissions`, { accessToken });
}

export function assignSuperAdminUserRole(
  userId: string,
  payload: { role: string; tenantId?: string; schoolId?: string; reason?: string; primaryRole?: boolean },
  accessToken?: string | null,
) {
  return httpClient.post<UserRoleAssignment>(`/v1/super-admin/users/${encodeURIComponent(userId)}/roles`, payload, { accessToken });
}

export function updateSuperAdminUserRole(
  userId: string,
  roleAssignmentId: string,
  payload: { active?: boolean; reason?: string },
  accessToken?: string | null,
) {
  return httpClient.patch<UserRoleAssignment>(
    `/v1/super-admin/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleAssignmentId)}`,
    payload,
    { accessToken },
  );
}

export function createSuperAdminPermissionOverride(
  userId: string,
  payload: { permissionCode: string; allowed: boolean; tenantId?: string; schoolId?: string; reason: string },
  accessToken?: string | null,
) {
  return httpClient.post<PermissionOverride>(`/v1/super-admin/users/${encodeURIComponent(userId)}/permission-overrides`, payload, { accessToken });
}

export function updateSuperAdminPermissionOverride(
  userId: string,
  overrideId: string,
  payload: { active?: boolean; reason?: string },
  accessToken?: string | null,
) {
  return httpClient.patch<PermissionOverride>(
    `/v1/super-admin/users/${encodeURIComponent(userId)}/permission-overrides/${encodeURIComponent(overrideId)}`,
    payload,
    { accessToken },
  );
}

export function listSuperAdminAiRecommendations(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiRecommendation>>(`/v1/super-admin/ai/recommendations${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function approveSuperAdminAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(
    `/v1/super-admin/ai/recommendations/${encodeURIComponent(recommendationId)}/approve`,
    undefined,
    { accessToken },
  );
}

export function rejectSuperAdminAiRecommendation(recommendationId: string, reason: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(
    `/v1/super-admin/ai/recommendations/${encodeURIComponent(recommendationId)}/reject`,
    { reason },
    { accessToken },
  );
}

export function executeSuperAdminAiRecommendation(recommendationId: string, accessToken?: string | null) {
  return httpClient.post<AiRecommendation>(
    `/v1/super-admin/ai/recommendations/${encodeURIComponent(recommendationId)}/execute`,
    undefined,
    { accessToken },
  );
}

export function listSuperAdminAutomationRules(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AutomationRule>>(`/v1/super-admin/ai/automation-rules${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function createSuperAdminAutomationRule(payload: Partial<AutomationRule> & {
  tenantId?: string;
  schoolId?: string;
  triggerType: string;
  triggerConfigJson?: string;
  actionType: string;
  actionConfigJson?: string;
}, accessToken?: string | null) {
  return httpClient.post<AutomationRule>('/v1/super-admin/ai/automation-rules', payload, { accessToken });
}

export function updateSuperAdminAutomationRule(ruleId: string, payload: Partial<AutomationRule>, accessToken?: string | null) {
  return httpClient.patch<AutomationRule>(`/v1/super-admin/ai/automation-rules/${encodeURIComponent(ruleId)}`, payload, { accessToken });
}

export function listSuperAdminAutomationRuns(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AutomationRun>>(`/v1/super-admin/ai/automation-runs${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function listSuperAdminAiPolicies(params: PageQuery = {}, accessToken?: string | null) {
  return httpClient.get<PageResponse<AiPolicy>>(`/v1/super-admin/ai/policies${queryString({ page: 0, size: 25, ...params })}`, { accessToken });
}

export function updateSuperAdminAiPolicy(tenantId: string, payload: Partial<AiPolicy>, accessToken?: string | null) {
  return httpClient.put<AiPolicy>(`/v1/super-admin/ai/policies/${encodeURIComponent(tenantId)}`, payload, { accessToken });
}
