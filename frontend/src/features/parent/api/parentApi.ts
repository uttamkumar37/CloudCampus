import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import type { ApiResponse } from '../../../types/api'

import type { Child, LinkParentRequest, ParentStudentLink } from '../types'

export async function getParentLinks() {
  const { data } = await apiClient.get<ApiResponse<ParentStudentLink[]>>(ENDPOINTS.parent.links)
  return data
}

export async function getMyChildren() {
  const { data } = await apiClient.get<ApiResponse<Child[]>>(ENDPOINTS.parent.myChildren)
  return data
}

export async function linkParent(payload: LinkParentRequest) {
  const { data } = await apiClient.post<ApiResponse<null>>(ENDPOINTS.parent.links, payload)
  return data
}

export async function unlinkParent(linkId: string) {
  await apiClient.delete(ENDPOINTS.parent.linkById(linkId))
}
