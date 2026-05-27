import { useEffect, useMemo, useState } from 'react';
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
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
} from 'recharts';

import { AcademicAssignmentsPage } from '../features/academic/pages/AcademicAssignmentsPage';
import { AcademicSetupPage } from '../features/academic/pages/AcademicSetupPage';
import { SchoolSelector } from '../features/auth/components/SchoolSelector';
import { AuthClient, AuthStateProvider, useAuthState } from '../features/auth/hooks/authState';
import { InvitationAcceptPage } from '../features/auth/pages/InvitationAcceptPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { createFinanceFeeDemand, recordFinanceFeePayment } from '../features/finance/api/feeApi';
import { FeeLifecyclePage } from '../features/finance/pages/FeeLifecyclePage';
import { BulkJobsPage } from '../features/operations/pages/BulkJobsPage';
import { ParentLeaveRequestsPage } from '../features/parent/pages/ParentLeaveRequestsPage';
import { SchoolAdminLeaveRequestsPage } from '../features/parent/pages/SchoolAdminLeaveRequestsPage';
import { SchoolAdminParentLinkPage } from '../features/parent/pages/SchoolAdminParentLinkPage';
import { ReportExportsPage } from '../features/reports/pages/ReportExportsPage';
import { StaffProvisioningPage } from '../features/staff/pages/StaffProvisioningPage';
import { StudentImportPage } from '../features/student/pages/StudentImportPage';
import { TenantOnboardingPage } from '../features/super-admin/pages/TenantOnboardingPage';
import { TenantReportsPage } from '../features/tenant-admin/pages/TenantReportsPage';
import { TenantSchoolCreationPage } from '../features/tenant-admin/pages/TenantSchoolCreationPage';
import { TenantSchoolManagementPage } from '../features/tenant-admin/pages/TenantSchoolManagementPage';
import { TenantSettingsPage } from '../features/tenant-admin/pages/TenantSettingsPage';
import type { AuthSession, CurrentUser, UserRole } from '../features/auth/api/authApi';

type AppProps = {
  authClient?: Partial<AuthClient>;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
};

type NavItem = {
  id: string;
  label: string;
  badge?: string;
};

type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
};

type AnalyticsPoint = {
  label: string;
  attendance: number;
  collection: number;
  engagement: number;
};

type QuickAction = {
  label: string;
  detail: string;
  icon: LucideIcon;
};

type RoleInfoItem = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: Metric['tone'];
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
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'schools', label: 'Schools' },
    { id: 'subscriptions', label: 'Subscription Plans' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'ai-usage', label: 'AI Usage' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'health', label: 'Platform Health' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'settings', label: 'Settings' },
  ],
  TENANT_ADMIN: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'schools', label: 'Schools' },
    { id: 'admins', label: 'School Admins' },
    { id: 'usage', label: 'Subscription Usage' },
    { id: 'reports', label: 'Reports' },
    { id: 'branding', label: 'Branding' },
    { id: 'settings', label: 'Settings' },
  ],
  SCHOOL_ADMIN: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'parents', label: 'Parents' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'staff', label: 'Staff' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'homework', label: 'Homework' },
    { id: 'exams', label: 'Exams & Results' },
    { id: 'fees', label: 'Fees' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'notices', label: 'Notices' },
    { id: 'reports', label: 'Reports' },
    { id: 'website', label: 'Website Builder' },
    { id: 'settings', label: 'Settings' },
  ],
  TEACHER: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'classes', label: 'My Classes' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'homework', label: 'Homework' },
    { id: 'exams', label: 'Exams' },
    { id: 'marks', label: 'Marks' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'resources', label: 'Resources' },
  ],
  FINANCE_STAFF: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fees', label: 'Fee Demands' },
    { id: 'payments', label: 'Payments' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'reports', label: 'Reports' },
  ],
  STAFF: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notices', label: 'Notices' },
  ],
  PARENT: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'children', label: 'My Children' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'homework', label: 'Homework' },
    { id: 'results', label: 'Results' },
    { id: 'fees', label: 'Fees' },
    { id: 'notices', label: 'Notices' },
    { id: 'leave', label: 'Leave Requests' },
  ],
  STUDENT: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'homework', label: 'Homework' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'results', label: 'Results' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'notices', label: 'Notices' },
    { id: 'resources', label: 'Resources' },
    { id: 'assistant', label: 'AI Study Assistant' },
  ],
};

