import { apiClient } from '../../../api/client'
import type { ApiResponse } from '../../../types/api'
import type {
  AdmissionLead,
  GalleryItem,
  WebsiteConfig,
  WebsiteSection,
} from '../types'

// ---- Config ----
export async function getWebsiteConfig(): Promise<ApiResponse<WebsiteConfig>> {
  const { data } = await apiClient.get<ApiResponse<WebsiteConfig>>('/cms/config')
  return data
}

export async function upsertWebsiteConfig(payload: WebsiteConfig): Promise<ApiResponse<WebsiteConfig>> {
  const { data } = await apiClient.put<ApiResponse<WebsiteConfig>>('/cms/config', payload)
  return data
}

// ---- Sections ----
export async function getWebsiteSections(): Promise<ApiResponse<WebsiteSection[]>> {
  const { data } = await apiClient.get<ApiResponse<WebsiteSection[]>>('/cms/sections')
  return data
}

export async function upsertWebsiteSection(payload: WebsiteSection): Promise<ApiResponse<WebsiteSection>> {
  const { data } = await apiClient.put<ApiResponse<WebsiteSection>>('/cms/sections', payload)
  return data
}

export async function deleteWebsiteSection(sectionKey: string): Promise<void> {
  await apiClient.delete(`/cms/sections/${sectionKey}`)
}

// ---- Gallery ----
export async function getGallery(): Promise<ApiResponse<GalleryItem[]>> {
  const { data } = await apiClient.get<ApiResponse<GalleryItem[]>>('/cms/gallery')
  return data
}

export async function addGalleryItem(payload: GalleryItem): Promise<ApiResponse<GalleryItem>> {
  const { data } = await apiClient.post<ApiResponse<GalleryItem>>('/cms/gallery', payload)
  return data
}

export async function deleteGalleryItem(itemId: string): Promise<void> {
  await apiClient.delete(`/cms/gallery/${itemId}`)
}

// ---- Leads ----
export async function getAdmissionLeads(status?: string): Promise<ApiResponse<AdmissionLead[]>> {
  const params = status ? `?status=${status}` : ''
  const { data } = await apiClient.get<ApiResponse<AdmissionLead[]>>(`/cms/leads${params}`)
  return data
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
  notes?: string,
): Promise<ApiResponse<AdmissionLead>> {
  const { data } = await apiClient.patch<ApiResponse<AdmissionLead>>(`/cms/leads/${leadId}`, {
    status,
    notes,
  })
  return data
}
