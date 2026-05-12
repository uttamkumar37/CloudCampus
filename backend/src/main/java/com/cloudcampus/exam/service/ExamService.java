package com.cloudcampus.exam.service;

import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.dto.ExamResponse;
import com.cloudcampus.exam.dto.ExamSubjectRequest;
import com.cloudcampus.exam.dto.ExamSubjectResponse;
import com.cloudcampus.exam.entity.ExamStatus;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ExamService {

    ExamResponse create(UUID tenantId, UUID schoolId, ExamCreateRequest request);

    ExamResponse getById(UUID schoolId, UUID examId);

    Page<ExamResponse> list(UUID schoolId, UUID academicYearId, ExamStatus status,
                             int page, int size);

    ExamResponse updateStatus(UUID schoolId, UUID examId, ExamStatus newStatus);

    ExamSubjectResponse addSubject(UUID schoolId, UUID examId, ExamSubjectRequest request);

    void removeSubject(UUID schoolId, UUID examId, UUID subjectEntryId);
}
