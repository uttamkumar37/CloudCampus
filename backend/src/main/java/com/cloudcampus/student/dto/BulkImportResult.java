package com.cloudcampus.student.dto;

import java.util.List;

public record BulkImportResult(
        int          totalRows,
        int          successCount,
        int          failedCount,
        List<RowError> errors
) {}
