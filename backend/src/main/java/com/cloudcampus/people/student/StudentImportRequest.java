package com.cloudcampus.people.student;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record StudentImportRequest(
        @NotEmpty
        List<@Valid StudentImportRow> rows
) {
}
