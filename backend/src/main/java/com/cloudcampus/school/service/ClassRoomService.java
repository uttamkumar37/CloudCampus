package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.ClassRoomRequest;
import com.cloudcampus.school.dto.ClassRoomResponse;

import java.util.List;
import java.util.UUID;

public interface ClassRoomService {

    ClassRoomResponse create(UUID schoolId, ClassRoomRequest request);

    List<ClassRoomResponse> listByAcademicYear(UUID academicYearId);

    ClassRoomResponse getById(UUID id);

    ClassRoomResponse update(UUID id, ClassRoomRequest request);

    void delete(UUID id);
}
