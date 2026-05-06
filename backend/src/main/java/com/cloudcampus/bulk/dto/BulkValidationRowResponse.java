package com.cloudcampus.bulk.dto;

import java.util.Map;

public record BulkValidationRowResponse(
        int rowNumber,
        Map<String, String> values,
        String status,
        String issue
) {
}
