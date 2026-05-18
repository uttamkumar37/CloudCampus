package com.cloudcampus.experience.dto.request;

public record PresentationCreateRequest(
        String title,
        String slug,
        String audienceType
) {}
