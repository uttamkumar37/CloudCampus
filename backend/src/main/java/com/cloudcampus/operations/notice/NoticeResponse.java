package com.cloudcampus.operations.notice;

import java.time.Instant;

public record NoticeResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String className,
        String sectionId,
        String sectionName,
        String title,
        String body,
        NoticeAudience audience,
        NoticeStatus status,
        String createdByUserId,
        String publishedByUserId,
        Instant createdAt,
        Instant publishedAt
) {
}
