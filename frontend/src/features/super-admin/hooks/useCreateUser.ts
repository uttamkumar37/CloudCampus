import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '../api/usersApi'
import type { CreateUserRequest } from '../types'

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin:users'] })
    },
  })
}
