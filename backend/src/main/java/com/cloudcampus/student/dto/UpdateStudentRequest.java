package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for updating an existing student profile (CC-0503).
 *
 * studentNumber update is intentionally omitted — number changes require
 * administrative workflow (future CC-0507). class/section re-assignment
 * is included here for convenience (e.g. class promotion within a year).
 */
public record UpdateStudentRequest(

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @PastOrPresent
        LocalDate dateOfBirth,

        Gender gender,

        @Size(max = 10)
        String bloodGroup,

        @Size(max = 30)
        String phone,

        @Size(max = 500)
        String address,

        @Size(max = 500)
        String photoUrl,

        /** Re-assign to a different class (e.g. failed year → repeat). */
        UUID classId,

        /** Re-assign to a different section. */
        UUID sectionId
) {}
