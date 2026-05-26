package com.cloudcampus.people.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StudentLoginInvitationRequest(
        @NotBlank
        @Email
        String email
) {
}
