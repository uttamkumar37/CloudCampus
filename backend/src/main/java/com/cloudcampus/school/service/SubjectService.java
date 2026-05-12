package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.SubjectRequest;
import com.cloudcampus.school.dto.SubjectResponse;

import java.util.List;
import java.util.UUID;

public interface SubjectService {

    SubjectResponse create(UUID schoolId, SubjectRequest request);

    /** Returns all subjects for the school regardless of active status. */
    List<SubjectResponse> listBySchool(UUID schoolId);

    /** Returns only active subjects for the school. */
    List<SubjectResponse> listActive(UUID schoolId);

    SubjectResponse getById(UUID id);

    SubjectResponse update(UUID id, SubjectRequest request);

    /** Soft-disables the subject. */
    SubjectResponse deactivate(UUID id);

    /** Re-enables a previously disabled subject. */
    SubjectResponse activate(UUID id);
}
