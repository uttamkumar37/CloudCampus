import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface PromptTemplate {
  id:          string;
  promptKey:   string;
  name:        string;
  description: string | null;
  template:    string;
  variables:   string | null;   // JSON array string
  version:     number;
  active:      boolean;
  createdBy:   string;
  createdAt:   string;
  updatedAt:   string;
}

export interface CreatePromptRequest {
  promptKey:   string;
  name:        string;
  description?: string;
  template:    string;
  variables?:  string;
}

export interface RenderRequest {
  variables?: Record<string, string>;
  tenantId?:  string;
}

export interface RenderResponse {
  renderedPrompt: string;
  aiResponse:     string;
}

const BASE = '/v1/super-admin/ai/prompts';

export async function listPrompts(key?: string): Promise<PromptTemplate[]> {
  const { data } = await axiosInstance.get<ApiResponse<PromptTemplate[]>>(BASE, {
    params: key ? { key } : undefined,
  });
  return data.data ?? [];
}

export async function getPrompt(id: string): Promise<PromptTemplate> {
  const { data } = await axiosInstance.get<ApiResponse<PromptTemplate>>(`${BASE}/${id}`);
  return data.data!;
}

export async function createPrompt(request: CreatePromptRequest): Promise<PromptTemplate> {
  const { data } = await axiosInstance.post<ApiResponse<PromptTemplate>>(BASE, request);
  return data.data!;
}

export async function activatePrompt(id: string): Promise<PromptTemplate> {
  const { data } = await axiosInstance.patch<ApiResponse<PromptTemplate>>(`${BASE}/${id}/activate`);
  return data.data!;
}

export async function deactivatePrompt(id: string): Promise<PromptTemplate> {
  const { data } = await axiosInstance.patch<ApiResponse<PromptTemplate>>(`${BASE}/${id}/deactivate`);
  return data.data!;
}

export async function renderPrompt(id: string, request: RenderRequest): Promise<RenderResponse> {
  const { data } = await axiosInstance.post<ApiResponse<RenderResponse>>(
    `${BASE}/${id}/render`, request,
  );
  return data.data!;
}
