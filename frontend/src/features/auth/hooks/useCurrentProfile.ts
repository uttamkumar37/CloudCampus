import { useQuery } from '@tanstack/react-query'

import { fetchCurrentProfile } from '../api/meApi'

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentProfile,
  })
}
