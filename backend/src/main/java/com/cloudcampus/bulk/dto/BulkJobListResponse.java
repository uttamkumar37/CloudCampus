package com.cloudcampus.bulk.dto;

import java.util.List;

public record BulkJobListResponse(
        List<BulkJobResponse> jobs
) {
}
