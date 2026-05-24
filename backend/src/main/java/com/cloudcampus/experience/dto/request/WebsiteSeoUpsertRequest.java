package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

public record WebsiteSeoUpsertRequest(
        UUID pageId,
        @NotBlank @Size(max = 500) String routePath,
        @NotBlank @Size(max = 180) String metaTitle,
        @NotBlank @Size(max = 320) String metaDescription,
        Map<String, Object> openGraphJson,
        Map<String, Object> twitterJson,
        Map<String, Object> structuredDataJson,
        @Size(max = 80) String robots,
        @DecimalMin("0.0") @DecimalMax("1.0") double sitemapPriority,
        @Size(max = 40) String sitemapChangeFreq
) {
}
