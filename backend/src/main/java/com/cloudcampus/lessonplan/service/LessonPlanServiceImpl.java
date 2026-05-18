package com.cloudcampus.lessonplan.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.lessonplan.dto.LessonPlanRequest;
import com.cloudcampus.lessonplan.dto.LessonPlanResponse;
import com.cloudcampus.lessonplan.entity.LessonPlan;
import com.cloudcampus.lessonplan.repository.LessonPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LessonPlanServiceImpl implements LessonPlanService {

    private final LessonPlanRepository repository;

    public LessonPlanServiceImpl(LessonPlanRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public LessonPlanResponse create(UUID tenantId, UUID schoolId, UUID staffId, LessonPlanRequest req) {
        LessonPlan lp = LessonPlan.create(
                tenantId, schoolId, staffId,
                req.classId(), req.sectionId(), req.subjectId(), req.academicYearId(),
                req.planDate(), req.periodNumber(), req.topic(),
                req.objectives(), req.activities(), req.materials(), req.homeworkNote()
        );
        if (req.publish()) lp.publish();
        return LessonPlanResponse.from(repository.save(lp));
    }

    @Override
    @Transactional
    public LessonPlanResponse update(UUID tenantId, UUID planId, LessonPlanRequest req) {
        LessonPlan lp = findOwned(tenantId, planId);
        lp.update(req.topic(), req.objectives(), req.activities(),
                  req.materials(), req.homeworkNote(), req.periodNumber());
        if (req.publish()) lp.publish();
        return LessonPlanResponse.from(repository.save(lp));
    }

    @Override
    @Transactional
    public LessonPlanResponse publish(UUID tenantId, UUID planId) {
        LessonPlan lp = findOwned(tenantId, planId);
        lp.publish();
        return LessonPlanResponse.from(repository.save(lp));
    }

    @Override
    @Transactional
    public void delete(UUID tenantId, UUID planId) {
        repository.delete(findOwned(tenantId, planId));
    }

    @Override
    public List<LessonPlanResponse> listByStaff(UUID staffId, LocalDate from, LocalDate to) {
        return repository.findByStaffIdAndPlanDateBetweenOrderByPlanDateAscPeriodNumberAsc(staffId, from, to)
                .stream().map(LessonPlanResponse::from).toList();
    }

    @Override
    public List<LessonPlanResponse> listBySchool(UUID schoolId, LocalDate from, LocalDate to) {
        return repository.findBySchoolIdAndPlanDateBetweenOrderByPlanDateAsc(schoolId, from, to)
                .stream().map(LessonPlanResponse::from).toList();
    }

    private LessonPlan findOwned(UUID tenantId, UUID planId) {
        return repository.findByIdAndTenantId(planId, tenantId)
                .orElseThrow(() -> new NotFoundException("Lesson plan not found"));
    }
}
