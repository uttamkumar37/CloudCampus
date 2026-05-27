import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  CalendarCheck,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Cloud,
  Command,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  Moon,
  Newspaper,
  PanelLeft,
  ReceiptText,
  School,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { AcademicAssignmentsPage } from '../features/academic/pages/AcademicAssignmentsPage';
import { AcademicSetupPage } from '../features/academic/pages/AcademicSetupPage';
import { SchoolSelector } from '../features/auth/components/SchoolSelector';
import { AuthClient, AuthStateProvider, useAuthState } from '../features/auth/hooks/authState';
import { InvitationAcceptPage } from '../features/auth/pages/InvitationAcceptPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { createFinanceFeeDemand, recordFinanceFeePayment } from '../features/finance/api/feeApi';
import { FeeLifecyclePage } from '../features/finance/pages/FeeLifecyclePage';
import { FinanceReportsPage } from '../features/finance/pages/FinanceReportsPage';
import { BulkJobsPage } from '../features/operations/pages/BulkJobsPage';
import { ParentLeaveRequestsPage } from '../features/parent/pages/ParentLeaveRequestsPage';
import { SchoolAdminLeaveRequestsPage } from '../features/parent/pages/SchoolAdminLeaveRequestsPage';
import { SchoolAdminParentLinkPage } from '../features/parent/pages/SchoolAdminParentLinkPage';
import {
  listParentChildAttendance,
  listParentChildFees,
  listParentChildHomework,
  listParentChildNotices,
  listParentChildResults,
  listParentChildTimetable,
  listParentChildren,
  type ParentChild,
} from '../features/parent/api/parentPortalApi';
import { getDashboardSummary, type DashboardSummary } from '../features/portal/api/dashboardApi';
import { ReportExportsPage } from '../features/reports/pages/ReportExportsPage';
import { SchoolAdminResourcePanel } from '../features/school-admin/pages/SchoolAdminResourcePanel';
import { SchoolSettingsPage } from '../features/school-admin/pages/SchoolSettingsPage';
import type { SchoolAdminResourceKey } from '../features/school-admin/api/schoolAdminResourcesApi';
import { httpClient } from '../shared/api/httpClient';
import { StaffProvisioningPage } from '../features/staff/pages/StaffProvisioningPage';
import { StudentImportPage } from '../features/student/pages/StudentImportPage';
import { SuperAdminPlatformPage } from '../features/super-admin/pages/SuperAdminPlatformPage';
import { TenantOnboardingPage } from '../features/super-admin/pages/TenantOnboardingPage';
import { TenantReportsPage } from '../features/tenant-admin/pages/TenantReportsPage';
import { TenantSchoolCreationPage } from '../features/tenant-admin/pages/TenantSchoolCreationPage';
import { TenantSchoolManagementPage } from '../features/tenant-admin/pages/TenantSchoolManagementPage';
import { TenantSettingsPage } from '../features/tenant-admin/pages/TenantSettingsPage';
import {
  listTeacherAssignments,
  listTeacherAttendance,
  listTeacherExamRoster,
  listTeacherExams,
  listTeacherHomework,
  listTeacherTimetable,
  recordTeacherExamMarks,
  type TeacherAssignment,
  type TeacherExam,
  type TeacherExamRosterStudent,
} from '../features/teacher/api/teacherPortalApi';
import type { AuthSession, CurrentUser, UserRole } from '../features/auth/api/authApi';

type AppProps = {
  authClient?: Partial<AuthClient>;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
};

type NavItem = {
  id: string;
  label: string;
  status: ConnectionStatus;
  badge?: string;
};

type ConnectionStatus = 'CONNECTED_REAL_API';

type QuickAction = {
  label: string;
  detail: string;
  icon: LucideIcon;
  navId: string;
};

type RoleInfoItem = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
};

const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: 'super-admin',
  TENANT_ADMIN: 'tenant-admin',
  SCHOOL_ADMIN: 'school-admin',
  TEACHER: 'teacher',
  FINANCE_STAFF: 'finance-staff',
  STAFF: 'staff',
  PARENT: 'parent',
  STUDENT: 'student',
};

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'tenants', label: 'Tenants', status: 'CONNECTED_REAL_API' },
    { id: 'schools', label: 'Schools', status: 'CONNECTED_REAL_API' },
    { id: 'subscriptions', label: 'Subscription Plans', status: 'CONNECTED_REAL_API' },
    { id: 'revenue', label: 'Revenue', status: 'CONNECTED_REAL_API' },
    { id: 'ai-usage', label: 'AI Usage', status: 'CONNECTED_REAL_API' },
    { id: 'reports', label: 'Reports', status: 'CONNECTED_REAL_API' },
    { id: 'audit', label: 'Audit Logs', status: 'CONNECTED_REAL_API' },
    { id: 'health', label: 'Platform Health', status: 'CONNECTED_REAL_API' },
    { id: 'notifications', label: 'Notifications', status: 'CONNECTED_REAL_API' },
    { id: 'settings', label: 'Settings', status: 'CONNECTED_REAL_API' },
  ],
  TENANT_ADMIN: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'schools', label: 'Schools', status: 'CONNECTED_REAL_API' },
    { id: 'admins', label: 'School Admins', status: 'CONNECTED_REAL_API' },
    { id: 'reports', label: 'Reports', status: 'CONNECTED_REAL_API' },
    { id: 'usage', label: 'Subscription Usage', status: 'CONNECTED_REAL_API' },
    { id: 'settings', label: 'Settings', status: 'CONNECTED_REAL_API' },
  ],
  SCHOOL_ADMIN: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'students', label: 'Students', status: 'CONNECTED_REAL_API' },
    { id: 'parents', label: 'Parents', status: 'CONNECTED_REAL_API' },
    { id: 'teachers', label: 'Teachers', status: 'CONNECTED_REAL_API' },
    { id: 'staff', label: 'Staff', status: 'CONNECTED_REAL_API' },
    { id: 'academic', label: 'Academic Setup', status: 'CONNECTED_REAL_API' },
    { id: 'attendance', label: 'Attendance', status: 'CONNECTED_REAL_API' },
    { id: 'homework', label: 'Homework', status: 'CONNECTED_REAL_API' },
    { id: 'exams', label: 'Exams & Results', status: 'CONNECTED_REAL_API' },
    { id: 'fees', label: 'Fees', status: 'CONNECTED_REAL_API' },
    { id: 'timetable', label: 'Timetable', status: 'CONNECTED_REAL_API' },
    { id: 'notices', label: 'Notices', status: 'CONNECTED_REAL_API' },
    { id: 'reports', label: 'Reports', status: 'CONNECTED_REAL_API' },
    { id: 'documents', label: 'Documents', status: 'CONNECTED_REAL_API' },
    { id: 'website', label: 'Website Builder', status: 'CONNECTED_REAL_API' },
    { id: 'settings', label: 'Settings', status: 'CONNECTED_REAL_API' },
  ],
  TEACHER: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'classes', label: 'My Classes', status: 'CONNECTED_REAL_API' },
    { id: 'attendance', label: 'Attendance', status: 'CONNECTED_REAL_API' },
    { id: 'homework', label: 'Homework', status: 'CONNECTED_REAL_API' },
    { id: 'exams', label: 'Exams', status: 'CONNECTED_REAL_API' },
    { id: 'marks', label: 'Marks', status: 'CONNECTED_REAL_API' },
    { id: 'notices', label: 'Notices', status: 'CONNECTED_REAL_API' },
    { id: 'timetable', label: 'Timetable', status: 'CONNECTED_REAL_API' },
  ],
  FINANCE_STAFF: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'fees', label: 'Fee Demands', status: 'CONNECTED_REAL_API' },
    { id: 'payments', label: 'Payments', status: 'CONNECTED_REAL_API' },
    { id: 'receipts', label: 'Receipts', status: 'CONNECTED_REAL_API' },
    { id: 'reports', label: 'Reports', status: 'CONNECTED_REAL_API' },
  ],
  STAFF: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
  ],
  PARENT: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'children', label: 'My Children', status: 'CONNECTED_REAL_API' },
    { id: 'attendance', label: 'Attendance', status: 'CONNECTED_REAL_API' },
    { id: 'homework', label: 'Homework', status: 'CONNECTED_REAL_API' },
    { id: 'results', label: 'Results', status: 'CONNECTED_REAL_API' },
    { id: 'fees', label: 'Fees', status: 'CONNECTED_REAL_API' },
    { id: 'notices', label: 'Notices', status: 'CONNECTED_REAL_API' },
    { id: 'timetable', label: 'Timetable', status: 'CONNECTED_REAL_API' },
    { id: 'leave', label: 'Leave Requests', status: 'CONNECTED_REAL_API' },
  ],
  STUDENT: [
    { id: 'dashboard', label: 'Dashboard', status: 'CONNECTED_REAL_API' },
    { id: 'homework', label: 'Homework', status: 'CONNECTED_REAL_API' },
    { id: 'results', label: 'Results', status: 'CONNECTED_REAL_API' },
    { id: 'fees', label: 'Fees', status: 'CONNECTED_REAL_API' },
    { id: 'notices', label: 'Notices', status: 'CONNECTED_REAL_API' },
    { id: 'attendance', label: 'Attendance', status: 'CONNECTED_REAL_API' },
    { id: 'timetable', label: 'Timetable', status: 'CONNECTED_REAL_API' },
  ],
};

