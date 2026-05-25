package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.dto.StudentMeResponse;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/student")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — Me", description = "Authenticated student identity snapshot")
public class StudentMeController {

    private final StudentRepository studentRepo;
    private final SchoolRepository schoolRepo;

    public StudentMeController(StudentRepository studentRepo, SchoolRepository schoolRepo) {
        this.studentRepo = studentRepo;
        this.schoolRepo = schoolRepo;
    }

    @Operation(summary = "My student profile",
               description = "Returns the authenticated student's own portal identity snapshot.")
    @GetMapping("/me")
    public ApiResponse<StudentMeResponse> me() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        Student student = studentRepo.findByUserIdAndTenantId(RequestContext.getUserId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Student profile not found"));
        School school = schoolRepo.findByIdFiltered(student.getSchoolId())
                .orElseThrow(() -> new NotFoundException("School not found"));

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), StudentMeResponse.from(student, school));
    }
}
