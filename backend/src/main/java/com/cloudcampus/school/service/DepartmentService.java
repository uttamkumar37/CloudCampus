package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.DepartmentRequest;
import com.cloudcampus.school.dto.DepartmentResponse;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {

    DepartmentResponse create(UUID schoolId, DepartmentRequest request);

    List<DepartmentResponse> listBySchool(UUID schoolId);

    List<DepartmentResponse> listActive(UUID schoolId);

    DepartmentResponse getById(UUID id);

    DepartmentResponse update(UUID id, DepartmentRequest request);

    DepartmentResponse deactivate(UUID id);

    DepartmentResponse activate(UUID id);
}
