package com.cloudcampus.operations.report;

import java.time.Instant;

import com.cloudcampus.operations.bulk.BulkJobStatus;

public record ReportExportResponse(
        String id,
        String tenantId,
        String schoolId,
        String requestedByUserId,
        String bulkJobId,
        ReportType reportType,
        ReportExportFormat format,
        BulkJobStatus status,
        String fileName,
        String contentType,
        Long sizeBytes,
        String checksumSha256,
        Instant requestedAt,
        Instant completedAt
) {
}
