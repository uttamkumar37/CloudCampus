import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type WhatsAppStatus = 'QUEUED' | 'SENT' | 'FAILED';

export interface WhatsAppMessageLogResponse {
  id: string;
  schoolId: string;
  recipient: string;
  templateName: string;
  languageCode: string;
  status: WhatsAppStatus;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface SendWhatsAppRequest {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

const base = '/v1/school-admin';

export async function sendWhatsApp(
  schoolId: string,
  body: SendWhatsAppRequest,
): Promise<void> {
  await axiosInstance.post<ApiResponse<null>>(
    `${base}/schools/${schoolId}/whatsapp/send`,
    body,
  );
}

export async function listWhatsAppLogs(
  schoolId: string,
  page = 0,
  size = 20,
): Promise<PageResponse<WhatsAppMessageLogResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<WhatsAppMessageLogResponse>>>(
    `${base}/schools/${schoolId}/whatsapp/logs`,
    { params: { page, size } },
  );
  return data.data ?? { items: [], offset: 0, limit: size, total: 0 };
}
