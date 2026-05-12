package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.ExamSubject;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ExamSubjectResponse(
        UUID id,
        UUID examId,
        UUID subjectId,
        UUID classId,
        UUID sectionId,
        LocalDate examDate,
        LocalTime startTime,
        Integer durationMinutes,
        BigDecimal totalMarks,
        BigDecimal passingMarks,
        String roomNumber,
        UUID invigilatorId
) {
    public static ExamSubjectResponse from(ExamSubject es) {
        return new ExamSubjectResponse(
                es.getId(),
                es.getExamId(),
                es.getSubjectId(),
                es.getClassId(),
                es.getSectionId(),
                es.getExamDate(),
                es.getStartTime(),
                es.getDurationMinutes(),
                es.getTotalMarks(),
                es.getPassingMarks(),
                es.getRoomNumber(),
                es.getInvigilatorId()
        );
    }
}
