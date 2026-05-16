package com.cloudcampus.ai.prompt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePromptRequest(

        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9][a-z0-9._-]{1,98}[a-z0-9]$",
                 message = "Key must be lowercase alphanumeric with dots, underscores, or hyphens")
        String promptKey,

        @NotBlank @Size(max = 200)
        String name,

        String description,

        @NotBlank
        String template,

        String variables   // JSON array string, e.g. ["studentName","courseName"]
) {}
