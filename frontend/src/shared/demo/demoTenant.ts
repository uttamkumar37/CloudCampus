export const DEMO_TENANT_ID = 'c0000000-0000-0000-0000-000000000001';

export function isDemoTenant(tenantId: string | null | undefined): boolean {
  return tenantId === DEMO_TENANT_ID;
}
