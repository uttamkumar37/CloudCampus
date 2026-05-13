package com.cloudcampus.assignment.service;

import com.cloudcampus.assignment.dto.AssignmentCreateRequest;
import com.cloudcampus.assignment.dto.AssignmentResponse;
import com.cloudcampus.assignment.dto.GradeSubmissionRequest;
import com.cloudcampus.assignment.dto.SubmissionResponse;
import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import com.cloudcampus.assignment.entity.AssignmentSubmission;
import com.cloudcampus.assignment.repository.AssignmentRepository;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository,
                                  SubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    @Override
    @Transactional
    public AssignmentResponse create(UUID tenantId, UUID schoolId, UUID assignedBy,
                                     AssignmentCreateRequest req) {
        Assignment a = Assignment.create(
                tenantId, schoolId, req.academicYearId(),
                req.classId(), req.sectionId(), req.subjectId(),
                assignedBy, req.title(), req.description(),
                req.dueDate(), req.maxMarks()
        );
        if (req.publishImmediately()) a.publish();
        assignmentRepository.save(a);
        return AssignmentResponse.from(a);
    }

    @Override
    public PageResponse<AssignmentResponse> list(UUID schoolId, UUID academicYearId,
                                                  UUID classId, UUID sectionId,
                                                  AssignmentStatus status, int page, int size) {
        Page<Assignment> result = assignmentRepository.findFiltered(
                schoolId, academicYearId, classId, sectionId, status, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream().map(AssignmentResponse::from).toList(),
                page * size, size, result.getTotalElements()
        );
    }

    @Override
    public AssignmentResponse getById(UUID schoolId, UUID assignmentId) {
        return AssignmentResponse.from(findOrThrow(schoolId, assignmentId));
    }

    @Override
    @Transactional
    public AssignmentResponse updateStatus(UUID schoolId, UUID assignmentId, AssignmentStatus status) {
        Assignment a = findOrThrow(schoolId, assignmentId);
        switch (status) {
            case PUBLISHED -> {
                if (a.getStatus() != AssignmentStatus.DRAFT)
                    throw new BadRequestException("Only DRAFT assignments can be published");
                a.publish();
            }
            case CLOSED -> {
                if (a.getStatus() == AssignmentStatus.CLOSED)
                    throw new BadRequestException("Assignment is already closed");
                a.close();
            }
            default -> throw new BadRequestException("Invalid target status: " + status);
        }
        return AssignmentResponse.from(a);
    }

    @Override
    @Transactional
    public void delete(UUID schoolId, UUID assignmentId) {
        Assignment a = findOrThrow(schoolId, assignmentId);
        if (a.getStatus() != AssignmentStatus.DRAFT)
            throw new BadRequestException("Only DRAFT assignments can be deleted");
        assignmentRepository.delete(a);
    }

    @Override
    public List<SubmissionResponse> listSubmissions(UUID schoolId, UUID assignmentId) {
        findOrThrow(schoolId, assignmentId); // ownership check
        return submissionRepository.findByAssignmentId(assignmentId)
                .stream().map(SubmissionResponse::from).toList();
    }

    @Override
    @Transactional
    public SubmissionResponse gradeSubmission(UUID schoolId, UUID assignmentId,
                                              UUID submissionId, UUID gradedBy,
                                              GradeSubmissionRequest req) {
        Assignment a = findOrThrow(schoolId, assignmentId);
        if (a.getMaxMarks() != null && req.marksObtained().compareTo(a.getMaxMarks()) > 0)
            throw new BadRequestException("Marks obtained cannot exceed max marks (" + a.getMaxMarks() + ")");

        AssignmentSubmission sub = submissionRepository.findByIdAndAssignmentId(submissionId, assignmentId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));
        sub.grade(req.marksObtained(), req.feedback(), gradedBy);
        return SubmissionResponse.from(sub);
    }

    private Assignment findOrThrow(UUID schoolId, UUID id) {
        return assignmentRepository.findBySchoolIdAndId(schoolId, id)
                .orElseThrow(() -> new NotFoundException("Assignment not found"));
    }
}