const METRICS_BY_ROLE: Record<UserRole, Metric[]> = {
  SUPER_ADMIN: [
    { label: 'Active tenants', value: '1,284', delta: '+18 this month', tone: 'blue' },
    { label: 'Schools online', value: '8,940', delta: '99.98% uptime', tone: 'emerald' },
    { label: 'Monthly revenue', value: '$428k', delta: '+12.4%', tone: 'violet' },
    { label: 'Pending invoices', value: '34', delta: '8 high value', tone: 'amber' },
  ],
  TENANT_ADMIN: [
    { label: 'Schools', value: '12', delta: '2 near limit', tone: 'blue' },
    { label: 'Active users', value: '18.2k', delta: '+6.1%', tone: 'emerald' },
    { label: 'Fee collection', value: '92%', delta: '+4.8%', tone: 'violet' },
    { label: 'Attendance', value: '94.6%', delta: '3 schools flagged', tone: 'amber' },
  ],
  SCHOOL_ADMIN: [
    { label: "Today's attendance", value: '94.8%', delta: '312 present', tone: 'emerald' },
    { label: 'Fee collection today', value: '$18.4k', delta: '78% cycle progress', tone: 'blue' },
    { label: 'Upcoming exams', value: '6', delta: 'Next 14 days', tone: 'violet' },
    { label: 'Approvals', value: '18', delta: 'Parent links & imports', tone: 'amber' },
  ],
  TEACHER: [
    { label: "Today's classes", value: '5', delta: '2 pending attendance', tone: 'blue' },
    { label: 'Homework review', value: '38', delta: 'Due today', tone: 'amber' },
    { label: 'Marks pending', value: '2', delta: 'Exam sheets', tone: 'violet' },
    { label: 'Class average', value: '82%', delta: '+3%', tone: 'emerald' },
  ],
  FINANCE_STAFF: [
    { label: 'Fee collection', value: '78%', delta: '42 pending', tone: 'blue' },
    { label: 'Payments today', value: '24', delta: '+9 online', tone: 'emerald' },
    { label: 'Receipts issued', value: '312', delta: 'This month', tone: 'violet' },
    { label: 'Overdue demands', value: '18', delta: 'Needs follow-up', tone: 'amber' },
  ],
  STAFF: [
    { label: 'Open tasks', value: '14', delta: '4 urgent', tone: 'amber' },
    { label: 'Notices', value: '6', delta: '2 unread', tone: 'blue' },
    { label: 'Requests', value: '9', delta: 'Operations queue', tone: 'violet' },
    { label: 'SLA', value: '96%', delta: '+2%', tone: 'emerald' },
  ],
  PARENT: [
    { label: 'Attendance', value: '96%', delta: 'This month', tone: 'emerald' },
    { label: 'Homework due', value: '3', delta: 'Next 48 hours', tone: 'amber' },
    { label: 'Fee reminders', value: '1', delta: 'Due Friday', tone: 'rose' },
    { label: 'Performance', value: 'A-', delta: '+5%', tone: 'violet' },
  ],
  STUDENT: [
    { label: 'Homework due', value: '4', delta: '2 due today', tone: 'amber' },
    { label: 'Attendance', value: '93%', delta: 'Above target', tone: 'emerald' },
    { label: 'Exam prep', value: '7d', delta: 'Mathematics', tone: 'violet' },
    { label: 'Study streak', value: '12', delta: 'days', tone: 'blue' },
  ],
};

