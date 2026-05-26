package com.cloudcampus.people.student;

import java.util.List;

public record StudentImportResponse(
        boolean imported,
        int importedCount,
        List<StudentResponse> students,
        List<StudentImportError> errors
) {
}
