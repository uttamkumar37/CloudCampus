package com.cloudcampus.experience.dto.request;

import java.util.Map;
import java.util.UUID;

public record WebsiteSeoUpsertRequest(
        UUID pageId,
        String routePath,
        String metaTitle,
        String metaDescription,
        Map<String, Object> openGraphJson,
        Map<String, Object> twitterJson,
        Map<String, Object> structuredDataJson,
        String robots,
        double sitemapPriority,
        String sitemapChangeFreq
) {
}
