export interface LoginCredentials {
  username: string;
  password: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT';

export interface AuthUser {
  userId: string;
  role: UserRole;
  tenantId: string | null;
  requiresPasswordChange: boolean;
  expiresIn: number;
  features: string[];
}
