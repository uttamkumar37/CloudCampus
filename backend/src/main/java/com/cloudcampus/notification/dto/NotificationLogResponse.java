package com.cloudcampus.notification.dto;

import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.entity.NotificationLog;
import com.cloudcampus.notification.entity.NotificationStatus;
import com.cloudcampus.notification.entity.NotificationTemplateCode;

import java.time.Instant;
import java.util.UUID;

/**
 * API projection for a {@link NotificationLog} entry.
 *
 * {@code recipient} is exposed because school admins need to verify
 * which address received the notification. It is not masked here since
 * the endpoint is scoped to SCHOOL_ADMIN+; tighter masking can be applied
 * in a future P1 privacy pass.
 */
public record NotificationLogResponse(
        UUID                    id,
        UUID                    schoolId,
        NotificationChannel     channel,
        NotificationTemplateCode templateCode,
        String                  recipient,
        String                  subject,
        NotificationStatus      status,
        String                  errorMessage,
        Instant                 sentAt,
        Instant                 createdAt
) {
    public static NotificationLogResponse from(NotificationLog entry) {
        return new NotificationLogResponse(
                entry.getId(),
                entry.getSchoolId(),
                entry.getChannel(),
                entry.getTemplateCode(),
                entry.getRecipient(),
                entry.getSubject(),
                entry.getStatus(),
                entry.getErrorMessage(),
                entry.getSentAt(),
                entry.getCreatedAt()
        );
    }
}
