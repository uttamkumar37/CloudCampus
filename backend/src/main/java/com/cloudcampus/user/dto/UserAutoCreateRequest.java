package com.cloudcampus.user.dto;

import com.cloudcampus.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserAutoCreateRequest(
        @NotBlank(message = "fullName is required")
        @Size(max = 120, message = "fullName must be at most 120 characters")
        String fullName,

        @Email(message = "email must be valid")
        @Size(max = 160, message = "email must be at most 160 characters")
        String email,

        @Size(max = 30, message = "phone must be at most 30 characters")
        String phone,

        @NotNull(message = "role is required")
        UserRole role
) {
}

