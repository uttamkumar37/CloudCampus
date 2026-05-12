package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for admitting a new student (CC-0501 / CC-0502).
 *
 * studentNumber is optional; if omitted the service auto-generates one
 * with the format {@code {YEAR}-{seq}} (e.g. "2025-001").
 */
public record AdmitStudentRequest(

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        /** Admission date — defaults to today when null. */
        @PastOrPresent
        LocalDate admissionDate,

        /** Null → auto-generated; provided for bulk imports. */
        @Size(max = 50)
        String studentNumber,

        /** Null → unassigned on admission (placed later). */
        UUID classId,

        /** Null → unassigned on admission (placed later). */
        UUID sectionId,

        LocalDate dateOfBirth,

        Gender gender,

        @Size(max = 10)
        String bloodGroup,

        @Size(max = 30)
        String phone,

        @Size(max = 500)
        String address,

        @Size(max = 500)
        String photoUrl
) {}
