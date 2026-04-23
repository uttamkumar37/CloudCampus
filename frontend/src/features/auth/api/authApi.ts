import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type { LoginRequest, LoginResponse } from '../types'

export async function login(payload: LoginRequest) {
  const { tenantId, ...body } = payload
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    ENDPOINTS.auth.login,
    body,
    { headers: { 'X-Tenant-ID': tenantId } },
  )
  return data
}
