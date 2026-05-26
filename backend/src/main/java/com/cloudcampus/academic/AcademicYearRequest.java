package com.cloudcampus.academic;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AcademicYearRequest(
        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate,

        boolean activate
) {
}
