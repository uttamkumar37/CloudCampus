/** Backend LoginRequest fields */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Subset of LoginResponse fields kept in memory.
 * Mirrors com.cloudcampus.auth.dto.LoginResponse.
 */
export interface AuthUser {
  userId: string;
  role: string;
  tenantId: string | null;
  requiresPasswordChange: boolean;
  expiresIn: number;
}
