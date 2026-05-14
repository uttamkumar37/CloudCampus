import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
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
import StaffAttendancePage from '@/features/staff/pages/StaffAttendancePage';
import LeaveManagementPage from '@/features/staff/pages/LeaveManagementPage';
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
import ResultsPage from '@/features/exam/pages/ResultsPage';
import ReportCardPage from '@/features/exam/pages/ReportCardPage';
import TimetablePage from '@/features/timetable/pages/TimetablePage';
import HomeworkListPage from '@/features/homework/pages/HomeworkListPage';
import HomeworkCreatePage from '@/features/homework/pages/HomeworkCreatePage';
import AssignmentListPage from '@/features/assignments/pages/AssignmentListPage';
import AssignmentCreatePage from '@/features/assignments/pages/AssignmentCreatePage';
import AssignmentDetailPage from '@/features/assignments/pages/AssignmentDetailPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import NoticeBoardPage from '@/features/notice-board/pages/NoticeBoardPage';
import StudentBulkImportPage from '@/features/student/pages/StudentBulkImportPage';
import { SuperAdminLayout } from '@/features/super-admin/layouts/SuperAdminLayout';
import { SuperAdminDashboardPage } from '@/features/super-admin/pages/SuperAdminDashboardPage';
import { TenantDetailPage } from '@/features/super-admin/pages/TenantDetailPage';
import { SchoolSettingsPage } from '@/features/school-admin/pages/SchoolSettingsPage';
import { TeacherLayout } from '@/features/teacher/layouts/TeacherLayout';
import TeacherDashboardPage from '@/features/teacher/pages/TeacherDashboardPage';
import TeacherTimetablePage from '@/features/teacher/pages/TeacherTimetablePage';
import TeacherHomeworkListPage from '@/features/teacher/pages/TeacherHomeworkListPage';
import TeacherHomeworkSubmissionsPage from '@/features/teacher/pages/TeacherHomeworkSubmissionsPage';
import TeacherAssignmentListPage from '@/features/teacher/pages/TeacherAssignmentListPage';
import TeacherAssignmentSubmissionsPage from '@/features/teacher/pages/TeacherAssignmentSubmissionsPage';
import TeacherAttendancePage from '@/features/teacher/pages/TeacherAttendancePage';
import TeacherNoticesPage from '@/features/teacher/pages/TeacherNoticesPage';
import { StudentLayout } from '@/features/student/layouts/StudentLayout';
import StudentDashboardPage from '@/features/student/pages/StudentDashboardPage';
import StudentHomeworkPage from '@/features/student/pages/StudentHomeworkPage';
import StudentAssignmentsPage from '@/features/student/pages/StudentAssignmentsPage';
import StudentTimetablePage from '@/features/student/pages/StudentTimetablePage';
import StudentNoticesPage from '@/features/student/pages/StudentNoticesPage';
import StudentResultsPage from '@/features/student/pages/StudentResultsPage';
import StudentFeesPage from '@/features/student/pages/StudentFeesPage';
import StudentAttendancePage from '@/features/student/pages/StudentAttendancePage';
import { ParentLayout } from '@/features/parent/layouts/ParentLayout';
import ParentDashboardPage from '@/features/parent/pages/ParentDashboardPage';
import ParentChildPage from '@/features/parent/pages/ParentChildPage';
import ParentNoticesPage from '@/features/parent/pages/ParentNoticesPage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/plan-upgrade" element={<PlanUpgradePage />} />

        {/* Super Admin portal — SUPER_ADMIN role required */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="tenants" element={<TenantListPage />} />
          <Route path="tenants/new" element={<TenantCreatePage />} />
          <Route path="tenants/:id" element={<TenantDetailPage />} />
        </Route>

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
          <Route path="students/bulk" element={<StudentBulkImportPage />} />
          <Route path="students/admit" element={<StudentAdmitPage />} />
          <Route path="students/:id" element={<StudentProfilePage />} />
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/new" element={<StaffCreatePage />} />
          <Route path="staff/:id" element={<StaffProfilePage />} />
          <Route path="staff-attendance" element={<StaffAttendancePage />} />
          <Route path="leave-requests" element={<LeaveManagementPage />} />
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
          <Route path="exams/:examId/results" element={<ResultsPage />} />
          <Route path="exams/:examId/results/students/:studentId" element={<ReportCardPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="homework" element={<HomeworkListPage />} />
          <Route path="homework/new" element={<HomeworkCreatePage />} />
          <Route path="assignments" element={<AssignmentListPage />} />
          <Route path="assignments/new" element={<AssignmentCreatePage />} />
          <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notices" element={<NoticeBoardPage />} />
          <Route path="settings" element={<SchoolSettingsPage />} />
        </Route>

        {/* Teacher portal — TEACHER role required */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['TEACHER']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="timetable" element={<TeacherTimetablePage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="homework" element={<TeacherHomeworkListPage />} />
          <Route path="homework/:homeworkId/submissions" element={<TeacherHomeworkSubmissionsPage />} />
          <Route path="assignments" element={<TeacherAssignmentListPage />} />
          <Route path="assignments/:assignmentId/submissions" element={<TeacherAssignmentSubmissionsPage />} />
          <Route path="notices" element={<TeacherNoticesPage />} />
        </Route>

        {/* Student portal — STUDENT role required */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="homework" element={<StudentHomeworkPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="timetable" element={<StudentTimetablePage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="fees" element={<StudentFeesPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="notices" element={<StudentNoticesPage />} />
        </Route>

        {/* Parent portal — PARENT role required */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute roles={['PARENT']}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboardPage />} />
          <Route path="children/:studentId" element={<ParentChildPage />} />
          <Route path="notices" element={<ParentNoticesPage />} />
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
