package com.cloudcampus.reports.dto;

import java.util.List;
import java.util.UUID;

public record ComparisonResponse(
        UUID                    tenantId,
        int                     totalSchools,
        List<SchoolComparisonRow> schools
) {}
