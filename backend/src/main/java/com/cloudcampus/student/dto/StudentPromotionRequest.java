package com.cloudcampus.student.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Bulk-promote all ACTIVE students in a source class (optionally filtered by
 * section) to a target class/section. Used at the end of an academic year.
 */
public record StudentPromotionRequest(

        @NotNull(message = "sourceClassId is required")
        UUID sourceClassId,

        /** When null, all sections of the source class are promoted. */
        UUID sourceSectionId,

        @NotNull(message = "targetClassId is required")
        UUID targetClassId,

        /** When null, students' sectionId is cleared (unassigned). */
        UUID targetSectionId
) {}
