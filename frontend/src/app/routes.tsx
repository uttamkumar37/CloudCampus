import { createBrowserRouter, Navigate } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { DashboardPage } from '../components/layout/DashboardPage'
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout'
import { PrivateRoute } from '../features/auth/components/PrivateRoute'
import { PublicRoute } from '../features/auth/components/PublicRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AcademicPage } from '../features/academic/pages/AcademicPage'
import { StudentsPage } from '../features/student/pages/StudentsPage'
import { TeachersPage } from '../features/teacher/pages/TeachersPage'
import { BulkUploadPage } from '../features/bulk-upload/pages/BulkUploadPage'
import { SuperAdminDashboardPage } from '../features/super-admin/pages/SuperAdminDashboardPage'
import { SuperAdminLoginPage } from '../features/super-admin/pages/SuperAdminLoginPage'
import { TenantsPage } from '../features/super-admin/pages/TenantsPage'

export const router = createBrowserRouter([
  {
    path: '/super-admin/login',
    element: (
      <PublicRoute>
        <SuperAdminLoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/super-admin',
    element: (
      <PrivateRoute allowedRoles={['SUPER_ADMIN']} loginPath="/super-admin/login">
        <SuperAdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/super-admin/dashboard" replace /> },
      { path: 'dashboard', element: <SuperAdminDashboardPage /> },
      { path: 'tenants', element: <TenantsPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'students',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <StudentsPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'teachers',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <TeachersPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'academic',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <AcademicPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'bulk-upload',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <BulkUploadPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
