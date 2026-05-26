package com.cloudcampus.operations.bulk;

public enum BulkJobStatus {
    QUEUED,
    VALIDATING,
    PROCESSING,
    PARTIALLY_COMPLETED,
    COMPLETED,
    FAILED,
    CANCELLED
}
