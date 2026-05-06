import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addGalleryItem,
  deleteGalleryItem,
  deleteWebsiteSection,
  getAdmissionLeads,
  getGallery,
  getWebsiteConfig,
  getWebsiteSections,
  updateLeadStatus,
  upsertWebsiteConfig,
  upsertWebsiteSection,
} from '../api/websiteApi'

const KEYS = {
  config: ['cms', 'config'] as const,
  sections: ['cms', 'sections'] as const,
  gallery: ['cms', 'gallery'] as const,
  leads: (status?: string) => ['cms', 'leads', status ?? 'all'] as const,
}

export function useWebsiteConfig() {
  return useQuery({ queryKey: KEYS.config, queryFn: getWebsiteConfig })
}

export function useUpsertWebsiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertWebsiteConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.config }),
  })
}

export function useWebsiteSections() {
  return useQuery({ queryKey: KEYS.sections, queryFn: getWebsiteSections })
}

export function useUpsertWebsiteSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertWebsiteSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.sections }),
  })
}

export function useDeleteWebsiteSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWebsiteSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.sections }),
  })
}

export function useGallery() {
  return useQuery({ queryKey: KEYS.gallery, queryFn: getGallery })
}

export function useAddGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addGalleryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.gallery }),
  })
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.gallery }),
  })
}

export function useAdmissionLeads(status?: string) {
  return useQuery({
    queryKey: KEYS.leads(status),
    queryFn: () => getAdmissionLeads(status),
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, status, notes }: { leadId: string; status: string; notes?: string }) =>
      updateLeadStatus(leadId, status, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms', 'leads'] }),
  })
}
