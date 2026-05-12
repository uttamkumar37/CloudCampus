import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse, PageResponse } from '@/shared/types/api';
import type {
  NotificationLogResponse,
  PushNotificationRequest,
  SendEmailRequest,
} from '../types/notification';

const base = '/v1/school-admin';

// ── Log history ───────────────────────────────────────────────────────────────

export async function listNotificationLogs(
  schoolId: string,
  page = 0,
  size = 20,
): Promise<PageResponse<NotificationLogResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<PageResponse<NotificationLogResponse>>>(
    `${base}/schools/${schoolId}/notification-logs`,
    { params: { page, size } },
  );
  return data.data ?? { items: [], offset: 0, limit: size, total: 0 };
}

// ── Send email ────────────────────────────────────────────────────────────────

export async function sendEmail(schoolId: string, body: SendEmailRequest): Promise<void> {
  await axiosInstance.post<ApiResponse<null>>(
    `${base}/schools/${schoolId}/notifications/send-email`,
    body,
  );
}

// ── Send push ─────────────────────────────────────────────────────────────────

export async function sendPush(schoolId: string, body: PushNotificationRequest): Promise<void> {
  await axiosInstance.post<ApiResponse<null>>(
    `${base}/schools/${schoolId}/notifications/send-push`,
    body,
  );
}
