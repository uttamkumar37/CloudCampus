import { useMutation } from '@tanstack/react-query'

import { sendCredentialsOtp } from '../api/authApi'
import type { CredentialOtpRequest } from '../types'

export function useSendCredentialsOtp() {
  return useMutation({
    mutationFn: (payload: CredentialOtpRequest) => sendCredentialsOtp(payload),
  })
}