const TABLE_COLUMNS = ['Name', 'Scope', 'Status', 'Owner'];
const TABLE_ROWS = [
  ['Aarav Sharma', 'Grade 8 / A', 'Active', 'School Admin'],
  ['Quarterly fee cycle', 'Finance', 'In progress', 'Accounts'],
  ['Midterm mathematics', 'Exams', 'Published', 'Academics'],
  ['Attendance risk cohort', 'AI insight', 'Review', 'Counsellor'],
];

const ANALYTICS_BY_ROLE: Record<UserRole, AnalyticsPoint[]> = {
  SUPER_ADMIN: [
    { label: 'Jan', attendance: 86, collection: 72, engagement: 64 },
    { label: 'Feb', attendance: 88, collection: 76, engagement: 69 },
    { label: 'Mar', attendance: 91, collection: 79, engagement: 73 },
    { label: 'Apr', attendance: 93, collection: 83, engagement: 78 },
    { label: 'May', attendance: 95, collection: 88, engagement: 82 },
  ],
  TENANT_ADMIN: [
    { label: 'Mon', attendance: 91, collection: 82, engagement: 74 },
    { label: 'Tue', attendance: 93, collection: 84, engagement: 79 },
    { label: 'Wed', attendance: 92, collection: 86, engagement: 81 },
    { label: 'Thu', attendance: 95, collection: 89, engagement: 83 },
    { label: 'Fri', attendance: 94, collection: 92, engagement: 86 },
  ],
  SCHOOL_ADMIN: [
    { label: 'Mon', attendance: 88, collection: 62, engagement: 72 },
    { label: 'Tue', attendance: 91, collection: 68, engagement: 76 },
    { label: 'Wed', attendance: 93, collection: 71, engagement: 78 },
    { label: 'Thu', attendance: 94, collection: 76, engagement: 83 },
    { label: 'Fri', attendance: 95, collection: 81, engagement: 86 },
  ],
  TEACHER: [
    { label: 'P1', attendance: 86, collection: 68, engagement: 74 },
    { label: 'P2', attendance: 92, collection: 72, engagement: 81 },
    { label: 'P3', attendance: 89, collection: 78, engagement: 84 },
    { label: 'P4', attendance: 94, collection: 80, engagement: 88 },
    { label: 'P5', attendance: 93, collection: 82, engagement: 87 },
  ],
  FINANCE_STAFF: [
    { label: 'W1', attendance: 72, collection: 58, engagement: 66 },
    { label: 'W2', attendance: 74, collection: 64, engagement: 70 },
    { label: 'W3', attendance: 78, collection: 71, engagement: 75 },
    { label: 'W4', attendance: 81, collection: 76, engagement: 78 },
    { label: 'W5', attendance: 86, collection: 83, engagement: 84 },
  ],
  STAFF: [
    { label: 'Mon', attendance: 84, collection: 68, engagement: 72 },
    { label: 'Tue', attendance: 86, collection: 70, engagement: 74 },
    { label: 'Wed', attendance: 88, collection: 73, engagement: 79 },
    { label: 'Thu', attendance: 90, collection: 76, engagement: 82 },
    { label: 'Fri', attendance: 92, collection: 78, engagement: 84 },
  ],
  PARENT: [
    { label: 'W1', attendance: 94, collection: 76, engagement: 70 },
    { label: 'W2', attendance: 92, collection: 78, engagement: 75 },
    { label: 'W3', attendance: 95, collection: 81, engagement: 82 },
    { label: 'W4', attendance: 96, collection: 86, engagement: 88 },
    { label: 'W5', attendance: 96, collection: 91, engagement: 90 },
  ],
  STUDENT: [
    { label: 'Mon', attendance: 84, collection: 70, engagement: 76 },
    { label: 'Tue', attendance: 89, collection: 72, engagement: 80 },
    { label: 'Wed', attendance: 91, collection: 75, engagement: 84 },
    { label: 'Thu', attendance: 93, collection: 76, engagement: 88 },
    { label: 'Fri', attendance: 94, collection: 78, engagement: 91 },
  ],
};

