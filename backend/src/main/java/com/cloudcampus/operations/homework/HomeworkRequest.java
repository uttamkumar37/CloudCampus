package com.cloudcampus.operations.homework;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HomeworkRequest(
        @NotBlank String classLevelId,
        String sectionId,
        @NotBlank String subjectId,
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 2000) String instructions,
        @NotNull LocalDate dueDate
) {
}
