package com.cloudcampus.operations.bulk;

public record BulkJobProgressRequest(
        int processedRecords,
        int successRecords,
        int failedRecords,
        String errorFileReference
) {
}
