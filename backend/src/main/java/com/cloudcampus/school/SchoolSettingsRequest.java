package com.cloudcampus.school;

import jakarta.validation.constraints.Size;

public record SchoolSettingsRequest(
        @Size(max = 180)
        String name
) {
}
