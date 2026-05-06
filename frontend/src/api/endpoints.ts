export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    sendCredentialsOtp: '/auth/credentials/send-otp',
    updateCredentials: '/auth/credentials/update',
  },
  dashboard: {
    tenantSummary: '/dashboard/tenant-summary',
    superAdminSummary: '/dashboard/super-admin-summary',
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    branding: (slug: string) => `/dashboard/branding/${slug}`,  // ADDED: tenant branding endpoint
  },
  bulk: {
    upload: '/bulk/upload',
    sample: (operation?: string) => operation ? `/bulk/sample?operation=${encodeURIComponent(operation)}` : '/bulk/sample',
    operations: '/bulk/operations',
    validate: '/bulk/validate',
    preview: '/bulk/preview',
    execute: '/bulk/execute',
    jobs: '/bulk/jobs',
    jobById: (jobId: string) => `/bulk/jobs/${jobId}`,
    retryJob: (jobId: string) => `/bulk/jobs/${jobId}/retry`,
    errorReport: (jobId: string) => `/bulk/jobs/${jobId}/error-report`,
  },
  tenants: {
    base: '/tenants',
    status: (tenantId: string) => `/tenants/${tenantId}/status`,
    searchSchools: '/tenants/schools/search',
    schoolBySlug: (slug: string) => `/tenants/schools/${slug}`,
  },
  users: {
    base: '/users',
  },
  students: {
    base: '/students',
    byId: (id: string) => `/students/${id}`,
    me: '/students/me',                                    // ADDED: student self-profile endpoint
    details: (id: string) => `/students/${id}/details`,   // ADDED: full student detail view
  },
  teachers: {
    base: '/teachers',
    byId: (id: string) => `/teachers/${id}`,
  },
  academic: {
    base: '/academics',
  },
  attendances: {
    base: '/attendances',
    byId: (id: string) => `/attendances/${id}`,
  },
  fees: {
    assignments: '/fees/assignments',
    payments: '/fees/payments',
    studentAssignments: (studentId: string) => `/fees/students/${studentId}/assignments`,
  },
  cms: {
    config: '/cms/config',
    sections: '/cms/sections',
    section: (key: string) => `/cms/sections/${key}`,
    gallery: '/cms/gallery',
    galleryItem: (id: string) => `/cms/gallery/${id}`,
    leads: '/cms/leads',
    lead: (id: string) => `/cms/leads/${id}`,
  },
  website: {
    bySlug: (slug: string) => `/website/${slug}`,
    leads: (slug: string) => `/website/${slug}/leads`,
  },
  exams: {
    base: '/exams',
    byClass: (classId: string) => `/exams/classes/${classId}`,
    results: '/exams/results',
    resultsByExam: (examId: string) => `/exams/${examId}/results`,
  },
  homework: {
    base: '/homework',
    byClass: (classId: string) => `/homework/classes/${classId}`,
  },
  timetable: {
    slots: '/timetable/slots',
    byClassSection: (classId: string, sectionId: string) =>
      `/timetable/classes/${classId}/sections/${sectionId}`,
  },
  parent: {
    myChildren: '/parents/me/children',
    links: '/parents/links',
    linkById: (linkId: string) => `/parents/links/${linkId}`,
  },
  plans: {
    base: '/plans',
    byId: (id: string) => `/plans/${id}`,
  },
  subscriptions: {
    subscribe: (tenantId: string) => `/tenants/${tenantId}/subscribe`,
    initiate: (tenantId: string) => `/tenants/${tenantId}/subscribe/initiate`,
    get: (tenantId: string) => `/tenants/${tenantId}/subscription`,
    cancel: (tenantId: string) => `/tenants/${tenantId}/subscription`,
  },
  payments: {
    base: '/payments',
    byTenant: (tenantId: string) => `/payments/tenant/${tenantId}`,
    webhook: '/payments/webhook',
  },
} as const
