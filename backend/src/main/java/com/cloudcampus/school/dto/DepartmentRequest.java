package com.cloudcampus.school.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(

        @NotBlank(message = "name is required")
        @Size(max = 150)
        String name,

        @Size(max = 20)
        @Pattern(regexp = "^[A-Z0-9_]*$",
                 message = "code must be uppercase letters, digits, or underscores")
        String code,

        @Size(max = 500)
        String description
) {}
