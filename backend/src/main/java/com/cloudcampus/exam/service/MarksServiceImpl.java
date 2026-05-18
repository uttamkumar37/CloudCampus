package com.cloudcampus.exam.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.exam.dto.BulkMarksEntryRequest;
import com.cloudcampus.exam.dto.MarksEntryRequest;
import com.cloudcampus.exam.dto.StudentMarkResponse;
import com.cloudcampus.exam.entity.ExamSubject;
import com.cloudcampus.exam.entity.StudentMark;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamSubjectRepository;
import com.cloudcampus.exam.repository.StudentMarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MarksServiceImpl implements MarksService {

    private final ExamRepository        examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final StudentMarkRepository studentMarkRepository;

    public MarksServiceImpl(ExamRepository examRepository,
                             ExamSubjectRepository examSubjectRepository,
                             StudentMarkRepository studentMarkRepository) {
        this.examRepository        = examRepository;
        this.examSubjectRepository = examSubjectRepository;
        this.studentMarkRepository = studentMarkRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<StudentMarkResponse> bulkSave(
            UUID tenantId,
            UUID schoolId,
            UUID examId,
            UUID subjectEntryId,
            BulkMarksEntryRequest request,
            UUID enteredBy) {

        // Validate exam exists under the school
        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        // Validate the paper belongs to this exam
        ExamSubject paper = examSubjectRepository.findByIdAndExamId(subjectEntryId, examId)
                .orElseThrow(() -> new NotFoundException("Exam subject not found"));

        List<StudentMarkResponse> results = new ArrayList<>();

        for (MarksEntryRequest entry : request.entries()) {
            BigDecimal marks = resolveMarks(entry, paper.getTotalMarks());

            studentMarkRepository.findByExamSubjectIdAndStudentId(subjectEntryId, entry.studentId())
                    .ifPresentOrElse(
                            existing -> {
                                existing.update(marks, entry.isAbsent(), entry.remarks(), enteredBy);
                                results.add(StudentMarkResponse.from(studentMarkRepository.save(existing)));
                            },
                            () -> {
                                StudentMark sm = StudentMark.create(
                                        tenantId, examId, subjectEntryId,
                                        entry.studentId(), marks,
                                        entry.isAbsent(), entry.remarks(), enteredBy);
                                results.add(StudentMarkResponse.from(studentMarkRepository.save(sm)));
                            }
                    );
        }
        return results;
    }

    @Override
    public List<StudentMarkResponse> listBySubject(UUID schoolId, UUID examId, UUID subjectEntryId) {
        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));
        examSubjectRepository.findByIdAndExamId(subjectEntryId, examId)
                .orElseThrow(() -> new NotFoundException("Exam subject not found"));

        return studentMarkRepository
                .findByExamSubjectIdOrderByStudentId(subjectEntryId)
                .stream()
                .map(StudentMarkResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public StudentMarkResponse update(
            UUID schoolId,
            UUID examId,
            UUID subjectEntryId,
            UUID markId,
            MarksEntryRequest request,
            UUID enteredBy) {

        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        ExamSubject paper = examSubjectRepository.findByIdAndExamId(subjectEntryId, examId)
                .orElseThrow(() -> new NotFoundException("Exam subject not found"));

        StudentMark sm = studentMarkRepository.findByIdAndExamSubjectId(markId, subjectEntryId)
                .orElseThrow(() -> new NotFoundException("Mark entry not found"));

        BigDecimal marks = resolveMarks(request, paper.getTotalMarks());
        sm.update(marks, request.isAbsent(), request.remarks(), enteredBy);
        return StudentMarkResponse.from(studentMarkRepository.save(sm));
    }

    @Override
    @Transactional
    public void delete(UUID schoolId, UUID examId, UUID subjectEntryId, UUID markId) {
        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));
        examSubjectRepository.findByIdAndExamId(subjectEntryId, examId)
                .orElseThrow(() -> new NotFoundException("Exam subject not found"));

        StudentMark sm = studentMarkRepository.findByIdAndExamSubjectId(markId, subjectEntryId)
                .orElseThrow(() -> new NotFoundException("Mark entry not found"));

        studentMarkRepository.delete(sm);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolve marks to persist:
     * - absent → 0
     * - not absent + null marks → null (unrecorded)
     * - else validate ≤ totalMarks and return as-is
     */
    private BigDecimal resolveMarks(MarksEntryRequest entry, BigDecimal totalMarks) {
        if (entry.isAbsent()) {
            return BigDecimal.ZERO;
        }
        if (entry.marksObtained() == null) {
            return null;
        }
        if (entry.marksObtained().compareTo(totalMarks) > 0) {
            throw new BadRequestException(
                    "Marks obtained (" + entry.marksObtained() +
                    ") cannot exceed total marks (" + totalMarks + ") for student " +
                    entry.studentId());
        }
        return entry.marksObtained();
    }
}
