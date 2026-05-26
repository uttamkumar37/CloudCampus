package com.cloudcampus.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank
        @Size(max = 40)
        String code,

        @NotBlank
        @Size(max = 120)
        String name
) {
}
