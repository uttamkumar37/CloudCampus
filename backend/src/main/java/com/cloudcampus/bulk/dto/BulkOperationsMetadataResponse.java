package com.cloudcampus.bulk.dto;

import java.util.List;

public record BulkOperationsMetadataResponse(
        List<BulkOperationDefinitionResponse> operations
) {
}
