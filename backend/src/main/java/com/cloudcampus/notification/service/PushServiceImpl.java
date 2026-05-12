package com.cloudcampus.notification.service;

import com.cloudcampus.notification.entity.DeviceToken;
import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.entity.NotificationLog;
import com.cloudcampus.notification.repository.DeviceTokenRepository;
import com.cloudcampus.notification.repository.NotificationLogRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Firebase-backed push notification dispatcher (CC-1003 / E13).
 *
 * Strategy:
 *  1. Look up all {@code DeviceToken} rows for the target user.
 *  2. For each token, build a Firebase {@link Message} and call
 *     {@link FirebaseMessaging#send(Message)}.
 *  3. Persist a {@code NotificationLog} row (PUSH channel) recording the outcome.
 *  4. Auto-remove tokens that Firebase reports as invalid or unregistered.
 *
 * Firebase is optional: if the {@code FirebaseMessaging} bean is absent
 * (i.e. {@code app.firebase.enabled=false}), every attempt is logged as
 * FAILED with a descriptive message. This keeps dev/test starts clean.
 *
 * Thread model: both methods run on the {@code notificationExecutor} pool.
 * Each {@code NotificationLog} save uses {@code REQUIRES_NEW} so the log row
 * commits even if the caller's transaction rolls back.
 */
@Service
public class PushServiceImpl implements PushService {

    private static final Logger log = LoggerFactory.getLogger(PushServiceImpl.class);

    private static final String NOT_CONFIGURED_MSG =
            "Firebase not configured — set app.firebase.enabled=true and provide credentials-path";

    private final DeviceTokenRepository    deviceTokenRepository;
    private final NotificationLogRepository notificationLogRepository;

    /**
     * Optional: present only when {@code app.firebase.enabled=true}.
     * Spring injects {@code Optional.empty()} when the bean does not exist,
     * so the service degrades gracefully in dev / test.
     */
    private final Optional<FirebaseMessaging> firebaseMessaging;

    public PushServiceImpl(DeviceTokenRepository deviceTokenRepository,
                           NotificationLogRepository notificationLogRepository,
                           Optional<FirebaseMessaging> firebaseMessaging) {
        this.deviceTokenRepository    = deviceTokenRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.firebaseMessaging        = firebaseMessaging;
    }

    // ── PushService ──────────────────────────────────────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendPushToUserAsync(UUID tenantId, UUID schoolId, UUID userId,
                                    String title, String body, Map<String, String> data) {
        List<DeviceToken> tokens = deviceTokenRepository.findAllByUserId(userId);
        if (tokens.isEmpty()) {
            log.debug("sendPushToUser: no device tokens for userId={}", userId);
            return;
        }
        for (DeviceToken token : tokens) {
            dispatchToToken(tenantId, schoolId, token, title, body, data);
        }
    }

    @Override
    @Async("notificationExecutor")
    public void sendPushToUsersAsync(UUID tenantId, UUID schoolId, List<UUID> userIds,
                                     String title, String body, Map<String, String> data) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        List<DeviceToken> tokens = deviceTokenRepository.findAllByUserIdIn(userIds);
        if (tokens.isEmpty()) {
            log.debug("sendPushToUsers: no device tokens for {} users", userIds.size());
            return;
        }
        for (DeviceToken token : tokens) {
            dispatchToToken(tenantId, schoolId, token, title, body, data);
        }
    }

    // ── Internal dispatch ────────────────────────────────────────────────────

    /**
     * Dispatches a single push message and persists the outcome log.
     *
     * Each save runs in its own transaction ({@code REQUIRES_NEW}) so log rows
     * are always committed, even if the surrounding async thread has no transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void dispatchToToken(UUID tenantId, UUID schoolId, DeviceToken token,
                         String title, String body, Map<String, String> data) {

        // recipient = userId (push_token must not be exposed in audit logs)
        NotificationLog entry = NotificationLog.create(
                tenantId,
                schoolId,
                NotificationChannel.PUSH,
                null,                          // no template code — push is ad-hoc
                token.getUserId().toString(),  // user identifier (not the raw device token)
                title);                        // subject field holds the notification title

        if (firebaseMessaging.isEmpty()) {
            entry.markFailed(NOT_CONFIGURED_MSG);
            notificationLogRepository.save(entry);
            log.warn("Push skipped (Firebase not configured) — userId={}", token.getUserId());
            return;
        }

        try {
            Message.Builder builder = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setToken(token.getPushToken());

            if (data != null && !data.isEmpty()) {
                builder.putAllData(data);
            }

            String messageId = firebaseMessaging.get().send(builder.build());
            entry.markSent();
            log.debug("Push sent: messageId={} userId={} platform={}",
                    messageId, token.getUserId(), token.getPlatform());

        } catch (FirebaseMessagingException ex) {
            MessagingErrorCode errorCode = ex.getMessagingErrorCode();
            String errorDesc = (errorCode != null ? errorCode.name() : "UNKNOWN")
                    + " — " + ex.getMessage();
            entry.markFailed("Firebase error: " + errorDesc);

            // Automatically prune tokens the platform no longer recognises
            if (errorCode == MessagingErrorCode.UNREGISTERED
                    || errorCode == MessagingErrorCode.INVALID_ARGUMENT) {
                deviceTokenRepository.deleteById(token.getId());
                log.info("Pruned stale push token — userId={} platform={}",
                        token.getUserId(), token.getPlatform());
            } else {
                log.warn("Push failed — userId={} platform={} error={}",
                        token.getUserId(), token.getPlatform(), errorDesc);
            }
        }

        notificationLogRepository.save(entry);
    }
}
