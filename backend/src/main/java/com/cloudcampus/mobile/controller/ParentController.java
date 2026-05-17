package com.cloudcampus.mobile.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.mobile.service.ParentPortalService;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Parent portal API (CC-1302).
 *
 * GET /v1/parent/children                            — linked children with attendance summary
 * GET /v1/parent/children/{studentId}/attendance     — attendance breakdown for one child
 * GET /v1/parent/children/{studentId}/results        — exam results for one child
 * GET /v1/parent/children/{studentId}/homework       — published homework for child's class
 * GET /v1/parent/children/{studentId}/timetable      — child's class timetable
 * GET /v1/parent/children/{studentId}/fees           — child's fee records
 *
 * Security: PARENT role only. Business logic delegated to ParentPortalService (H-22).
 */
@RestController
@RequestMapping("/v1/parent")
@PreAuthorize("hasRole('PARENT')")
@Tag(name = "Parent — Portal", description = "Parent portal for child monitoring")
public class ParentController {

    private final ParentPortalService portalService;

    public ParentController(ParentPortalService portalService) {
        this.portalService = portalService;
    }

    @Operation(summary = "My children", description = "All linked children with a quick attendance summary")
    @GetMapping("/children")
    public ApiResponse<List<ParentPortalService.ChildSummary>> children() {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), portalService.getLinkedChildren());
    }

    @Operation(summary = "Child attendance summary")
    @GetMapping("/children/{studentId}/attendance")
    public ApiResponse<ParentPortalService.AttendanceSummary> attendance(@PathVariable UUID studentId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), portalService.getChildAttendance(studentId));
    }

    @Operation(summary = "Child exam results")
    @GetMapping("/children/{studentId}/results")
    public ApiResponse<List<ExamResultResponse>> results(@PathVariable UUID studentId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), portalService.getChildResults(studentId));
    }

    @Operation(summary = "Child's class homework")
    @GetMapping("/children/{studentId}/homework")
    public ApiResponse<List<HomeworkResponse>> homework(@PathVariable UUID studentId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), portalService.getChildHomework(studentId));
    }

    @Operation(summary = "Child's class timetable")
    @GetMapping("/children/{studentId}/timetable")
    public ApiResponse<List<TimetableSlotResponse>> timetable(
            @PathVariable UUID studentId,
            @RequestParam(required = false) UUID academicYearId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                portalService.getChildTimetable(studentId, academicYearId));
    }

    @Operation(summary = "Child fee records")
    @GetMapping("/children/{studentId}/fees")
    public ApiResponse<List<StudentFeeRecordResponse>> fees(@PathVariable UUID studentId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), portalService.getChildFees(studentId));
    }
}
