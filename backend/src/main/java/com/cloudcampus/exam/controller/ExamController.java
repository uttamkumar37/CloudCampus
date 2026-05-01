package com.cloudcampus.exam.controller;

import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.security.OwnershipChecker;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamResultCreateRequest;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam", description = "Exam APIs")
public class ExamController {

    private final ExamService examService;
    private final OwnershipChecker ownershipChecker;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "Create exam", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(@Valid @RequestBody ExamCreateRequest request) {
        ExamResponse response = examService.createExam(request);
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", response));
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get exams by class", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExamsByClass(@PathVariable UUID classId) {
        List<ExamResponse> response = examService.getExamsByClass(classId);
        return ResponseEntity.ok(ApiResponse.success("Exams fetched successfully", response));
    }

    @PostMapping("/results")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "Create exam result", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<ExamResultResponse>> createExamResult(@Valid @RequestBody ExamResultCreateRequest request) {
        ExamResultResponse response = examService.createExamResult(request);
        return ResponseEntity.ok(ApiResponse.success("Exam result created successfully", response));
    }

    @GetMapping("/{examId}/results")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    @Operation(summary = "Get exam results by exam id", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> getExamResults(
            @PathVariable UUID examId,
            @AuthenticationPrincipal CloudCampusUserDetails caller
    ) {
        Set<UUID> allowed = ownershipChecker.resolveAllowedStudentIds(caller).orElse(null);
        List<ExamResultResponse> response = examService.getExamResults(examId, allowed);
        return ResponseEntity.ok(ApiResponse.success("Exam results fetched successfully", response));
    }
}

