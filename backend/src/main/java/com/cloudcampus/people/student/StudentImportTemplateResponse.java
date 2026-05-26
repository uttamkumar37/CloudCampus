package com.cloudcampus.people.student;

import java.util.List;

public record StudentImportTemplateResponse(
        List<String> requiredColumns,
        List<String> optionalColumns,
        StudentImportRow sampleRow
) {
}
