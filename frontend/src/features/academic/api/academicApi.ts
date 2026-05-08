import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type {
  AcademicClass,
  AcademicSection,
  AcademicSubject,
  CreateAcademicClassRequest,
  CreateAcademicSectionRequest,
  CreateAcademicSubjectRequest,
} from '../types'

export async function getAcademicClasses() {
  const { data } = await apiClient.get<ApiResponse<AcademicClass[]>>(`${ENDPOINTS.academic.base}/classes`)
  return data
}

export async function createAcademicClass(payload: CreateAcademicClassRequest) {
  const { data } = await apiClient.post<ApiResponse<AcademicClass>>(
    `${ENDPOINTS.academic.base}/classes`,
    payload,
  )
  return data
}

export async function getAcademicSubjects() {
  const { data } = await apiClient.get<ApiResponse<AcademicSubject[]>>(`${ENDPOINTS.academic.base}/subjects`)
  return data
}

export async function createAcademicSubject(payload: CreateAcademicSubjectRequest) {
  const { data } = await apiClient.post<ApiResponse<AcademicSubject>>(
    `${ENDPOINTS.academic.base}/subjects`,
    payload,
  )
  return data
}

export async function getAcademicSections() {
  const { data } = await apiClient.get<ApiResponse<AcademicSection[]>>(`${ENDPOINTS.academic.base}/sections`)
  return data
}

export async function createAcademicSection(payload: CreateAcademicSectionRequest) {
  const { data } = await apiClient.post<ApiResponse<AcademicSection>>(
    `${ENDPOINTS.academic.base}/sections`,
    payload,
  )
  return data
}

export async function assignClassTeacher(sectionId: string, teacherId: string) {
  const { data } = await apiClient.put<ApiResponse<AcademicSection>>(
    `${ENDPOINTS.academic.base}/sections/${sectionId}/class-teacher`,
    { teacherId },
  )
  return data
}

export async function removeClassTeacher(sectionId: string) {
  const { data } = await apiClient.delete<ApiResponse<AcademicSection>>(
    `${ENDPOINTS.academic.base}/sections/${sectionId}/class-teacher`,
  )
  return data
}
