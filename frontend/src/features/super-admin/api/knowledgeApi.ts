import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface KnowledgeDocument {
  id:         string;
  tenantId:   string;
  title:      string;
  sourceType: string;
  charCount:  number;
  chunkCount: number;
  createdAt:  string;
}

export interface RagQueryResponse {
  answer:       string;
  sourceTitles: string[];
  chunksUsed:   number;
}

const base = (tenantId: string) => `/v1/super-admin/ai/knowledge/${tenantId}`;

export async function ingestDocument(
  tenantId: string,
  title: string,
  content: string,
): Promise<KnowledgeDocument> {
  const { data } = await axiosInstance.post<ApiResponse<KnowledgeDocument>>(
    `${base(tenantId)}/ingest`,
    { title, content },
  );
  return data.data!;
}

export async function listDocuments(tenantId: string): Promise<KnowledgeDocument[]> {
  const { data } = await axiosInstance.get<ApiResponse<KnowledgeDocument[]>>(base(tenantId));
  return data.data!;
}

export async function deleteDocument(tenantId: string, docId: string): Promise<void> {
  await axiosInstance.delete(`${base(tenantId)}/${docId}`);
}

export async function ragQuery(tenantId: string, question: string): Promise<RagQueryResponse> {
  const { data } = await axiosInstance.post<ApiResponse<RagQueryResponse>>(
    `${base(tenantId)}/query`,
    { question },
  );
  return data.data!;
}
