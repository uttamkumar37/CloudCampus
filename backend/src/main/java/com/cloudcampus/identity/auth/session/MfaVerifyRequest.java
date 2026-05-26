package com.cloudcampus.identity.auth.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MfaVerifyRequest(
        @NotBlank String challengeId,
        @NotBlank @Pattern(regexp = "\\d{6}", message = "must be a 6 digit code") String code
) {
}
