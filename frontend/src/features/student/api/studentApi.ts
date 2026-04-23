import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'
import type { PageResponse } from '../../../types/pagination'

import type { CreateStudentRequest, Student } from '../types'

interface GetStudentsParams {
  page?: number
  size?: number
}

export async function getStudents(params: GetStudentsParams = {}) {
  const { page = 0, size = 20 } = params

  const { data } = await apiClient.get<ApiResponse<PageResponse<Student>>>(ENDPOINTS.students.base, {
    params: {
      page,
      size,
    },
  })

  return data
}

export async function createStudent(payload: CreateStudentRequest) {
  const { data } = await apiClient.post<ApiResponse<Student>>(ENDPOINTS.students.base, payload)
  return data
}
