package com.cloudcampus.operations.bulk;

import java.util.Map;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BulkJobCreateRequest(
        @NotBlank @Size(max = 80) String jobType,
        @Min(0) Integer totalRecords,
        @Size(max = 500) String inputFileReference,
        Map<String, Object> metadata
) {
}
