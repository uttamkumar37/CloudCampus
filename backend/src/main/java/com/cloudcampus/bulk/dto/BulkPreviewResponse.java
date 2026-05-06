package com.cloudcampus.bulk.dto;

import java.util.List;

public record BulkPreviewResponse(
        String validationId,
        String operation,
        int newRecords,
        int updatedRecords,
        int skippedRecords,
        List<String> validationNotes
) {
}
