package com.cloudcampus.academic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SectionRequest(
        @NotBlank
        String classLevelId,

        @NotBlank
        @Size(max = 80)
        String name,

        @Min(1)
        Integer capacity
) {
}
