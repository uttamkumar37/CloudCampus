import axios from 'axios'

import { API_BASE_URL } from './endpoints'
import { storage } from '../utils/storage'
import { showToast } from '../utils/toast'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Token is sent via HttpOnly cookie; credentials must be included
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const role = storage.getRole()
  if (role === 'SUPER_ADMIN') {
    delete config.headers['X-Tenant-Slug']
    return config
  }

  const tenantSlug = storage.getTenantSlug()

  if (tenantSlug) {
    config.headers['X-Tenant-Slug'] = tenantSlug
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isSuperAdmin = storage.getRole() === 'SUPER_ADMIN'
      storage.clearAuth()
      showToast({
        title: 'Session expired',
        description: 'Please sign in again to continue.',
        tone: 'error',
      })
      setTimeout(() => {
        window.location.replace(isSuperAdmin ? '/super-admin/login' : '/login')
      }, 1200)
    }

    return Promise.reject(error)
  },
)
