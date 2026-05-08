import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'
import { getTeacherDetails } from '../api/teacherApi'

export function useTeacherDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.teacherDetails(id),
    queryFn: () => getTeacherDetails(id),
    enabled: !!id,
  })
}
