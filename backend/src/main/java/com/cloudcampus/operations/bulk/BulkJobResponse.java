package com.cloudcampus.operations.bulk;

import java.time.Instant;

public record BulkJobResponse(
        String id,
        String tenantId,
        String schoolId,
        String jobType,
        String requestedByUserId,
        BulkJobStatus status,
        int totalRecords,
        int processedRecords,
        int successRecords,
        int failedRecords,
        String inputFileReference,
        String errorFileReference,
        String lastError,
        Instant requestedAt,
        Instant startedAt,
        Instant completedAt,
        Instant cancelledAt,
        Instant updatedAt
) {
}