const QUICK_ACTIONS_BY_ROLE: Record<UserRole, QuickAction[]> = {
  SUPER_ADMIN: [
    { label: 'Create tenant', detail: 'Create trust, first school and admin', icon: Building2 },
    { label: 'Create plan', detail: 'Prepare subscription package', icon: ReceiptText },
    { label: 'View audit logs', detail: 'Review privileged events', icon: FileText },
    { label: 'System health', detail: 'Check platform readiness', icon: LineChart },
  ],
  TENANT_ADMIN: [
    { label: 'Add school', detail: 'Add a new campus safely', icon: School },
    { label: 'Invite School Admin', detail: 'Grant school access', icon: Users },
    { label: 'View reports', detail: 'Compare school performance', icon: FileText },
    { label: 'Subscription usage', detail: 'Review plan limits', icon: ReceiptText },
  ],
  SCHOOL_ADMIN: [
    { label: 'Add student', detail: 'Validate and queue roster updates', icon: Users },
    { label: 'Add teacher', detail: 'Provision portal access', icon: GraduationCap },
    { label: 'Take attendance', detail: 'Open today’s classes', icon: CalendarCheck },
    { label: 'Create notice', detail: 'Publish school update', icon: Newspaper },
    { label: 'Create exam', detail: 'Prepare assessment flow', icon: ClipboardCheck },
  ],
  TEACHER: [
    { label: 'Mark attendance', detail: 'Open assigned classes', icon: CalendarCheck },
    { label: 'Create homework', detail: 'Prepare class work', icon: BookOpen },
    { label: 'Enter marks', detail: 'Update exam scores', icon: ClipboardCheck },
  ],
  FINANCE_STAFF: [
    { label: 'Record payment', detail: 'Issue receipt', icon: CircleDollarSign },
    { label: 'Generate receipt', detail: 'Share payment proof', icon: ReceiptText },
    { label: 'Export report', detail: 'Share collection view', icon: FileText },
  ],
  STAFF: [
    { label: 'Open tasks', detail: 'Review school operations', icon: ClipboardCheck },
    { label: 'Read notices', detail: 'Catch up on updates', icon: Newspaper },
    { label: 'Support queue', detail: 'Follow assigned work', icon: MessageSquareText },
  ],
  PARENT: [
    { label: 'Pay fees', detail: 'Review reminders', icon: CircleDollarSign },
    { label: 'Apply leave', detail: 'Submit linked-child leave', icon: CalendarCheck },
    { label: 'View results', detail: 'Review published marks', icon: GraduationCap },
  ],
  STUDENT: [
    { label: 'Submit homework', detail: 'Track what is due', icon: BookOpen },
    { label: 'View timetable', detail: 'Plan today’s classes', icon: CalendarCheck },
    { label: 'View results', detail: 'Review published marks', icon: GraduationCap },
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
  const navItems = NAV_BY_ROLE[user.role];
  const portalTitle = roleTitle(user.role);

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
          <PortalDashboard user={user} />
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
        <span>Live delivery health</span>
      </div>
      {[
        ['Invitation delivered', 'School Admin invite logged safely'],
        ['Report export ready', 'Student directory CSV completed'],
        ['AI insight', 'Attendance risk changed for Grade 8'],
      ].map(([title, detail]) => (
        <article key={title}>
          <i aria-hidden="true" />
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
        </article>
      ))}
    </div>
  );
}

function PortalDashboard({ user }: { user: CurrentUser }) {
  const metrics = METRICS_BY_ROLE[user.role];
  const chartData = ANALYTICS_BY_ROLE[user.role];

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

      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="insight-grid">
        <AnalyticsPanel data={chartData} role={user.role} />
        <QuickActionsPanel role={user.role} />
        <AIInsightPanel role={user.role} />
        <NotificationCenter />
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
  if (activeNav === 'fees' || activeNav === 'payments' || activeNav === 'receipts') {
    return (
      <FeeLifecyclePage
        onCreateDemand={createFinanceFeeDemand}
        onRecordPayment={recordFinanceFeePayment}
      />
    );
  }

  return (
    <div className="workspace-grid">
      <ModernTable title={activeNav === 'dashboard' ? 'Finance operations' : moduleTitle(activeNav)} />
      <TimelinePanel role="FINANCE_STAFF" />
      <EmptyState title={`${moduleTitle(activeNav)} ready`} detail="Finance access is limited to fee, payment, receipt and finance report workflows." />
    </div>
  );
}

function SuperAdminModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'tenants') {
    return <TenantOnboardingPage />;
  }

  if (activeNav === 'dashboard') {
    return (
      <div className="workspace-grid">
        <ModernTable title="Tenant operations" />
        <WizardPreview />
      </div>
    );
  }

  return (
    <div className="workspace-grid">
      <ModernTable title={moduleTitle(activeNav)} />
      <TimelinePanel role="SUPER_ADMIN" />
      <EmptyState title={`${moduleTitle(activeNav)} ready`} detail="This premium shell is prepared for the verified backend module." />
    </div>
  );
}

function TenantAdminModule({ activeNav }: { activeNav: string }) {
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

  return (
    <div className="workspace-grid">
      <ModernTable title={activeNav === 'admins' ? 'School admin directory' : 'Tenant operations'} />
      <TimelinePanel role="TENANT_ADMIN" />
      <EmptyState title={`${moduleTitle(activeNav)} workspace`} detail="Cross-school controls are staged for the next verified workflow." />
    </div>
  );
}

function SchoolAdminModule({ activeNav }: { activeNav: string }) {
  if (activeNav === 'students') {
    return (
      <div className="workspace-grid">
        <ModernTable title="Student management" />
        <StudentImportPage />
      </div>
    );
  }

  if (activeNav === 'parents') {
    return (
      <div className="workspace-grid">
        <SchoolAdminParentLinkPage />
        <SchoolAdminLeaveRequestsPage />
      </div>
    );
  }
  if (activeNav === 'teachers' || activeNav === 'staff') return <StaffProvisioningPage />;
  if (activeNav === 'fees') return <FeeLifecyclePage />;
  if (activeNav === 'reports') return <ReportExportsPage />;
  if (activeNav === 'settings') return <BulkJobsPage />;
  if (activeNav === 'dashboard') {
    return (
      <div className="workspace-grid">
        <ModernTable title="School operations" />
        <TimelinePanel role="SCHOOL_ADMIN" />
        <EmptyState title="Approvals queue" detail="Parent links, staff invitations and student imports are ready from the sidebar." />
      </div>
    );
  }

  if (activeNav === 'attendance' || activeNav === 'homework' || activeNav === 'exams' || activeNav === 'timetable') {
    return (
      <div className="workspace-grid">
        <AcademicSetupPage />
        <AcademicAssignmentsPage />
        <ModernTable title={moduleTitle(activeNav)} />
      </div>
    );
  }

  return (
    <div className="workspace-grid">
      <ModernTable title={moduleTitle(activeNav)} />
      <EmptyState title={`${moduleTitle(activeNav)} module`} detail="The role-safe shell is ready for this school-scoped workflow." />
    </div>
  );
}

