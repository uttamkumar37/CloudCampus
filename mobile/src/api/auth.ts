import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { LoginRequest, LoginResponse } from '../types/auth';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    payload,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
