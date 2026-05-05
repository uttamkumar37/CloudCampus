package com.cloudcampus.bulk.dto;

import java.util.List;
import java.util.Map;

public record BulkValidationResponse(
        String validationId,
        String operation,
        List<String> columns,
        Map<String, String> autoMapping,
        int errorCount,
        int warningCount,
        int readyCount,
        List<BulkValidationRowResponse> rows
) {
}
