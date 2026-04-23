import { useQuery } from '@tanstack/react-query'

import { getStudents } from '../api/studentApi'

interface UseStudentsParams {
  page?: number
  size?: number
}

export function useStudents(params: UseStudentsParams = {}) {
  const { page = 0, size = 20 } = params

  return useQuery({
    queryKey: ['students', page, size],
    queryFn: () => getStudents({ page, size }),
  })
}
