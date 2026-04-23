package com.campuscloud.teacher.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TeacherCreateRequest(
        @NotBlank(message = "employeeNo is required")
        @Size(max = 50, message = "employeeNo must be at most 50 characters")
        String employeeNo,

        @NotBlank(message = "firstName is required")
        @Size(max = 80, message = "firstName must be at most 80 characters")
        String firstName,

        @NotBlank(message = "lastName is required")
        @Size(max = 80, message = "lastName must be at most 80 characters")
        String lastName,

        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 160, message = "email must be at most 160 characters")
        String email,

        @Size(max = 30, message = "phone must be at most 30 characters")
        String phone,

        @NotNull(message = "hireDate is required")
        @PastOrPresent(message = "hireDate must be in the past or present")
        LocalDate hireDate
) {
}
