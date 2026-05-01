export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'

export interface LoginRequest {
  username: string
  password: string
  tenantSlug?: string
  role?: UserRole
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  username: string
  role: UserRole
  roles: string[]
  tenantSlug?: string
  schoolName?: string
}

export interface SchoolSearchResult {
  slug: string
  schoolName: string
  logoUrl: string | null
  primaryColor: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