const QUICK_ACTIONS_BY_ROLE: Record<UserRole, QuickAction[]> = {
  SUPER_ADMIN: [
    { label: 'Create tenant', detail: 'Create trust, first school and admin', icon: Building2, navId: 'tenants' },
    { label: 'Create plan', detail: 'Prepare subscription package', icon: ReceiptText, navId: 'subscriptions' },
    { label: 'System health', detail: 'Check platform readiness', icon: LineChart, navId: 'health' },
  ],
  TENANT_ADMIN: [
    { label: 'Add school', detail: 'Add a new campus safely', icon: School, navId: 'schools' },
    { label: 'Invite School Admin', detail: 'Grant school access', icon: Users, navId: 'admins' },
    { label: 'View reports', detail: 'Compare school performance', icon: FileText, navId: 'reports' },
    { label: 'Subscription usage', detail: 'Review plan limits', icon: ReceiptText, navId: 'usage' },
  ],
  SCHOOL_ADMIN: [
    { label: 'Add student', detail: 'Validate and queue roster updates', icon: Users, navId: 'students' },
    { label: 'Add teacher', detail: 'Provision portal access', icon: GraduationCap, navId: 'teachers' },
    { label: 'Take attendance', detail: 'Open today’s classes', icon: CalendarCheck, navId: 'attendance' },
    { label: 'Create notice', detail: 'Publish school update', icon: Newspaper, navId: 'notices' },
    { label: 'Create exam', detail: 'Prepare assessment flow', icon: ClipboardCheck, navId: 'exams' },
  ],
  TEACHER: [
    { label: 'Mark attendance', detail: 'Open assigned classes', icon: CalendarCheck, navId: 'attendance' },
    { label: 'Create homework', detail: 'Prepare class work', icon: BookOpen, navId: 'homework' },
    { label: 'Enter marks', detail: 'Update exam scores', icon: ClipboardCheck, navId: 'marks' },
  ],
  FINANCE_STAFF: [
    { label: 'Record payment', detail: 'Issue receipt', icon: CircleDollarSign, navId: 'payments' },
    { label: 'Generate receipt', detail: 'Share payment proof', icon: ReceiptText, navId: 'receipts' },
    { label: 'Export report', detail: 'Share collection view', icon: FileText, navId: 'reports' },
  ],
  STAFF: [
    { label: 'Open tasks', detail: 'Review school operations', icon: ClipboardCheck, navId: 'tasks' },
    { label: 'Read notices', detail: 'Catch up on updates', icon: Newspaper, navId: 'notices' },
  ],
  PARENT: [
    { label: 'Pay fees', detail: 'Review reminders', icon: CircleDollarSign, navId: 'fees' },
    { label: 'Apply leave', detail: 'Submit linked-child leave', icon: CalendarCheck, navId: 'leave' },
    { label: 'View results', detail: 'Review published marks', icon: GraduationCap, navId: 'results' },
  ],
  STUDENT: [
    { label: 'Submit homework', detail: 'Track what is due', icon: BookOpen, navId: 'homework' },
    { label: 'View results', detail: 'Review published marks', icon: GraduationCap, navId: 'results' },
  ],
};

export function App({ authClient, storage }: AppProps = {}) {
  return (
    <AuthStateProvider client={authClient} storage={storage}>
      <AppExperience storage={storage} />
    </AuthStateProvider>
  );
}

function AppExperience({ storage }: Pick<AppProps, 'storage'>) {
  const auth = useAuthState();

  if (auth.status === 'loading') {
    return <LoadingScreen />;
  }

  if (auth.status !== 'authenticated' || !auth.currentUser) {
    return <PublicAuthExperience storage={storage} />;
  }

  return <AuthenticatedExperience user={auth.currentUser} />;
}

function PublicAuthExperience({ storage }: Pick<AppProps, 'storage'>) {
  const { registerSession } = useAuthState();
  const [accessPanel, setAccessPanel] = useState<'login' | 'invitation' | null>(null);

  return (
    <main className="marketing-home" data-testid="cloudcampus-shell">
      <MarketingHeader onOpenLogin={() => setAccessPanel('login')} />
      <HeroSection onOpenLogin={() => setAccessPanel('login')} />
      <TrustedBySection />
      <FeatureShowcase />
      <StatsStrip />
      <AIShowcase />
      <Testimonials />
      <PricingCTA onOpenLogin={() => setAccessPanel('login')} />
      <MarketingFooter />

      {accessPanel ? (
        <AccessPanel
          mode={accessPanel}
          onClose={() => setAccessPanel(null)}
          onShowInvitation={() => setAccessPanel('invitation')}
          onShowLogin={() => setAccessPanel('login')}
          registerSession={registerSession}
          storage={storage}
        />
      ) : null}
    </main>
  );
}

function MarketingHeader({ onOpenLogin }: { onOpenLogin: () => void }) {
  const navItems = ['Product', 'Features', 'Solutions', 'Pricing', 'Resources', 'Company'];

  return (
    <header className="marketing-header">
      <a className="marketing-brand" href="#top" aria-label="CloudCampus home">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span>CloudCampus School ERP</span>
      </a>
      <nav className="marketing-nav" aria-label="CloudCampus website navigation">
        {navItems.map((item) => (
          <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>
        ))}
      </nav>
      <div className="marketing-actions">
        <button className="ghost-action" onClick={onOpenLogin} type="button">Sign In</button>
        <a className="primary-action demo-action" href="#pricing">Book Demo</a>
      </div>
    </header>
  );
}

