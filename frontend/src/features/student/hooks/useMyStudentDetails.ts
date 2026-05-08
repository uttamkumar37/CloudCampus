import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../app/queryKeys'
import { getMyStudentDetails } from '../api/studentApi'

export function useMyStudentDetails() {
  return useQuery({
    queryKey: queryKeys.studentMyDetails,
    queryFn: getMyStudentDetails,
  })
}
