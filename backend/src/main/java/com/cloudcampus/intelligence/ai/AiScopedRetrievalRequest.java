package com.cloudcampus.intelligence.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiScopedRetrievalRequest(
        @NotBlank @Size(max = 2000) String query,
        String schoolId,
        String studentId,
        Integer limit
) {
}
