import { useAuthStore } from '@/features/auth/store/useAuthStore';

// Stable empty array — avoids creating a new reference on every render when
// user is null, which would trigger an infinite re-render via useSyncExternalStore.
const NO_FEATURES: string[] = [];

/**
 * Returns true if the authenticated user's tenant has the given feature enabled.
 * Feature codes match the backend FeatureFlag.code column (e.g. "ATTENDANCE_QR").
 *
 * Usage:
 *   const hasQr = useFeatureFlag('ATTENDANCE_QR');
 *   if (hasQr) { ... }
 *
 * SUPER_ADMIN has no tenant, so features are always empty for them — guard
 * accordingly in ProtectedRoute (roles check takes precedence over feature check).
 */
export function useFeatureFlag(feature: string): boolean {
  const features = useAuthStore((s) => s.user?.features ?? NO_FEATURES);
  return features.includes(feature);
}
