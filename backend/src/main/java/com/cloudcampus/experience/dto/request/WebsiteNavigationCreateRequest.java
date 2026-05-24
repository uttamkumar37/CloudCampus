package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WebsiteNavigationCreateRequest(
        @NotBlank @Size(max = 120) String label,
        @NotBlank @Size(max = 500) String path,
        @Size(max = 40) String target,
        @Size(max = 80) String groupName,
        @Min(0) int position,
        boolean visible
) {
}
