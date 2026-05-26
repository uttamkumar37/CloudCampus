package com.cloudcampus.academic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassLevelRequest(
        @NotBlank
        String academicYearId,

        @NotBlank
        @Size(max = 120)
        String name,

        @Min(0)
        int displayOrder
) {
}
