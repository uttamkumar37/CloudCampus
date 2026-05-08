package com.cloudcampus.student.dto;

import com.cloudcampus.student.entity.StudentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(
        @Size(max = 80, message = "firstName must be at most 80 characters")
        String firstName,

        @Size(max = 80, message = "lastName must be at most 80 characters")
        String lastName,

        @Email(message = "email must be valid")
        @Size(max = 160, message = "email must be at most 160 characters")
        String email,

        @Size(max = 30, message = "phone must be at most 30 characters")
        String phone,

        StudentStatus status
) {
}
