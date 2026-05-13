package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.SectionRequest;
import com.cloudcampus.school.dto.SectionResponse;

import java.util.List;
import java.util.UUID;

public interface SectionService {

    SectionResponse create(UUID schoolId, SectionRequest request);

    List<SectionResponse> listByClass(UUID classId);

    SectionResponse getById(UUID id);

    SectionResponse update(UUID id, SectionRequest request);

    void delete(UUID id);
}
