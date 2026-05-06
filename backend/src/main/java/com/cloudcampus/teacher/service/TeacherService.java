package com.cloudcampus.teacher.service;

import com.cloudcampus.teacher.dto.TeacherCreateRequest;
import com.cloudcampus.teacher.dto.TeacherDetailResponse;
import com.cloudcampus.teacher.dto.TeacherResponse;
import com.cloudcampus.teacher.dto.TeacherUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TeacherService {

    TeacherResponse createTeacher(TeacherCreateRequest request);

    TeacherResponse getTeacherById(UUID id);

    TeacherDetailResponse getTeacherDetails(UUID id);

    TeacherResponse getMyProfile();

    Page<TeacherResponse> getTeachers(Pageable pageable);

    TeacherResponse updateTeacher(UUID id, TeacherUpdateRequest request);

    void softDeleteTeacher(UUID id);
}
