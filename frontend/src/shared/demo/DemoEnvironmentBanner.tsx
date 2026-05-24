import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isDemoTenant } from './demoTenant';

export function DemoEnvironmentBanner() {
  const tenantId = useAuthStore((state) => state.user?.tenantId);

  if (!isDemoTenant(tenantId)) {
    return null;
  }

  return (
    <div
      data-testid="demo-environment-banner"
      className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <span className="font-semibold">Demo-only tenant.</span>{' '}
      Sample data resets nightly at 02:00. Do not enter real student, parent, or payment data.
    </div>
  );
}
