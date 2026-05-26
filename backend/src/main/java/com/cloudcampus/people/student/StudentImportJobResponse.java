package com.cloudcampus.people.student;

import java.time.Instant;
import java.util.List;

import com.cloudcampus.operations.bulk.BulkJobStatus;

public record StudentImportJobResponse(
        String id,
        String bulkJobId,
        String tenantId,
        String schoolId,
        BulkJobStatus status,
        int totalRecords,
        int processedRecords,
        int successRecords,
        int failedRecords,
        String errorFileReference,
        List<StudentImportError> validationErrors,
        Instant createdAt,
        Instant processedAt
) {
}
