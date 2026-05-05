import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'
import type { PageResponse } from '../../../types/pagination'
import type { CreateUserRequest } from '../types'
import type { User } from '../types'

interface GetUsersParams {
  page?: number
  size?: number
}

export async function getUsers(params: GetUsersParams = {}) {
  const { page = 0, size = 50 } = params
  const { data } = await apiClient.get<ApiResponse<PageResponse<User>>>(ENDPOINTS.users.base, {
    params: { page, size },
  })
  return data
}

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
