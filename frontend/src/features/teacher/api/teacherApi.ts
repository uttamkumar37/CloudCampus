import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type { Teacher } from '../types'

export async function getTeachers() {
  const { data } = await apiClient.get<ApiResponse<Teacher[]>>(ENDPOINTS.teachers.base)
  return data
}
