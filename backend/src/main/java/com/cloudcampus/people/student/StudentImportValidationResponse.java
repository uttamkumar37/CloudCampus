package com.cloudcampus.people.student;

import java.util.List;

public record StudentImportValidationResponse(
        boolean valid,
        int rowCount,
        List<StudentImportError> errors
) {
}
