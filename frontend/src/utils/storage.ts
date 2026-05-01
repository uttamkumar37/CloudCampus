// NOTE: The JWT access token is stored in an HttpOnly cookie set by the backend.
// It is not accessible from JavaScript. Only non-sensitive session metadata is
// kept in localStorage (tenantSlug, schoolName, username, role).

const TENANT_SLUG_KEY = 'cloudcampus.tenantSlug'
const SCHOOL_NAME_KEY = 'cloudcampus.schoolName'
const USERNAME_KEY = 'cloudcampus.username'
const ROLE_KEY = 'cloudcampus.role'

const LEGACY_TENANT_ID_KEY = 'edutenant.tenantId'
const LEGACY_USERNAME_KEY = 'edutenant.username'
const LEGACY_ROLE_KEY = 'edutenant.role'

export const storage = {
  getTenantSlug: (): string | null => localStorage.getItem(TENANT_SLUG_KEY),
  setTenantSlug: (tenantSlug: string): void => {
    localStorage.setItem(TENANT_SLUG_KEY, tenantSlug)
  },
  removeTenantSlug: (): void => {
    localStorage.removeItem(TENANT_SLUG_KEY)
  },
  getSchoolName: (): string | null => localStorage.getItem(SCHOOL_NAME_KEY),
  setSchoolName: (schoolName: string): void => {
    localStorage.setItem(SCHOOL_NAME_KEY, schoolName)
  },
  removeSchoolName: (): void => {
    localStorage.removeItem(SCHOOL_NAME_KEY)
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
  clearAuth: (): void => {
    localStorage.removeItem(TENANT_SLUG_KEY)
    localStorage.removeItem(SCHOOL_NAME_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(LEGACY_TENANT_ID_KEY)
    localStorage.removeItem(LEGACY_USERNAME_KEY)
    localStorage.removeItem(LEGACY_ROLE_KEY)
  },
}
