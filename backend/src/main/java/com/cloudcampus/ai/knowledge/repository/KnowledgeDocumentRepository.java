package com.cloudcampus.ai.knowledge.repository;

import com.cloudcampus.ai.knowledge.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, UUID> {

    List<KnowledgeDocument> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    Optional<KnowledgeDocument> findByIdAndTenantId(UUID id, UUID tenantId);

    void deleteByIdAndTenantId(UUID id, UUID tenantId);
}
