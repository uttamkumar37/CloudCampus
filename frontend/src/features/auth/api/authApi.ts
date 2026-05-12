import authClient from '@/shared/api/authClient';
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
  requiresPasswordChange: boolean;
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
