package com.cloudcampus.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DomainRequest(
        @NotBlank
        @Pattern(regexp = "^[a-zA-Z0-9][a-zA-Z0-9\\-\\.]{1,253}[a-zA-Z0-9]$",
                 message = "Must be a valid domain name (e.g. erp.myschool.edu)")
        String domain
) {}
