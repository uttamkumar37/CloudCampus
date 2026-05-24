package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record ContentBlockUpdateRequest(
        Map<String, Object> content,
        @Size(max = 16) String locale
) {}
