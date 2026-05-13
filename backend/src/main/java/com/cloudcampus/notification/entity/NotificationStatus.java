package com.cloudcampus.notification.entity;

/**
 * Lifecycle status of a single notification dispatch attempt.
 *
 * QUEUED  — reserved but dispatch has not been attempted yet.
 * SENT    — provider accepted the message (delivery to recipient is not guaranteed).
 * FAILED  — provider rejected or threw an exception; see error_message column.
 */
public enum NotificationStatus {
    QUEUED,
    SENT,
    FAILED
}
