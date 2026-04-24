import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'
import type { CreateUserRequest } from '../types'

export async function createUser(payload: CreateUserRequest) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(ENDPOINTS.users.base, {
    fullName: payload.fullName,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  })
  return data
}
