import { lazy, Suspense, type ReactNode } from 'react'
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

const StudentDashboardPage = lazy(() =>
  import('../features/dashboard/pages/StudentDashboardPage').then((module) => ({
    default: module.StudentDashboardPage,
  })),
)
const TeacherDashboardPage = lazy(() =>
  import('../features/dashboard/pages/TeacherDashboardPage').then((module) => ({
    default: module.TeacherDashboardPage,
  })),
)
const StudentLearningPage = lazy(() =>
  import('../features/student/pages/StudentLearningPage').then((module) => ({
    default: module.StudentLearningPage,
  })),
)
const ParentLearningPage = lazy(() =>
  import('../features/parent/pages/ParentLearningPage').then((module) => ({
    default: module.ParentLearningPage,
  })),
)

function withSuspense(element: ReactNode) {
  return (
    <Suspense
      fallback={(
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading page...
        </div>
      )}
    >
      {element}
    </Suspense>
  )
}

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
            {withSuspense(<TeacherDashboardPage />)}
          </PrivateRoute>
        ),
      },
      {
        path: 'student/dashboard',
        element: (
          <PrivateRoute allowedRoles={['STUDENT']}>
            {withSuspense(<StudentDashboardPage />)}
          </PrivateRoute>
        ),
      },
      {
        path: 'student/learning',
        element: (
          <PrivateRoute allowedRoles={['STUDENT']}>
            {withSuspense(<StudentLearningPage />)}
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
        path: 'parent/learning',
        element: (
          <PrivateRoute allowedRoles={['PARENT']}>
            {withSuspense(<ParentLearningPage />)}
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
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <HomeworkPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'timetable',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <TimetablePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
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
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
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
