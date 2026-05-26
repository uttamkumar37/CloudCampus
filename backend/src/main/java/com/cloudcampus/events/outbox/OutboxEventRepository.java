package com.cloudcampus.events.outbox;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

    List<OutboxEvent> findByTenantId(String tenantId);

    List<OutboxEvent> findByAggregateTypeAndAggregateId(String aggregateType, String aggregateId);

    List<OutboxEvent> findTop100ByStatusOrderByCreatedAtAsc(OutboxEventStatus status);

    Optional<OutboxEvent> findByEventKey(String eventKey);
}
