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
  tenantId: string
  slug: string
  schoolName: string
  schemaName: string
  logoUrl: string | null
  primaryColor: string
  active: boolean
  createdAt: string
}

export interface CreateTenantRequest {
  tenantId: string
  slug?: string
  schoolName: string
  schemaName: string
  logoUrl: string
  primaryColor: string
}

export type PlanFeature =
  | 'STUDENT_MANAGEMENT'
  | 'TEACHER_MANAGEMENT'
  | 'ACADEMIC_MANAGEMENT'
  | 'ATTENDANCE_TRACKING'
  | 'FEE_MANAGEMENT'
  | 'EXAM_MANAGEMENT'
  | 'HOMEWORK_MANAGEMENT'
  | 'TIMETABLE_MANAGEMENT'
  | 'PARENT_PORTAL'
  | 'BULK_UPLOAD'
  | 'DASHBOARD_ACCESS'
  | 'ADVANCED_REPORTS'
  | 'CUSTOM_BRANDING'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycleDays: number
  maxStudents: number
  maxTeachers: number
  description: string | null
  active: boolean
  features: PlanFeature[]
  createdAt: string
}

export interface CreatePlanRequest {
  name: string
  price: number
  billingCycleDays: number
  maxStudents: number
  maxTeachers: number
  description?: string
  features: PlanFeature[]
}

export interface SubscribeRequest {
  planId: string
  durationDays: number
}

export interface TenantSubscription {
  id: string
  tenantId: string
  plan: SubscriptionPlan
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  createdAt: string
}

export interface InitiatePaymentResponse {
  orderId: string
  amountInPaise: number
  currency: string
  keyId: string
  subscriptionId: string
  tenantId: string
}

export interface RecordPaymentRequest {
  tenantId: string
  subscriptionId?: string
  amount: number
  paymentDate: string
  paymentMethod: 'MANUAL' | 'BANK_TRANSFER' | 'UPI' | 'RAZORPAY' | 'STRIPE'
  referenceNo?: string
  notes?: string
}

export interface PlatformPayment {
  id: string
  tenantId: string
  subscriptionId: string | null
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentDate: string
  paymentMethod: 'MANUAL' | 'BANK_TRANSFER' | 'UPI' | 'RAZORPAY' | 'STRIPE'
  referenceNo: string | null
  notes: string | null
  createdAt: string
}

export interface SuperAdminDashboardSummary {
  totalTenants: number
  activeTenants: number
  tenantsCreatedThisMonth: number
  inactiveTenants: number
  newestTenants: Tenant[]
}
