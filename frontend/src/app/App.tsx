import { AcademicAssignmentsPage } from '../features/academic/pages/AcademicAssignmentsPage';
import { AcademicSetupPage } from '../features/academic/pages/AcademicSetupPage';
import { SchoolSelector } from '../features/auth/components/SchoolSelector';
import { ProtectedPanel } from '../features/auth/components/ProtectedPanel';
import { AuthClient, AuthStateProvider, useAuthState } from '../features/auth/hooks/authState';
import { InvitationAcceptPage } from '../features/auth/pages/InvitationAcceptPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { FeeLifecyclePage } from '../features/finance/pages/FeeLifecyclePage';
import { BulkJobsPage } from '../features/operations/pages/BulkJobsPage';
import { SchoolAdminParentLinkPage } from '../features/parent/pages/SchoolAdminParentLinkPage';
import { ReportExportsPage } from '../features/reports/pages/ReportExportsPage';
import { StaffProvisioningPage } from '../features/staff/pages/StaffProvisioningPage';
import { StudentImportPage } from '../features/student/pages/StudentImportPage';
import { TenantOnboardingPage } from '../features/super-admin/pages/TenantOnboardingPage';
import { TenantReportsPage } from '../features/tenant-admin/pages/TenantReportsPage';
import { TenantSchoolCreationPage } from '../features/tenant-admin/pages/TenantSchoolCreationPage';
import { TenantSchoolManagementPage } from '../features/tenant-admin/pages/TenantSchoolManagementPage';
import { TenantSettingsPage } from '../features/tenant-admin/pages/TenantSettingsPage';

const shellReadiness = [
  {
    label: 'Backend API shell',
    status: 'Ready for compile and test validation',
  },
  {
    label: 'Web portal shell',
    status: 'Ready for Super Admin onboarding work',
  },
  {
    label: 'Mobile shell',
    status: 'Ready for role-based mobile flows',
  },
];

type AppProps = {
  authClient?: Partial<AuthClient>;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
};

export function App({ authClient, storage }: AppProps = {}) {
  return (
    <AuthStateProvider client={authClient} storage={storage}>
      <AppShell storage={storage} />
    </AuthStateProvider>
  );
}

function AppShell({ storage }: Pick<AppProps, 'storage'>) {
  const auth = useAuthState();

  return (
    <main className="app-shell" data-testid="cloudcampus-shell">
      <section className="shell-header" aria-labelledby="cloudcampus-title">
        <p className="eyebrow">CloudCampus onboarding foundation</p>
        <h1 id="cloudcampus-title">Clean single-school onboarding</h1>
        <p className="summary">
          Super Admin can create a tenant with the customer's first real school,
          invite the first School Admin, and activate that account through a secure
          set-password flow.
        </p>
      </section>

      <section className="readiness-grid" aria-label="Scaffold readiness">
        {shellReadiness.map((item) => (
          <article className="readiness-card" key={item.label}>
            <h2>{item.label}</h2>
            <p>{item.status}</p>
          </article>
        ))}
      </section>

      <div className="workflow-grid">
        <InvitationAcceptPage />
        <LoginPage onAuthenticated={auth.registerSession} storage={storage} />
        <SessionPanel />
        <SchoolSelector />
        <ProtectedPanel allowedRoles={['SUPER_ADMIN']} title="Super Admin onboarding">
          <TenantOnboardingPage />
        </ProtectedPanel>
        <ProtectedPanel allowedRoles={['TENANT_ADMIN']} title="Tenant Admin portal">
          <TenantSchoolCreationPage />
          <TenantSchoolManagementPage />
          <TenantSettingsPage />
          <TenantReportsPage />
        </ProtectedPanel>
        <ProtectedPanel allowedRoles={['SCHOOL_ADMIN']} requireActiveSchool title="School Admin scaffold">
          <SchoolAdminParentLinkPage />
          <StaffProvisioningPage />
          <AcademicSetupPage />
          <AcademicAssignmentsPage />
          <StudentImportPage />
          <BulkJobsPage />
          <FeeLifecyclePage />
          <ReportExportsPage />
        </ProtectedPanel>
      </div>
    </main>
  );
}

function SessionPanel() {
  const { currentUser, error, logout, status } = useAuthState();

  if (status !== 'authenticated' || !currentUser) {
    return null;
  }

  return (
    <section className="workflow-panel auth-panel" aria-labelledby="session-title">
      <p className="eyebrow">Session</p>
      <h2 id="session-title">Current user</h2>
      <div className="form-result">
        <strong>{currentUser.role}</strong>
        <span>{currentUser.email}</span>
        <span>Active school: {currentUser.activeSchool?.name ?? 'none'}</span>
      </div>
      <form className="workflow-form" onSubmit={(event) => {
        event.preventDefault();
        void logout();
      }}>
        <button type="submit">Log out</button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
