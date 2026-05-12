package com.cloudcampus.school.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ClassRoomRequest(

        @NotNull(message = "academicYearId is required")
        UUID academicYearId,

        @NotBlank(message = "name is required")
        String name,

        String displayName,

        @Min(0) @Max(30)
        short gradeOrder
) {}
