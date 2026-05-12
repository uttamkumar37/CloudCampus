import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import type { UserRole } from '@/features/auth/types/auth';

interface ProtectedRouteProps {
  /** If provided, only these roles may access the route. */
  roles?: UserRole[];
  /**
   * If provided, the tenant must have this feature enabled.
   * SUPER_ADMIN is always exempt from feature checks (no tenant).
   */
  feature?: string;
  children: React.ReactNode;
}

/**
 * Route guard (EUP-044).
 *
 * Guard order:
 *   1. Not authenticated → redirect /login
 *   2. Wrong role        → redirect /403
 *   3. Feature disabled  → redirect /plan-upgrade
 *   4. Pass              → render children
 *
 * SUPER_ADMIN is always exempt from feature checks because they
 * have no tenant and therefore no feature flags.
 */
export function ProtectedRoute({ roles, feature, children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const hasFeature = useFeatureFlag(feature ?? '');

  // 1. Must be authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // 3. Feature check — SUPER_ADMIN bypasses (no tenant features)
  if (feature && user.role !== 'SUPER_ADMIN' && !hasFeature) {
    return <Navigate to="/plan-upgrade" replace />;
  }

  return <>{children}</>;
}
