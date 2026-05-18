package com.cloudcampus.experience.listener;

import com.cloudcampus.experience.config.ExperienceQueueConfig;
import com.cloudcampus.experience.entity.ExperienceEvent;
import com.cloudcampus.experience.repository.ExperienceEventRepository;
import com.cloudcampus.experience.service.ExperienceEventPublisher.EnrichedEvent;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

/**
 * Consumes enriched experience events from RabbitMQ and persists them to PostgreSQL.
 * Manual acknowledgement ensures no events are lost under DB failures.
 */
@Component
public class ExperienceEventListener {

    private static final Logger log = LoggerFactory.getLogger(ExperienceEventListener.class);

    private final ExperienceEventRepository repo;

    public ExperienceEventListener(ExperienceEventRepository repo) {
        this.repo = repo;
    }

    @RabbitListener(queues = ExperienceQueueConfig.QUEUE_EVENTS)
    @Transactional
    public void onEvent(EnrichedEvent enriched,
                        Channel channel,
                        @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            var p = enriched.payload();
            ExperienceEvent event = ExperienceEvent.of(
                    p.sessionId(), p.visitorId(), null,
                    p.eventType(), p.data(), p.pagePath(),
                    p.utmSource(), p.utmMedium(), p.utmCampaign(),
                    p.deviceType(), enriched.countryCode(), enriched.ipHash()
            );
            repo.save(event);
            channel.basicAck(deliveryTag, false);
        } catch (Exception ex) {
            log.error("Failed to persist experience event: {}", ex.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
