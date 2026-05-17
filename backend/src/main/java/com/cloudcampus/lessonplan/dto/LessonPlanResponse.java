package com.cloudcampus.lessonplan.dto;

import com.cloudcampus.lessonplan.entity.LessonPlan;
import com.cloudcampus.lessonplan.entity.LessonPlanStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LessonPlanResponse(
        UUID             id,
        UUID             staffId,
        UUID             classId,
        UUID             sectionId,
        UUID             subjectId,
        LocalDate        planDate,
        Integer          periodNumber,
        String           topic,
        String           objectives,
        String           activities,
        String           materials,
        String           homeworkNote,
        LessonPlanStatus status,
        Instant          createdAt,
        Instant          updatedAt
) {
    public static LessonPlanResponse from(LessonPlan lp) {
        return new LessonPlanResponse(
                lp.getId(), lp.getStaffId(), lp.getClassId(), lp.getSectionId(),
                lp.getSubjectId(), lp.getPlanDate(), lp.getPeriodNumber(),
                lp.getTopic(), lp.getObjectives(), lp.getActivities(),
                lp.getMaterials(), lp.getHomeworkNote(), lp.getStatus(),
                lp.getCreatedAt(), lp.getUpdatedAt()
        );
    }
}
