import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface BrandingResponse {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export async function getBrandingApi(tenantId: string): Promise<BrandingResponse> {
  const { data } = await axios.get<{ data: BrandingResponse }>(
    `${BASE_URL}/v1/public/branding`,
    { headers: { 'X-Tenant-Id': tenantId } },
  );
  return data.data;
}
