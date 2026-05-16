package com.cloudcampus.website.dto;

import java.util.List;

public record PublicSiteResponse(
        String            schoolName,
        String            tenantCode,
        List<PageResponse>    pages,
        List<NavItemResponse> navItems
) {}
