package com.cloudcampus.operations.website;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WebsitePageRequest(
        @NotBlank @Size(max = 120) @Pattern(regexp = "^[a-z0-9][a-z0-9-]{0,119}$") String slug,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 8000) String body
) {
}
