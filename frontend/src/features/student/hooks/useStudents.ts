import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'
import { getStudents } from '../api/studentApi'
import type { StudentStatus } from '../types'

interface UseStudentsParams {
  page?: number
  size?: number
  search?: string
  status?: StudentStatus
}

export function useStudents(params: UseStudentsParams = {}) {
  const { page = 0, size = 20, search, status } = params

  return useQuery({
    queryKey: queryKeys.students(page, size, search, status),
    queryFn: () => getStudents({ page, size, search, status }),
  })
}
