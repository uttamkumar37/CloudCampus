package com.campuscloud.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassCreateRequest(
        @NotBlank(message = "name is required")
        @Size(max = 80, message = "name must be at most 80 characters")
        String name,

        @NotBlank(message = "code is required")
        @Size(max = 40, message = "code must be at most 40 characters")
        String code
) {
}
