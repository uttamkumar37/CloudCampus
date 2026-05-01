import type { PropsWithChildren } from 'react'
import { createContext, useMemo, useState } from 'react'

import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import { storage } from '../../../utils/storage'
import type { LoginResponse, UserRole } from '../types'

interface AuthContextValue {
  tenantSlug: string | null
  schoolName: string | null
  username: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  setAuthSession: (response: LoginResponse) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [tenantSlug, setTenantSlug] = useState<string | null>(storage.getTenantSlug())
  const [schoolName, setSchoolName] = useState<string | null>(storage.getSchoolName())
  const [username, setUsername] = useState<string | null>(storage.getUsername())
  const [role, setRole] = useState<UserRole | null>(storage.getRole() as UserRole | null)

  const setAuthSession = (response: LoginResponse) => {
    storage.setUsername(response.username)
    storage.setRole(response.role)

    if (response.tenantSlug) {
      storage.setTenantSlug(response.tenantSlug)
    } else {
      storage.removeTenantSlug()
    }

    if (response.schoolName) {
      storage.setSchoolName(response.schoolName)
    } else {
      storage.removeSchoolName()
    }

    setTenantSlug(response.tenantSlug ?? null)
    setSchoolName(response.schoolName ?? null)
    setUsername(response.username)
    setRole(response.role)
  }

  const logout = () => {
    // Ask the backend to expire the HttpOnly cookie
    apiClient.post(ENDPOINTS.auth.logout).catch(() => {/* best-effort */})
    storage.clearAuth()
    setTenantSlug(null)
    setSchoolName(null)
    setUsername(null)
    setRole(null)
  }

  const value = useMemo(
    () => ({
      tenantSlug,
      schoolName,
      username,
      role,
      // isAuthenticated is derived from non-sensitive localStorage values.
      // If the HttpOnly cookie is expired the first protected API call will
      // return 401 and the response interceptor will call clearAuth().
      isAuthenticated: Boolean(username && role),
      isSuperAdmin: role === 'SUPER_ADMIN',
      setAuthSession,
      logout,
    }),
    [role, schoolName, tenantSlug, username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
