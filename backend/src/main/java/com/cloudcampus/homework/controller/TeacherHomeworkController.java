package com.cloudcampus.homework.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.dto.HomeworkSubmissionResponse;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.entity.HomeworkStatus;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.homework.service.HomeworkService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Teacher homework portal (CC-0701).
 *
 * GET   /v1/teacher/homework                                        — list teacher's own homework
 * GET   /v1/teacher/homework/{homeworkId}/submissions               — list all submissions
 * PATCH /v1/teacher/homework/{homeworkId}/submissions/{subId}/review — mark reviewed
 *
 * Security: TEACHER role only.
 */
@RestController
@RequestMapping("/v1/teacher/homework")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Homework", description = "Teacher homework list and submission review")
public class TeacherHomeworkController {

    public record HomeworkSummary(
            UUID          homeworkId,
            String        title,
            String        description,
            LocalDate     dueDate,
            HomeworkStatus status,
            UUID          classId,
            UUID          sectionId,
            UUID          subjectId,
            long          submissionCount
    ) {}

    private final HomeworkRepository           homeworkRepo;
    private final HomeworkSubmissionRepository submissionRepo;
    private final SchoolRepository             schoolRepo;
    private final HomeworkService              homeworkService;
    private final AcademicYearRepository       academicYearRepo;
    private final ClassRoomRepository          classRoomRepo;
    private final SectionRepository            sectionRepo;
    private final SubjectRepository            subjectRepo;
    private final StaffRepository              staffRepo;
    private final StaffAssignmentService       staffAssignmentService;

    public TeacherHomeworkController(
            HomeworkRepository           homeworkRepo,
            HomeworkSubmissionRepository submissionRepo,
            SchoolRepository             schoolRepo,
            HomeworkService              homeworkService,
            AcademicYearRepository       academicYearRepo,
            ClassRoomRepository          classRoomRepo,
            SectionRepository            sectionRepo,
            SubjectRepository            subjectRepo,
            StaffRepository              staffRepo,
            StaffAssignmentService       staffAssignmentService) {
        this.homeworkRepo      = homeworkRepo;
        this.submissionRepo    = submissionRepo;
        this.schoolRepo        = schoolRepo;
        this.homeworkService   = homeworkService;
        this.academicYearRepo  = academicYearRepo;
        this.classRoomRepo     = classRoomRepo;
        this.sectionRepo       = sectionRepo;
        this.subjectRepo       = subjectRepo;
        this.staffRepo         = staffRepo;
        this.staffAssignmentService = staffAssignmentService;
    }

    @Operation(summary = "Create homework as the authenticated teacher")
    @PostMapping
    public ResponseEntity<ApiResponse<HomeworkResponse>> create(
            @Valid @RequestBody HomeworkCreateRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        School school = resolveSchool();
        Staff teacher = resolveTeacherStaff(school.getId());
        validateScope(tenantId, school.getId(), request);
        staffAssignmentService.assertAssignedToAcademicWork(
                school.getId(), teacher.getId(), request.academicYearId(),
                request.classId(), request.sectionId(), request.subjectId());

        HomeworkResponse created = homeworkService.create(
                tenantId, school.getId(), teacher.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), created));
    }

    @Operation(summary = "List my homework assignments",
               description = "Returns all homework posted by the authenticated teacher, newest first.")
    @GetMapping
    public ApiResponse<PageResponse<HomeworkSummary>> myHomework(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        School school = resolveSchool();
        Staff teacher = resolveTeacherStaff(school.getId());

        Page<HomeworkAssignment> result = homeworkRepo
                .findBySchoolIdAndAssignedByOrderByCreatedAtDesc(
                        school.getId(), teacher.getId(), PageRequest.of(page, size));

        List<UUID> ids = result.getContent().stream().map(HomeworkAssignment::getId).toList();
        Map<UUID, Long> counts = ids.isEmpty() ? Map.of()
                : submissionRepo.countGroupedByHomework(ids).stream()
                        .collect(Collectors.toMap(r -> (UUID) r[0], r -> ((Number) r[1]).longValue()));

        List<HomeworkSummary> items = result.getContent().stream()
                .map(h -> new HomeworkSummary(
                        h.getId(),
                        h.getTitle(),
                        h.getDescription(),
                        h.getDueDate(),
                        h.getStatus(),
                        h.getClassId(),
                        h.getSectionId(),
                        h.getSubjectId(),
                        counts.getOrDefault(h.getId(), 0L)))
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                new PageResponse<>(items, page * size, size, result.getTotalElements()));
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

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        var sub = submissionRepo.findByIdAndHomeworkIdAndTenantId(subId, homeworkId, tenantId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));

        sub.markReviewed();
        submissionRepo.save(sub);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), HomeworkSubmissionResponse.from(sub));
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

    private void validateScope(UUID tenantId, UUID schoolId, HomeworkCreateRequest request) {
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
