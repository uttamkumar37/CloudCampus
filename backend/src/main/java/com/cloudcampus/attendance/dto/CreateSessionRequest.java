package com.cloudcampus.attendance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request to open (create) an attendance session.
 *
 * period_number: 0 = whole-day, 1-12 = specific class period.
 * sectionId: null for whole-class attendance (schools without section splits).
 */
public record CreateSessionRequest(

        @NotNull
        UUID classId,

        /** Null = whole-class session (no sections). */
        UUID sectionId,

        @NotNull
        UUID academicYearId,

        /** Optional — for subject-specific (period-level) attendance. */
        UUID subjectId,

        /** Staff member conducting the session; null = system / untracked. */
        UUID takenByStaffId,

        @NotNull
        @PastOrPresent
        LocalDate sessionDate,

        /** 0 = whole-day, 1-12 = period number. Defaults to 0 if not provided. */
        int periodNumber
) {
    /** Normalise: treat negative period numbers as 0 (whole-day). */
    public int periodNumber() {
        return Math.max(0, periodNumber);
    }
}
