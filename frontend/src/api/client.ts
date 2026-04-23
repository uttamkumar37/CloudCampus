import axios from 'axios'

import { API_BASE_URL } from './endpoints'
import { storage } from '../utils/storage'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = storage.getAccessToken()
  const tenantId = storage.getTenantId()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }

  return config
})
