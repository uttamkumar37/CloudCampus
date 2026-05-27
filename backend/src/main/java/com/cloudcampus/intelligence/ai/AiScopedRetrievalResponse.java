package com.cloudcampus.intelligence.ai;

import java.util.List;

public record AiScopedRetrievalResponse(
        String tenantId,
        String schoolId,
        String userId,
        String role,
        String querySha256,
        int resultCount,
        List<AiKnowledgeResultResponse> results
) {
}
