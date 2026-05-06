package com.cloudcampus.bulk.dto;

import java.util.List;

public record BulkOperationDefinitionResponse(
        String id,
        String title,
        String description,
        List<String> acceptedFileTypes,
        List<String> requiredColumns
) {
}
