package com.cloudcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Inbound payload for POST /v1/auth/login.
 *
 * Both fields are required. Size limits prevent trivially oversized payloads.
 * Error messages are intentionally generic — we never reveal which field is wrong
 * in the upstream response (OWASP: user enumeration prevention).
 */
public record LoginRequest(

        @NotBlank
        @Size(max = 200)
        String username,

        @NotBlank
        @Size(max = 200)
        String password
) {}
