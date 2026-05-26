package com.cloudcampus.identity.auth.invitation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptInvitationRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 12, message = "must be at least 12 characters") String password,
        String displayName
) {
}
