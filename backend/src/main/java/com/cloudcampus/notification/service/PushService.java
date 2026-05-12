package com.cloudcampus.notification.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Push notification dispatcher (CC-1003 / E13).
 *
 * Sends FCM / APNs push notifications to user devices registered in
 * {@code device_tokens}. All operations are fire-and-forget: they run on
 * the {@code notificationExecutor} thread pool and never block the caller.
 *
 * Each dispatch attempt is persisted as a {@code NotificationLog} row with
 * channel={@code PUSH}, so school admins can audit delivery outcomes.
 *
 * Firebase Admin SDK is optional: if {@code app.firebase.enabled=false}
 * (the default in dev), each attempt is logged as FAILED with a descriptive
 * message instead of throwing.
 */
public interface PushService {

    /**
     * Sends a push notification to all registered devices belonging to the user.
     *
     * Fan-out is one-message-per-device-token. Invalid tokens reported by FCM
     * are automatically removed from {@code device_tokens}.
     *
     * @param tenantId  tenant UUID (for log scoping and tenant isolation)
     * @param schoolId  school UUID (for log scoping and reporting)
     * @param userId    target user — all their registered device tokens are used
     * @param title     notification title (mandatory)
     * @param body      notification body text (mandatory)
     * @param data      optional key/value payload for deep-linking / client logic;
     *                  values must be strings per FCM data message spec
     */
    void sendPushToUserAsync(UUID tenantId, UUID schoolId, UUID userId,
                             String title, String body, Map<String, String> data);

    /**
     * Sends a push notification to all devices belonging to a list of users.
     *
     * Convenience method for bulk dispatch (e.g. class-wide attendance alert).
     * Internally calls {@link #sendPushToUserAsync} per user.
     *
     * @param userIds   list of target user UUIDs; empty list is a no-op
     */
    void sendPushToUsersAsync(UUID tenantId, UUID schoolId, List<UUID> userIds,
                              String title, String body, Map<String, String> data);
}
