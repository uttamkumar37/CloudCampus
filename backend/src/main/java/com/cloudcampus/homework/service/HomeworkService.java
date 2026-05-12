package com.cloudcampus.homework.service;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.homework.dto.HomeworkCreateRequest;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.homework.entity.HomeworkStatus;

import java.util.UUID;

public interface HomeworkService {

    HomeworkResponse create(UUID tenantId, UUID schoolId, UUID assignedBy, HomeworkCreateRequest request);

    PageResponse<HomeworkResponse> list(UUID schoolId, UUID academicYearId,
                                        UUID classId, UUID sectionId,
                                        HomeworkStatus status, int page, int size);

    HomeworkResponse getById(UUID schoolId, UUID homeworkId);

    HomeworkResponse updateStatus(UUID schoolId, UUID homeworkId, HomeworkStatus status);

    void delete(UUID schoolId, UUID homeworkId);
}
