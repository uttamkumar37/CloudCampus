package com.campuscloud.homework.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record HomeworkCreateRequest(
        @NotBlank @Size(max = 200) String title,
        String instructions,
        @NotNull UUID classId,
        UUID sectionId,
        LocalDate dueDate
) {
}
