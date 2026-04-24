export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'

export interface LoginRequest {
  username: string
  password: string
  tenantId?: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  username: string
  role: UserRole
  roles: string[]
  tenantId?: string
  userId?: string
}
