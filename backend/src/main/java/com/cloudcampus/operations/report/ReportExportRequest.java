package com.cloudcampus.operations.report;

import java.util.Map;

import jakarta.validation.constraints.NotNull;

public record ReportExportRequest(
        @NotNull ReportType reportType,
        @NotNull ReportExportFormat format,
        Map<String, Object> parameters
) {
}
