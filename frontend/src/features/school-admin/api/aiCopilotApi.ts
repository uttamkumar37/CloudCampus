import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface CopilotQueryRequest {
  question: string;
  contextKeys?: string[];
}

export interface CopilotQueryResponse {
  answer: string;
  tokensUsed: number;
  fromCache: boolean;
}

export async function queryAiCopilot(
  req: CopilotQueryRequest,
): Promise<CopilotQueryResponse> {
  const { data } = await api.post<ApiResponse<CopilotQueryResponse>>(
    '/v1/school-admin/ai/query',
    req,
  );
  return data.data!;
}
