package com.cloudcampus.operations.document;

import java.time.Instant;

public record SchoolDocumentResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String classLevelName,
        String studentId,
        String studentName,
        String title,
        String fileName,
        String storageKey,
        Instant createdAt
) {
}
