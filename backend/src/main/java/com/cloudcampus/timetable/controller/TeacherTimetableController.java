package com.cloudcampus.timetable.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
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
 * Teacher self-service timetable view (CC-0601).
 *
 * GET /v1/teacher/timetable?academicYearId={uuid}
 *   — Returns all slots assigned to the authenticated teacher.
 *   — academicYearId is optional; defaults to the school's current academic year.
 *
 * Security: TEACHER role only.
 */
@RestController
@RequestMapping("/v1/teacher/timetable")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Timetable", description = "Teacher's personal timetable view")
public class TeacherTimetableController {

    private final TimetableService timetableService;
    private final SchoolRepository schoolRepository;
    private final StaffRepository staffRepository;
    private final AcademicYearRepository academicYearRepository;

    public TeacherTimetableController(
            TimetableService timetableService,
            SchoolRepository schoolRepository,
            StaffRepository staffRepository,
            AcademicYearRepository academicYearRepository) {
        this.timetableService      = timetableService;
        this.schoolRepository      = schoolRepository;
        this.staffRepository       = staffRepository;
        this.academicYearRepository = academicYearRepository;
    }

    @Operation(summary = "Get my timetable", description = "Returns all slots for the logged-in teacher")
    @GetMapping
    public ApiResponse<List<TimetableSlotResponse>> myTimetable(
            @RequestParam(required = false) UUID academicYearId) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID userId   = RequestContext.getUserId();

        School school = schoolRepository.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));

        Staff staff = staffRepository.findBySchoolIdAndUserId(school.getId(), userId)
                .orElseThrow(() -> new NotFoundException("Staff profile not found for this account"));

        UUID resolvedYearId = resolveAcademicYear(school.getId(), academicYearId);

        List<TimetableSlotResponse> slots =
                timetableService.listSlotsByStaff(school.getId(), resolvedYearId, staff.getId());

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), slots);
    }

    private UUID resolveAcademicYear(UUID schoolId, UUID requested) {
        if (requested != null) return requested;
        // Fall back to the school's current academic year.
        return academicYearRepository.findBySchoolIdAndIsCurrent(schoolId, true)
                .map(AcademicYear::getId)
                .orElseThrow(() -> new NotFoundException(
                        "No current academic year set — please provide academicYearId"));
    }
}
