package com.cloudcampus.staff.dto;

import com.cloudcampus.student.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for updating an existing staff profile (CC-0602).
 *
 * staffType is intentionally omitted — changing an employee's type is a
 * separate administrative workflow (deferred). departmentId can change
 * (staff can move departments).
 */
public record UpdateStaffRequest(

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        UUID departmentId,

        @PastOrPresent
        LocalDate joiningDate,

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
