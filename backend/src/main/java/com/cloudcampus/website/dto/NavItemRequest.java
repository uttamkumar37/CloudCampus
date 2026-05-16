package com.cloudcampus.website.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record NavItemRequest(
        @NotBlank @Size(max = 100) String label,
        @Size(max = 500) String url,
        UUID pageId,
        int position,
        UUID parentId
) {}
