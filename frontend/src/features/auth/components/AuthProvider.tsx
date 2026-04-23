import type { PropsWithChildren } from 'react'
import { createContext, useMemo, useState } from 'react'

import { storage } from '../../../utils/storage'

interface AuthContextValue {
  accessToken: string | null
  tenantId: string | null
  isAuthenticated: boolean
  setAuthSession: (accessToken: string, tenantId: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(storage.getAccessToken())
  const [tenantId, setTenantId] = useState<string | null>(storage.getTenantId())

  const setAuthSession = (nextAccessToken: string, nextTenantId: string) => {
    storage.setAccessToken(nextAccessToken)
    storage.setTenantId(nextTenantId)

    setAccessToken(nextAccessToken)
    setTenantId(nextTenantId)
  }

  const logout = () => {
    storage.clearAuth()
    setAccessToken(null)
    setTenantId(null)
  }

  const value = useMemo(
    () => ({
      accessToken,
      tenantId,
      isAuthenticated: Boolean(accessToken && tenantId),
      setAuthSession,
      logout,
    }),
    [accessToken, tenantId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
