package com.cloudcampus.people.parent;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParentLinkRequest(
        @NotBlank
        String studentId,

        @NotBlank
        @Size(max = 160)
        String parentFullName,

        @NotBlank
        @Email
        @Size(max = 320)
        String parentEmail,

        @Size(max = 40)
        String parentMobile,

        @NotBlank
        @Size(max = 80)
        String relationship,

        boolean primaryContact
) {
}
