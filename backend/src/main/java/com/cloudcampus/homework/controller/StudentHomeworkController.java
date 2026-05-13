package com.cloudcampus.homework.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.dto.HomeworkSubmissionResponse;
import com.cloudcampus.homework.dto.HomeworkSubmitRequest;
import com.cloudcampus.homework.entity.HomeworkSubmission;
import com.cloudcampus.homework.entity.HomeworkStatus;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Student self-service homework endpoints (CC-0701).
 *
 * GET  /v1/student/homework           — published homework for the student's class/section
 * POST /v1/student/homework/{id}/submit — submit a response for a homework
 *
 * Security: STUDENT role only.
 */
@RestController
@RequestMapping("/v1/student/homework")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Homework", description = "Student homework view and submission")
public class StudentHomeworkController {

    private final HomeworkRepository           homeworkRepo;
    private final HomeworkSubmissionRepository submissionRepo;
    private final StudentRepository            studentRepo;
    private final SchoolRepository             schoolRepo;

    public StudentHomeworkController(
            HomeworkRepository           homeworkRepo,
            HomeworkSubmissionRepository submissionRepo,
            StudentRepository            studentRepo,
            SchoolRepository             schoolRepo) {
        this.homeworkRepo   = homeworkRepo;
        this.submissionRepo = submissionRepo;
        this.studentRepo    = studentRepo;
        this.schoolRepo     = schoolRepo;
    }

    @Operation(summary = "List my homework", description = "Published assignments for the student's class/section")
    @GetMapping
    public ApiResponse<List<HomeworkResponse>> myHomework() {
        Student student = resolveStudent();
        if (student.getClassId() == null) {
            return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), List.of());
        }
        List<HomeworkResponse> list = homeworkRepo
                .findPublishedForClass(student.getSchoolId(), student.getClassId(), student.getSectionId())
                .stream()
                .map(HomeworkResponse::from)
                .toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), list);
    }

    @Operation(summary = "Submit homework")
    @PostMapping("/{homeworkId}/submit")
    public ResponseEntity<ApiResponse<HomeworkSubmissionResponse>> submit(
            @PathVariable UUID homeworkId,
            @Valid @RequestBody HomeworkSubmitRequest req) {

        Student student = resolveStudent();

        var hw = homeworkRepo.findBySchoolIdAndId(student.getSchoolId(), homeworkId)
                .orElseThrow(() -> new NotFoundException("Homework not found"));

        if (hw.getStatus() != HomeworkStatus.PUBLISHED) {
            throw new NotFoundException("Homework is not open for submission");
        }
        if (submissionRepo.existsByHomeworkIdAndStudentId(homeworkId, student.getId())) {
            throw new ConflictException("Already submitted for this homework");
        }

        UUID tenantId  = UUID.fromString(RequestContext.getTenantId());
        HomeworkSubmission sub = HomeworkSubmission.create(tenantId, homeworkId, student.getId(), req.notes());
        submissionRepo.save(sub);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), HomeworkSubmissionResponse.from(sub)));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Student resolveStudent() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID userId   = RequestContext.getUserId();
        School school = schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
        return studentRepo.findBySchoolIdAndUserId(school.getId(), userId)
                .orElseThrow(() -> new NotFoundException("Student profile not found for this account"));
    }
}
