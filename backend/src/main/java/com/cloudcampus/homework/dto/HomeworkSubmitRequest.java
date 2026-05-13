package com.cloudcampus.homework.dto;

import jakarta.validation.constraints.Size;

public record HomeworkSubmitRequest(
        @Size(max = 2000) String notes
) {}
