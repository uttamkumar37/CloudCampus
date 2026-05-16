package com.cloudcampus.ai.knowledge.dto;

import com.cloudcampus.ai.knowledge.entity.KnowledgeDocument;

import java.time.Instant;
import java.util.UUID;

public record KnowledgeDocumentResponse(
        UUID    id,
        UUID    tenantId,
        String  title,
        String  sourceType,
        int     charCount,
        int     chunkCount,
        Instant createdAt
) {
    public static KnowledgeDocumentResponse from(KnowledgeDocument d) {
        return new KnowledgeDocumentResponse(
                d.getId(), d.getTenantId(), d.getTitle(),
                d.getSourceType(), d.getCharCount(), d.getChunkCount(), d.getCreatedAt());
    }
}
