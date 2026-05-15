package com.cloudcampus.notification.queue;

import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.entity.NotificationTemplateCode;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Payload published to the RabbitMQ notification exchange (CC-1504).
 *
 * Serialised as JSON by {@code Jackson2JsonMessageConverter}.
 * All fields must be JSON-serialisable (no JPA entities, no proxies).
 *
 * {@code messageId} is set by the publisher and used for idempotency checks
 * and correlation in logs. {@code publishedAt} enables age-based alerting
 * on the dead-letter queue.
 */
public record NotificationMessage(
        UUID                    messageId,
        UUID                    tenantId,
        UUID                    schoolId,
        NotificationChannel     channel,
        NotificationTemplateCode templateCode,
        String                  recipient,      // email address, phone number, or userId string
        Map<String, String>     variables,
        Instant                 publishedAt
) {
    public static NotificationMessage email(UUID tenantId, UUID schoolId,
                                            String to, NotificationTemplateCode template,
                                            Map<String, String> variables) {
        return new NotificationMessage(UUID.randomUUID(), tenantId, schoolId,
                NotificationChannel.EMAIL, template, to, variables, Instant.now());
    }

    public static NotificationMessage sms(UUID tenantId, UUID schoolId,
                                          String phone, NotificationTemplateCode template,
                                          Map<String, String> variables) {
        return new NotificationMessage(UUID.randomUUID(), tenantId, schoolId,
                NotificationChannel.SMS, template, phone, variables, Instant.now());
    }
}
