package com.cloudcampus.tenant.dto;

public record SuperAdminStatsResponse(
        long totalTenants,
        long activeTenants,
        long suspendedTenants,
        long newThisMonth
) {}
