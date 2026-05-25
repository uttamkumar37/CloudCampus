package com.cloudcampus.mobile.dto;

import com.cloudcampus.mobile.service.ParentPortalService;

import java.util.List;
import java.util.UUID;

/**
 * Lightweight identity snapshot for the authenticated parent portal shell.
 */
public record ParentMeResponse(
        UUID userId,
        String username,
        UUID tenantId,
        int linkedChildrenCount,
        List<ParentPortalService.ChildSummary> children
) {
}
