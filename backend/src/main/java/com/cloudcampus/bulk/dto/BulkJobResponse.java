package com.cloudcampus.bulk.dto;

public record BulkJobResponse(
        String jobId,
        String operation,
        String startedAt,
        String status,
        int successCount,
        int failedCount
) {
}
