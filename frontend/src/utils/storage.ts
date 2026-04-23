const ACCESS_TOKEN_KEY = 'edutenant.accessToken'
const TENANT_ID_KEY = 'edutenant.tenantId'

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
  clearAuth: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(TENANT_ID_KEY)
  },
}
