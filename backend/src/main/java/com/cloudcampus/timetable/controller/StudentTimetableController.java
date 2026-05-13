package com.cloudcampus.timetable.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import com.cloudcampus.timetable.service.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Student self-service timetable (CC-0601).
 *
 * GET /v1/student/timetable?academicYearId=   — student's class/section timetable
 *
 * Security: STUDENT role only.
 */
@RestController
@RequestMapping("/v1/student/timetable")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Timetable", description = "Student class timetable view")
public class StudentTimetableController {

    private final TimetableService       timetableService;
    private final StudentRepository      studentRepo;
    private final SchoolRepository       schoolRepo;
    private final AcademicYearRepository academicYearRepo;

    public StudentTimetableController(
            TimetableService       timetableService,
            StudentRepository      studentRepo,
            SchoolRepository       schoolRepo,
            AcademicYearRepository academicYearRepo) {
        this.timetableService = timetableService;
        this.studentRepo      = studentRepo;
        this.schoolRepo       = schoolRepo;
        this.academicYearRepo = academicYearRepo;
    }

    @Operation(summary = "My class timetable", description = "Returns all timetable slots for the student's class/section")
    @GetMapping
    public ApiResponse<List<TimetableSlotResponse>> myTimetable(
            @RequestParam(required = false) UUID academicYearId) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID userId   = RequestContext.getUserId();

        School school = schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));

        Student student = studentRepo.findBySchoolIdAndUserId(school.getId(), userId)
                .orElseThrow(() -> new NotFoundException("Student profile not found for this account"));

        if (student.getClassId() == null) {
            return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), List.of());
        }

        UUID resolvedYearId = resolveAcademicYear(school.getId(), academicYearId);

        List<TimetableSlotResponse> slots = timetableService.listSlots(
                school.getId(), resolvedYearId, student.getClassId(), student.getSectionId());

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), slots);
    }

    private UUID resolveAcademicYear(UUID schoolId, UUID requested) {
        if (requested != null) return requested;
        return academicYearRepo.findBySchoolIdAndIsCurrent(schoolId, true)
                .map(AcademicYear::getId)
                .orElseThrow(() -> new NotFoundException(
                        "No current academic year set — please provide academicYearId"));
    }
}
