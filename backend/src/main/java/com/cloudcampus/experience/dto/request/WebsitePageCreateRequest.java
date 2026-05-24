package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record WebsitePageCreateRequest(
        @NotBlank @Size(max = 120) String pageKey,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 180) String slug,
        Map<String, Object> seoJson,
        Map<String, Object> settingsJson
) {
}
