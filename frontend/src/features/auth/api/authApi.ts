import authClient from '@/shared/api/authClient';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Request / response shapes (mirrors backend DTOs) ─────────────────────────

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  userId: string;
  tenantId: string | null;
  /** Populated for SCHOOL_ADMIN — the primary school UUID for that tenant. */
  schoolId?: string | null;
  requiresPasswordChange: boolean;
  /** Feature-flag codes enabled for the tenant. Backend populates in future. */
  features?: string[];
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function loginApi(
  credentials: LoginRequestData,
): Promise<LoginResponseData> {
  const { data } = await authClient.post<ApiResponse<LoginResponseData>>(
    '/v1/auth/login',
    credentials,
  );
  return data.data!;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await authClient.post('/v1/auth/logout', { refreshToken });
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await authClient.post('/v1/auth/forgot-password', { email });
}

export async function resetPasswordApi(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  await authClient.post('/v1/auth/reset-password', { email, otp, newPassword });
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await axiosInstance.post('/v1/auth/change-password', { currentPassword, newPassword });
}

export async function revokeAllSessionsApi(): Promise<void> {
  await axiosInstance.post('/v1/auth/revoke-all');
}
