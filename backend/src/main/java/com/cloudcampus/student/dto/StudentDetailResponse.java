package com.cloudcampus.student.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StudentDetailResponse(
        StudentResponse student,
        List<ParentContact> parents,
        List<FeeItem> fees,
        List<ExamItem> exams,
        List<AttendanceItem> attendance,
        List<HomeworkItem> homework
) {
    public record ParentContact(
            UUID parentUserId,
            String parentName,
            String parentEmail,
            String parentPhone
    ) {}

    public record FeeItem(
            UUID id,
            String title,
            BigDecimal amount,
            LocalDate dueDate,
            String status
    ) {}

    public record ExamItem(
            UUID resultId,
            String examTitle,
            LocalDate examDate,
            String subject,
            BigDecimal marksObtained,
            String grade,
            boolean published
    ) {}

    public record AttendanceItem(
            LocalDate date,
            String status,
            String className,
            String sectionName,
            String remarks
    ) {}

    public record HomeworkItem(
            UUID id,
            String title,
            LocalDate dueDate,
            String className,
            String sectionName,
            Instant createdAt
    ) {}
}
