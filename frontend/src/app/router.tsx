import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage';
import { PlanUpgradePage } from '@/features/auth/pages/PlanUpgradePage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { TenantListPage } from '@/features/super-admin/pages/TenantListPage';
import { TenantCreatePage } from '@/features/super-admin/pages/TenantCreatePage';
import { SchoolAdminLayout } from '@/features/school-admin/layouts/SchoolAdminLayout';
import { SchoolAdminDashboardPage } from '@/features/school-admin/pages/SchoolAdminDashboardPage';
import { AcademicYearListPage } from '@/features/school-admin/pages/AcademicYearListPage';
import { ClassListPage } from '@/features/school-admin/pages/ClassListPage';
import { SectionListPage } from '@/features/school-admin/pages/SectionListPage';
import { SubjectListPage } from '@/features/school-admin/pages/SubjectListPage';
import { StudentListPage } from '@/features/student/pages/StudentListPage';
import { StudentAdmitPage } from '@/features/student/pages/StudentAdmitPage';
import { StudentProfilePage } from '@/features/student/pages/StudentProfilePage';
import { StaffListPage } from '@/features/staff/pages/StaffListPage';
import { StaffCreatePage } from '@/features/staff/pages/StaffCreatePage';
import { StaffProfilePage } from '@/features/staff/pages/StaffProfilePage';
import { AttendanceSessionListPage } from '@/features/attendance/pages/AttendanceSessionListPage';
import { AttendanceCreateSessionPage } from '@/features/attendance/pages/AttendanceCreateSessionPage';
import { AttendanceMarkPage } from '@/features/attendance/pages/AttendanceMarkPage';
import FeeStructureListPage from '@/features/finance/pages/FeeStructureListPage';
import FeeStructureCreatePage from '@/features/finance/pages/FeeStructureCreatePage';
import FeeCollectionPage from '@/features/finance/pages/FeeCollectionPage';
import StudentFeeDetailPage from '@/features/finance/pages/StudentFeeDetailPage';
import NotificationLogPage from '@/features/notification/pages/NotificationLogPage';
import WhatsAppPage from '@/features/whatsapp/pages/WhatsAppPage';
import ExamListPage from '@/features/exam/pages/ExamListPage';
import ExamCreatePage from '@/features/exam/pages/ExamCreatePage';
import ExamDetailPage from '@/features/exam/pages/ExamDetailPage';
import MarksEntryPage from '@/features/exam/pages/MarksEntryPage';

/**
 * Application router.
 *
 * Public:        /login, /403, /plan-upgrade
 * Super Admin:   /super-admin/tenants, /super-admin/tenants/new
 * School Admin:  /school-admin/* — SCHOOL_ADMIN role required
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/plan-upgrade" element={<PlanUpgradePage />} />

        {/* Super Admin portal — SUPER_ADMIN role required */}
        <Route
          path="/super-admin/tenants/new"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <TenantCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/tenants"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <TenantListPage />
            </ProtectedRoute>
          }
        />
        <Route path="/super-admin" element={<Navigate to="/super-admin/tenants" replace />} />

        {/* School Admin portal — SCHOOL_ADMIN role required */}
        <Route
          path="/school-admin"
          element={
            <ProtectedRoute roles={['SCHOOL_ADMIN']}>
              <SchoolAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SchoolAdminDashboardPage />} />
          <Route path="academic-years" element={<AcademicYearListPage />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="sections" element={<SectionListPage />} />
          <Route path="subjects" element={<SubjectListPage />} />
          <Route path="students" element={<StudentListPage />} />
          <Route path="students/admit" element={<StudentAdmitPage />} />
          <Route path="students/:id" element={<StudentProfilePage />} />
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/new" element={<StaffCreatePage />} />
          <Route path="staff/:id" element={<StaffProfilePage />} />
          <Route path="attendance" element={<AttendanceSessionListPage />} />
          <Route path="attendance/new" element={<AttendanceCreateSessionPage />} />
          <Route path="attendance/sessions/:sessionId/mark" element={<AttendanceMarkPage />} />
          <Route path="fees" element={<FeeStructureListPage />} />
          <Route path="fees/structures/new" element={<FeeStructureCreatePage />} />
          <Route path="fees/collection" element={<FeeCollectionPage />} />
          <Route path="fees/records/:recordId" element={<StudentFeeDetailPage />} />
          <Route path="notifications" element={<NotificationLogPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="exams" element={<ExamListPage />} />
          <Route path="exams/create" element={<ExamCreatePage />} />
          <Route path="exams/:examId" element={<ExamDetailPage />} />
          <Route path="exams/:examId/subjects/:subjectEntryId/marks" element={<MarksEntryPage />} />
        </Route>

        {/* Authenticated catch-all → role-appropriate home */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <Navigate to="/app/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Root and catch-all */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
