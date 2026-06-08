import { httpClient } from '../../../shared/api/httpClient';

export const BACKEND_USER_ROLES = [
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'TEACHER',
  'STUDENT',
  'PARENT',
  'FINANCE_STAFF',
  'OFFICE_STAFF',
  'GUEST',
  'SYSTEM',
  'AI_AGENT',
  'STAFF',
] as const;

export type UserRole = (typeof BACKEND_USER_ROLES)[number];

export type SchoolAccess = {
  schoolId: string;
  code: string;
  name: string;
  role: UserRole;
  primaryAccess: boolean;
};

export type CurrentUser = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId: string;
  activeSchool: SchoolAccess | null;
  allowedSchools: SchoolAccess[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: 'Bearer' | null;
  expiresAt: string | null;
  user: CurrentUser | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
  mfaCode: string | null;
  mfaExpiresAt: string | null;
};

export type AuthMessage = {
  message: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken: string;
  expiresAt: string;
};

export async function login(payload: LoginRequest): Promise<AuthSession> {
  return httpClient.post<AuthSession>('/v1/auth/login', payload, { accessToken: null, retryOnUnauthorized: false });
}

export async function verifyMfa(challengeId: string, code: string): Promise<AuthSession> {
  return httpClient.post<AuthSession>('/v1/auth/mfa/verify', { challengeId, code }, { accessToken: null, retryOnUnauthorized: false });
}

export async function refreshSession(refreshToken: string): Promise<AuthSession> {
  return httpClient.post<AuthSession>('/v1/auth/refresh', { refreshToken }, { accessToken: null, retryOnUnauthorized: false });
}

export async function logout(accessToken: string, refreshToken?: string): Promise<AuthMessage> {
  return httpClient.post<AuthMessage>('/v1/me/logout', { refreshToken }, { accessToken });
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return httpClient.post<ForgotPasswordResponse>('/v1/auth/forgot-password', { email }, { accessToken: null, retryOnUnauthorized: false });
}

export async function resetPassword(token: string, password: string): Promise<AuthMessage> {
  return httpClient.post<AuthMessage>('/v1/auth/reset-password', { token, password }, { accessToken: null, retryOnUnauthorized: false });
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthMessage> {
  return httpClient.post<AuthMessage>('/v1/me/change-password', { currentPassword, newPassword }, { accessToken });
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return httpClient.get<CurrentUser>('/v1/me', { accessToken });
}

export async function getMySchools(accessToken: string): Promise<SchoolAccess[]> {
  return httpClient.get<SchoolAccess[]>('/v1/me/schools', { accessToken });
}

export async function activateSchool(accessToken: string, schoolId: string): Promise<AuthSession> {
  return httpClient.post<AuthSession>(`/v1/me/schools/${schoolId}/activate`, undefined, { accessToken });
}
