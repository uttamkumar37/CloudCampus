import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

export interface UserProfile {
  username: string
  email: string
  fullName: string
  role: string
  active: boolean
  tenantSlug: string | null
  schoolName: string | null
}

export async function fetchCurrentProfile() {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.auth.me)
  return data
}
