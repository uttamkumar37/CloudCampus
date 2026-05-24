package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsiteSectionCreateRequest(
        @NotBlank @Size(max = 120) String sectionKey,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 80) String sectionType,
        @Min(0) int position,
        Map<String, Object> configJson
) {
}
