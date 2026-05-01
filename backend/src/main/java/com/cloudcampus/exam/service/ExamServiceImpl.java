package com.cloudcampus.exam.service;

import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamResultCreateRequest;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public ExamResponse createExam(ExamCreateRequest request) {
        validateTenantContext();

        if (!schoolClassRepository.existsById(request.classId())) {
            throw new IllegalArgumentException("Class not found: " + request.classId());
        }
        if (!sectionRepository.existsById(request.sectionId())) {
            throw new IllegalArgumentException("Section not found: " + request.sectionId());
        }
        if (!subjectRepository.existsById(request.subjectId())) {
            throw new IllegalArgumentException("Subject not found: " + request.subjectId());
        }
        if (examRepository.existsByTitleAndExamDateAndClassIdAndSectionIdAndSubjectId(
                request.title().trim(),
                request.examDate(),
                request.classId(),
                request.sectionId(),
                request.subjectId()
        )) {
            throw new IllegalArgumentException("Exam already scheduled for the same title/date/class/section/subject");
        }

        Exam exam = new Exam();
        exam.setTitle(request.title().trim());
        exam.setExamDate(request.examDate());
        exam.setClassId(request.classId());
        exam.setSectionId(request.sectionId());
        exam.setSubjectId(request.subjectId());
        exam.setMaxMarks(request.maxMarks());
        exam.setActive(true);

        Exam saved = examRepository.save(exam);
        log.info("Exam created: examId={}, title={}, tenant={}", saved.getId(), saved.getTitle(), TenantContext.getTenant());
        return mapExam(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponse> getExamsByClass(UUID classId) {
        validateTenantContext();

        if (!schoolClassRepository.existsById(classId)) {
            throw new IllegalArgumentException("Class not found: " + classId);
        }

        return examRepository.findAllByClassId(classId).stream().map(this::mapExam).toList();
    }

    @Override
    @Transactional
    public ExamResultResponse createExamResult(ExamResultCreateRequest request) {
        validateTenantContext();

        Exam exam = examRepository.findById(request.examId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + request.examId()));

        if (!studentRepository.existsById(request.studentId())) {
            throw new IllegalArgumentException("Student not found: " + request.studentId());
        }
        if (examResultRepository.existsByExamIdAndStudentId(request.examId(), request.studentId())) {
            throw new IllegalArgumentException("Result already recorded for this student and exam");
        }
        if (request.marksObtained().compareTo(exam.getMaxMarks()) > 0) {
            throw new IllegalArgumentException("marksObtained cannot exceed maxMarks");
        }

        ExamResult examResult = new ExamResult();
        examResult.setExamId(request.examId());
        examResult.setStudentId(request.studentId());
        examResult.setMarksObtained(request.marksObtained());
        examResult.setGrade(normalizeNullable(request.grade()));
        examResult.setRemarks(normalizeNullable(request.remarks()));
        examResult.setPublished(request.published());

        ExamResult saved = examResultRepository.save(examResult);
        log.info("Exam result created: resultId={}, examId={}, studentId={}, tenant={}",
                saved.getId(), saved.getExamId(), saved.getStudentId(), TenantContext.getTenant());
        return mapResult(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResultResponse> getExamResults(UUID examId, @Nullable Set<UUID> allowedStudentIds) {
        validateTenantContext();

        if (!examRepository.existsById(examId)) {
            throw new IllegalArgumentException("Exam not found: " + examId);
        }

        List<ExamResult> results = examResultRepository.findAllByExamId(examId);
        if (allowedStudentIds != null) {
            results = results.stream()
                    .filter(r -> allowedStudentIds.contains(r.getStudentId()))
                    .toList();
        }
        return results.stream().map(this::mapResult).toList();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for exam operations");
        }
    }

    private ExamResponse mapExam(Exam exam) {
        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getExamDate(),
                exam.getClassId(),
                exam.getSectionId(),
                exam.getSubjectId(),
                exam.getMaxMarks(),
                exam.isActive(),
                exam.getCreatedAt()
        );
    }

    private ExamResultResponse mapResult(ExamResult result) {
        return new ExamResultResponse(
                result.getId(),
                result.getExamId(),
                result.getStudentId(),
                result.getMarksObtained(),
                result.getGrade(),
                result.getRemarks(),
                result.isPublished(),
                result.getCreatedAt()
        );
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
