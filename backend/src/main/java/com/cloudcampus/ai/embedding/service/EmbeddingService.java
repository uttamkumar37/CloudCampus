package com.cloudcampus.ai.embedding.service;

import org.springframework.ai.document.Document;

import java.util.List;
import java.util.UUID;

public interface EmbeddingService {

    /** Generates and stores an embedding for an entity. Idempotent — upserts by entity ID. */
    void index(UUID tenantId, String entityType, UUID entityId, String content);

    /**
     * Like {@link #index} but also stores a {@code doc_id} metadata field that groups
     * multiple chunk embeddings under a parent document (used by the knowledge base).
     */
    void indexWithMeta(UUID tenantId, String entityType, UUID entityId, String content, String docId);

    /** Deletes the stored embedding for a single entity ID. */
    void delete(UUID entityId);

    /** Deletes all embeddings whose {@code doc_id} metadata matches the given value. */
    void deleteByDocId(String docId);

    /** Searches for similar documents within a tenant context. */
    List<Document> search(UUID tenantId, String query, int topK);
}
