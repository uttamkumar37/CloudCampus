package com.cloudcampus.user.dto;

import com.cloudcampus.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank(message = "fullName is required")
        @Size(max = 120, message = "fullName must be at most 120 characters")
        String fullName,

        @Size(max = 100, message = "username must be at most 100 characters")
        String username,

        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 160, message = "email must be at most 160 characters")
        String email,

        @Size(min = 8, max = 64, message = "password must be between 8 and 64 characters")
        String password,

        @NotNull(message = "role is required")
        UserRole role
) {
}
