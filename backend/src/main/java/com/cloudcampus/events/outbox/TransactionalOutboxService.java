package com.cloudcampus.events.outbox;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionalOutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public TransactionalOutboxService(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OutboxEvent record(
            String tenantId,
            String schoolId,
            String aggregateType,
            String aggregateId,
            String eventType,
            Map<String, ?> payload
    ) {
        return record(tenantId, schoolId, aggregateType, aggregateId, eventType, null, payload);
    }

    @Transactional
    public OutboxEvent record(
            String tenantId,
            String schoolId,
            String aggregateType,
            String aggregateId,
            String eventType,
            String eventKey,
            Map<String, ?> payload
    ) {
        if (eventKey != null) {
            Optional<OutboxEvent> existing = outboxEventRepository.findByEventKey(eventKey);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        return outboxEventRepository.save(new OutboxEvent(
                tenantId,
                schoolId,
                aggregateType,
                aggregateId,
                eventType,
                eventKey,
                payloadJson(payload)
        ));
    }

    @Transactional
    public OutboxEvent markProcessing(String eventId, String workerId) {
        OutboxEvent event = outboxEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Outbox event was not found."));
        event.markProcessing(workerId, Instant.now());
        return event;
    }

    @Transactional
    public OutboxEvent markPublished(String eventId) {
        OutboxEvent event = outboxEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Outbox event was not found."));
        event.markPublished(Instant.now());
        return event;
    }

    @Transactional
    public OutboxEvent markFailed(String eventId, String error, Instant nextAttemptAt) {
        OutboxEvent event = outboxEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Outbox event was not found."));
        event.markFailed(error, nextAttemptAt);
        return event;
    }

    private String payloadJson(Map<String, ?> payload) {
        if (payload == null || payload.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize outbox payload.", exception);
        }
    }
}
