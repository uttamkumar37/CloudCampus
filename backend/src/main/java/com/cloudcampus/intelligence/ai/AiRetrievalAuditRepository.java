package com.cloudcampus.intelligence.ai;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AiRetrievalAuditRepository extends JpaRepository<AiRetrievalAudit, String> {

    List<AiRetrievalAudit> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
