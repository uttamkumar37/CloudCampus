package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

public record AiKnowledgeDocumentResponse(
        String id,
        String tenantId,
        String schoolId,
        String title,
        AiFeature category,
        List<UserRole> visibleToRoles,
        AiKnowledgeDocumentStatus status,
        String createdByUserId,
        Instant createdAt
) {
}
