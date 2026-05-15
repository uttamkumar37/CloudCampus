package com.cloudcampus.notification.queue;

import com.cloudcampus.notification.entity.NotificationTemplateCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Publishes notification events to the RabbitMQ topic exchange (CC-1504).
 *
 * This is the durable alternative to calling {@code NotificationService}
 * directly. Messages survive app restarts; failures route to the dead-letter
 * queue for manual inspection rather than being silently dropped.
 *
 * Fails open: if RabbitMQ is unreachable the publish exception is logged but
 * not re-thrown, matching the fire-and-forget contract of the existing
 * {@code @Async} notification path.
 */
@Service
public class NotificationQueuePublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationQueuePublisher.class);

    @Nullable
    private final RabbitTemplate rabbitTemplate;

    NotificationQueuePublisher(@Autowired(required = false) RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishEmail(UUID tenantId, UUID schoolId, String to,
                             NotificationTemplateCode template,
                             Map<String, String> variables) {
        publish(NotificationMessage.email(tenantId, schoolId, to, template, variables),
                NotificationQueueConfig.KEY_EMAIL);
    }

    public void publishSms(UUID tenantId, UUID schoolId, String phone,
                           NotificationTemplateCode template,
                           Map<String, String> variables) {
        publish(NotificationMessage.sms(tenantId, schoolId, phone, template, variables),
                NotificationQueueConfig.KEY_SMS);
    }

    private void publish(NotificationMessage message, String routingKey) {
        if (rabbitTemplate == null) {
            log.debug("RabbitMQ not available; notification dropped (no-op): channel={} recipient={}",
                    message.channel(), message.recipient());
            return;
        }
        try {
            rabbitTemplate.convertAndSend(NotificationQueueConfig.EXCHANGE, routingKey, message);
            log.debug("Notification queued: id={} channel={} recipient={}",
                    message.messageId(), message.channel(), message.recipient());
        } catch (AmqpException ex) {
            log.warn("Failed to publish notification to queue (failing open): " +
                     "id={} channel={} recipient={} error={}",
                    message.messageId(), message.channel(), message.recipient(), ex.getMessage());
        }
    }
}
