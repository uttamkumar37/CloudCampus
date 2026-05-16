package com.cloudcampus.ai.embedding.service;

import org.springframework.ai.document.Document;

import java.util.List;
import java.util.UUID;

public interface EmbeddingService {

    /** Generates and stores an embedding for an entity. Idempotent — upserts by entity ID. */
    void index(UUID tenantId, String entityType, UUID entityId, String content);

    /** Deletes the stored embedding for an entity. */
    void delete(UUID entityId);

    /** Searches for similar documents within a tenant context. */
    List<Document> search(UUID tenantId, String query, int topK);
}
