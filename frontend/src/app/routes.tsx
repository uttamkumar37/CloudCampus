import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { DashboardPage } from '../components/layout/DashboardPage'
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout'
import { PrivateRoute } from '../features/auth/components/PrivateRoute'
import { PublicRoute } from '../features/auth/components/PublicRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage'
import { AcademicPage } from '../features/academic/pages/AcademicPage'
import { StudentsPage } from '../features/student/pages/StudentsPage'
import { StudentAdminProfilePage } from '../features/student/pages/StudentAdminProfilePage'
import { TeachersPage } from '../features/teacher/pages/TeachersPage'
import { TeacherAdminProfilePage } from '../features/teacher/pages/TeacherAdminProfilePage'
import { BulkUploadPage } from '../features/bulk-upload/pages/BulkUploadPage'
import { SuperAdminDashboardPage } from '../features/super-admin/pages/SuperAdminDashboardPage'
import { SuperAdminLoginPage } from '../features/super-admin/pages/SuperAdminLoginPage'
import { TenantsPage } from '../features/super-admin/pages/TenantsPage'
import { UsersPage } from '../features/super-admin/pages/UsersPage'
import SubscriptionPlansPage from '../features/super-admin/pages/SubscriptionPlansPage'
import TenantSubscriptionPage from '../features/super-admin/pages/TenantSubscriptionPage'
import { FeatureRoadmapPage } from '../features/super-admin/pages/FeatureRoadmapPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { HomeworkPage } from '../features/homework/pages/HomeworkPage'
import { TimetablePage } from '../features/timetable/pages/TimetablePage'
import { MyChildrenPage } from '../features/parent/pages/MyChildrenPage'
import { ParentLinksAdminPage } from '../features/parent/pages/ParentLinksAdminPage'
import { AttendanceHubPage } from '../features/attendance/pages/AttendanceHubPage'
import { FeesHubPage } from '../features/fees/pages/FeesHubPage'
import { MarksHubPage } from '../features/marks/pages/MarksHubPage'
import { WebsiteBuilderPage } from '../features/website-builder/pages/WebsiteBuilderPage'
import { SchoolWebsitePage } from '../features/public-website/pages/SchoolWebsitePage'
import { NoticeBoardPage } from '../features/notice-board/pages/NoticeBoardPage'
import { SupportPage } from '../features/support/pages/SupportPage'
import { LetterTemplatesPage } from '../features/letter-templates/pages/LetterTemplatesPage'
import { StudentBehaviorPage } from '../features/student-behavior/pages/StudentBehaviorPage'
import { PayrollPage } from '../features/payroll/pages/PayrollPage'
import { ExpensesPage } from '../features/expenses/pages/ExpensesPage'
import { TaskBoardPage } from '../features/tasks/pages/TaskBoardPage'
import { LibraryPage } from '../features/library/pages/LibraryPage'
import { AdmissionsPage } from '../features/admissions/pages/AdmissionsPage'
import { CommunicationPage } from '../features/communication/pages/CommunicationPage'
import { TransportPage } from '../features/transport/pages/TransportPage'
import { ProcurementPage } from '../features/procurement/pages/ProcurementPage'
import { AuditLogPage } from '../features/audit-log/pages/AuditLogPage'
import { QuestionBankPage } from '../features/question-bank/pages/QuestionBankPage'
import { HostelPage } from '../features/hostel/pages/HostelPage'
import { InventoryPage } from '../features/inventory/pages/InventoryPage'
import { ApprovalsPage } from '../features/approvals/pages/ApprovalsPage'

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
const StudentFullProfilePage = lazy(() =>
  import('../features/student/pages/StudentFullProfilePage').then((module) => ({
    default: module.StudentFullProfilePage,
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
      { path: 'roadmap', element: <FeatureRoadmapPage /> },
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
    path: '/roadmap',
    element: <FeatureRoadmapPage />,
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
        path: 'student/profile',
        element: (
          <PrivateRoute allowedRoles={['STUDENT']}>
            {withSuspense(<StudentFullProfilePage />)}
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
        path: 'students/:id',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <StudentAdminProfilePage />
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
        path: 'teachers/:id',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <TeacherAdminProfilePage />
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
        path: 'website-builder',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <WebsiteBuilderPage />
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
      {
        path: 'notice-board',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <NoticeBoardPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'support',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}>
            <SupportPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'letter-templates',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <LetterTemplatesPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'student-behavior',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <StudentBehaviorPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'payroll',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <PayrollPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'expenses',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <ExpensesPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <TaskBoardPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'library',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <LibraryPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'admissions',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <AdmissionsPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'communication',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <CommunicationPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'transport',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <TransportPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'procurement',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <ProcurementPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'audit-log',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <AuditLogPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'question-bank',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
            <QuestionBankPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'hostel',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <HostelPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'inventory',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <InventoryPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'approvals',
        element: (
          <PrivateRoute allowedRoles={['SCHOOL_ADMIN']}>
            <ApprovalsPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  // Public school website (no auth, accessible at /school/:slug)
  {
    path: '/school/:slug',
    element: <SchoolSlugPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

function SchoolSlugPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  return <SchoolWebsitePage slug={slug} />
}
