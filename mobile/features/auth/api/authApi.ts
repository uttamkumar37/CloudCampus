import authClient from '@/shared/api/authClient';
import type { ApiResponse } from '@/shared/types/api';

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken:            string;
  refreshToken:           string;
  expiresIn:              number;
  role:                   string;
  userId:                 string;
  tenantId:               string | null;
  schoolId:               string | null;
  requiresPasswordChange: boolean;
  features?:              string[];
}

export async function loginApi(credentials: LoginRequestData): Promise<LoginResponseData> {
  const { data } = await authClient.post<ApiResponse<LoginResponseData>>(
    '/v1/auth/login',
    credentials,
  );
  if (!data.data) throw new Error(data.error ?? 'Login failed');
  return data.data;
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
