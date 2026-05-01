package com.cloudcampus.exam.service;

import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamResultCreateRequest;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamServiceImplTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamResultRepository examResultRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ExamServiceImpl examService;

    private final UUID classId = UUID.randomUUID();
    private final UUID sectionId = UUID.randomUUID();
    private final UUID subjectId = UUID.randomUUID();
    private final UUID studentId = UUID.randomUUID();
    private final UUID examId = UUID.randomUUID();

    @BeforeEach
    void setTenantContext() {
        TenantContext.setTenant("school_a");
    }

    @AfterEach
    void clearTenantContext() {
        TenantContext.clear();
    }

    // ── createExam ────────────────────────────────────────────────────────────

    @Test
    void createExam_success() {
        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        when(schoolClassRepository.existsById(classId)).thenReturn(true);
        when(sectionRepository.existsById(sectionId)).thenReturn(true);
        when(subjectRepository.existsById(subjectId)).thenReturn(true);
        when(examRepository.existsByTitleAndExamDateAndClassIdAndSectionIdAndSubjectId(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId))
                .thenReturn(false);

        Exam saved = buildExam(examId, "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));
        when(examRepository.save(any(Exam.class))).thenReturn(saved);

        ExamResponse response = examService.createExam(request);

        assertThat(response.title()).isEqualTo("Midterm");
        assertThat(response.maxMarks()).isEqualByComparingTo("100.00");
        assertThat(response.classId()).isEqualTo(classId);
    }

    @Test
    void createExam_throwsWhenClassNotFound() {
        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        when(schoolClassRepository.existsById(classId)).thenReturn(false);

        assertThatThrownBy(() -> examService.createExam(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Class not found");
    }

    @Test
    void createExam_throwsWhenSectionNotFound() {
        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        when(schoolClassRepository.existsById(classId)).thenReturn(true);
        when(sectionRepository.existsById(sectionId)).thenReturn(false);

        assertThatThrownBy(() -> examService.createExam(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Section not found");
    }

    @Test
    void createExam_throwsWhenSubjectNotFound() {
        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        when(schoolClassRepository.existsById(classId)).thenReturn(true);
        when(sectionRepository.existsById(sectionId)).thenReturn(true);
        when(subjectRepository.existsById(subjectId)).thenReturn(false);

        assertThatThrownBy(() -> examService.createExam(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Subject not found");
    }

    @Test
    void createExam_throwsOnDuplicateSchedule() {
        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        when(schoolClassRepository.existsById(classId)).thenReturn(true);
        when(sectionRepository.existsById(sectionId)).thenReturn(true);
        when(subjectRepository.existsById(subjectId)).thenReturn(true);
        when(examRepository.existsByTitleAndExamDateAndClassIdAndSectionIdAndSubjectId(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId))
                .thenReturn(true);

        assertThatThrownBy(() -> examService.createExam(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Exam already scheduled");
    }

    @Test
    void createExam_throwsWhenNoTenantContext() {
        TenantContext.setTenant(TenantContext.DEFAULT_SCHEMA);

        ExamCreateRequest request = new ExamCreateRequest(
                "Midterm", LocalDate.of(2026, 6, 1), classId, sectionId, subjectId,
                new BigDecimal("100.00"));

        assertThatThrownBy(() -> examService.createExam(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("X-Tenant-Slug header is required");
    }

    // ── getExamsByClass ───────────────────────────────────────────────────────

    @Test
    void getExamsByClass_returnsExamsForClass() {
        when(schoolClassRepository.existsById(classId)).thenReturn(true);

        Exam e1 = buildExam(UUID.randomUUID(), "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));
        Exam e2 = buildExam(UUID.randomUUID(), "Final", LocalDate.of(2026, 11, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));
        when(examRepository.findAllByClassId(classId)).thenReturn(List.of(e1, e2));

        List<ExamResponse> result = examService.getExamsByClass(classId);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ExamResponse::title).containsExactly("Midterm", "Final");
    }

    @Test
    void getExamsByClass_throwsWhenClassNotFound() {
        when(schoolClassRepository.existsById(classId)).thenReturn(false);

        assertThatThrownBy(() -> examService.getExamsByClass(classId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Class not found");
    }

    // ── createExamResult ──────────────────────────────────────────────────────

    @Test
    void createExamResult_success() {
        Exam exam = buildExam(examId, "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));

        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(examResultRepository.existsByExamIdAndStudentId(examId, studentId)).thenReturn(false);

        ExamResultCreateRequest request = new ExamResultCreateRequest(
                examId, studentId, new BigDecimal("85.00"), "A", "Good performance", true);

        ExamResult saved = buildResult(UUID.randomUUID(), examId, studentId, new BigDecimal("85.00"), "A");
        when(examResultRepository.save(any(ExamResult.class))).thenReturn(saved);

        var response = examService.createExamResult(request);

        assertThat(response.marksObtained()).isEqualByComparingTo("85.00");
        assertThat(response.grade()).isEqualTo("A");
    }

    @Test
    void createExamResult_throwsWhenMarksExceedMaxMarks() {
        Exam exam = buildExam(examId, "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));

        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(examResultRepository.existsByExamIdAndStudentId(examId, studentId)).thenReturn(false);

        ExamResultCreateRequest request = new ExamResultCreateRequest(
                examId, studentId, new BigDecimal("105.00"), null, null, true);

        assertThatThrownBy(() -> examService.createExamResult(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("marksObtained cannot exceed maxMarks");
    }

    @Test
    void createExamResult_throwsWhenDuplicateResult() {
        Exam exam = buildExam(examId, "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));

        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(examResultRepository.existsByExamIdAndStudentId(examId, studentId)).thenReturn(true);

        ExamResultCreateRequest request = new ExamResultCreateRequest(
                examId, studentId, new BigDecimal("75.00"), null, null, true);

        assertThatThrownBy(() -> examService.createExamResult(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Result already recorded");
    }

    @Test
    void createExamResult_throwsWhenExamNotFound() {
        when(examRepository.findById(examId)).thenReturn(Optional.empty());

        ExamResultCreateRequest request = new ExamResultCreateRequest(
                examId, studentId, new BigDecimal("75.00"), null, null, true);

        assertThatThrownBy(() -> examService.createExamResult(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Exam not found");
    }

    @Test
    void createExamResult_throwsWhenStudentNotFound() {
        Exam exam = buildExam(examId, "Midterm", LocalDate.of(2026, 6, 1),
                classId, sectionId, subjectId, new BigDecimal("100.00"));

        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(studentRepository.existsById(studentId)).thenReturn(false);

        ExamResultCreateRequest request = new ExamResultCreateRequest(
                examId, studentId, new BigDecimal("75.00"), null, null, true);

        assertThatThrownBy(() -> examService.createExamResult(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student not found");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Exam buildExam(UUID id, String title, LocalDate examDate,
                            UUID classId, UUID sectionId, UUID subjectId, BigDecimal maxMarks) {
        Exam exam = new Exam();
        exam.setId(id);
        exam.setTitle(title);
        exam.setExamDate(examDate);
        exam.setClassId(classId);
        exam.setSectionId(sectionId);
        exam.setSubjectId(subjectId);
        exam.setMaxMarks(maxMarks);
        exam.setActive(true);
        exam.setCreatedAt(Instant.now());
        return exam;
    }

    private ExamResult buildResult(UUID id, UUID examId, UUID studentId,
                                    BigDecimal marks, String grade) {
        ExamResult result = new ExamResult();
        result.setId(id);
        result.setExamId(examId);
        result.setStudentId(studentId);
        result.setMarksObtained(marks);
        result.setGrade(grade);
        result.setPublished(true);
        result.setCreatedAt(Instant.now());
        return result;
    }
}
