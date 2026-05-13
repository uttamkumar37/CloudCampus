package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamStatus;
import com.cloudcampus.exam.entity.ExamType;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
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
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Student self-service exam results (E38).
 *
 * GET /v1/student/results — all published exam results for the authenticated student.
 */
@RestController
@RequestMapping("/v1/student/results")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Results", description = "Student exam results and report cards")
public class StudentResultsController {

    public record StudentResultSummary(
            UUID       resultId,
            UUID       examId,
            String     examName,
            ExamType   examType,
            ExamStatus examStatus,
            BigDecimal totalMarksObtained,
            BigDecimal totalMarksPossible,
            BigDecimal percentage,
            String     grade,
            Integer    rank,
            boolean    passed,
            Instant    generatedAt
    ) {}

    private final SchoolRepository      schoolRepo;
    private final StudentRepository     studentRepo;
    private final ExamResultRepository  resultRepo;
    private final ExamRepository        examRepo;

    public StudentResultsController(
            SchoolRepository     schoolRepo,
            StudentRepository    studentRepo,
            ExamResultRepository resultRepo,
            ExamRepository       examRepo) {
        this.schoolRepo  = schoolRepo;
        this.studentRepo = studentRepo;
        this.resultRepo  = resultRepo;
        this.examRepo    = examRepo;
    }

    @Operation(summary = "My exam results",
               description = "Returns all available exam results for the authenticated student, newest first.")
    @GetMapping
    public ApiResponse<List<StudentResultSummary>> myResults() {
        School  school  = resolveSchool();
        Student student = resolveStudent(school.getId());

        List<ExamResult> results = resultRepo
                .findByStudentIdAndSchoolIdOrderByCreatedAtDesc(student.getId(), school.getId());

        // Batch-load exam metadata to avoid N+1
        Map<UUID, Exam> examMap = examRepo.findAllById(
                results.stream().map(ExamResult::getExamId).distinct().toList()
        ).stream().collect(Collectors.toMap(Exam::getId, e -> e));

        List<StudentResultSummary> summaries = results.stream()
                .map(r -> {
                    Exam exam = examMap.get(r.getExamId());
                    return new StudentResultSummary(
                            r.getId(),
                            r.getExamId(),
                            exam != null ? exam.getName()     : "Unknown",
                            exam != null ? exam.getExamType() : null,
                            exam != null ? exam.getStatus()   : null,
                            r.getTotalMarksObtained(),
                            r.getTotalMarksPossible(),
                            r.getPercentage(),
                            r.getGrade(),
                            r.getRank(),
                            r.isPassed(),
                            r.getGeneratedAt()
                    );
                })
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), summaries);
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
