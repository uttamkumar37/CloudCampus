package com.cloudcampus.notification.entity;

/**
 * Notification delivery channel.
 *
 * EMAIL — SMTP via JavaMailSender (MailHog in dev, real SMTP in prod).
 * SMS   — SMS gateway (stub in E12; real provider wired in future).
 * PUSH  — FCM / APNs push dispatch via Firebase Admin SDK (E13).
 */
public enum NotificationChannel {
    EMAIL,
    SMS,
    PUSH
}
