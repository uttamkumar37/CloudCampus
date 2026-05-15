package com.cloudcampus.assignment.controller;

import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import com.cloudcampus.assignment.entity.AssignmentSubmission;
import com.cloudcampus.assignment.entity.SubmissionStatus;
import com.cloudcampus.assignment.repository.AssignmentRepository;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.MDC;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Student self-service assignment endpoints (CC-0703).
 *
 * GET  /v1/student/assignments         — published assignments for student's class
 * POST /v1/student/assignments/{id}/submit — submit text response
 *
 * Security: STUDENT role only.
 */
@RestController
@RequestMapping("/v1/student/assignments")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Assignments", description = "Student assignment view and submission")
public class StudentAssignmentController {

    public record AssignmentView(
            UUID             assignmentId,
            String           title,
            String           description,
            LocalDate        dueDate,
            BigDecimal       maxMarks,
            AssignmentStatus assignmentStatus,
            boolean          submitted,
            SubmissionStatus submissionStatus,
            BigDecimal       marksObtained,
            String           feedback,
            Instant          submittedAt
    ) {}

    public record SubmitRequest(
            @NotBlank @Size(max = 5000) String textResponse
    ) {}

    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;
    private final StudentRepository    studentRepo;
    private final SchoolRepository     schoolRepo;

    public StudentAssignmentController(
            AssignmentRepository assignmentRepo,
            SubmissionRepository submissionRepo,
            StudentRepository    studentRepo,
            SchoolRepository     schoolRepo) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
        this.studentRepo    = studentRepo;
        this.schoolRepo     = schoolRepo;
    }

    @Operation(summary = "My assignments", description = "Published assignments for the student's class/section")
    @GetMapping
    public ApiResponse<List<AssignmentView>> myAssignments() {
        Student student = resolveStudent();
        if (student.getClassId() == null) {
            return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), List.of());
        }

        List<Assignment> assignments = assignmentRepo.findFiltered(
                student.getSchoolId(), null,
                student.getClassId(), student.getSectionId(),
                AssignmentStatus.PUBLISHED,
                PageRequest.of(0, 50)
        ).getContent();

        List<UUID> ids = assignments.stream().map(Assignment::getId).toList();
        Map<UUID, AssignmentSubmission> submissionByAssignment = ids.isEmpty() ? Map.of()
                : submissionRepo.findByAssignmentIdInAndStudentId(ids, student.getId()).stream()
                        .collect(Collectors.toMap(AssignmentSubmission::getAssignmentId, s -> s));

        List<AssignmentView> views = assignments.stream().map(a -> {
            AssignmentSubmission sub = submissionByAssignment.get(a.getId());
            return new AssignmentView(
                    a.getId(), a.getTitle(), a.getDescription(), a.getDueDate(), a.getMaxMarks(),
                    a.getStatus(),
                    sub != null,
                    sub != null ? sub.getStatus() : null,
                    sub != null ? sub.getMarksObtained() : null,
                    sub != null ? sub.getFeedback() : null,
                    sub != null ? sub.getSubmittedAt() : null
            );
        }).toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), views);
    }

    @Operation(summary = "Submit assignment response")
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<ApiResponse<AssignmentView>> submit(
            @PathVariable UUID assignmentId,
            @RequestBody SubmitRequest req) {

        Student student = resolveStudent();

        Assignment a = assignmentRepo.findBySchoolIdAndId(student.getSchoolId(), assignmentId)
                .orElseThrow(() -> new NotFoundException("Assignment not found"));

        if (a.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment is not open for submission");
        }
        if (submissionRepo.findByAssignmentIdAndStudentId(assignmentId, student.getId()).isPresent()) {
            throw new ConflictException("Already submitted for this assignment");
        }

        UUID tenantId  = UUID.fromString(RequestContext.getTenantId());
        boolean isLate = a.getDueDate() != null && a.getDueDate().isBefore(LocalDate.now());
        AssignmentSubmission sub = AssignmentSubmission.create(tenantId, student.getSchoolId(), assignmentId, student.getId());
        sub.submit(req.textResponse(), isLate);
        submissionRepo.save(sub);

        AssignmentView view = new AssignmentView(
                a.getId(), a.getTitle(), a.getDescription(), a.getDueDate(), a.getMaxMarks(),
                a.getStatus(), true, sub.getStatus(), null, null, sub.getSubmittedAt());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), view));
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
