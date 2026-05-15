import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getBrandingApi } from '@/shared/api/brandingApi';
import type { BrandingResponse } from '@/shared/api/brandingApi';

/**
 * Fetches and applies per-tenant branding (CC-0206).
 *
 * - Reads tenantId from the auth store (requires login).
 * - Applies primaryColor and secondaryColor as CSS custom properties on <html>.
 * - Returns the branding object (or null while loading / not authenticated).
 */
export function useBranding(): BrandingResponse | null {
  const tenantId = useAuthStore((s) => s.user?.tenantId ?? null);

  const { data } = useQuery({
    queryKey: ['branding', tenantId],
    queryFn: () => getBrandingApi(tenantId!),
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000,
    gcTime:    20 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    if (data.primaryColor)   root.style.setProperty('--brand-primary',   data.primaryColor);
    if (data.secondaryColor) root.style.setProperty('--brand-secondary', data.secondaryColor);
    if (data.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = data.faviconUrl;
    }
  }, [data]);

  return data ?? null;
}
