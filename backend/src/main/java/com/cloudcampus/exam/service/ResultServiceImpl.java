package com.cloudcampus.exam.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.exam.dto.SubjectResultLine;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.entity.ExamSubject;
import com.cloudcampus.exam.entity.StudentMark;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.exam.repository.ExamSubjectRepository;
import com.cloudcampus.exam.repository.StudentMarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * CC-1103: Result generation service.
 *
 * Generation algorithm:
 *   1. Load all student_marks for the exam (Hibernate filter ensures tenant isolation).
 *   2. Group by studentId.
 *   3. For each student: sum obtained, sum possible (from exam_subjects map).
 *   4. Compute percentage, grade, pass/fail against exam-level pass threshold.
 *   5. Sort by percentage DESC; assign standard rank (ties share rank, next skipped).
 *   6. Upsert into exam_results (idempotent).
 *
 * CC-1104: Report card — handled by {@link #getStudentResult} which adds the
 * per-subject breakdown ({@code subjects} list) to the response.
 */
@Service
@Transactional(readOnly = true)
public class ResultServiceImpl implements ResultService {

    private final ExamRepository        examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final ExamResultRepository  examResultRepository;

    public ResultServiceImpl(ExamRepository examRepository,
                              ExamSubjectRepository examSubjectRepository,
                              StudentMarkRepository studentMarkRepository,
                              ExamResultRepository examResultRepository) {
        this.examRepository        = examRepository;
        this.examSubjectRepository = examSubjectRepository;
        this.studentMarkRepository = studentMarkRepository;
        this.examResultRepository  = examResultRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public contract
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<ExamResultResponse> generate(UUID tenantId, UUID schoolId, UUID examId) {

        Exam exam = examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        // Exam-level pass threshold as a percentage (e.g. 40 / 100 → 40 %)
        BigDecimal passThreshold = computePassThreshold(exam);

        // Map each paper id → ExamSubject (for totalMarks lookup)
        Map<UUID, ExamSubject> paperMap = examSubjectRepository
                .findByExamIdOrderByExamDateAsc(examId)
                .stream()
                .collect(Collectors.toMap(ExamSubject::getId, es -> es));

        // All marks for this exam (tenant-filtered by Hibernate @Filter)
        List<StudentMark> allMarks = studentMarkRepository.findByExamId(examId);

        if (allMarks.isEmpty()) {
            return List.of();
        }

        // Group marks by studentId
        Map<UUID, List<StudentMark>> byStudent = allMarks.stream()
                .collect(Collectors.groupingBy(StudentMark::getStudentId));

        // Build unsaved ExamResult objects
        List<ExamResult> results = new ArrayList<>(byStudent.size());

        for (Map.Entry<UUID, List<StudentMark>> entry : byStudent.entrySet()) {
            UUID studentId        = entry.getKey();
            List<StudentMark> marks = entry.getValue();

            BigDecimal obtained  = BigDecimal.ZERO;
            BigDecimal possible  = BigDecimal.ZERO;

            for (StudentMark sm : marks) {
                ExamSubject paper = paperMap.get(sm.getExamSubjectId());
                if (paper == null) continue; // deleted paper — skip gracefully
                possible = possible.add(paper.getTotalMarks());
                if (sm.getMarksObtained() != null) {
                    obtained = obtained.add(sm.getMarksObtained());
                }
            }

            // Effectively-final copies for use inside the lambda below
            final BigDecimal fObtained   = obtained;
            final BigDecimal fPossible   = possible;
            final BigDecimal percentage  = computePercentage(obtained, possible);
            final String     grade       = computeGrade(percentage);
            final boolean    passed      = percentage.compareTo(passThreshold) >= 0;

            ExamResult result = examResultRepository
                    .findByExamIdAndStudentId(examId, studentId)
                    .orElseGet(() -> ExamResult.create(
                            tenantId, examId, studentId, exam.getSchoolId(),
                            fObtained, fPossible, percentage, grade, passed));

            // If found existing, update aggregates
            if (result.getId() != null && result.getCreatedAt() != null) {
                result.updateAggregates(obtained, possible, percentage, grade, passed);
            }

            results.add(result);
        }

        // Sort by percentage DESC → assign standard rank
        results.sort(Comparator.comparing(ExamResult::getPercentage).reversed());
        assignRanks(results);

        examResultRepository.saveAll(results);

        return results.stream()
                .map(ExamResultResponse::from)
                .toList();
    }

    @Override
    public List<ExamResultResponse> listResults(UUID schoolId, UUID examId) {
        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        return examResultRepository
                .findByExamIdOrderByRankAsc(examId)
                .stream()
                .map(ExamResultResponse::from)
                .toList();
    }

    @Override
    public ExamResultResponse getStudentResult(UUID schoolId, UUID examId, UUID studentId) {

        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        ExamResult result = examResultRepository
                .findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new NotFoundException(
                        "Result not found — please generate results first"));

        // Per-subject breakdown for report card
        List<ExamSubject> papers = examSubjectRepository.findByExamIdOrderByExamDateAsc(examId);
        List<StudentMark> marks  = studentMarkRepository.findByExamIdAndStudentId(examId, studentId);

        Map<UUID, StudentMark> markByPaper = marks.stream()
                .collect(Collectors.toMap(StudentMark::getExamSubjectId, sm -> sm));

        List<SubjectResultLine> subjects = papers.stream()
                .map(paper -> {
                    StudentMark sm = markByPaper.get(paper.getId());
                    if (sm == null) {
                        // No mark entered for this paper
                        return new SubjectResultLine(
                                paper.getId(),
                                paper.getSubjectId().toString(), // plain UUID; frontend resolves name
                                paper.getTotalMarks(),
                                BigDecimal.ZERO,
                                false,
                                false);
                    }
                    BigDecimal obtained = sm.getMarksObtained() != null ? sm.getMarksObtained() : BigDecimal.ZERO;
                    boolean    passed   = !sm.isAbsent()
                                         && obtained.compareTo(paper.getPassingMarks()) >= 0;
                    return new SubjectResultLine(
                            paper.getId(),
                            paper.getSubjectId().toString(),
                            paper.getTotalMarks(),
                            obtained,
                            sm.isAbsent(),
                            passed);
                })
                .toList();

        return ExamResultResponse.fromWithSubjects(result, subjects);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private BigDecimal computePassThreshold(Exam exam) {
        if (exam.getTotalMarks().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return exam.getPassingMarks()
                .divide(exam.getTotalMarks(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal computePercentage(BigDecimal obtained, BigDecimal possible) {
        if (possible.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return obtained
                .divide(possible, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String computeGrade(BigDecimal percentage) {
        double pct = percentage.doubleValue();
        if (pct >= 90.0) return "A+";
        if (pct >= 80.0) return "A";
        if (pct >= 70.0) return "B";
        if (pct >= 60.0) return "C";
        if (pct >= 35.0) return "D";
        return "F";
    }

    /**
     * Assigns standard (competition) ranks in-place.
     * Input must already be sorted by percentage DESC.
     * Ties: same rank → next rank skips positions.
     * Example: percentages [90, 85, 85, 70] → ranks [1, 2, 2, 4].
     */
    private void assignRanks(List<ExamResult> sorted) {
        for (int i = 0; i < sorted.size(); i++) {
            ExamResult current = sorted.get(i);
            if (i == 0) {
                current.assignRank(1);
            } else {
                BigDecimal prevPct    = sorted.get(i - 1).getPercentage();
                int        prevRank   = sorted.get(i - 1).getRank();
                if (current.getPercentage().compareTo(prevPct) == 0) {
                    current.assignRank(prevRank); // same percentage → same rank
                } else {
                    current.assignRank(i + 1);    // standard: skip ranks for ties
                }
            }
        }
    }
}
