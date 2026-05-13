package com.cloudcampus.exam.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamSubjectRequest;
import com.cloudcampus.exam.dto.ExamSubjectResponse;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamStatus;
import com.cloudcampus.exam.entity.ExamSubject;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamSubjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;

    public ExamServiceImpl(ExamRepository examRepository,
                            ExamSubjectRepository examSubjectRepository) {
        this.examRepository        = examRepository;
        this.examSubjectRepository = examSubjectRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ExamResponse create(UUID tenantId, UUID schoolId, ExamCreateRequest req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }
        if (req.passingMarks().compareTo(req.totalMarks()) > 0) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }

        Exam exam = Exam.create(
                tenantId, schoolId, req.academicYearId(),
                req.name(), req.examType(),
                req.startDate(), req.endDate(),
                req.totalMarks(), req.passingMarks()
        );
        if (req.instructions() != null) {
            exam.setInstructions(req.instructions());
        }
        examRepository.save(exam);

        List<ExamSubjectResponse> subjectResponses = List.of();
        if (req.subjects() != null && !req.subjects().isEmpty()) {
            subjectResponses = req.subjects().stream()
                    .map(s -> saveSubject(exam.getId(), s))
                    .map(ExamSubjectResponse::from)
                    .toList();
        }

        return ExamResponse.from(exam, subjectResponses);
    }

    @Override
    public ExamResponse getById(UUID schoolId, UUID examId) {
        Exam exam = examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found: " + examId));
        List<ExamSubjectResponse> subjects = examSubjectRepository
                .findByExamIdOrderByExamDateAsc(examId)
                .stream()
                .map(ExamSubjectResponse::from)
                .toList();
        return ExamResponse.from(exam, subjects);
    }

    @Override
    public Page<ExamResponse> list(UUID schoolId, UUID academicYearId,
                                    ExamStatus status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        if (academicYearId != null && status != null) {
            return examRepository
                    .findBySchoolIdAndAcademicYearIdOrderByStartDateDesc(schoolId, academicYearId, pageable)
                    .map(ExamResponse::from);
        }
        if (academicYearId != null) {
            return examRepository
                    .findBySchoolIdAndAcademicYearIdOrderByStartDateDesc(schoolId, academicYearId, pageable)
                    .map(ExamResponse::from);
        }
        if (status != null) {
            return examRepository
                    .findBySchoolIdAndStatusOrderByStartDateDesc(schoolId, status, pageable)
                    .map(ExamResponse::from);
        }
        return examRepository
                .findBySchoolIdOrderByStartDateDesc(schoolId, pageable)
                .map(ExamResponse::from);
    }

    @Override
    @Transactional
    public ExamResponse updateStatus(UUID schoolId, UUID examId, ExamStatus newStatus) {
        Exam exam = examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found: " + examId));
        applyStatusTransition(exam, newStatus);
        examRepository.save(exam);
        List<ExamSubjectResponse> subjects = examSubjectRepository
                .findByExamIdOrderByExamDateAsc(examId)
                .stream().map(ExamSubjectResponse::from).toList();
        return ExamResponse.from(exam, subjects);
    }

    @Override
    @Transactional
    public ExamSubjectResponse addSubject(UUID schoolId, UUID examId, ExamSubjectRequest req) {
        Exam exam = examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found: " + examId));
        if (exam.getStatus() == ExamStatus.COMPLETED || exam.getStatus() == ExamStatus.CANCELLED) {
            throw new BadRequestException("Cannot add subjects to a " + exam.getStatus() + " exam");
        }
        if (req.passingMarks().compareTo(req.totalMarks()) > 0) {
            throw new BadRequestException("Subject passing marks cannot exceed total marks");
        }
        ExamSubject saved = saveSubject(examId, req);
        return ExamSubjectResponse.from(saved);
    }

    @Override
    @Transactional
    public void removeSubject(UUID schoolId, UUID examId, UUID subjectEntryId) {
        examRepository.findByIdAndSchoolId(examId, schoolId)
                .orElseThrow(() -> new NotFoundException("Exam not found: " + examId));
        ExamSubject es = examSubjectRepository.findByIdAndExamId(subjectEntryId, examId)
                .orElseThrow(() -> new NotFoundException("Exam subject entry not found: " + subjectEntryId));
        examSubjectRepository.delete(es);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private ExamSubject saveSubject(UUID examId, ExamSubjectRequest req) {
        ExamSubject es = ExamSubject.create(
                examId, req.subjectId(), req.classId(),
                req.examDate(), req.totalMarks(), req.passingMarks()
        );
        es.setSectionId(req.sectionId());
        es.setStartTime(req.startTime());
        es.setDurationMinutes(req.durationMinutes());
        es.setRoomNumber(req.roomNumber());
        es.setInvigilatorId(req.invigilatorId());
        return examSubjectRepository.save(es);
    }

    private void applyStatusTransition(Exam exam, ExamStatus newStatus) {
        switch (newStatus) {
            case SCHEDULED  -> exam.schedule();
            case ONGOING    -> exam.markOngoing();
            case COMPLETED  -> exam.complete();
            case CANCELLED  -> exam.cancel();
            default -> throw new BadRequestException("Invalid target status: " + newStatus);
        }
    }
}
