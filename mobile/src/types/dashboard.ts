export interface TenantBranding {
  tenantId: string;
  schoolName: string;
  logoUrl: string | null;
  primaryColor: string;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export interface RecentActivity {
  title: string;
  description: string;
  type: string;
  occurredAt: string;
}

export interface TenantDashboardSummary {
  branding: TenantBranding;
  totalStudents: number;
  totalTeachers: number;
  attendancePercentage: number;
  feesCollected: number;
  attendanceTrend: MetricPoint[];
  monthlyFeeCollection: MetricPoint[];
  recentActivity: RecentActivity[];
  quickInsights: string[];
}
