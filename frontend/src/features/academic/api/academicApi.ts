import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type { AcademicClass } from '../types'

export async function getAcademicClasses() {
  const { data } = await apiClient.get<ApiResponse<AcademicClass[]>>(ENDPOINTS.academic.base)
  return data
}
