package com.campuscloud.student.dto;

import com.campuscloud.student.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentCreateRequest(
        @NotBlank(message = "admissionNo is required")
        @Size(max = 50, message = "admissionNo must be at most 50 characters")
        String admissionNo,

        @NotBlank(message = "firstName is required")
        @Size(max = 80, message = "firstName must be at most 80 characters")
        String firstName,

        @NotBlank(message = "lastName is required")
        @Size(max = 80, message = "lastName must be at most 80 characters")
        String lastName,

        @NotNull(message = "dateOfBirth is required")
        @Past(message = "dateOfBirth must be in the past")
        LocalDate dateOfBirth,

        @NotNull(message = "gender is required")
        Gender gender,

        @Email(message = "email must be valid")
        @Size(max = 160, message = "email must be at most 160 characters")
        String email,

        @Size(max = 30, message = "phone must be at most 30 characters")
        String phone
) {
}
