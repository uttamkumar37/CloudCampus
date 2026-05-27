package com.cloudcampus.intelligence.ai;

public record AiKnowledgeResultResponse(
        String documentId,
        String tenantId,
        String schoolId,
        String title,
        AiFeature category,
        String snippet
) {
}
