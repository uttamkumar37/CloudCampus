import { AcademicAssignmentsPage } from '../features/academic/pages/AcademicAssignmentsPage';
import { AcademicSetupPage } from '../features/academic/pages/AcademicSetupPage';
import { InvitationAcceptPage } from '../features/auth/pages/InvitationAcceptPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { FeeLifecyclePage } from '../features/finance/pages/FeeLifecyclePage';
import { BulkJobsPage } from '../features/operations/pages/BulkJobsPage';
import { SchoolAdminParentLinkPage } from '../features/parent/pages/SchoolAdminParentLinkPage';
import { StaffProvisioningPage } from '../features/staff/pages/StaffProvisioningPage';
import { StudentImportPage } from '../features/student/pages/StudentImportPage';
import { TenantOnboardingPage } from '../features/super-admin/pages/TenantOnboardingPage';

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

export function App() {
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
        <TenantOnboardingPage />
        <InvitationAcceptPage />
        <LoginPage />
        <SchoolAdminParentLinkPage />
        <StaffProvisioningPage />
        <AcademicSetupPage />
        <AcademicAssignmentsPage />
        <StudentImportPage />
        <BulkJobsPage />
        <FeeLifecyclePage />
      </div>
    </main>
  );
}
