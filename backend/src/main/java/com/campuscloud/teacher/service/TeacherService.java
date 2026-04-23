package com.campuscloud.teacher.service;

import com.campuscloud.teacher.dto.TeacherCreateRequest;
import com.campuscloud.teacher.dto.TeacherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TeacherService {

    TeacherResponse createTeacher(TeacherCreateRequest request);

    TeacherResponse getTeacherById(UUID id);

    Page<TeacherResponse> getTeachers(Pageable pageable);
}
