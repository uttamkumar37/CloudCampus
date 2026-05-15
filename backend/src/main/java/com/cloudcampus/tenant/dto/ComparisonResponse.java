package com.cloudcampus.tenant.dto;

import java.util.List;

public record ComparisonResponse(
        String tenantId,
        int totalSchools,
        List<SchoolComparisonRow> schools
) {}
