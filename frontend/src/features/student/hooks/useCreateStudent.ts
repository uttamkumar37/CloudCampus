import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createStudent } from '../api/studentApi'

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
