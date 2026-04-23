import { useMutation } from '@tanstack/react-query'

import { login } from '../api/authApi'

export function useLogin() {
  return useMutation({
    mutationFn: login,
  })
}
