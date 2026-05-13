package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
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
 * Student self-service fee records (E38).
 *
 * GET /v1/student/fees — fee records for the authenticated student.
 */
@RestController
@RequestMapping("/v1/student/fees")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Fees", description = "Student fee record self-service")
public class StudentFeesController {

    private final SchoolRepository  schoolRepo;
    private final StudentRepository studentRepo;
    private final FeeService        feeService;

    public StudentFeesController(
            SchoolRepository  schoolRepo,
            StudentRepository studentRepo,
            FeeService        feeService) {
        this.schoolRepo  = schoolRepo;
        this.studentRepo = studentRepo;
        this.feeService  = feeService;
    }

    @Operation(summary = "My fee records",
               description = "Returns all fee records for the authenticated student. " +
                             "Optionally filtered by academic year.")
    @GetMapping
    public ApiResponse<List<StudentFeeRecordResponse>> myFees(
            @RequestParam(required = false) UUID academicYearId) {

        School  school  = resolveSchool();
        Student student = resolveStudent(school.getId());

        List<StudentFeeRecordResponse> fees =
                feeService.listRecordsByStudent(student.getId(), academicYearId);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), fees);
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private Student resolveStudent(UUID schoolId) {
        UUID userId = RequestContext.getUserId();
        return studentRepo.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new NotFoundException("Student profile not found"));
    }
}
