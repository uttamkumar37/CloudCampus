package com.cloudcampus.notification.entity;

/**
 * Identifies the content template used for a notification dispatch.
 *
 * Each code maps to a pre-built HTML/text body in {@code TemplateRenderer}.
 * New templates should be added here first, then implemented in the renderer.
 *
 * CC-1002 (E12 baseline):
 *   WELCOME_STUDENT  — sent on student admission confirmation.
 *   FEE_RECEIPT      — sent after a fee payment is recorded.
 *   FEE_REMINDER     — scheduled reminder for an upcoming due fee.
 *   ATTENDANCE_ALERT — sent to parent when student is marked absent.
 *   GENERIC          — ad-hoc message with caller-supplied subject + body.
 */
public enum NotificationTemplateCode {
    WELCOME_STUDENT,
    FEE_RECEIPT,
    FEE_REMINDER,
    ATTENDANCE_ALERT,
    GENERIC
}
