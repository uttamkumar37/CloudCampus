package com.cloudcampus.staff.dto;

import com.cloudcampus.staff.entity.StaffType;
import com.cloudcampus.student.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for creating a new staff / teacher record (CC-0601).
 *
 * employeeNumber is optional — auto-generated as {@code EMP-{YEAR}-{seq}}
 * if omitted. joiningDate defaults to today when null.
 */
public record CreateStaffRequest(

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @NotNull
        StaffType staffType,

        /** Null → auto-generated. Provided for bulk imports. */
        @Size(max = 50)
        String employeeNumber,

        /** Null → defaults to today. */
        @PastOrPresent
        LocalDate joiningDate,

        UUID departmentId,

        LocalDate dateOfBirth,

        Gender gender,

        @Size(max = 30)
        String phone,

        @Email
        @Size(max = 200)
        String email,

        @Size(max = 500)
        String address,

        @Size(max = 500)
        String photoUrl,

        @Size(max = 300)
        String qualification,

        @Size(max = 300)
        String specialization
) {}
