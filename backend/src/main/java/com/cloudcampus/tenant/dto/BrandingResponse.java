package com.cloudcampus.tenant.dto;

/**
 * Public branding payload returned by GET /v1/public/branding (CC-0206).
 * No auth required — consumed by portal pages before login context is established.
 */
public record BrandingResponse(
        String logoUrl,
        String faviconUrl,
        String primaryColor,
        String secondaryColor
) {}
