import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getParentLinks, linkParent, unlinkParent } from '../api/parentApi'
import type { LinkParentRequest } from '../types'

export function useParentLinks() {
  return useQuery({
    queryKey: ['parent-links'],
    queryFn: getParentLinks,
  })
}

export function useLinkParent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LinkParentRequest) => linkParent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
      queryClient.invalidateQueries({ queryKey: ['parent-links'] })
    },
  })
}

export function useUnlinkParent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => unlinkParent(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
      queryClient.invalidateQueries({ queryKey: ['parent-links'] })
    },
  })
}
