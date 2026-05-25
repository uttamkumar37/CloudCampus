package com.cloudcampus.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReasonRequest(
        @NotBlank(message = "reason is required")
        @Size(max = 1000, message = "reason must be at most 1000 characters")
        String reason
) {
    public String normalizedReason() {
        return reason.trim();
    }
}
