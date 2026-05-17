package com.cloudcampus.lessonplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record LessonPlanRequest(
        UUID      classId,
        UUID      sectionId,
        UUID      subjectId,
        UUID      academicYearId,
        @NotNull  LocalDate planDate,
        Integer   periodNumber,
        @NotBlank String    topic,
        String    objectives,
        String    activities,
        String    materials,
        String    homeworkNote,
        boolean   publish
) {}
