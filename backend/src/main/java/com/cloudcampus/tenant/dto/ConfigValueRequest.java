package com.cloudcampus.tenant.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConfigValueRequest(
        @NotNull
        @Size(max = 500)
        String value
) {}
