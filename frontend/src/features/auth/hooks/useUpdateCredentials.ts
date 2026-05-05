import { useMutation } from '@tanstack/react-query'

import { updateCredentials } from '../api/authApi'
import type { UpdateCredentialsRequest } from '../types'

export function useUpdateCredentials() {
  return useMutation({
    mutationFn: (payload: UpdateCredentialsRequest) => updateCredentials(payload),
  })
}
