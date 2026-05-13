package com.cloudcampus.homework.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.dto.HomeworkSubmissionResponse;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Teacher homework submission management (CC-0701).
 *
 * GET   /v1/teacher/homework/{homeworkId}/submissions — list all submissions
 * PATCH /v1/teacher/homework/{homeworkId}/submissions/{subId}/review — mark reviewed
 *
 * Security: TEACHER role only.
 */
@RestController
@RequestMapping("/v1/teacher/homework")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Homework", description = "Teacher homework submission review")
public class TeacherHomeworkController {

    private final HomeworkRepository           homeworkRepo;
    private final HomeworkSubmissionRepository submissionRepo;
    private final SchoolRepository             schoolRepo;

    public TeacherHomeworkController(
            HomeworkRepository           homeworkRepo,
            HomeworkSubmissionRepository submissionRepo,
            SchoolRepository             schoolRepo) {
        this.homeworkRepo   = homeworkRepo;
        this.submissionRepo = submissionRepo;
        this.schoolRepo     = schoolRepo;
    }

    @Operation(summary = "List submissions for a homework assignment")
    @GetMapping("/{homeworkId}/submissions")
    public ApiResponse<List<HomeworkSubmissionResponse>> listSubmissions(
            @PathVariable UUID homeworkId) {

        School school = resolveSchool();
        homeworkRepo.findBySchoolIdAndId(school.getId(), homeworkId)
                .orElseThrow(() -> new NotFoundException("Homework not found"));

        List<HomeworkSubmissionResponse> list = submissionRepo
                .findAllByHomeworkIdOrderBySubmittedAtAsc(homeworkId)
                .stream()
                .map(HomeworkSubmissionResponse::from)
                .toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), list);
    }

    @Operation(summary = "Mark a submission as reviewed")
    @PatchMapping("/{homeworkId}/submissions/{subId}/review")
    public ApiResponse<HomeworkSubmissionResponse> review(
            @PathVariable UUID homeworkId,
            @PathVariable UUID subId) {

        School school = resolveSchool();
        homeworkRepo.findBySchoolIdAndId(school.getId(), homeworkId)
                .orElseThrow(() -> new NotFoundException("Homework not found"));

        var sub = submissionRepo.findById(subId)
                .filter(s -> s.getHomeworkId().equals(homeworkId))
                .orElseThrow(() -> new NotFoundException("Submission not found"));

        sub.markReviewed();
        submissionRepo.save(sub);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), HomeworkSubmissionResponse.from(sub));
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }
}
