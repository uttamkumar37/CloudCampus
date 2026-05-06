package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.StudentCreateRequest;
import com.cloudcampus.student.dto.StudentDetailResponse;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface StudentService {

    StudentResponse createStudent(StudentCreateRequest request);

    StudentResponse getStudentById(UUID id);

    StudentDetailResponse getStudentDetails(UUID id);

    StudentResponse getMyProfile();

    Page<StudentResponse> getStudents(Pageable pageable);

    StudentResponse updateStudent(UUID id, StudentUpdateRequest request);

    void softDeleteStudent(UUID id);
}
