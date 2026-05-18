package com.cloudcampus.experience.service;

import com.cloudcampus.experience.config.ExperienceQueueConfig;
import com.cloudcampus.experience.dto.request.IngestEventsRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Publishes batches of experience analytics events to RabbitMQ.
 * The listener persists them asynchronously so the public API stays <10ms.
 */
@Service
public class ExperienceEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ExperienceEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public ExperienceEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(List<IngestEventsRequest.EventPayload> events, String countryCode, String ipHash) {
        for (IngestEventsRequest.EventPayload event : events) {
            try {
                var message = new EnrichedEvent(event, countryCode, ipHash);
                rabbitTemplate.convertAndSend(
                        ExperienceQueueConfig.EXCHANGE,
                        ExperienceQueueConfig.KEY_EVENT,
                        message
                );
            } catch (Exception ex) {
                log.error("Failed to publish experience event type={}: {}", event.eventType(), ex.getMessage());
            }
        }
    }

    public record EnrichedEvent(
            IngestEventsRequest.EventPayload payload,
            String countryCode,
            String ipHash
    ) {}
}
