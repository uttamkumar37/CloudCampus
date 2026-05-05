import { createBrowserRouter, Navigate } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { DashboardPage } from '../components/layout/DashboardPage'
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout'
import { PrivateRoute } from '../features/auth/components/PrivateRoute'
import { PublicRoute } from '../features/auth/components/PublicRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage'
import { AcademicPage } from '../features/academic/pages/AcademicPage'
import { StudentsPage } from '../features/student/pages/StudentsPage'
import { TeachersPage } from '../features/teacher/pages/TeachersPage'
import { BulkUploadPage } from '../features/bulk-upload/pages/BulkUploadPage'
import { SuperAdminDashboardPage } from '../features/super-admin/pages/SuperAdminDashboardPage'
import { SuperAdminLoginPage } from '../features/super-admin/pages/SuperAdminLoginPage'
import { TenantsPage } from '../features/super-admin/pages/TenantsPage'
import { UsersPage } from '../features/super-admin/pages/UsersPage'
import SubscriptionPlansPage from '../features/super-admin/pages/SubscriptionPlansPage'
import TenantSubscriptionPage from '../features/super-admin/pages/TenantSubscriptionPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { HomeworkPage } from '../features/homework/pages/HomeworkPage'
import { TimetablePage } from '../features/timetable/pages/TimetablePage'
import { MyChildrenPage } from '../features/parent/pages/MyChildrenPage'
import { ParentLinksAdminPage } from '../features/parent/pages/ParentLinksAdminPage'
import { AttendanceHubPage } from '../features/attendance/pages/AttendanceHubPage'
import { FeesHubPage } from '../features/fees/pages/FeesHubPage'
import { MarksHubPage } from '../features/marks/pages/MarksHubPage'
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage'
import { TeacherDashboardPage } from '../features/dashboard/pages/TeacherDashboardPage'

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
      { path: 'users', element: <UsersPage /> },
      { path: 'plans', element: <SubscriptionPlansPage /> },
      { path: 'subscriptions/:tenantId', element: <TenantSubscriptionPage /> },
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
      // Role-specific dashboard aliases — all resolve to the same branched DashboardPage
      {
        path: 'teacher/dashboard',
        element: (
          <PrivateRoute allowedRoles={['TEACHER']}>
            <TeacherDashboardPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'student/dashboard',
        element: (
          <PrivateRoute allowedRoles={['STUDENT']}>
            <StudentDashboardPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'parent/dashboard',
        element: (
          <PrivateRoute allowedRoles={['PARENT']}>
            <MyChildrenPage />
          </PrivateRoute>
        ),
      },
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
      {
        path: 'profile',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'homework',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <HomeworkPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'timetable',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <TimetablePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <AttendanceHubPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'fees',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <FeesHubPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'marks',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <MarksHubPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'my-children',
        element: (
          <PrivateRoute allowedRoles={['PARENT']}>
            <MyChildrenPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'parent-links',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <ParentLinksAdminPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'change-password',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <ChangePasswordPage />
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
