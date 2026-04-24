const ACCESS_TOKEN_KEY = 'edutenant.accessToken'
const TENANT_ID_KEY = 'edutenant.tenantId'
const USERNAME_KEY = 'edutenant.username'
const ROLE_KEY = 'edutenant.role'
const USER_ID_KEY = 'edutenant.userId'

export const storage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  removeAccessToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
  getTenantId: (): string | null => localStorage.getItem(TENANT_ID_KEY),
  setTenantId: (tenantId: string): void => {
    localStorage.setItem(TENANT_ID_KEY, tenantId)
  },
  removeTenantId: (): void => {
    localStorage.removeItem(TENANT_ID_KEY)
  },
  getUsername: (): string | null => localStorage.getItem(USERNAME_KEY),
  setUsername: (username: string): void => {
    localStorage.setItem(USERNAME_KEY, username)
  },
  removeUsername: (): void => {
    localStorage.removeItem(USERNAME_KEY)
  },
  getRole: (): string | null => localStorage.getItem(ROLE_KEY),
  setRole: (role: string): void => {
    localStorage.setItem(ROLE_KEY, role)
  },
  removeRole: (): void => {
    localStorage.removeItem(ROLE_KEY)
  },
  getUserId: (): string | null => localStorage.getItem(USER_ID_KEY),
  setUserId: (userId: string): void => {
    localStorage.setItem(USER_ID_KEY, userId)
  },
  removeUserId: (): void => {
    localStorage.removeItem(USER_ID_KEY)
  },
  clearAuth: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(TENANT_ID_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_ID_KEY)
  },
}
