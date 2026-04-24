import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

export interface UserProfile {
  userId: string | null
  username: string
  email: string
  fullName: string
  role: string
  active: boolean
  tenantSchema: string
}

export async function fetchCurrentProfile() {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.auth.me)
  return data
}
