package com.cloudcampus.reports.dto;

import java.time.Instant;
import java.util.UUID;

public record ReportExportJobResponse(
        UUID jobId,
        String type,
        String status,
        String filename,
        String contentType,
        Instant createdAt,
        Instant completedAt,
        String errorMessage,
        String downloadUrl
) {
}
