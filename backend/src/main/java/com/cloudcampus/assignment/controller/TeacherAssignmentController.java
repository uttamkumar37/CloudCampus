package com.cloudcampus.assignment.controller;

import com.cloudcampus.assignment.dto.GradeSubmissionRequest;
import com.cloudcampus.assignment.dto.AssignmentCreateRequest;
import com.cloudcampus.assignment.dto.AssignmentResponse;
import com.cloudcampus.assignment.dto.SubmissionResponse;
import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import com.cloudcampus.assignment.repository.AssignmentRepository;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.assignment.service.AssignmentService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SectionRepository;
import com.cloudcampus.school.repository.SubjectRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.staff.service.StaffAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cloudcampus.assignment.entity.SubmissionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Teacher assignment portal (CC-0703).
 *
 * GET   /v1/teacher/assignments                                             — list teacher's assignments
 * GET   /v1/teacher/assignments/{assignmentId}/submissions                  — list submissions
 * PATCH /v1/teacher/assignments/{assignmentId}/submissions/{subId}/grade    — grade a submission
 *
 * Security: TEACHER role only.
 */
@RestController
@RequestMapping("/v1/teacher/assignments")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Assignments", description = "Teacher assignment list and grading portal")
public class TeacherAssignmentController {

    public record AssignmentSummary(
            UUID             assignmentId,
            String           title,
            String           description,
            LocalDate        dueDate,
            BigDecimal       maxMarks,
            AssignmentStatus status,
            UUID             classId,
            UUID             sectionId,
            UUID             subjectId,
            long             submissionCount,
            long             gradedCount
    ) {}

    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;
    private final SchoolRepository     schoolRepo;
    private final AssignmentService    assignmentService;
    private final AcademicYearRepository academicYearRepo;
    private final ClassRoomRepository  classRoomRepo;
    private final SectionRepository    sectionRepo;
    private final SubjectRepository    subjectRepo;
    private final StaffRepository      staffRepo;
    private final StaffAssignmentService staffAssignmentService;

    public TeacherAssignmentController(
            AssignmentRepository assignmentRepo,
            SubmissionRepository submissionRepo,
            SchoolRepository     schoolRepo,
            AssignmentService    assignmentService,
            AcademicYearRepository academicYearRepo,
            ClassRoomRepository  classRoomRepo,
            SectionRepository    sectionRepo,
            SubjectRepository    subjectRepo,
            StaffRepository      staffRepo,
            StaffAssignmentService staffAssignmentService) {
        this.assignmentRepo    = assignmentRepo;
        this.submissionRepo    = submissionRepo;
        this.schoolRepo        = schoolRepo;
        this.assignmentService = assignmentService;
        this.academicYearRepo  = academicYearRepo;
        this.classRoomRepo     = classRoomRepo;
        this.sectionRepo       = sectionRepo;
        this.subjectRepo       = subjectRepo;
        this.staffRepo         = staffRepo;
        this.staffAssignmentService = staffAssignmentService;
    }

