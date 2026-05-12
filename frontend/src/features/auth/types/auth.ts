/** Backend LoginRequest fields */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * All defined backend roles. Keep in sync with UserRole.java.
 */
export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT';

/**
 * Subset of LoginResponse fields kept in memory.
 * Mirrors com.cloudcampus.auth.dto.LoginResponse.
 * features: enabled feature-flag codes for the tenant (EUP-043).
 */
export interface AuthUser {
  userId: string;
  role: UserRole;
  tenantId: string | null;
  /** Populated for SCHOOL_ADMIN users — the school they administer. */
  schoolId: string | null;
  requiresPasswordChange: boolean;
  expiresIn: number;
  /** Feature-flag codes enabled for this tenant. Empty array = no features. */
  features: string[];
}
