package com.cloudcampus.assignment.service;

import com.cloudcampus.assignment.dto.AssignmentCreateRequest;
import com.cloudcampus.assignment.dto.AssignmentResponse;
import com.cloudcampus.assignment.dto.GradeSubmissionRequest;
import com.cloudcampus.assignment.dto.SubmissionResponse;
import com.cloudcampus.assignment.entity.AssignmentStatus;
import com.cloudcampus.common.web.PageResponse;

import java.util.List;
import java.util.UUID;

public interface AssignmentService {

    AssignmentResponse create(UUID tenantId, UUID schoolId, UUID assignedBy, AssignmentCreateRequest request);

    PageResponse<AssignmentResponse> list(UUID schoolId, UUID academicYearId,
                                          UUID classId, UUID sectionId,
                                          AssignmentStatus status, int page, int size);

    AssignmentResponse getById(UUID schoolId, UUID assignmentId);

    AssignmentResponse updateStatus(UUID schoolId, UUID assignmentId, AssignmentStatus status);

    void delete(UUID schoolId, UUID assignmentId);

    List<SubmissionResponse> listSubmissions(UUID schoolId, UUID assignmentId);

    SubmissionResponse gradeSubmission(UUID schoolId, UUID assignmentId,
                                       UUID submissionId, UUID gradedBy,
                                       GradeSubmissionRequest request);
}
