export const API_BASE_URL = 'http://localhost:8080/api/v1'

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  students: {
    base: '/students',
  },
  teachers: {
    base: '/teachers',
  },
  academic: {
    base: '/academic',
  },
} as const
