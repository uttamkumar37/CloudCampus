import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'

import { updateTenantStatus } from '../api/superAdminApi'

interface UpdateTenantStatusPayload {
  tenantId: string
  active: boolean
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tenantId, active }: UpdateTenantStatusPayload) => updateTenantStatus(tenantId, { active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenants })
      void queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboardSummary })
    },
  })
}
