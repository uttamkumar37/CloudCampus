package com.campuscloud.bulk.dto;

public record BulkUploadErrorResponse(
        String sheet,
        int row,
        String message
) {
}
