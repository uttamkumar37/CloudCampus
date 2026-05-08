import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'
import type { PageResponse } from '../../../types/pagination'

import type { CreateStudentRequest, Student, StudentFullDetail, StudentStatus, UpdateStudentRequest } from '../types'

interface GetStudentsParams {
  page?: number
  size?: number
  search?: string
  status?: StudentStatus
}

export async function getStudents(params: GetStudentsParams = {}) {
  const { page = 0, size = 20, search, status } = params

  const { data } = await apiClient.get<ApiResponse<PageResponse<Student>>>(ENDPOINTS.students.base, {
    params: {
      page,
      size,
      ...(search && search.trim() ? { search: search.trim() } : {}),
      ...(status ? { status } : {}),
    },
  })

  return data
}

export async function createStudent(payload: CreateStudentRequest) {
  const { data } = await apiClient.post<ApiResponse<Student>>(ENDPOINTS.students.base, payload)
  return data
}

export async function updateStudent(id: string, payload: UpdateStudentRequest) {
  const { data } = await apiClient.patch<ApiResponse<Student>>(ENDPOINTS.students.byId(id), payload)
  return data
}

export async function deleteStudent(id: string) {
  await apiClient.delete(`${ENDPOINTS.students.base}/${id}`)
}

export async function getStudentDetails(id: string) {
  const { data } = await apiClient.get<ApiResponse<StudentFullDetail>>(ENDPOINTS.students.details(id))
  return data
}

export async function getMyStudentDetails() {
  const { data } = await apiClient.get<ApiResponse<StudentFullDetail>>(ENDPOINTS.students.meDetails)
  return data
}
