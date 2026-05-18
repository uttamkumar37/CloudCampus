import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import authClient from '@/shared/api/authClient';

const BASE = '/v1/experience/public';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentBlock {
  id: string;
  blockKey: string;
  blockType: string;
  content: Record<string, unknown>;
  locale: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  slug: string;
  description: string;
  schoolProfile: Record<string, unknown>;
  features: string[];
  sessionTtlMin: number;
  displayOrder: number;
}

export interface DemoSessionResult {
  visitorToken: string;
  loginUrl: string;
  demoUsername: string;
  demoPassword: string;
  expiresAt: string;
}

export interface InvestorRoomSection {
  id: string;
  position: number;
  sectionType: string;
  content: Record<string, unknown>;
}

export interface InvestorRoom {
  id: string;
  roomCode: string;
  title: string;
  accessMode: string;
  expiresAt: string | null;
  content: Record<string, unknown>;
  branding: Record<string, unknown>;
  status: string;
  sections: InvestorRoomSection[];
}

export interface DemoStartPayload {
  scenarioSlug: string;
  email?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export interface InvestorAccessResult {
  granted: boolean;
  room?: InvestorRoom;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await authClient.get<{ data: T }>(path);
  return res.data.data;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await authClient.post<{ data: T }>(path, body);
  return res.data.data;
}

// ── React Query hooks ─────────────────────────────────────────────────────────

export function useContentBlocks(
  keys: string[],
  locale = 'en'
): UseQueryResult<Record<string, ContentBlock>> {
  return useQuery({
    queryKey: ['exp:blocks', keys, locale],
    queryFn: () =>
      get<Record<string, ContentBlock>>(
        `${BASE}/content-blocks?keys=${keys.join(',')}&locale=${locale}`
      ),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDemoScenarios(): UseQueryResult<DemoScenario[]> {
  return useQuery({
    queryKey: ['exp:demo-scenarios'],
    queryFn: () => get<DemoScenario[]>(`${BASE}/demo-scenarios`),
    staleTime: 10 * 60 * 1000,
  });
}

export function useInvestorRoom(roomCode: string): UseQueryResult<InvestorRoom> {
  return useQuery({
    queryKey: ['exp:room', roomCode],
    queryFn: () => get<InvestorRoom>(`${BASE}/investor/${roomCode}`),
    staleTime: 30 * 60 * 1000,
    enabled: !!roomCode,
  });
}

export function useStartDemo() {
  return useMutation<DemoSessionResult, Error, DemoStartPayload>({
    mutationFn: (payload) => post<DemoSessionResult>(`${BASE}/demo/start`, payload),
    retry: false,
  });
}

export function useVerifyInvestorAccess(roomCode: string) {
  return useMutation<InvestorAccessResult, Error, { password: string }>({
    mutationFn: (body) => post<InvestorAccessResult>(`${BASE}/investor/${roomCode}/access`, body),
    retry: false,
  });
}