function LearnerStaffModule({ activeNav, role }: { activeNav: string; role: UserRole }) {
  if (role === 'PARENT' && activeNav === 'leave') {
    return <ParentLeaveRequestsPage />;
  }

  return (
    <div className="workspace-grid">
      <ModernTable title={activeNav === 'dashboard' ? roleTableTitle(role) : moduleTitle(activeNav)} />
      <TimelinePanel role={role} />
      <EmptyState title={`${moduleTitle(activeNav)} ready`} detail="This portal area is isolated to the authenticated role context." />
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <motion.article
      className={`metric-card tone-${metric.tone}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
    >
      <span className="metric-dot" aria-hidden="true" />
      <p>{metric.label}</p>
      <strong>{metric.value}</strong>
      <em>{metric.delta}</em>
    </motion.article>
  );
}

function AnalyticsPanel({ data, role }: { data: AnalyticsPoint[]; role: UserRole }) {
  return (
    <section className="analytics-panel" aria-labelledby={`${ROLE_HOME[role]}-analytics`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h3 id={`${ROLE_HOME[role]}-analytics`}>{analyticsTitle(role)}</h3>
        </div>
        <span className="status-chip info">Live model</span>
      </div>
      <div className="chart-shell" aria-label={`${roleTitle(role)} analytics trend`}>
        <AreaChart width={560} height={230} data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`${ROLE_HOME[role]}-attendance`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={3} fill={`url(#${ROLE_HOME[role]}-attendance)`} />
          <Area type="monotone" dataKey="engagement" stroke="#7c3aed" strokeWidth={2} fill="transparent" dot={false} />
        </AreaChart>
      </div>
    </section>
  );
}

function QuickActionsPanel({ role }: { role: UserRole }) {
  return (
    <section className="quick-actions-panel" aria-labelledby={`${ROLE_HOME[role]}-quick-actions`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Quick actions</p>
          <h3 id={`${ROLE_HOME[role]}-quick-actions`}>Next best actions</h3>
        </div>
        <Sparkles size={18} aria-hidden="true" />
      </div>
      <div className="quick-action-list">
        {QUICK_ACTIONS_BY_ROLE[role].map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} type="button">
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

function ModernTable({ title }: { title: string }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(
    () => TABLE_ROWS.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <section className="data-surface" aria-labelledby={`${slug(title)}-title`}>
      <div className="surface-toolbar">
        <div>
          <p className="eyebrow">Data</p>
          <h3 id={`${slug(title)}-title`}>{title}</h3>
        </div>
        <div className="table-actions">
          <input aria-label={`${title} search`} onChange={(event) => setQuery(event.target.value)} placeholder="Search" value={query} />
          <button type="button">Filters</button>
          <button type="button">Columns</button>
          <button type="button">Export</button>
        </div>
      </div>
      <div className="mobile-record-list" aria-label={`${title} mobile records`}>
        {rows.map((row) => (
          <article key={`mobile-${row.join('-')}`}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <em>{row[2]}</em>
          </article>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {TABLE_COLUMNS.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell, index) => (
                  <td key={cell}>
                    {index === 2 ? <span className="status-chip">{cell}</span> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>{rows.length} records</span>
        <span>Page 1 of 1</span>
        <span>Bulk actions ready</span>
      </div>
    </section>
  );
}

function AIInsightPanel({ role }: { role: UserRole }) {
  return (
    <section className="insight-panel" aria-labelledby="ai-insight-title">
      <p className="eyebrow">AI insights</p>
      <h3 id="ai-insight-title">{aiInsightTitle(role)}</h3>
      <div className="prediction-bar" aria-label="Prediction confidence">
        <span style={{ width: `${role === 'PARENT' || role === 'STUDENT' ? 72 : 84}%` }} />
      </div>
      <ul>
        <li>Attendance risk cluster identified</li>
        <li>Fee reminder timing optimized</li>
        <li>Exam trend anomaly ready for review</li>
      </ul>
    </section>
  );
}

function NotificationCenter() {
  return (
    <section className="notification-center" aria-labelledby="notification-title">
      <p className="eyebrow">Notifications</p>
      <h3 id="notification-title">Delivery center</h3>
      <ul>
        <li><span className="status-chip">Sent</span> Invitation email queued</li>
        <li><span className="status-chip warning">Review</span> Fee reminder draft</li>
        <li><span className="status-chip info">Info</span> Report export completed</li>
      </ul>
    </section>
  );
}

function TimelinePanel({ role }: { role: UserRole }) {
  return (
    <section className="timeline-panel" aria-labelledby="timeline-title">
      <p className="eyebrow">Today</p>
      <h3 id="timeline-title">{roleTitle(role)} timeline</h3>
      <ol>
        <li><strong>08:30</strong><span>Morning attendance</span></li>
        <li><strong>11:00</strong><span>Homework review</span></li>
        <li><strong>14:15</strong><span>Notice acknowledgement</span></li>
      </ol>
    </section>
  );
}

function WizardPreview() {
  return (
    <section className="wizard-preview" aria-labelledby="wizard-title">
      <p className="eyebrow">Wizard</p>
      <h3 id="wizard-title">Tenant onboarding flow</h3>
      <div className="wizard-steps" aria-label="Onboarding progress">
        <span className="is-complete">Tenant</span>
        <span className="is-active">School</span>
        <span>Admin</span>
        <span>Invite</span>
      </div>
    </section>
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

function analyticsTitle(role: UserRole) {
  if (role === 'SUPER_ADMIN') return 'Platform growth and reliability';
  if (role === 'TENANT_ADMIN') return 'Organisation performance trend';
  if (role === 'SCHOOL_ADMIN') return 'School operating rhythm';
  if (role === 'FINANCE_STAFF') return 'Collection momentum';
  if (role === 'TEACHER') return 'Class engagement trend';
  if (role === 'PARENT') return 'Child progress pulse';
  if (role === 'STUDENT') return 'Learning momentum';
  return 'Operational throughput';
}

function roleInfoItems(user: CurrentUser): RoleInfoItem[] {
  const schoolCount = String(user.allowedSchools.length);
  const activeSchool = user.activeSchool?.name ?? 'Platform scope';

  if (user.role === 'SUPER_ADMIN') {
    return [
      { label: 'Total users', value: '2.4M', detail: 'Across tenant schools', icon: Users, tone: 'blue' },
      { label: 'API health', value: 'Normal', detail: '99.98% platform uptime', icon: ShieldCheck, tone: 'emerald' },
      { label: 'Recent onboarding', value: '18', detail: 'New tenants this month', icon: Building2, tone: 'violet' },
      { label: 'Audit alerts', value: '4', detail: 'Review privileged events', icon: FileText, tone: 'amber' },
      { label: 'Notification delivery', value: '99.2%', detail: 'SMTP queue healthy', icon: Bell, tone: 'emerald' },
    ];
  }

  if (user.role === 'TENANT_ADMIN') {
    return [
      { label: 'Organisation', value: user.tenantId, detail: 'Tenant workspace', icon: Building2, tone: 'blue' },
      { label: 'Subscription plan', value: 'Growth', detail: 'School usage tracked', icon: ReceiptText, tone: 'violet' },
      { label: 'School usage limit', value: `${schoolCount || '0'} / 15`, detail: 'Active schools in plan', icon: School, tone: 'emerald' },
      { label: 'Students / teachers', value: '12.4k / 740', detail: 'Combined tenant roster', icon: Users, tone: 'blue' },
      { label: 'Recent notices', value: '12', detail: 'Across connected schools', icon: Newspaper, tone: 'amber' },
    ];
  }

  if (user.role === 'SCHOOL_ADMIN') {
    return [
      { label: 'School', value: activeSchool, detail: 'Active operating scope', icon: School, tone: 'blue' },
      { label: 'Academic year', value: '2026-27', detail: 'Current planning cycle', icon: GraduationCap, tone: 'violet' },
      { label: 'Students / teachers', value: '1,248 / 86', detail: 'Active roster count', icon: Users, tone: 'emerald' },
      { label: 'Pending approvals', value: '18', detail: 'Parent links and imports', icon: ClipboardCheck, tone: 'amber' },
      { label: 'Homework activity', value: '42', detail: 'Submissions pending review', icon: BookOpen, tone: 'blue' },
      { label: 'Notices published', value: '7', detail: 'This week', icon: Newspaper, tone: 'emerald' },
    ];
  }

  if (user.role === 'TEACHER') {
    return [
      { label: "Today's schedule", value: '5 classes', detail: '2 need attendance', icon: CalendarCheck, tone: 'blue' },
      { label: 'Assigned classes', value: '4', detail: 'Server-scoped by assignment', icon: GraduationCap, tone: 'emerald' },
      { label: 'Pending attendance', value: '2', detail: 'Needs marking today', icon: ClipboardCheck, tone: 'amber' },
      { label: 'Homework review', value: '38', detail: 'Submissions pending', icon: BookOpen, tone: 'amber' },
      { label: 'Upcoming exams', value: '2', detail: 'Marks workflow ready', icon: ClipboardCheck, tone: 'violet' },
      { label: 'Recent notices', value: '6', detail: 'Class updates unread', icon: Newspaper, tone: 'blue' },
    ];
  }

  if (user.role === 'FINANCE_STAFF') {
    return [
      { label: "Today's collection", value: '$18.4k', detail: '24 payments recorded', icon: CircleDollarSign, tone: 'emerald' },
      { label: 'Pending dues', value: '42', detail: 'Needs follow-up', icon: ReceiptText, tone: 'amber' },
      { label: 'Recent payments', value: '24', detail: 'Online and counter payments', icon: CircleDollarSign, tone: 'emerald' },
      { label: 'Receipt count', value: '312', detail: 'This month', icon: FileText, tone: 'blue' },
      { label: 'Failed payments', value: '3', detail: 'Review manually', icon: Bell, tone: 'rose' },
      { label: 'Monthly collection', value: '$312k', detail: 'Collection graph below', icon: LineChart, tone: 'violet' },
    ];
  }

  if (user.role === 'PARENT') {
    return [
      { label: 'Child selector', value: '1 child', detail: 'Linked by school access', icon: Users, tone: 'blue' },
      { label: 'Attendance', value: '96%', detail: 'Current month', icon: CalendarCheck, tone: 'emerald' },
      { label: 'Homework pending', value: '3', detail: 'Due within 48 hours', icon: BookOpen, tone: 'amber' },
      { label: 'Fee due', value: '1 reminder', detail: 'Due this week', icon: CircleDollarSign, tone: 'amber' },
      { label: 'Notices / exams', value: '4 / 2', detail: 'Recent notices and upcoming exams', icon: Newspaper, tone: 'blue' },
      { label: 'Leave status', value: 'Open', detail: 'Request workflow ready', icon: ClipboardCheck, tone: 'violet' },
    ];
  }

  if (user.role === 'STUDENT') {
    return [
      { label: 'Class / section', value: 'Grade 8 / A', detail: 'Student portal scope', icon: GraduationCap, tone: 'blue' },
      { label: 'Attendance', value: '93%', detail: 'Above target', icon: CalendarCheck, tone: 'emerald' },
      { label: 'Homework due', value: '4', detail: '2 due today', icon: BookOpen, tone: 'amber' },
      { label: 'Upcoming exams', value: '3', detail: 'Next 14 days', icon: ClipboardCheck, tone: 'violet' },
      { label: 'Recent results', value: 'A-', detail: 'Latest published marks', icon: LineChart, tone: 'blue' },
      { label: 'Notices', value: '5', detail: 'School updates', icon: Newspaper, tone: 'amber' },
      { label: 'AI study insights', value: 'Ready', detail: 'Placeholder enabled', icon: BrainCircuit, tone: 'emerald' },
    ];
  }

  return [
    { label: 'Assigned school', value: activeSchool, detail: 'Operational context', icon: School, tone: 'blue' },
    { label: 'Open tasks', value: '14', detail: 'Staff operations queue', icon: ClipboardCheck, tone: 'amber' },
    { label: 'Recent notices', value: '6', detail: '2 unread', icon: Newspaper, tone: 'violet' },
    { label: 'Session scope', value: 'Active', detail: 'Role-safe workspace', icon: ShieldCheck, tone: 'emerald' },
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

function aiInsightTitle(role: UserRole) {
  if (role === 'SUPER_ADMIN') return 'Platform growth signals';
  if (role === 'TENANT_ADMIN') return 'Cross-school risk signals';
  if (role === 'SCHOOL_ADMIN') return 'School performance signals';
  if (role === 'FINANCE_STAFF') return 'Collection and payment signals';
  if (role === 'STUDENT') return 'Learning recommendations';
  if (role === 'PARENT') return 'Child support recommendations';
  return 'Classroom recommendations';
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
