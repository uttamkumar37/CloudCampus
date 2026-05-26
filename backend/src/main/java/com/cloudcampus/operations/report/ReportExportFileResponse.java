package com.cloudcampus.operations.report;

public record ReportExportFileResponse(
        String fileName,
        String contentType,
        long sizeBytes,
        String checksumSha256,
        String content
) {
}
