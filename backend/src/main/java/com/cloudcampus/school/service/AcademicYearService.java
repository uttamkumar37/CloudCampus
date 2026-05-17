package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.AcademicYearRequest;
import com.cloudcampus.school.dto.AcademicYearResponse;

import java.util.List;
import java.util.UUID;

public interface AcademicYearService {

    AcademicYearResponse create(UUID schoolId, AcademicYearRequest request);

    List<AcademicYearResponse> listBySchool(UUID schoolId);

    AcademicYearResponse getById(UUID id);

    AcademicYearResponse update(UUID id, AcademicYearRequest request);

    /** Marks the given year as current; clears the flag from all other years of the same school. */
    AcademicYearResponse setAsCurrent(UUID id);

    AcademicYearResponse close(UUID id);
}
