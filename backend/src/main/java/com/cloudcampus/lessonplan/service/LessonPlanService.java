package com.cloudcampus.lessonplan.service;

import com.cloudcampus.lessonplan.dto.LessonPlanRequest;
import com.cloudcampus.lessonplan.dto.LessonPlanResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface LessonPlanService {
    LessonPlanResponse create(UUID tenantId, UUID schoolId, UUID staffId, LessonPlanRequest req);
    LessonPlanResponse update(UUID tenantId, UUID planId, LessonPlanRequest req);
    LessonPlanResponse publish(UUID tenantId, UUID planId);
    void delete(UUID tenantId, UUID planId);
    List<LessonPlanResponse> listByStaff(UUID staffId, LocalDate from, LocalDate to);
    List<LessonPlanResponse> listBySchool(UUID schoolId, LocalDate from, LocalDate to);
}
