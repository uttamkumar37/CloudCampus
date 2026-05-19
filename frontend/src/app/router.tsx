import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AnalyticsConsentBanner } from '@/features/experience/components/AnalyticsConsentBanner';

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage            = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage   = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage    = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ChangePasswordPage   = lazy(() => import('@/features/auth/pages/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));
const ForbiddenPage        = lazy(() => import('@/features/auth/pages/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })));
const PlanUpgradePage      = lazy(() => import('@/features/auth/pages/PlanUpgradePage').then(m => ({ default: m.PlanUpgradePage })));

// ── Super Admin ───────────────────────────────────────────────────────────────
const SuperAdminLayout         = lazy(() => import('@/features/super-admin/layouts/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
const SuperAdminDashboardPage  = lazy(() => import('@/features/super-admin/pages/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));
const TenantListPage           = lazy(() => import('@/features/super-admin/pages/TenantListPage').then(m => ({ default: m.TenantListPage })));
const TenantCreatePage         = lazy(() => import('@/features/super-admin/pages/TenantCreatePage').then(m => ({ default: m.TenantCreatePage })));
const TenantDetailPage         = lazy(() => import('@/features/super-admin/pages/TenantDetailPage').then(m => ({ default: m.TenantDetailPage })));
const SchoolComparisonPage     = lazy(() => import('@/features/super-admin/pages/SchoolComparisonPage').then(m => ({ default: m.SchoolComparisonPage })));
const TenantAnalyticsPage      = lazy(() => import('@/features/super-admin/pages/TenantAnalyticsPage').then(m => ({ default: m.TenantAnalyticsPage })));
const PromptListPage           = lazy(() => import('@/features/super-admin/pages/PromptListPage').then(m => ({ default: m.PromptListPage })));
const PromptDetailPage         = lazy(() => import('@/features/super-admin/pages/PromptDetailPage').then(m => ({ default: m.PromptDetailPage })));
const KnowledgeBasePage        = lazy(() => import('@/features/super-admin/pages/KnowledgeBasePage').then(m => ({ default: m.KnowledgeBasePage })));
const AiUsagePage              = lazy(() => import('@/features/super-admin/pages/AiUsagePage').then(m => ({ default: m.AiUsagePage })));

// ── School Admin ──────────────────────────────────────────────────────────────
const SchoolAdminLayout        = lazy(() => import('@/features/school-admin/layouts/SchoolAdminLayout').then(m => ({ default: m.SchoolAdminLayout })));
const SchoolAdminDashboardPage = lazy(() => import('@/features/school-admin/pages/SchoolAdminDashboardPage').then(m => ({ default: m.SchoolAdminDashboardPage })));
const AiCopilotPage            = lazy(() => import('@/features/school-admin/pages/AiCopilotPage').then(m => ({ default: m.AiCopilotPage })));
const SchoolAdminProfilePage   = lazy(() => import('@/features/school-admin/pages/SchoolAdminProfilePage').then(m => ({ default: m.SchoolAdminProfilePage })));
const AcademicYearListPage     = lazy(() => import('@/features/school-admin/pages/AcademicYearListPage').then(m => ({ default: m.AcademicYearListPage })));
const ClassListPage            = lazy(() => import('@/features/school-admin/pages/ClassListPage').then(m => ({ default: m.ClassListPage })));
const SectionListPage          = lazy(() => import('@/features/school-admin/pages/SectionListPage').then(m => ({ default: m.SectionListPage })));
const SubjectListPage          = lazy(() => import('@/features/school-admin/pages/SubjectListPage').then(m => ({ default: m.SubjectListPage })));
const SchoolSettingsPage       = lazy(() => import('@/features/school-admin/pages/SchoolSettingsPage').then(m => ({ default: m.SchoolSettingsPage })));
const DepartmentListPage       = lazy(() => import('@/features/school-admin/pages/DepartmentListPage').then(m => ({ default: m.DepartmentListPage })));
const WebsiteBuilderPage       = lazy(() => import('@/features/school-admin/pages/WebsiteBuilderPage').then(m => ({ default: m.WebsiteBuilderPage })));
const CustomDomainPage         = lazy(() => import('@/features/school-admin/pages/CustomDomainPage').then(m => ({ default: m.CustomDomainPage })));

// ── Students ──────────────────────────────────────────────────────────────────
const StudentListPage          = lazy(() => import('@/features/student/pages/StudentListPage').then(m => ({ default: m.StudentListPage })));
const StudentAdmitPage         = lazy(() => import('@/features/student/pages/StudentAdmitPage').then(m => ({ default: m.StudentAdmitPage })));
const StudentProfilePage       = lazy(() => import('@/features/student/pages/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const StudentBulkImportPage    = lazy(() => import('@/features/student/pages/StudentBulkImportPage'));
const StudentPromotionPage     = lazy(() => import('@/features/student/pages/StudentPromotionPage'));

// ── Staff ─────────────────────────────────────────────────────────────────────
const StaffListPage            = lazy(() => import('@/features/staff/pages/StaffListPage').then(m => ({ default: m.StaffListPage })));
const StaffCreatePage          = lazy(() => import('@/features/staff/pages/StaffCreatePage').then(m => ({ default: m.StaffCreatePage })));
const StaffProfilePage         = lazy(() => import('@/features/staff/pages/StaffProfilePage').then(m => ({ default: m.StaffProfilePage })));
const StaffAttendancePage      = lazy(() => import('@/features/staff/pages/StaffAttendancePage'));
const LeaveManagementPage      = lazy(() => import('@/features/staff/pages/LeaveManagementPage'));

// ── Attendance ────────────────────────────────────────────────────────────────
const AttendanceSessionListPage   = lazy(() => import('@/features/attendance/pages/AttendanceSessionListPage').then(m => ({ default: m.AttendanceSessionListPage })));
const AttendanceCreateSessionPage = lazy(() => import('@/features/attendance/pages/AttendanceCreateSessionPage').then(m => ({ default: m.AttendanceCreateSessionPage })));
const AttendanceMarkPage          = lazy(() => import('@/features/attendance/pages/AttendanceMarkPage').then(m => ({ default: m.AttendanceMarkPage })));

// ── Finance ───────────────────────────────────────────────────────────────────
const FeeStructureListPage     = lazy(() => import('@/features/finance/pages/FeeStructureListPage'));
const FeeStructureCreatePage   = lazy(() => import('@/features/finance/pages/FeeStructureCreatePage'));
const FeeCollectionPage        = lazy(() => import('@/features/finance/pages/FeeCollectionPage'));
const StudentFeeDetailPage     = lazy(() => import('@/features/finance/pages/StudentFeeDetailPage'));

// ── Notifications / WhatsApp ──────────────────────────────────────────────────
const NotificationLogPage      = lazy(() => import('@/features/notification/pages/NotificationLogPage'));
const WhatsAppPage             = lazy(() => import('@/features/whatsapp/pages/WhatsAppPage'));

// ── Exams ─────────────────────────────────────────────────────────────────────
const ExamListPage             = lazy(() => import('@/features/exam/pages/ExamListPage'));
const ExamCreatePage           = lazy(() => import('@/features/exam/pages/ExamCreatePage'));
const ExamDetailPage           = lazy(() => import('@/features/exam/pages/ExamDetailPage'));
const MarksEntryPage           = lazy(() => import('@/features/exam/pages/MarksEntryPage'));
const ResultsPage              = lazy(() => import('@/features/exam/pages/ResultsPage'));
const ReportCardPage           = lazy(() => import('@/features/exam/pages/ReportCardPage'));

// ── Timetable / Homework / Assignments ────────────────────────────────────────
const TimetablePage            = lazy(() => import('@/features/timetable/pages/TimetablePage'));
const HomeworkListPage         = lazy(() => import('@/features/homework/pages/HomeworkListPage'));
const HomeworkCreatePage       = lazy(() => import('@/features/homework/pages/HomeworkCreatePage'));
const AssignmentListPage       = lazy(() => import('@/features/assignments/pages/AssignmentListPage'));
const AssignmentCreatePage     = lazy(() => import('@/features/assignments/pages/AssignmentCreatePage'));
const AssignmentDetailPage     = lazy(() => import('@/features/assignments/pages/AssignmentDetailPage'));

// ── Reports / Notices ─────────────────────────────────────────────────────────
const ReportsPage              = lazy(() => import('@/features/reports/pages/ReportsPage'));
const NoticeBoardPage          = lazy(() => import('@/features/notice-board/pages/NoticeBoardPage'));

// ── Teacher portal ────────────────────────────────────────────────────────────
const TeacherLayout                    = lazy(() => import('@/features/teacher/layouts/TeacherLayout').then(m => ({ default: m.TeacherLayout })));
const TeacherDashboardPage             = lazy(() => import('@/features/teacher/pages/TeacherDashboardPage'));
const TeacherTimetablePage             = lazy(() => import('@/features/teacher/pages/TeacherTimetablePage'));
const TeacherHomeworkListPage          = lazy(() => import('@/features/teacher/pages/TeacherHomeworkListPage'));
const TeacherHomeworkSubmissionsPage   = lazy(() => import('@/features/teacher/pages/TeacherHomeworkSubmissionsPage'));
const TeacherAssignmentListPage        = lazy(() => import('@/features/teacher/pages/TeacherAssignmentListPage'));
const TeacherAssignmentSubmissionsPage = lazy(() => import('@/features/teacher/pages/TeacherAssignmentSubmissionsPage'));
const TeacherAttendancePage            = lazy(() => import('@/features/teacher/pages/TeacherAttendancePage'));
const TeacherNoticesPage               = lazy(() => import('@/features/teacher/pages/TeacherNoticesPage'));
const TeacherLeavePage                 = lazy(() => import('@/features/teacher/pages/TeacherLeavePage'));
const LessonPlanPage                   = lazy(() => import('@/features/teacher/pages/LessonPlanPage').then(m => ({ default: m.LessonPlanPage })));
const OnlineClassPage                  = lazy(() => import('@/features/teacher/pages/OnlineClassPage').then(m => ({ default: m.OnlineClassPage })));
const VideoUploadPage                  = lazy(() => import('@/features/teacher/pages/VideoUploadPage').then(m => ({ default: m.VideoUploadPage })));

// ── Student portal ────────────────────────────────────────────────────────────
const StudentLayout            = lazy(() => import('@/features/student/layouts/StudentLayout').then(m => ({ default: m.StudentLayout })));
const StudentDashboardPage     = lazy(() => import('@/features/student/pages/StudentDashboardPage'));
const StudentHomeworkPage      = lazy(() => import('@/features/student/pages/StudentHomeworkPage'));
const StudentAssignmentsPage   = lazy(() => import('@/features/student/pages/StudentAssignmentsPage'));
const StudentTimetablePage     = lazy(() => import('@/features/student/pages/StudentTimetablePage'));
const StudentNoticesPage       = lazy(() => import('@/features/student/pages/StudentNoticesPage'));
const StudentResultsPage       = lazy(() => import('@/features/student/pages/StudentResultsPage'));
const StudentFeesPage          = lazy(() => import('@/features/student/pages/StudentFeesPage'));
const StudentAttendancePage    = lazy(() => import('@/features/student/pages/StudentAttendancePage'));
const StudentQrScanPage        = lazy(() => import('@/features/student/pages/StudentQrScanPage'));

// ── Parent portal ─────────────────────────────────────────────────────────────
const ParentLayout             = lazy(() => import('@/features/parent/layouts/ParentLayout').then(m => ({ default: m.ParentLayout })));
const ParentDashboardPage      = lazy(() => import('@/features/parent/pages/ParentDashboardPage'));
const ParentChildPage          = lazy(() => import('@/features/parent/pages/ParentChildPage'));
const ParentNoticesPage        = lazy(() => import('@/features/parent/pages/ParentNoticesPage'));

// ── Public site ───────────────────────────────────────────────────────────────
const PublicSitePage           = lazy(() => import('@/features/public-site/pages/PublicSitePage').then(m => ({ default: m.PublicSitePage })));

// ── DSEP — Experience Platform (public, no auth) ──────────────────────────────
const DemoPage                 = lazy(() => import('@/features/experience/pages/DemoPage'));
const InvestorRoomPage         = lazy(() => import('@/features/experience/pages/InvestorRoomPage'));

// ── DSEP — Super Admin Experience Control Center ──────────────────────────────
const ExperienceControlCenter  = lazy(() => import('@/features/super-admin/experience/ExperienceControlCenter'));
const PublicWebsiteDashboardPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsiteDashboardPage').then(m => ({ default: m.PublicWebsiteDashboardPage })));
const PublicWebsitePagesPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsitePagesPage').then(m => ({ default: m.PublicWebsitePagesPage })));
const PublicWebsiteBrandingPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsiteBrandingPage').then(m => ({ default: m.PublicWebsiteBrandingPage })));
const PublicWebsiteSeoPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsiteSeoPage').then(m => ({ default: m.PublicWebsiteSeoPage })));
const PublicWebsiteAnalyticsPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsiteAnalyticsPage').then(m => ({ default: m.PublicWebsiteAnalyticsPage })));
const PublicWebsiteMediaPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsiteMediaPage').then(m => ({ default: m.PublicWebsiteMediaPage })));
const PublicWebsitePublishPage = lazy(() => import('@/features/super-admin/public-website/pages/PublicWebsitePublishPage').then(m => ({ default: m.PublicWebsitePublishPage })));
const CloudCampusPublicWebsitePage = lazy(() => import('@/features/public-site/pages/CloudCampusPublicWebsitePage'));

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
      <Suspense fallback={null}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/plan-upgrade" element={<PlanUpgradePage />} />

          {/* Authenticated — any role */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

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
            <Route path="comparison" element={<SchoolComparisonPage />} />
            <Route path="analytics"  element={<TenantAnalyticsPage />} />
            <Route path="ai/prompts"       element={<PromptListPage />} />
            <Route path="ai/prompts/:id"   element={<PromptDetailPage />} />
            <Route path="ai/knowledge"     element={<KnowledgeBasePage />} />
            <Route path="ai/usage"         element={<AiUsagePage />} />
            <Route path="experience"       element={<ExperienceControlCenter />} />
            <Route path="public-website" element={<PublicWebsiteDashboardPage />} />
            <Route path="public-website/pages" element={<PublicWebsitePagesPage />} />
            <Route path="public-website/branding" element={<PublicWebsiteBrandingPage />} />
            <Route path="public-website/seo" element={<PublicWebsiteSeoPage />} />
            <Route path="public-website/analytics" element={<PublicWebsiteAnalyticsPage />} />
            <Route path="public-website/media" element={<PublicWebsiteMediaPage />} />
            <Route path="public-website/publish" element={<PublicWebsitePublishPage />} />
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
            <Route path="students/promote" element={<StudentPromotionPage />} />
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
            <Route path="departments" element={<DepartmentListPage />} />
            <Route path="website" element={<WebsiteBuilderPage />} />
            <Route path="custom-domain" element={<CustomDomainPage />} />
            <Route path="ai-copilot" element={<AiCopilotPage />} />
            <Route path="profile" element={<SchoolAdminProfilePage />} />
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
            <Route path="lesson-plans"   element={<LessonPlanPage />} />
            <Route path="online-classes" element={<OnlineClassPage />} />
            <Route path="videos"         element={<VideoUploadPage />} />
            <Route path="notices"        element={<TeacherNoticesPage />} />
            <Route path="leave"          element={<TeacherLeavePage />} />
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
            <Route path="attendance/scan" element={<StudentQrScanPage />} />
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

          {/* Public school website — no auth required */}
          <Route path="/sites/:tenantCode" element={<PublicSitePage />} />
          <Route path="/sites/:tenantCode/pages/:slug" element={<PublicSitePage />} />

          {/* DSEP public routes — no auth required */}
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/investor/:roomCode" element={<InvestorRoomPage />} />

          {/* Root and catch-all */}
          <Route path="/" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/home" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/features" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/platform" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/ai" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/investors" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/contact" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/pricing" element={<CloudCampusPublicWebsitePage />} />
          <Route path="/about" element={<CloudCampusPublicWebsitePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AnalyticsConsentBanner />
      </Suspense>
    </BrowserRouter>
  );
}
