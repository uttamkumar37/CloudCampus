import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../app/queryKeys'
import { getStudentDetails } from '../api/studentApi'

export function useStudentDetails(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.studentDetails(id ?? ''),
    queryFn: () => getStudentDetails(id!),
    enabled: !!id,
  })
}
