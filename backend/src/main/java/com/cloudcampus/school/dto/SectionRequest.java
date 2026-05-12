package com.cloudcampus.school.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SectionRequest(

        @NotNull(message = "classId is required")
        UUID classId,

        @NotBlank(message = "name is required")
        String name,

        @Min(1) @Max(200)
        short capacity
) {}
