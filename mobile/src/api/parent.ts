import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { ParentChild } from '../types/parent';

export async function getMyChildren(): Promise<ParentChild[]> {
  const { data } = await apiClient.get<ApiResponse<ParentChild[]>>(
    '/parents/me/children',
  );
  if (!data.success) throw new Error(data.message);
  // backend returns array or object with children array — handle both
  const payload = data.data as any;
  if (Array.isArray(payload)) return payload as ParentChild[];
  if (payload?.children) return payload.children as ParentChild[];
  return [];
}
