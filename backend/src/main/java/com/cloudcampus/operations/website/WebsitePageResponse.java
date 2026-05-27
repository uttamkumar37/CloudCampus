package com.cloudcampus.operations.website;

import java.time.Instant;

public record WebsitePageResponse(
        String id,
        String tenantId,
        String schoolId,
        String slug,
        String title,
        String body,
        WebsitePageStatus status,
        Instant createdAt,
        Instant publishedAt
) {
}
