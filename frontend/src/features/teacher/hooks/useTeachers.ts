import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'
import { getTeachers } from '../api/teacherApi'
import type { TeacherStatus } from '../types'

interface UseTeachersParams {
  page?: number
  size?: number
  search?: string
  status?: TeacherStatus
}

export function useTeachers(params: UseTeachersParams = {}) {
  const { page = 0, size = 20, search, status } = params

  return useQuery({
    queryKey: queryKeys.teachers(page, size, search, status),
    queryFn: () => getTeachers({ page, size, search, status }),
  })
}