    @Operation(summary = "Create an assignment as the authenticated teacher")
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> create(
            @Valid @RequestBody AssignmentCreateRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        School school = resolveSchool();
        Staff teacher = resolveTeacherStaff(school.getId());
        validateScope(tenantId, school.getId(), request);
        staffAssignmentService.assertAssignedToAcademicWork(
                school.getId(), teacher.getId(), request.academicYearId(),
                request.classId(), request.sectionId(), request.subjectId());

        AssignmentResponse created = assignmentService.create(
                tenantId, school.getId(), teacher.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), created));
    }

    @Operation(summary = "List my assignments",
               description = "Returns all assignments created by the authenticated teacher, newest first.")
    @GetMapping
    public ApiResponse<PageResponse<AssignmentSummary>> myAssignments(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        School school = resolveSchool();
        Staff teacher = resolveTeacherStaff(school.getId());

        Page<Assignment> result = assignmentRepo
                .findBySchoolIdAndAssignedByOrderByCreatedAtDesc(
                        school.getId(), teacher.getId(), PageRequest.of(page, size));

        List<UUID> ids = result.getContent().stream().map(Assignment::getId).toList();
        Map<UUID, Long> submissionCounts = ids.isEmpty() ? Map.of()
                : submissionRepo.countGroupedByAssignment(ids).stream()
                        .collect(Collectors.toMap(r -> (UUID) r[0], r -> ((Number) r[1]).longValue()));
        Map<UUID, Long> gradedCounts = ids.isEmpty() ? Map.of()
                : submissionRepo.countByStatusGroupedByAssignment(ids, SubmissionStatus.GRADED).stream()
                        .collect(Collectors.toMap(r -> (UUID) r[0], r -> ((Number) r[1]).longValue()));

        List<AssignmentSummary> items = result.getContent().stream()
                .map(a -> new AssignmentSummary(
                        a.getId(), a.getTitle(), a.getDescription(), a.getDueDate(),
                        a.getMaxMarks(), a.getStatus(),
                        a.getClassId(), a.getSectionId(), a.getSubjectId(),
                        submissionCounts.getOrDefault(a.getId(), 0L),
                        gradedCounts.getOrDefault(a.getId(), 0L)))
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new PageResponse<>(items, page * size, size, result.getTotalElements()));
    }

    @Operation(summary = "List submissions for an assignment")
    @GetMapping("/{assignmentId}/submissions")
    public ApiResponse<List<SubmissionResponse>> listSubmissions(
            @PathVariable UUID assignmentId) {

        requireOwnership(assignmentId);
        List<SubmissionResponse> list = submissionRepo.findByAssignmentId(assignmentId)
                .stream().map(SubmissionResponse::from).toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), list);
    }

    @Operation(summary = "Grade a student submission")
    @PatchMapping("/{assignmentId}/submissions/{subId}/grade")
    public ApiResponse<SubmissionResponse> grade(
            @PathVariable UUID assignmentId,
            @PathVariable UUID subId,
            @Valid @RequestBody GradeSubmissionRequest req) {

        Assignment assignment = requireOwnership(assignmentId);

        if (assignment.getMaxMarks() != null
                && req.marksObtained().compareTo(assignment.getMaxMarks()) > 0) {
            throw new BadRequestException(
                    "Marks " + req.marksObtained() + " exceed max marks " + assignment.getMaxMarks());
        }

        var sub = submissionRepo.findByIdAndAssignmentId(subId, assignmentId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));

        UUID gradedBy = RequestContext.getUserId();
        sub.grade(req.marksObtained(), req.feedback(), gradedBy);
        submissionRepo.save(sub);

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), SubmissionResponse.from(sub));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Assignment requireOwnership(UUID assignmentId) {
        School school = resolveSchool();
        Assignment a = assignmentRepo.findBySchoolIdAndId(school.getId(), assignmentId)
                .orElseThrow(() -> new NotFoundException("Assignment not found"));
        Staff teacher = resolveTeacherStaff(school.getId());
        if (a.getAssignedBy() != null && !a.getAssignedBy().equals(teacher.getId())) {
            throw new NotFoundException("Assignment not found");
        }
        return a;
    }

    private School resolveSchool() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        String schoolId = RequestContext.getSchoolId();
        if (schoolId != null && !schoolId.isBlank()) {
            return schoolRepo.findByIdFiltered(UUID.fromString(schoolId))
                    .filter(s -> s.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new NotFoundException("School not found"));
        }
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private Staff resolveTeacherStaff(UUID schoolId) {
        return staffRepo.findBySchoolIdAndUserId(schoolId, RequestContext.getUserId())
                .orElseThrow(() -> new NotFoundException("Teacher staff profile not found"));
    }

    private void validateScope(UUID tenantId, UUID schoolId, AssignmentCreateRequest request) {
        var year = academicYearRepo.findByIdAndTenantId(request.academicYearId(), tenantId)
                .filter(y -> y.getSchoolId().equals(schoolId))
                .orElseThrow(() -> new BadRequestException("Academic year does not belong to this school"));
        var classRoom = classRoomRepo.findByIdAndTenantId(request.classId(), tenantId)
                .filter(c -> c.getSchoolId().equals(schoolId))
                .filter(c -> c.getAcademicYearId().equals(year.getId()))
                .orElseThrow(() -> new BadRequestException("Class does not belong to this academic year"));
        if (request.sectionId() != null) {
            sectionRepo.findByIdAndTenantId(request.sectionId(), tenantId)
                    .filter(s -> s.getSchoolId().equals(schoolId))
                    .filter(s -> s.getClassId().equals(classRoom.getId()))
                    .orElseThrow(() -> new BadRequestException("Section does not belong to this class"));
        }
        subjectRepo.findByIdAndTenantId(request.subjectId(), tenantId)
                .filter(s -> s.getSchoolId().equals(schoolId))
                .filter(s -> s.isActive())
                .orElseThrow(() -> new BadRequestException("Subject does not belong to this school"));
    }
}
