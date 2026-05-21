import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export type EntitlementPlanCode = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'AI_PREMIUM';

type UseEntitlementInput = {
  feature?: string;
  requiredPlan?: EntitlementPlanCode;
};

const PLAN_ORDER: EntitlementPlanCode[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'AI_PREMIUM'];

const FEATURE_PLAN_MAP: Record<string, EntitlementPlanCode> = {
  ATTENDANCE: 'STARTER',
  HOMEWORK: 'STARTER',
  NOTICE_BOARD: 'STARTER',
  NOTIFICATIONS: 'STARTER',
  FINANCE: 'PROFESSIONAL',
  REPORTS: 'PROFESSIONAL',
  WEBSITE_BUILDER: 'PROFESSIONAL',
  CUSTOM_DOMAIN: 'PROFESSIONAL',
  ADVANCED_ANALYTICS: 'PROFESSIONAL',
  AI_COPILOT: 'AI_PREMIUM',
  AI_WEBSITE_GENERATION: 'AI_PREMIUM',
};

const AI_FEATURES = new Set(['AI_COPILOT', 'AI_WEBSITE_GENERATION']);

export function useEntitlement(input: UseEntitlementInput = {}) {
  const user = useAuthStore((state) => state.user);
  const features = user?.features ?? [];
  const requiredPlan = input.requiredPlan ?? (input.feature ? FEATURE_PLAN_MAP[input.feature] : undefined) ?? 'FREE';

  return useMemo(() => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const currentPlan = inferPlanFromFeatures(features);
    const featureEnabled = input.feature ? features.includes(input.feature) : true;
    const planAllowed = PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(requiredPlan);
    const aiAllowed = input.feature && AI_FEATURES.has(input.feature) ? featureEnabled || planAllowed : planAllowed;
    const allowed = isSuperAdmin || featureEnabled || aiAllowed;

    return {
      allowed,
      currentPlan,
      requiredPlan,
      feature: input.feature,
      featureEnabled,
      isSuperAdmin,
      upgradeTitle: `${displayPlan(requiredPlan)} feature`,
      upgradeMessage: `Upgrade to ${displayPlan(requiredPlan)} to unlock ${featureLabel(input.feature)}`,
    };
  }, [features, input.feature, requiredPlan, user?.role]);
}

export function displayPlan(plan: EntitlementPlanCode) {
  return plan
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function inferPlanFromFeatures(features: string[]): EntitlementPlanCode {
  if (features.some((feature) => AI_FEATURES.has(feature) || feature.startsWith('AI_'))) return 'AI_PREMIUM';
  if (features.some((feature) => ['WEBSITE_BUILDER', 'REPORTS', 'FINANCE', 'CUSTOM_DOMAIN', 'ADVANCED_ANALYTICS'].includes(feature))) {
    return 'PROFESSIONAL';
  }
  if (features.some((feature) => ['ATTENDANCE', 'HOMEWORK', 'NOTICE_BOARD', 'NOTIFICATIONS'].includes(feature))) return 'STARTER';
  return 'FREE';
}

function featureLabel(feature?: string) {
  if (!feature) return 'this premium capability';
  return feature
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
