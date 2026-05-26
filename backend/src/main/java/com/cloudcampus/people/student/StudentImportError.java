package com.cloudcampus.people.student;

public record StudentImportError(
        int rowNumber,
        String field,
        String message
) {
}
