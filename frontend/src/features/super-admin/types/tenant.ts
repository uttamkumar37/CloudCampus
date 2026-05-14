export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface TenantResponse {
  id: string;
  code: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreateRequest {
  code: string;
  name: string;
}

export interface SuperAdminStatsResponse {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  newThisMonth: number;
}

export type FeatureType = 'CORE' | 'OPTIONAL' | 'PREMIUM' | 'BETA';

export interface FeatureResponse {
  key: string;
  name: string;
  type: FeatureType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantFeatureResponse {
  tenantId: string;
  featureKey: string;
  enabled: boolean;
  updatedAt: string;
}

export interface SchoolComparisonRow {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  academicYearId: string | null;
  academicYearName: string;
  activeStudents: number;
  totalSessions: number;
  attendanceRate: number;
  totalDue: number;
  totalPaid: number;
  feeCollectionRate: number;
}

export interface ComparisonResponse {
  tenantId: string;
  totalSchools: number;
  schools: SchoolComparisonRow[];
}
