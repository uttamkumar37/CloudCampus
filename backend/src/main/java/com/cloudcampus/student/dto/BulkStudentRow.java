package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * A single row in a bulk student import request (CC-0508).
 *
 * firstName and lastName are the only required fields.
 * classId / sectionId assign the student to a class on admission.
 * studentNumber is auto-generated if blank.
 */
public record BulkStudentRow(

        @NotBlank @Size(max = 100)
        String firstName,

        @NotBlank @Size(max = 100)
        String lastName,

        LocalDate admissionDate,
        LocalDate dateOfBirth,
        Gender    gender,

        @Size(max = 50)
        String studentNumber,

        UUID classId,
        UUID sectionId,

        @Size(max = 30)
        String phone
) {}