function HeroSection({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-glow hero-glow-blue" aria-hidden="true" />
      <div className="hero-glow hero-glow-violet" aria-hidden="true" />
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <span className="hero-badge">#1 Modern School ERP Platform</span>
        <h1 id="hero-title">
          Run Your School.
          <span>Smarter.</span>
          <span>Faster.</span>
          <span>Better.</span>
        </h1>
        <p>
          CloudCampus is a next-generation AI-ready School ERP platform built for modern schools, trusts, and multi-campus organizations.
        </p>
        <div className="hero-actions">
          <a className="primary-action large" href="#pricing">Book a Demo <ArrowRight size={18} aria-hidden="true" /></a>
          <a className="secondary-action large" href="#features">Explore Features</a>
        </div>
        <div className="trust-row" aria-label="CloudCampus trust indicators">
          {([
            [ShieldCheck, 'Secure & Compliant'],
            [BrainCircuit, 'AI-Powered'],
            [Cloud, 'Cloud-Native'],
            [Building2, 'Multi-Tenant Ready'],
          ] satisfies Array<[LucideIcon, string]>).map(([Icon, item]) => (
            <span key={item}><Icon size={16} aria-hidden="true" />{item}</span>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="hero-visual"
        aria-label="CloudCampus dashboard and mobile preview"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
      >
        <DashboardPreview />
        <MobilePreview />
        <button className="visual-login-chip" onClick={onOpenLogin} type="button">
          <Sparkles size={16} aria-hidden="true" />
          Universal login
        </button>
      </motion.div>
    </section>
  );
}

function DashboardPreview() {
  const bars = ['62%', '74%', '58%', '88%', '71%', '94%', '82%'];
  const feed = [
    ['Fee receipt issued', 'Aarav Sharma', 'now'],
    ['Homework published', 'Grade 8 / A', '4m'],
    ['Exam result approved', 'Mathematics', '12m'],
  ];

  return (
    <motion.div
      className="dashboard-preview"
      whileHover={{ y: -8, rotateY: -5 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      <aside>
        <strong>CloudCampus</strong>
        {([
          [LineChart, 'Overview'],
          [Users, 'Students'],
          [CalendarCheck, 'Attendance'],
          [CircleDollarSign, 'Fees'],
          [BrainCircuit, 'AI Insights'],
        ] satisfies Array<[LucideIcon, string]>).map(([Icon, item]) => (
          <span className={item === 'Overview' ? 'active' : ''} key={item}>
            <Icon size={15} aria-hidden="true" />
            {item}
          </span>
        ))}
      </aside>
      <section>
        <div className="preview-topline">
          <div>
            <span>School Admin</span>
            <strong>Operations dashboard</strong>
          </div>
          <em><span aria-hidden="true" />Live</em>
        </div>
        <div className="preview-card-grid">
          <PreviewMetric label="Attendance" trend="+4.2%" value="94.8%" />
          <PreviewMetric label="Fee collection" trend="$1.8M" value="78%" />
          <PreviewMetric label="Notifications" trend="99.2%" value="1.2k" />
        </div>
        <div className="preview-main-grid">
          <div className="chart-card">
            <div className="chart-head">
              <strong>Attendance trend</strong>
              <span>7 days</span>
            </div>
            <div className="bar-chart" aria-hidden="true">
              {bars.map((height, index) => (
                <i key={`${height}-${index}`} style={{ height }} />
              ))}
            </div>
            <svg className="line-overlay" viewBox="0 0 260 90" aria-hidden="true">
              <path d="M4 66 C42 38, 64 72, 101 39 S169 18, 205 42 S238 34, 256 16" />
            </svg>
          </div>
          <div className="ai-widget">
            <span><Sparkles size={14} aria-hidden="true" />AI insight</span>
            <strong>Grade 8 attendance risk is down 12% this week.</strong>
            <p>Smart reminders sent to parents and class teachers.</p>
            <div className="ai-confidence" aria-label="AI confidence 91 percent">
              <i />
              <strong>91%</strong>
            </div>
          </div>
        </div>
        <div className="activity-list">
          {feed.map(([item, subject, time]) => (
            <span key={item}>
              <i aria-hidden="true" />
              <strong>{item}<small>{subject}</small></strong>
              <em>{time}</em>
            </span>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function PreviewMetric({ label, trend, value }: { label: string; trend: string; value: string }) {
  return (
    <div className="preview-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{trend}</em>
    </div>
  );
}

function MobilePreview() {
  return (
    <motion.div
      className="mobile-preview"
      aria-label="CloudCampus mobile app preview"
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="phone-speaker" aria-hidden="true" />
      <div className="phone-header">
        <strong>Parent App</strong>
        <Bell size={16} aria-hidden="true" />
      </div>
      <span>Attendance 96%</span>
      <div className="phone-ring" aria-hidden="true"><i /></div>
      <div className="phone-card"><BookOpen size={15} aria-hidden="true" />Homework due today</div>
      <div className="phone-card accent"><CircleDollarSign size={15} aria-hidden="true" />Fee reminder paid</div>
      <div className="phone-card notice"><Newspaper size={15} aria-hidden="true" />New school notice</div>
      <div className="phone-nav" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </motion.div>
  );
}

function TrustedBySection() {
  const logos = ['Northstar Academy', 'Riverdale Trust', 'Apex Schools', 'Vista World', 'Meridian Group'];

  return (
    <section className="trusted-section" aria-labelledby="trusted-title">
      <div>
        <p className="eyebrow">Trusted by modern schools</p>
        <h2 id="trusted-title">Built for secure, AI-ready school networks.</h2>
      </div>
      <div className="logo-cloud" aria-label="School customers">
        {logos.map((logo) => <span key={logo}>{logo}</span>)}
      </div>
      <div className="trust-badges">
        <span><LockKeyhole size={16} aria-hidden="true" />Role-safe access</span>
        <span><ShieldCheck size={16} aria-hidden="true" />Audit-ready</span>
        <span><Cloud size={16} aria-hidden="true" />Cloud-native</span>
        <span><BrainCircuit size={16} aria-hidden="true" />AI-ready</span>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const features: Array<[LucideIcon, string, string]> = [
    [CalendarCheck, 'Attendance', 'Daily, class-wise and teacher-driven attendance with risk signals.'],
    [BookOpen, 'Homework', 'Publish, track, submit and review assignments across portals.'],
    [GraduationCap, 'Exams', 'Create exams, record marks and publish results with audit flow.'],
    [CircleDollarSign, 'Fees', 'Demand, payment and receipt workflows with finance-ready controls.'],
    [Users, 'Parent App', 'Linked-child access for fees, homework, results and notices.'],
    [BrainCircuit, 'AI Insights', 'Predict risk, surface actions and guide school operations.'],
    [Building2, 'Multi-school Management', 'Tenant-level schools, admins, settings and usage.'],
    [LineChart, 'Reports', 'Durable export jobs for student and finance reporting.'],
    [MessageSquareText, 'Notifications', 'SMTP-capable invitation delivery with token-safe audit metadata.'],
    [Newspaper, 'Website Builder', 'Prepared school website content scope for future release.'],
  ];

  return (
    <section className="marketing-section" id="features" aria-labelledby="features-title">
      <SectionIntro
        eyebrow="Product"
        title="Everything a modern school needs, without the ERP clutter."
        copy="CloudCampus connects academic, finance, parent, staff and platform workflows in one clean SaaS experience."
      />
      <div className="feature-grid">
        {features.map(([Icon, title, copy], index) => (
          <motion.article
            className={index === 0 || index === 5 ? 'feature-card feature-card-wide' : 'feature-card'}
            key={title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.18) }}
          >
            <span className="feature-icon" aria-hidden="true"><Icon size={20} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    ['100000+', 'Schools'],
    ['Millions', 'of users'],
    ['99.9%', 'uptime target'],
    ['Multi-tenant', 'architecture'],
  ];

  return (
    <section className="stats-strip" aria-label="CloudCampus platform scale">
      {stats.map(([value, label]) => (
        <div className="stat-tile" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function AIShowcase() {
  return (
    <section className="ai-showcase" id="product" aria-labelledby="ai-title">
      <div>
        <p className="eyebrow">AI-ready architecture</p>
        <h2 id="ai-title">Insights that help schools act before problems grow.</h2>
        <p>
          AI-powered attendance risk, fee collection prediction, performance analytics and smart notification flows are designed into the product architecture.
        </p>
      </div>
      <div className="ai-signal-grid">
        {([
          [CalendarCheck, 'Attendance risk prediction', 'Grade-wise absence spikes detected before they become chronic.'],
          [CircleDollarSign, 'Fee collection prediction', 'Payment timing patterns guide smarter reminders.'],
          [LineChart, 'Student performance analytics', 'Academic trends surface for teachers and parents.'],
          [Bell, 'Smart notifications', 'Role-safe alerts keep action moving without noise.'],
        ] satisfies Array<[LucideIcon, string, string]>).map(([Icon, item, copy]) => (
          <div className="ai-signal" key={item}>
            <span aria-hidden="true"><Icon size={18} /></span>
            <strong>{item}</strong>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    ['Principal', 'CloudCampus makes our multi-school operations feel calm, visible and controlled.', 'AM'],
    ['Teacher', 'Attendance, homework and exam workflows are finally in one place.', 'RK'],
    ['Parent', 'I can follow fees, homework and notices without calling the office.', 'PS'],
  ];

  return (
    <section className="marketing-section testimonials" id="solutions" aria-labelledby="testimonials-title">
      <SectionIntro
        eyebrow="Teams"
        title="Built for every stakeholder in the school ecosystem."
        copy="From platform owners to parents, every role gets a focused portal after one universal login."
      />
      <div className="testimonial-track">
        {quotes.map(([role, quote, avatar]) => (
          <article className="testimonial-card" key={role}>
            <div className="rating-row" aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, index) => <Star fill="currentColor" key={index} size={14} />)}
            </div>
            <p>{quote}</p>
            <div className="testimonial-author">
              <span>{avatar}</span>
              <strong>{role} feedback</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingCTA({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <section className="pricing-cta" id="pricing" aria-labelledby="pricing-title">
      <p className="eyebrow">Enterprise SaaS</p>
      <h2 id="pricing-title">Ready to transform your school?</h2>
      <p>Launch clean onboarding, secure roles and premium school operations from one CloudCampus workspace.</p>
      <div className="hero-actions">
        <a className="primary-action large" href="mailto:sales@cloudcampus.dev">Book Demo</a>
        <button className="secondary-action large" onClick={onOpenLogin} type="button">Start Free Trial</button>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="marketing-footer" id="resources">
      <div className="marketing-brand">
        <span className="brand-mark compact" aria-hidden="true">C</span>
        <span>CloudCampus</span>
      </div>
      <nav aria-label="CloudCampus footer links">
        {['Product', 'Pricing', 'Security', 'Compliance', 'Privacy', 'Careers', 'Support', 'Contact'].map((item) => (
          <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>
        ))}
      </nav>
      <div className="footer-meta">
        <span>© 2026 CloudCampus</span>
        <span>ISO-ready</span>
        <span>GDPR-ready architecture</span>
      </div>
    </footer>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="section-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function AccessPanel({
  mode,
  onClose,
  onShowInvitation,
  onShowLogin,
  registerSession,
  storage,
}: {
  mode: 'login' | 'invitation';
  onClose: () => void;
  onShowInvitation: () => void;
  onShowLogin: () => void;
  registerSession: (session: AuthSession) => Promise<void> | void;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | undefined;
}) {
  return (
    <div className="access-overlay" role="dialog" aria-modal="true" aria-label="CloudCampus account access">
      <button className="access-scrim" aria-label="Close account access" onClick={onClose} type="button" />
      <aside className="access-panel">
        <div className="access-panel-header">
          <div>
            <p className="eyebrow">Universal access</p>
            <h2>{mode === 'login' ? 'Welcome Back' : 'Accept Invitation'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">x</button>
        </div>
        <div className="access-tabs" role="tablist" aria-label="Access options">
          <button className={mode === 'login' ? 'active' : ''} onClick={onShowLogin} type="button">Sign In</button>
          <button className={mode === 'invitation' ? 'active' : ''} onClick={onShowInvitation} type="button">Accept Invitation</button>
        </div>
        {mode === 'login' ? (
          <>
            <LoginPage
              className="panel-login-card"
              onAuthenticated={registerSession}
              storage={storage}
              summary="Access your CloudCampus portal. One login works for Super Admin, Tenant Admin, School Admin, Teacher, Parent and Student roles."
              title="Welcome Back"
            />
            <PasswordResetCard />
          </>
        ) : (
          <InvitationAcceptPage />
        )}
      </aside>
    </div>
  );
}

function AuthenticatedExperience({ user }: { user: CurrentUser }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navItems = useMemo(() => visibleNavItems(user.role), [user.role]);
  const portalTitle = roleTitle(user.role);

  useEffect(() => {
    if (!navItems.some((item) => item.id === activeNav)) {
      setActiveNav(navItems[0]?.id ?? 'dashboard');
    }
  }, [activeNav, navItems]);

  return (
    <main className="enterprise-shell" data-testid="cloudcampus-shell" data-theme={theme}>
      <aside className={`enterprise-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark compact" aria-hidden="true">C</div>
          <div>
            <strong>CloudCampus</strong>
            <span>{portalTitle}</span>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label={`${portalTitle} navigation`}>
          {navItems.map((item) => (
            <SidebarNavButton
              isActive={activeNav === item.id}
              item={item}
              key={item.id}
              onSelect={() => {
                setActiveNav(item.id);
                setMobileOpen(false);
              }}
            />
          ))}
        </nav>
        <AIAssistCard role={user.role} />
      </aside>

      <section className="enterprise-main">
        <TopBar
          activeNav={activeNav}
          navItems={navItems}
          onOpenMenu={() => setMobileOpen(true)}
          onSelectNav={setActiveNav}
          onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          theme={theme}
          user={user}
        />
        <div className="content-grid">
          <PortalDashboard navItems={navItems} onSelectNav={setActiveNav} user={user} />
          <RoleWorkspace activeNav={activeNav} user={user} />
        </div>
      </section>

      {mobileOpen ? (
        <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} type="button" />
      ) : null}
      <button className="ai-fab" aria-label="Open CloudCampus AI assistant" type="button">AI</button>
    </main>
  );
}

function visibleNavItems(role: UserRole) {
  return NAV_BY_ROLE[role].filter((item) => item.status === 'CONNECTED_REAL_API');
}

function SidebarNavButton({
  isActive,
  item,
  onSelect,
}: {
  isActive: boolean;
  item: NavItem;
  onSelect: () => void;
}) {
  const Icon = navIcon(item.id);

  return (
    <button
      className={isActive ? 'is-active' : ''}
      onClick={onSelect}
      type="button"
    >
      <span className="nav-icon" aria-hidden="true"><Icon size={17} /></span>
      <span>{item.label}</span>
      {item.badge ? <em>{item.badge}</em> : null}
    </button>
  );
}

function TopBar({
  activeNav,
  navItems,
  onOpenMenu,
  onSelectNav,
  onToggleTheme,
  theme,
  user,
}: {
  activeNav: string;
  navItems: NavItem[];
  onOpenMenu: () => void;
  onSelectNav: (navId: string) => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  user: CurrentUser;
}) {
  const { error, logout } = useAuthState();
  const { date, time } = useLiveClock();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageTitle = activeNav === 'dashboard' ? `${roleTitle(user.role)} Dashboard` : moduleTitle(activeNav);
  const schoolLabel = user.activeSchool?.name ?? (user.role === 'SUPER_ADMIN' ? 'Platform scope' : 'No active school');

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu-button" onClick={onOpenMenu} type="button" aria-label="Open navigation">
        <PanelLeft size={18} aria-hidden="true" />
      </button>
      <div className="topbar-context">
        <nav aria-label="Breadcrumbs">
          <span>CloudCampus</span>
          <span>{roleTitle(user.role)}</span>
          <strong>{moduleTitle(activeNav)}</strong>
        </nav>
        <div>
          <h1>{pageTitle}</h1>
          <p><CalendarCheck size={15} aria-hidden="true" />{date}<span>{time}</span></p>
        </div>
      </div>
      <label className="global-search">
        <Search size={17} aria-hidden="true" />
        <input onFocus={() => setCommandOpen(true)} placeholder="Search students, invoices, reports..." />
        <button onClick={() => setCommandOpen(true)} type="button" aria-label="Open command palette">
          <Command size={14} aria-hidden="true" />
          K
        </button>
      </label>
      <div className="topbar-actions">
        <button className="quick-action-button" onClick={() => setCommandOpen(true)} type="button">
          <Sparkles size={16} aria-hidden="true" />
          Actions
        </button>
        <button className="school-switcher-chip" onClick={() => setCommandOpen(true)} type="button">
          <School size={16} aria-hidden="true" />
          <span>{schoolLabel}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        <ThemeToggle onToggle={onToggleTheme} theme={theme} />
        <div className="topbar-popover-wrap">
          <NotificationButton onClick={() => setNotificationsOpen((open) => !open)} />
          {notificationsOpen ? <NotificationPopover /> : null}
        </div>
        <div className="profile-menu topbar-popover-wrap">
          <div className="avatar" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user.displayName ?? user.email}</strong>
            <span>{user.role.replace('_', ' ')}</span>
          </div>
          <button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} type="button" aria-label="Open profile menu">
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {profileOpen ? (
            <div className="profile-popover" role="menu" aria-label="Profile menu">
              <div className="profile-summary">
                <strong>{user.displayName ?? user.email}</strong>
                <span>{user.email}</span>
                <em>{roleTitle(user.role)} · {schoolLabel}</em>
                <small>Last login: Current session</small>
              </div>
              <button type="button"><UserCircle size={16} aria-hidden="true" />Profile</button>
              <button type="button"><Settings size={16} aria-hidden="true" />Preferences</button>
              <button onClick={() => void logout()} type="button"><LogOut size={16} aria-hidden="true" />Log out</button>
            </div>
          ) : null}
        </div>
      </div>
      {error ? <p className="topbar-error">{error}</p> : null}
      {commandOpen ? (
        <CommandPalette
          navItems={navItems}
          onClose={() => setCommandOpen(false)}
          onSelect={(navId) => {
            onSelectNav(navId);
            setCommandOpen(false);
          }}
          role={user.role}
        />
      ) : null}
    </header>
  );
}

function CommandPalette({
  navItems,
  onClose,
  onSelect,
  role,
}: {
  navItems: NavItem[];
  onClose: () => void;
  onSelect: (navId: string) => void;
  role: UserRole;
}) {
  return (
    <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
      <button className="command-scrim" onClick={onClose} type="button" aria-label="Close command palette" />
      <motion.section
        className="command-panel"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <div className="command-search-row">
          <Search size={18} aria-hidden="true" />
          <input autoFocus placeholder={`Search ${roleTitle(role)} workspace...`} />
          <kbd>Esc</kbd>
        </div>
        <div className="command-list">
          {navItems.slice(0, 8).map((item) => {
            const Icon = navIcon(item.id);
            return (
              <button key={item.id} onClick={() => onSelect(item.id)} type="button">
                <span><Icon size={17} aria-hidden="true" /></span>
                <strong>{item.label}</strong>
                <em>Open</em>
              </button>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}

function NotificationPopover() {
  return (
    <div className="notification-popover" role="status" aria-label="Notification center">
      <div>
        <strong>Notification center</strong>
        <span>Live delivery status appears in each portal module</span>
      </div>
      <article>
        <i aria-hidden="true" />
        <span>
          <strong>No new alerts</strong>
          <small>Your active workspace will show module-specific delivery, report, and approval updates.</small>
        </span>
      </article>
    </div>
  );
}

function PortalDashboard({
  navItems,
  onSelectNav,
  user,
}: {
  navItems: NavItem[];
  onSelectNav: (navId: string) => void;
  user: CurrentUser;
}) {
  const { accessToken } = useAuthState();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      if (!accessToken) {
        setStatus('unavailable');
        setError('Login is required to load dashboard summary.');
        return;
      }

      setStatus('loading');
      try {
        const response = await getDashboardSummary(user.role, accessToken);
        if (!mounted) return;
        setSummary(response);
        setError(null);
        setStatus('ready');
      } catch (caught) {
        if (!mounted) return;
        setSummary(null);
        setError(caught instanceof Error ? caught.message : 'Dashboard summary API is unavailable.');
        setStatus('unavailable');
      }
    }

    void loadSummary();

    return () => {
      mounted = false;
    };
  }, [accessToken, user.role]);

  return (
    <section className="dashboard-region" aria-labelledby={`${ROLE_HOME[user.role]}-dashboard`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{user.role.replace('_', ' ')}</p>
          <h2 id={`${ROLE_HOME[user.role]}-dashboard`}>{roleTitle(user.role)} Overview</h2>
        </div>
        <span className="context-pill">{user.activeSchool?.name ?? 'Platform scope'}</span>
      </div>

      <SessionSummaryPanel user={user} />
      <RoleInfoGrid user={user} />
      <DashboardSummaryPanel error={error} status={status} summary={summary} user={user} />
      <div className="insight-grid">
        <QuickActionsPanel navItems={navItems} onSelectNav={onSelectNav} role={user.role} />
        <ApiCoveragePanel navItems={navItems} role={user.role} />
      </div>
    </section>
  );
}

function SessionSummaryPanel({ user }: { user: CurrentUser }) {
  const { date, time } = useLiveClock();
  const activeSchool = user.activeSchool?.name ?? (user.role === 'SUPER_ADMIN' ? 'Platform owner scope' : 'No active school selected');

  return (
    <motion.section
      className="session-summary-panel"
      aria-labelledby={`${ROLE_HOME[user.role]}-session-summary`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="session-welcome">
        <span className="status-chip info"><span className="live-dot" aria-hidden="true" />Session active</span>
        <h3 id={`${ROLE_HOME[user.role]}-session-summary`}>Welcome, {user.displayName ?? user.email}</h3>
        <p>{activeSchool}</p>
      </div>
      <dl className="session-facts">
        <div>
          <dt>Date</dt>
          <dd>{date}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{time}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{roleTitle(user.role)}</dd>
        </div>
        <div>
          <dt>Last login</dt>
          <dd>Current session</dd>
        </div>
      </dl>
    </motion.section>
  );
}

function RoleInfoGrid({ user }: { user: CurrentUser }) {
  return (
    <div className="role-info-grid" aria-label={`${roleTitle(user.role)} dashboard information`}>
      {roleInfoItems(user).map((item) => {
        const Icon = item.icon;
        return (
          <motion.article
            className={`role-info-card tone-${item.tone}`}
            key={`${item.label}-${item.value}`}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <span className="role-info-icon" aria-hidden="true"><Icon size={18} /></span>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <em>{item.detail}</em>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function RoleWorkspace({ activeNav, user }: { activeNav: string; user: CurrentUser }) {
  if (user.role === 'SUPER_ADMIN') {
    return (
      <section className="role-workspace" aria-label="Super Admin area">
        <WorkspaceHeader title="Platform control center" activeNav={activeNav} />
        <SuperAdminModule activeNav={activeNav} />
      </section>
    );
  }

  if (user.role === 'TENANT_ADMIN') {
    return (
      <section className="role-workspace" aria-label="Tenant Admin area">
        <WorkspaceHeader title="Organisation workspace" activeNav={activeNav} />
        <TenantAdminModule activeNav={activeNav} />
      </section>
    );
  }

  if (user.role === 'SCHOOL_ADMIN') {
    return (
      <section className="role-workspace" aria-label="School Admin area">
        <WorkspaceHeader title="School ERP workspace" activeNav={activeNav} />
        <SchoolSelector />
        {user.activeSchool ? (
          <SchoolAdminModule activeNav={activeNav} />
        ) : (
          <EmptyState title="Select active school" detail="Choose an assigned school to open the School Admin tools." />
        )}
      </section>
    );
  }

  if (user.role === 'FINANCE_STAFF') {
    return (
      <section className="role-workspace" aria-label="Finance Staff area">
        <WorkspaceHeader title="Finance workspace" activeNav={activeNav} />
        <SchoolSelector />
        {user.activeSchool ? (
          <FinanceStaffModule activeNav={activeNav} />
        ) : (
          <EmptyState title="Select active school" detail="Choose an assigned school to open the finance tools." />
        )}
      </section>
    );
  }

  return (
    <section className="role-workspace" aria-label={`${roleTitle(user.role)} area`}>
      <WorkspaceHeader title={`${roleTitle(user.role)} workspace`} activeNav={activeNav} />
      <LearnerStaffModule activeNav={activeNav} role={user.role} />
    </section>
  );
}

function FinanceStaffModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'dashboard') {
    return <DashboardWorkspacePanel role="FINANCE_STAFF" />;
  }

  if (activeNav === 'reports') {
    return <FinanceReportsPage />;
  }

  if (activeNav === 'fees' || activeNav === 'payments' || activeNav === 'receipts') {
    return (
      <div className="workspace-grid">
        <EndpointListPanel title="Finance fee demands" path="/v1/finance/fees/demands" />
        {activeNav === 'receipts' ? (
          <EndpointListPanel title="Finance receipts" path="/v1/finance/receipts?size=50" />
        ) : (
          <FeeLifecyclePage
            onCreateDemand={createFinanceFeeDemand}
            onRecordPayment={recordFinanceFeePayment}
          />
        )}
      </div>
    );
  }

  return <ComingSoonPanel activeNav={activeNav} role="FINANCE_STAFF" />;
}

function SuperAdminModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'tenants') {
    return (
      <div className="workspace-grid">
        <TenantOnboardingPage />
        <SuperAdminPlatformPage section={activeNav} />
      </div>
    );
  }

  return <SuperAdminPlatformPage section={activeNav} />;
}

function TenantAdminModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'dashboard') {
    return <DashboardWorkspacePanel role="TENANT_ADMIN" />;
  }

  if (activeNav === 'schools') {
    return (
      <div className="workspace-grid">
        <TenantSchoolCreationPage />
        <TenantSchoolManagementPage />
      </div>
    );
  }

  if (activeNav === 'settings' || activeNav === 'usage' || activeNav === 'branding') {
    return <TenantSettingsPage />;
  }

  if (activeNav === 'reports') {
    return <TenantReportsPage />;
  }

  if (activeNav === 'admins') {
    return (
      <div className="workspace-grid">
        <TenantSchoolManagementPage />
        <EmptyState title="School Admins are school-scoped" detail="Select a school in School Management to list, invite, resend or revoke School Admin access through the real backend API." />
      </div>
    );
  }

  return <ComingSoonPanel activeNav={activeNav} role="TENANT_ADMIN" />;
}

function SchoolAdminModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'students') {
    return (
      <div className="workspace-grid">
        <SchoolAdminResourcePanel resource="students" />
        <StudentImportPage />
      </div>
    );
  }

  if (activeNav === 'parents') {
    return (
      <div className="workspace-grid">
        <SchoolAdminResourcePanel resource="parents" />
        <SchoolAdminParentLinkPage />
        <SchoolAdminLeaveRequestsPage />
      </div>
    );
  }
  if (activeNav === 'teachers' || activeNav === 'staff') {
    return (
      <div className="workspace-grid">
        <SchoolAdminResourcePanel resource={activeNav} />
        <StaffProvisioningPage />
      </div>
    );
  }
  if (activeNav === 'fees') {
    return (
      <div className="workspace-grid">
        <SchoolAdminResourcePanel resource="fees" />
        <FeeLifecyclePage />
      </div>
    );
  }
  if (activeNav === 'reports') return <ReportExportsPage />;
  if (activeNav === 'settings') {
    return (
      <div className="workspace-grid">
        <SchoolSettingsPage />
        <BulkJobsPage />
      </div>
    );
  }
  if (activeNav === 'academic') {
    return (
      <div className="workspace-grid">
        <AcademicSetupPage />
        <AcademicAssignmentsPage />
      </div>
    );
  }

  if (isSchoolAdminResource(activeNav)) {
    return <SchoolAdminResourcePanel resource={activeNav} />;
  }

  if (activeNav === 'dashboard') {
    return (
      <div className="workspace-grid">
        <SchoolAdminResourcePanel resource="students" />
        <EmptyState title="School Admin workspace" detail="Use the connected sidebar modules for student import, academic setup, attendance, homework, exams, fees, notices, documents and website pages." />
      </div>
    );
  }

  return <ComingSoonPanel activeNav={activeNav} role="SCHOOL_ADMIN" />;
}

function LearnerStaffModule({ activeNav, role }: { activeNav: string; role: UserRole }) {
  if (activeNav === 'dashboard') {
    return <DashboardWorkspacePanel role={role} />;
  }

  if (role === 'TEACHER') {
    if (activeNav === 'marks') {
      return <TeacherMarksEntryPanel />;
    }
    return <TeacherScopedPortalPanel activeNav={activeNav} />;
  }

  if (role === 'PARENT' && activeNav !== 'leave') {
    return <ParentChildPortalPanel activeNav={activeNav} />;
  }

  if (role === 'PARENT' && activeNav === 'leave') {
    return <ParentLeaveRequestsPage />;
  }

  const endpoint = roleEndpoint(role, activeNav);
  if (endpoint) {
    return <EndpointListPanel title={activeNav === 'dashboard' ? roleTableTitle(role) : moduleTitle(activeNav)} path={endpoint} />;
  }

  return <ComingSoonPanel activeNav={activeNav} role={role} />;
}

function DashboardWorkspacePanel({ role }: { role: UserRole }) {
  const endpoint = dashboardEndpoint(role);

  return (
    <div className="workspace-grid">
      <EndpointListPanel title={`${roleTitle(role)} live summary`} path={endpoint} />
      <EmptyState
        title="Production workspace"
        detail="This dashboard is backed by the authenticated summary API above. Use the sidebar to open the verified operational modules for this role."
      />
    </div>
  );
}

function TeacherScopedPortalPanel({ activeNav }: { activeNav: string }) {
  const { accessToken } = useAuthState();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [items, setItems] = useState<unknown[]>([]);
  const [status, setStatus] = useState<'loading' | 'idle'>('loading');
  const [error, setError] = useState<string | null>(null);

  const selected = assignments.find((assignment) => assignment.id === selectedId) ?? assignments[0] ?? null;
  const needsAssignment = ['attendance', 'homework', 'exams'].includes(activeNav);

  useEffect(() => {
    let mounted = true;

    async function loadAssignments() {
      if (!accessToken) {
        setError('Teacher login is required.');
        setStatus('idle');
        return;
      }
      setStatus('loading');
      try {
        const loaded = await listTeacherAssignments(accessToken);
        if (!mounted) return;
        setAssignments(loaded);
        setSelectedId((current) => current || loaded[0]?.id || '');
        setError(null);
      } catch (caught) {
        if (!mounted) return;
        setAssignments([]);
        setError(caught instanceof Error ? caught.message : 'Teacher assignments could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadAssignments();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      if (!accessToken) return;
      if (activeNav === 'classes' || activeNav === 'dashboard') {
        setItems(assignments);
        return;
      }
      if (activeNav === 'timetable') {
        setStatus('loading');
        try {
          const timetable = await listTeacherTimetable(accessToken);
          if (mounted) {
            setItems(timetable);
            setError(null);
          }
        } catch (caught) {
          if (mounted) setError(caught instanceof Error ? caught.message : 'Teacher timetable could not be loaded.');
        } finally {
          if (mounted) setStatus('idle');
        }
        return;
      }
      if (!selected && needsAssignment) {
        setItems([]);
        return;
      }
      if (!selected) return;

      setStatus('loading');
      try {
        const loader = activeNav === 'attendance'
          ? listTeacherAttendance
          : activeNav === 'homework'
            ? listTeacherHomework
            : listTeacherExams;
        const loaded = await loader(selected.classLevelId, selected.subjectId, accessToken);
        if (mounted) {
          setItems(loaded);
          setError(null);
        }
      } catch (caught) {
        if (mounted) {
          setItems([]);
          setError(caught instanceof Error ? caught.message : `${moduleTitle(activeNav)} could not be loaded.`);
        }
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadItems();
    return () => {
      mounted = false;
    };
  }, [accessToken, activeNav, assignments, needsAssignment, selected]);

  return (
    <section className="data-surface" aria-labelledby={`teacher-${activeNav}-title`}>
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">Connected real API</p>
          <h3 id={`teacher-${activeNav}-title`}>{activeNav === 'classes' ? 'My Classes' : moduleTitle(activeNav)}</h3>
        </div>
        {needsAssignment ? (
          <label className="inline-select">
            Assignment
            <select value={selected?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.className} - {assignment.subjectName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {!error && status !== 'loading' && assignments.length === 0 ? (
        <div className="api-empty-state">
          <strong>No assigned classes</strong>
          <span>Ask your School Admin to assign a class and subject before using teacher workflows.</span>
        </div>
      ) : null}
      {!error && status !== 'loading' && assignments.length > 0 && items.length === 0 ? (
        <div className="api-empty-state">
          <strong>No records yet</strong>
          <span>The backend returned an empty list for this teacher scope.</span>
        </div>
      ) : null}
      <div className="api-record-list">
        {items.slice(0, 12).map((item, index) => (
          <article key={recordKey(item, index)}>
            <strong>{recordTitle(item, index)}</strong>
            <span>{recordDetail(item)}</span>
            <code>{recordId(item)}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeacherMarksEntryPanel() {
  const { accessToken } = useAuthState();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classLevelId, setClassLevelId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [examId, setExamId] = useState('');
  const [roster, setRoster] = useState<TeacherExamRosterStudent[]>([]);
  const [marksByStudent, setMarksByStudent] = useState<Record<string, string>>({});
  const [initialMarksByStudent, setInitialMarksByStudent] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'loading' | 'idle' | 'submitting'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedExam = exams.find((exam) => exam.id === examId) ?? null;
  const classOptions = useMemo(() => uniqueBy(assignments, 'classLevelId'), [assignments]);
  const subjectOptions = useMemo(
    () => assignments.filter((assignment) => assignment.classLevelId === classLevelId),
    [assignments, classLevelId],
  );
  const hasUnsavedChanges = useMemo(
    () => roster.some((student) => (marksByStudent[student.studentId] ?? '') !== (initialMarksByStudent[student.studentId] ?? '')),
    [initialMarksByStudent, marksByStudent, roster],
  );

  useEffect(() => {
    let mounted = true;

    async function loadAssignments() {
      if (!accessToken) {
        setError('Teacher login is required.');
        setStatus('idle');
        return;
      }
      setStatus('loading');
      try {
        const loaded = await listTeacherAssignments(accessToken);
        if (!mounted) return;
        setAssignments(loaded);
        setClassLevelId((current) => current || loaded[0]?.classLevelId || '');
        setSubjectId((current) => current || loaded[0]?.subjectId || '');
        setError(null);
      } catch (caught) {
        if (!mounted) return;
        setError(caught instanceof Error ? caught.message : 'Teacher assignments could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadAssignments();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!classLevelId || subjectOptions.some((assignment) => assignment.subjectId === subjectId)) {
      return;
    }
    setSubjectId(subjectOptions[0]?.subjectId ?? '');
  }, [classLevelId, subjectId, subjectOptions]);

  useEffect(() => {
    let mounted = true;

    async function loadExams() {
      if (!accessToken || !classLevelId || !subjectId) {
        setExams([]);
        setExamId('');
        return;
      }
      setStatus('loading');
      try {
        const loaded = await listTeacherExams(classLevelId, subjectId, accessToken);
        if (!mounted) return;
        setExams(loaded);
        setExamId((current) => loaded.some((exam) => exam.id === current) ? current : loaded[0]?.id ?? '');
        setError(null);
      } catch (caught) {
        if (!mounted) return;
        setExams([]);
        setExamId('');
        setError(caught instanceof Error ? caught.message : 'Assigned exams could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadExams();
    return () => {
      mounted = false;
    };
  }, [accessToken, classLevelId, subjectId]);

  useEffect(() => {
    let mounted = true;

    async function loadRoster() {
      if (!accessToken || !examId) {
        setRoster([]);
        setMarksByStudent({});
        setInitialMarksByStudent({});
        return;
      }
      setStatus('loading');
      try {
        const loaded = await listTeacherExamRoster(examId, accessToken);
        if (!mounted) return;
        const nextMarks = Object.fromEntries(
          loaded.map((student) => [student.studentId, student.marksObtained == null ? '' : String(student.marksObtained)]),
        );
        setRoster(loaded);
        setMarksByStudent(nextMarks);
        setInitialMarksByStudent(nextMarks);
        setError(null);
        setSuccess(null);
      } catch (caught) {
        if (!mounted) return;
        setRoster([]);
        setError(caught instanceof Error ? caught.message : 'Exam roster could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadRoster();
    return () => {
      mounted = false;
    };
  }, [accessToken, examId]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function changeClass(nextClassLevelId: string) {
    if (!confirmDiscardChanges()) return;
    const nextAssignment = assignments.find((assignment) => assignment.classLevelId === nextClassLevelId);
    setClassLevelId(nextClassLevelId);
    setSubjectId(nextAssignment?.subjectId ?? '');
    resetMarks();
  }

  function changeSubject(nextSubjectId: string) {
    if (!confirmDiscardChanges()) return;
    setSubjectId(nextSubjectId);
    resetMarks();
  }

  function changeExam(nextExamId: string) {
    if (!confirmDiscardChanges()) return;
    setExamId(nextExamId);
  }

  function confirmDiscardChanges() {
    return !hasUnsavedChanges || window.confirm('You have unsaved marks. Discard changes?');
  }

  function resetMarks() {
    setRoster([]);
    setMarksByStudent({});
    setInitialMarksByStudent({});
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selectedExam) {
      setError('Teacher login and selected exam are required.');
      return;
    }
    const validationError = validateMarks(selectedExam, roster, marksByStudent);
    if (validationError) {
      setError(validationError);
      return;
    }
    const changedEntries = roster
      .map((student) => ({
        studentId: student.studentId,
        marks: marksByStudent[student.studentId] ?? '',
        initialMarks: initialMarksByStudent[student.studentId] ?? '',
      }))
      .filter((entry) => entry.marks !== '' && entry.marks !== entry.initialMarks);
    if (changedEntries.length === 0) {
      setError('Enter or change marks before submitting.');
      return;
    }

    setStatus('submitting');
    setError(null);
    setSuccess(null);
    try {
      await Promise.all(
        changedEntries.map((entry) => recordTeacherExamMarks(
          selectedExam.id,
          entry.studentId,
          Number(entry.marks),
          accessToken,
        )),
      );
      const refreshed = await listTeacherExamRoster(selectedExam.id, accessToken);
      const nextMarks = Object.fromEntries(
        refreshed.map((student) => [student.studentId, student.marksObtained == null ? '' : String(student.marksObtained)]),
      );
      setRoster(refreshed);
      setMarksByStudent(nextMarks);
      setInitialMarksByStudent(nextMarks);
      setSuccess(`${changedEntries.length} mark ${changedEntries.length === 1 ? 'entry' : 'entries'} saved.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Marks could not be saved.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="data-surface marks-entry-panel" aria-labelledby="teacher-marks-title">
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">Connected real API</p>
          <h3 id="teacher-marks-title">Teacher Marks Entry</h3>
        </div>
        {hasUnsavedChanges ? <span className="status-chip warning">Unsaved changes</span> : <span className="status-chip info">Saved</span>}
      </div>

      <div className="marks-selector-grid">
        <label className="inline-select">
          Class
          <select value={classLevelId} onChange={(event) => changeClass(event.target.value)}>
            {classOptions.map((assignment) => (
              <option key={assignment.classLevelId} value={assignment.classLevelId}>
                {assignment.className}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-select">
          Subject
          <select value={subjectId} onChange={(event) => changeSubject(event.target.value)}>
            {subjectOptions.map((assignment) => (
              <option key={assignment.subjectId} value={assignment.subjectId}>
                {assignment.subjectName} ({assignment.subjectCode})
              </option>
            ))}
          </select>
        </label>
        <label className="inline-select">
          Exam
          <select value={examId} onChange={(event) => changeExam(event.target.value)}>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} - {exam.sectionName ? `Section ${exam.sectionName}` : 'All sections'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedExam ? (
        <div className="marks-context">
          <span>{selectedExam.className}</span>
          <span>{selectedExam.subjectName}</span>
          <span>Max marks: {selectedExam.maxMarks}</span>
          <span>Status: {selectedExam.status}</span>
        </div>
      ) : null}

      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {success ? <p className="toast-message" role="status">{success}</p> : null}
      {!error && status !== 'loading' && assignments.length === 0 ? (
        <div className="api-empty-state">
          <strong>No assigned classes</strong>
          <span>Ask your School Admin to assign a class and subject before entering marks.</span>
        </div>
      ) : null}
      {!error && status !== 'loading' && assignments.length > 0 && exams.length === 0 ? (
        <div className="api-empty-state">
          <strong>No assigned exams</strong>
          <span>No exams exist yet for the selected class and subject.</span>
        </div>
      ) : null}
      {!error && status !== 'loading' && selectedExam && roster.length === 0 ? (
        <div className="api-empty-state">
          <strong>No students in exam scope</strong>
          <span>The selected exam class/section does not currently have active students.</span>
        </div>
      ) : null}

      {selectedExam && roster.length > 0 ? (
        <form className="marks-entry-form" noValidate onSubmit={handleSubmit}>
          <div className="marks-table" role="table" aria-label="Teacher marks roster">
            <div className="marks-row marks-header" role="row">
              <span>Student</span>
              <span>Admission</span>
              <span>Roll</span>
              <span>Marks</span>
            </div>
            {roster.map((student) => (
              <div className="marks-row" role="row" key={student.studentId}>
                <strong>{student.fullName}</strong>
                <span>{student.admissionNumber}</span>
                <span>{student.rollNumber ?? 'Not set'}</span>
                <label>
                  <span className="sr-only">Marks for {student.fullName}</span>
                  <input
                    aria-label={`Marks for ${student.fullName}`}
                    inputMode="decimal"
                    min="0"
                    max={selectedExam.maxMarks}
                    step="0.01"
                    type="number"
                    value={marksByStudent[student.studentId] ?? ''}
                    onChange={(event) => {
                      setMarksByStudent((current) => ({
                        ...current,
                        [student.studentId]: event.target.value,
                      }));
                      setSuccess(null);
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          <p className="form-hint">Absent marking is not enabled by the current backend exam API, so only numeric marks are submitted.</p>
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Saving marks...' : 'Save marks'}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function ParentChildPortalPanel({ activeNav }: { activeNav: string }) {
  const { accessToken } = useAuthState();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [items, setItems] = useState<unknown[]>([]);
  const [status, setStatus] = useState<'loading' | 'idle'>('loading');
  const [error, setError] = useState<string | null>(null);

  const selected = children.find((child) => child.studentId === selectedId) ?? children[0] ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadChildren() {
      if (!accessToken) {
        setError('Parent login is required.');
        setStatus('idle');
        return;
      }
      setStatus('loading');
      try {
        const loaded = await listParentChildren(accessToken);
        if (!mounted) return;
        setChildren(loaded);
        setSelectedId((current) => current || loaded[0]?.studentId || '');
        setError(null);
      } catch (caught) {
        if (!mounted) return;
        setChildren([]);
        setError(caught instanceof Error ? caught.message : 'Linked children could not be loaded.');
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadChildren();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      if (!accessToken) return;
      if (activeNav === 'children' || activeNav === 'dashboard') {
        setItems(children);
        return;
      }
      if (!selected) {
        setItems([]);
        return;
      }

      setStatus('loading');
      try {
        const loader = activeNav === 'attendance'
          ? listParentChildAttendance
          : activeNav === 'homework'
            ? listParentChildHomework
            : activeNav === 'results'
              ? listParentChildResults
              : activeNav === 'fees'
                ? listParentChildFees
                : activeNav === 'timetable'
                  ? listParentChildTimetable
                  : listParentChildNotices;
        const loaded = await loader(selected.studentId, accessToken);
        if (mounted) {
          setItems(loaded);
          setError(null);
        }
      } catch (caught) {
        if (mounted) {
          setItems([]);
          setError(caught instanceof Error ? caught.message : `${moduleTitle(activeNav)} could not be loaded.`);
        }
      } finally {
        if (mounted) setStatus('idle');
      }
    }

    void loadItems();
    return () => {
      mounted = false;
    };
  }, [accessToken, activeNav, children, selected]);

  return (
    <section className="data-surface" aria-labelledby={`parent-${activeNav}-title`}>
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">Connected child-scoped API</p>
          <h3 id={`parent-${activeNav}-title`}>{activeNav === 'children' ? 'My Children' : moduleTitle(activeNav)}</h3>
        </div>
        {activeNav !== 'children' && activeNav !== 'dashboard' ? (
          <label className="inline-select">
            Child
            <select value={selected?.studentId ?? ''} onChange={(event) => setSelectedId(event.target.value)}>
              {children.map((child) => (
                <option key={child.studentId} value={child.studentId}>
                  {child.studentName} - {child.admissionNumber}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {!error && status !== 'loading' && children.length === 0 ? (
        <div className="api-empty-state">
          <strong>No linked children</strong>
          <span>Ask the school to link your parent account to a student.</span>
        </div>
      ) : null}
      {!error && status !== 'loading' && children.length > 0 && items.length === 0 ? (
        <div className="api-empty-state">
          <strong>No records yet</strong>
          <span>The backend returned an empty list for this child.</span>
        </div>
      ) : null}
      <div className="api-record-list">
        {items.slice(0, 12).map((item, index) => (
          <article key={recordKey(item, index)}>
            <strong>{recordTitle(item, index)}</strong>
            <span>{recordDetail(item)}</span>
            <code>{recordId(item)}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function isSchoolAdminResource(navId: string): navId is SchoolAdminResourceKey {
  return ['attendance', 'homework', 'exams', 'notices', 'timetable', 'documents', 'website'].includes(navId);
}

function DashboardSummaryPanel({
  error,
  status,
  summary,
  user,
}: {
  error: string | null;
  status: 'loading' | 'ready' | 'unavailable';
  summary: DashboardSummary | null;
  user: CurrentUser;
}) {
  if (status === 'loading') {
    return (
      <section className="data-surface" aria-label="Loading dashboard summary">
        <div className="api-skeleton"><span /><span /><span /></div>
      </section>
    );
  }

  if (status === 'unavailable') {
    return (
      <section className="data-surface api-contract-state" aria-labelledby={`${ROLE_HOME[user.role]}-summary-unavailable`}>
        <p className="eyebrow">Live dashboard API</p>
        <h3 id={`${ROLE_HOME[user.role]}-summary-unavailable`}>Dashboard summary is not connected yet</h3>
        <p>
          No demo numbers are displayed. The frontend attempted the {roleTitle(user.role)} summary API and received:
        </p>
        <code>{error ?? 'Summary endpoint unavailable'}</code>
      </section>
    );
  }

  const metrics = summary?.metrics ?? [];

  if (metrics.length === 0) {
    return (
      <section className="data-surface api-contract-state" aria-label="Empty dashboard summary">
        <p className="eyebrow">Live dashboard API</p>
        <h3>No summary metrics returned</h3>
        <p>The backend summary endpoint responded, but returned no metrics for this role.</p>
      </section>
    );
  }

  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <article className="metric-card tone-blue" key={metric.label}>
          <span className="metric-dot" aria-hidden="true" />
          <p>{metric.label}</p>
          <strong>{metric.value}</strong>
          {metric.detail ? <em>{metric.detail}</em> : null}
        </article>
      ))}
    </div>
  );
}

function QuickActionsPanel({
  navItems,
  onSelectNav,
  role,
}: {
  navItems: NavItem[];
  onSelectNav: (navId: string) => void;
  role: UserRole;
}) {
  const availableNavIds = new Set(navItems.map((item) => item.id));
  const actions = QUICK_ACTIONS_BY_ROLE[role].filter((action) => availableNavIds.has(action.navId));

  return (
    <section className="quick-actions-panel" aria-labelledby={`${ROLE_HOME[role]}-quick-actions`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Connected actions</p>
          <h3 id={`${ROLE_HOME[role]}-quick-actions`}>Open live modules</h3>
        </div>
        <Sparkles size={18} aria-hidden="true" />
      </div>
      <div className="quick-action-list">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} onClick={() => onSelectNav(action.navId)} type="button">
              <span aria-hidden="true"><Icon size={18} /></span>
              <strong>{action.label}<small>{action.detail}</small></strong>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ApiCoveragePanel({ navItems, role }: { navItems: NavItem[]; role: UserRole }) {
  return (
    <section className="notification-center" aria-labelledby={`${ROLE_HOME[role]}-api-coverage`}>
      <p className="eyebrow">API coverage</p>
      <h3 id={`${ROLE_HOME[role]}-api-coverage`}>Visible modules</h3>
      <ul>
        {navItems.map((item) => (
          <li key={item.id}>
            <span className={`status-chip ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EndpointListPanel({ path, title }: { path: string | null; title: string }) {
  const { accessToken } = useAuthState();
  const [items, setItems] = useState<unknown[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!path) {
        setStatus('idle');
        setError('No backend list endpoint exists for this visible section yet.');
        return;
      }
      if (!accessToken) {
        setStatus('idle');
        setError('Login is required.');
        return;
      }

      setStatus('loading');
      try {
        const response = await httpClient.get<unknown>(path, { accessToken });
        if (!mounted) return;
        setItems(toListItems(response));
        setError(null);
      } catch (caught) {
        if (!mounted) return;
        setItems([]);
        setError(caught instanceof Error ? caught.message : 'API request failed.');
      } finally {
        if (mounted) {
          setStatus('idle');
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [accessToken, path]);

  return (
    <section className="data-surface" aria-labelledby={`${slug(title)}-title`}>
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">{path ? 'Connected real API' : 'Missing backend API'}</p>
          <h3 id={`${slug(title)}-title`}>{title}</h3>
        </div>
        {path ? <code>{path}</code> : null}
      </div>

      {status === 'loading' ? <div className="api-skeleton"><span /><span /><span /></div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {status !== 'loading' && !error && items.length === 0 ? (
        <div className="api-empty-state">
          <strong>No records yet</strong>
          <span>The backend returned an empty list.</span>
        </div>
      ) : null}
      <div className="api-record-list">
        {items.slice(0, 12).map((item, index) => (
          <article key={recordKey(item, index)}>
            <strong>{recordTitle(item, index)}</strong>
            <span>{recordDetail(item)}</span>
            <code>{recordId(item)}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComingSoonPanel({ activeNav, role }: { activeNav: string; role: UserRole }) {
  return (
    <EmptyState
      title={`${moduleTitle(activeNav)} is unavailable`}
      detail={`${roleTitle(role)} ${moduleTitle(activeNav)} is hidden from navigation until a verified backend/UI integration exists.`}
    />
  );
}

function EmptyState({ detail, title }: { detail: string; title: string }) {
  return (
    <section className="empty-state" aria-labelledby={`${slug(title)}-title`}>
      <div className="empty-mark" aria-hidden="true" />
      <h3 id={`${slug(title)}-title`}>{title}</h3>
      <p>{detail}</p>
    </section>
  );
}

function toListItems(response: unknown) {
  if (Array.isArray(response)) {
    return response;
  }
  if (typeof response === 'object' && response !== null && 'items' in response) {
    const items = (response as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items;
    }
  }
  return response == null ? [] : [response];
}

function recordKey(item: unknown, index: number) {
  const id = recordId(item);
  return id === 'No ID' ? `record-${index}` : id;
}

function recordId(item: unknown) {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return String((item as { id?: unknown }).id ?? 'No ID');
  }
  if (typeof item === 'object' && item !== null && 'studentId' in item) {
    return String((item as { studentId?: unknown }).studentId ?? 'No ID');
  }
  return 'No ID';
}

function recordTitle(item: unknown, index: number) {
  if (typeof item !== 'object' || item === null) {
    return `Record ${index + 1}`;
  }

  const record = item as Record<string, unknown>;
  return String(
    record.fullName
      ?? record.studentName
      ?? record.title
      ?? record.name
      ?? record.className
      ?? record.subjectName
      ?? record.description
      ?? record.email
      ?? `Record ${index + 1}`,
  );
}

function recordDetail(item: unknown) {
  if (typeof item !== 'object' || item === null) {
    return String(item);
  }

  const record = item as Record<string, unknown>;
  const detail = record.status
    ?? record.role
    ?? record.subjectCode
    ?? record.code
    ?? record.admissionNumber
    ?? record.attendanceDate
    ?? record.weekday
    ?? record.dueDate
    ?? record.createdAt;
  return detail ? String(detail) : 'Live backend record';
}

function uniqueBy<T>(items: T[], key: keyof T) {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function validateMarks(
  exam: TeacherExam,
  roster: TeacherExamRosterStudent[],
  marksByStudent: Record<string, string>,
) {
  for (const student of roster) {
    const rawMarks = marksByStudent[student.studentId] ?? '';
    if (rawMarks === '') {
      continue;
    }
    const marks = Number(rawMarks);
    if (!Number.isFinite(marks)) {
      return `Marks for ${student.fullName} must be a valid number.`;
    }
    if (marks < 0) {
      return `Marks for ${student.fullName} cannot be negative.`;
    }
    if (marks > exam.maxMarks) {
      return `Marks for ${student.fullName} cannot exceed ${exam.maxMarks}.`;
    }
  }
  return null;
}

function LoadingScreen() {
  return (
    <main className="loading-shell" data-testid="cloudcampus-shell">
      <div className="skeleton-card">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

function PasswordResetCard() {
  return (
    <section className="workflow-panel compact-auth-card" aria-labelledby="forgot-password-title">
      <p className="eyebrow">Account recovery</p>
      <h2 id="forgot-password-title">Forgot password</h2>
      <form className="workflow-form">
        <label>
          Email
          <input autoComplete="email" name="resetEmail" type="email" />
        </label>
        <button type="button">Send reset link</button>
      </form>
    </section>
  );
}

function WorkspaceHeader({ activeNav, title }: { activeNav: string; title: string }) {
  return (
    <div className="workspace-header">
      <div>
        <p className="eyebrow">{activeNav.replace('-', ' ')}</p>
        <h2>{title}</h2>
      </div>
      <div className="workspace-actions">
        <button type="button">Import</button>
        <button type="button">Create</button>
      </div>
    </div>
  );
}

function AIAssistCard({ role }: { role: UserRole }) {
  return (
    <section className="sidebar-ai-card">
      <p>AI assistant</p>
      <strong>{role === 'STUDENT' ? 'Study coach ready' : 'Insights ready'}</strong>
    </section>
  );
}

function NotificationButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-button notification-dot" aria-label="Open notifications" onClick={onClick} type="button">
      <Bell size={17} aria-hidden="true" />
    </button>
  );
}

function ThemeToggle({ onToggle, theme }: { onToggle: () => void; theme: 'light' | 'dark' }) {
  return (
    <button className="theme-toggle" aria-label="Toggle theme" onClick={onToggle} type="button">
      {theme === 'light' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      <em>{theme === 'light' ? 'Light' : 'Dark'}</em>
    </button>
  );
}

function roleTitle(role: UserRole) {
  return role
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function navIcon(navId: string): LucideIcon {
  if (navId.includes('dashboard')) return Home;
  if (navId.includes('tenant') || navId.includes('school') || navId.includes('branding')) return Building2;
  if (navId.includes('student') || navId.includes('parent') || navId.includes('teacher') || navId.includes('staff') || navId.includes('admin')) return Users;
  if (navId.includes('attendance') || navId.includes('timetable') || navId.includes('leave')) return CalendarCheck;
  if (navId.includes('homework') || navId.includes('resource')) return BookOpen;
  if (navId.includes('exam') || navId.includes('result') || navId.includes('marks')) return GraduationCap;
  if (navId.includes('fee') || navId.includes('payment') || navId.includes('receipt') || navId.includes('revenue') || navId.includes('subscription') || navId.includes('usage')) return CircleDollarSign;
  if (navId.includes('notice') || navId.includes('notification')) return Bell;
  if (navId.includes('report') || navId.includes('audit')) return FileText;
  if (navId.includes('ai') || navId.includes('assistant')) return BrainCircuit;
  if (navId.includes('health')) return LineChart;
  if (navId.includes('setting')) return Settings;
  return Sparkles;
}

function roleInfoItems(user: CurrentUser): RoleInfoItem[] {
  const activeSchool = user.activeSchool?.name ?? (user.role === 'SUPER_ADMIN' ? 'Platform scope' : 'No active school');
  return [
    { label: 'Authenticated role', value: roleTitle(user.role), detail: 'Server-derived from /v1/me', icon: ShieldCheck, tone: 'blue' },
    { label: 'Tenant', value: user.tenantId || 'Platform', detail: 'Not accepted from frontend input', icon: Building2, tone: 'emerald' },
    { label: 'Active school', value: activeSchool, detail: 'Resolved from authenticated session', icon: School, tone: 'violet' },
    { label: 'Allowed schools', value: String(user.allowedSchools.length), detail: 'Loaded from /v1/me/schools', icon: Users, tone: 'amber' },
  ];
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return useMemo(() => ({
    date: new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }).format(now),
    time: new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now),
  }), [now]);
}

function roleTableTitle(role: UserRole) {
  if (role === 'TEACHER') return 'Class operations';
  if (role === 'FINANCE_STAFF') return 'Finance operations';
  if (role === 'PARENT') return 'Child activity';
  if (role === 'STUDENT') return 'Learning plan';
  return 'Operations queue';
}

function roleEndpoint(role: UserRole, activeNav: string) {
  if (role === 'TEACHER') {
    if (activeNav === 'classes' || activeNav === 'dashboard') return '/v1/teacher/assignments';
    if (activeNav === 'notices') return '/v1/teacher/notices';
    return null;
  }

  if (role === 'PARENT') {
    if (activeNav === 'children' || activeNav === 'dashboard') return '/v1/parent/children';
    return null;
  }

  if (role === 'STUDENT') {
    if (activeNav === 'dashboard') return '/v1/student/profile';
    if (activeNav === 'homework') return '/v1/student/homework';
    if (activeNav === 'results') return '/v1/student/results';
    if (activeNav === 'fees') return '/v1/student/fees';
    if (activeNav === 'notices') return '/v1/student/notices';
    if (activeNav === 'attendance') return '/v1/student/attendance';
    if (activeNav === 'timetable') return '/v1/student/timetable';
    return null;
  }

  return null;
}

function dashboardEndpoint(role: UserRole) {
  if (role === 'SUPER_ADMIN') return '/v1/super-admin/dashboard/summary';
  if (role === 'TENANT_ADMIN') return '/v1/tenant-admin/dashboard/summary';
  if (role === 'SCHOOL_ADMIN') return '/v1/school-admin/dashboard/summary';
  if (role === 'TEACHER') return '/v1/teacher/dashboard/summary';
  if (role === 'FINANCE_STAFF') return '/v1/finance/dashboard/summary';
  if (role === 'STAFF') return '/v1/staff/dashboard/summary';
  if (role === 'PARENT') return '/v1/parent/dashboard/summary';
  return '/v1/student/dashboard/summary';
}

function statusLabel(status: ConnectionStatus) {
  if (status === 'CONNECTED_REAL_API') return 'Live API';
  return 'Live API';
}

function statusTone(status: ConnectionStatus) {
  if (status === 'CONNECTED_REAL_API') return 'info';
  return 'info';
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function moduleTitle(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
