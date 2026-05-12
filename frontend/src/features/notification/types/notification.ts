/** Mirrors com.cloudcampus.notification.entity.NotificationChannel */
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

/** Mirrors com.cloudcampus.notification.entity.NotificationStatus */
export type NotificationStatus = 'QUEUED' | 'SENT' | 'FAILED';

/** Mirrors com.cloudcampus.notification.entity.NotificationTemplateCode */
export type NotificationTemplateCode =
  | 'WELCOME_STUDENT'
  | 'FEE_RECEIPT'
  | 'FEE_REMINDER'
  | 'ATTENDANCE_ALERT'
  | 'GENERIC';

/** Mirrors com.cloudcampus.notification.dto.NotificationLogResponse */
export interface NotificationLogResponse {
  id: string;
  tenantId: string;
  schoolId: string;
  channel: NotificationChannel;
  templateCode: NotificationTemplateCode | null;
  recipient: string;
  subject: string | null;
  status: NotificationStatus;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

/** Request body for POST /notifications/send-email */
export interface SendEmailRequest {
  to: string;
  templateCode: NotificationTemplateCode;
  variables?: Record<string, string>;
}

/** Request body for POST /notifications/send-push */
export interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}
