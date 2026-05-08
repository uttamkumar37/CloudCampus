import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'
import type { PageResponse } from '../../../types/pagination'

import type { CreateTeacherRequest, Teacher, TeacherDetailResponse, TeacherStatus, UpdateTeacherRequest } from '../types'

interface GetTeachersParams {
  page?: number
  size?: number
  search?: string
  status?: TeacherStatus
}

export async function getTeachers(params: GetTeachersParams = {}) {
  const { page = 0, size = 20, search, status } = params

  const { data } = await apiClient.get<ApiResponse<PageResponse<Teacher>>>(ENDPOINTS.teachers.base, {
    params: { page, size, ...(search ? { search } : {}), ...(status ? { status } : {}) },
  })

  return data
}

export async function getTeacherById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Teacher>>(ENDPOINTS.teachers.byId(id))
  return data
}

export async function getTeacherDetails(id: string) {
  const { data } = await apiClient.get<ApiResponse<TeacherDetailResponse>>(`${ENDPOINTS.teachers.byId(id)}/details`)
  return data
}

export async function createTeacher(payload: CreateTeacherRequest) {
  const { data } = await apiClient.post<ApiResponse<Teacher>>(ENDPOINTS.teachers.base, payload)
  return data
}

export async function updateTeacher(id: string, payload: UpdateTeacherRequest) {
  const { data } = await apiClient.patch<ApiResponse<Teacher>>(ENDPOINTS.teachers.byId(id), payload)
  return data
}

export async function deleteTeacher(id: string) {
  await apiClient.delete(`${ENDPOINTS.teachers.base}/${id}`)
}
