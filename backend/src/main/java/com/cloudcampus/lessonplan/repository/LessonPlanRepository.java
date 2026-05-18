package com.cloudcampus.lessonplan.repository;

import com.cloudcampus.lessonplan.entity.LessonPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonPlanRepository extends JpaRepository<LessonPlan, UUID> {
    Optional<LessonPlan> findByIdAndTenantId(UUID id, UUID tenantId);

    List<LessonPlan> findByStaffIdAndPlanDateBetweenOrderByPlanDateAscPeriodNumberAsc(
            UUID staffId, LocalDate from, LocalDate to);
    List<LessonPlan> findBySchoolIdAndClassIdAndPlanDateOrderByPeriodNumberAsc(
            UUID schoolId, UUID classId, LocalDate date);
    List<LessonPlan> findBySchoolIdAndPlanDateBetweenOrderByPlanDateAsc(
            UUID schoolId, LocalDate from, LocalDate to);
}
