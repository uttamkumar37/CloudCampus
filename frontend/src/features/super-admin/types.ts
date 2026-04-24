export interface CreateUserRequest {
  fullName: string
  username: string
  email: string
  password: string
  role: string
  tenantId?: string
  rollNumber?: string
  employeeNumber?: string
  classId?: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  tenantId?: string
}

export interface Tenant {
  id: string
  tenantId: string
  schoolName: string
  schemaName: string
  logoUrl: string | null
  primaryColor: string
  active: boolean
  createdAt: string
}

export interface CreateTenantRequest {
  tenantId: string
  schoolName: string
  schemaName: string
  logoUrl: string
  primaryColor: string
}

export interface SuperAdminDashboardSummary {
  totalTenants: number
  activeTenants: number
  tenantsCreatedThisMonth: number
  inactiveTenants: number
  newestTenants: Tenant[]
}
