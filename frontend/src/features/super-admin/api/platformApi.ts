import { httpClient } from '../../../shared/api/httpClient';

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
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

export function listSuperAdminTenants(accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminTenant>>('/v1/super-admin/tenants?size=50', { accessToken });
}

export function updateSuperAdminTenantStatus(tenantId: string, status: string, accessToken?: string | null) {
  return httpClient.patch<SuperAdminTenant>(
    `/v1/super-admin/tenants/${encodeURIComponent(tenantId)}/status`,
    { status },
    { accessToken },
  );
}

export function listSuperAdminSchools(accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminSchool>>('/v1/super-admin/schools?size=50', { accessToken });
}

export function getSuperAdminRevenue(accessToken?: string | null) {
  return httpClient.get<RevenueSummary>('/v1/super-admin/revenue/summary', { accessToken });
}

export function listSuperAdminInvoices(accessToken?: string | null) {
  return httpClient.get<PageResponse<SuperAdminInvoice>>('/v1/super-admin/revenue/invoices?size=50', { accessToken });
}

export function getSuperAdminAiUsage(accessToken?: string | null) {
  return httpClient.get<AiUsageSummary>('/v1/super-admin/ai/usage/summary', { accessToken });
}

export function getSuperAdminReports(accessToken?: string | null) {
  return httpClient.get<ReportSummary>('/v1/super-admin/reports/summary', { accessToken });
}

export function requestSuperAdminReportExport(accessToken?: string | null) {
  return httpClient.post<ReportSummary>(
    '/v1/super-admin/reports/exports',
    { reportType: 'PLATFORM_SUMMARY', format: 'CSV' },
    { accessToken },
  );
}

export function listSuperAdminAuditLogs(accessToken?: string | null) {
  return httpClient.get<PageResponse<AuditLogRow>>('/v1/super-admin/audit-logs?size=50', { accessToken });
}

export function getSuperAdminPlatformHealth(accessToken?: string | null) {
  return httpClient.get<PlatformHealth>('/v1/super-admin/platform-health', { accessToken });
}

export function getSuperAdminNotifications(accessToken?: string | null) {
  return httpClient.get<NotificationSummary>('/v1/super-admin/notifications/summary', { accessToken });
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
