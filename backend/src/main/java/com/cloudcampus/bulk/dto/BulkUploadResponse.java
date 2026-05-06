package com.cloudcampus.bulk.dto;

import java.util.List;

public record BulkUploadResponse(
        int totalRows,
        int successCount,
        int failedCount,
        List<BulkUploadErrorResponse> errors,
        List<BulkCredentialResponse> credentials
) {
}
