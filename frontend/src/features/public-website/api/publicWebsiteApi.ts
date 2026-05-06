import axios from 'axios'
import type { ApiResponse } from '../../../types/api'
import type { AdmissionLeadRequest, PublicWebsiteData } from '../types'

// Uses its own unauthenticated axios instance — no cookies, no tenant header
const publicClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export async function getPublicWebsite(slug: string): Promise<ApiResponse<PublicWebsiteData>> {
  const { data } = await publicClient.get<ApiResponse<PublicWebsiteData>>(`/website/${slug}`)
  return data
}

export async function submitAdmissionLead(
  slug: string,
  payload: AdmissionLeadRequest,
): Promise<ApiResponse<unknown>> {
  const { data } = await publicClient.post<ApiResponse<unknown>>(`/website/${slug}/leads`, payload)
  return data
}
