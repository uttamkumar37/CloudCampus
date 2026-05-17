package com.cloudcampus.notification.queue;

import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.service.NotificationService;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Consumes messages from the RabbitMQ notification queues and delegates to
 * the existing {@link NotificationService} for actual dispatch (CC-1504).
 *
 * Uses MANUAL acknowledge mode (CRIT-18). Messages are acked only after
 * successful dispatch; on failure they are nacked without requeue and routed
 * to {@code cc.notifications.dead} via x-dead-letter-exchange for operator
 * inspection and manual replay.
 */
@Component
public class NotificationQueueConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationQueueConsumer.class);

    private final NotificationService notificationService;

    NotificationQueueConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = NotificationQueueConfig.QUEUE_EMAIL)
    public void handleEmail(NotificationMessage message,
                            Channel channel,
                            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        log.debug("Consuming email notification: id={} recipient={}", message.messageId(), message.recipient());
        try {
            notificationService.sendEmailAsync(
                    message.tenantId(), message.schoolId(),
                    message.recipient(), message.templateCode(), message.variables());
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("Failed to dispatch email notification id={}: {}", message.messageId(), e.getMessage(), e);
            // requeue=false: routes to DLQ via x-dead-letter-exchange for manual replay
            channel.basicNack(deliveryTag, false, false);
        }
    }

    @RabbitListener(queues = NotificationQueueConfig.QUEUE_SMS)
    public void handleSms(NotificationMessage message,
                          Channel channel,
                          @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        log.debug("Consuming SMS notification: id={} recipient={}", message.messageId(), message.recipient());
        try {
            if (message.channel() == NotificationChannel.SMS) {
                notificationService.sendSmsAsync(
                        message.tenantId(), message.schoolId(),
                        message.recipient(), message.templateCode(), message.variables());
            }
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("Failed to dispatch SMS notification id={}: {}", message.messageId(), e.getMessage(), e);
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
