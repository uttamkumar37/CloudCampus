package com.cloudcampus.experience.dto.request;

import java.util.Map;

public record ContentBlockUpdateRequest(
        Map<String, Object> content,
        String locale
) {}
