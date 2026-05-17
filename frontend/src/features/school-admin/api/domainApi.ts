import axiosInstance from '@/shared/api/axiosInstance';

export interface DomainResponse {
  id: string;
  tenantId: string;
  domain: string;
  verificationToken: string;
  dnsRecord: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export async function listDomainsApi(): Promise<DomainResponse[]> {
  const res = await axiosInstance.get('/school-admin/domains');
  return res.data.data;
}

export async function registerDomainApi(domain: string): Promise<DomainResponse> {
  const res = await axiosInstance.post('/school-admin/domains', { domain });
  return res.data.data;
}

export async function verifyDomainApi(domainId: string): Promise<DomainResponse> {
  const res = await axiosInstance.post(`/school-admin/domains/${domainId}/verify`);
  return res.data.data;
}

export async function deleteDomainApi(domainId: string): Promise<void> {
  await axiosInstance.delete(`/school-admin/domains/${domainId}`);
}
