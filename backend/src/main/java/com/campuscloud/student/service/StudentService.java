package com.campuscloud.student.service;

import com.campuscloud.student.dto.StudentCreateRequest;
import com.campuscloud.student.dto.StudentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface StudentService {

    StudentResponse createStudent(StudentCreateRequest request);

    StudentResponse getStudentById(UUID id);

    Page<StudentResponse> getStudents(Pageable pageable);
}
