package com.cloudcampus.notification.queue;

import com.cloudcampus.notification.entity.NotificationChannel;
import com.cloudcampus.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes messages from the RabbitMQ notification queues and delegates to
 * the existing {@link NotificationService} for actual dispatch (CC-1504).
 *
 * On unhandled exception the message is nacked without requeue
 * ({@code defaultRequeueRejected=false} in {@code NotificationQueueConfig})
 * and routed to {@code cc.notifications.dead} for operator inspection.
 *
 * Concurrency: one listener thread per queue by default. Increase via
 * {@code spring.rabbitmq.listener.simple.concurrency} if throughput demands it.
 */
@Component
public class NotificationQueueConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationQueueConsumer.class);

    private final NotificationService notificationService;

    NotificationQueueConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = NotificationQueueConfig.QUEUE_EMAIL)
    public void handleEmail(NotificationMessage message) {
        log.debug("Consuming email notification: id={} recipient={}", message.messageId(), message.recipient());
        notificationService.sendEmailAsync(
                message.tenantId(), message.schoolId(),
                message.recipient(), message.templateCode(), message.variables());
    }

    @RabbitListener(queues = NotificationQueueConfig.QUEUE_SMS)
    public void handleSms(NotificationMessage message) {
        log.debug("Consuming SMS notification: id={} recipient={}", message.messageId(), message.recipient());
        if (message.channel() == NotificationChannel.SMS) {
            notificationService.sendSmsAsync(
                    message.tenantId(), message.schoolId(),
                    message.recipient(), message.templateCode(), message.variables());
        }
    }
}
