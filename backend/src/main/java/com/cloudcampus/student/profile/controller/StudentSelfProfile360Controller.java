package com.cloudcampus.student.profile.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.profile.dto.StudentProfile360Response;
import com.cloudcampus.student.profile.service.StudentProfile360Service;
import com.cloudcampus.student.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/profile-360")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student — 360 Profile", description = "Authenticated student self-service 360 profile")
public class StudentSelfProfile360Controller {

    private final StudentRepository studentRepo;
    private final StudentProfile360Service profileService;

    public StudentSelfProfile360Controller(
            StudentRepository studentRepo,
            StudentProfile360Service profileService) {
        this.studentRepo = studentRepo;
        this.profileService = profileService;
    }

    @Operation(summary = "My 360 student profile",
               description = "Returns the authenticated student's own 360 profile aggregate.")
    @GetMapping
    public ApiResponse<StudentProfile360Response> myProfile() {
        Student student = studentRepo.findByUserId(RequestContext.getUserId())
                .orElseThrow(() -> new NotFoundException("Student profile not found"));

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), profileService.getProfile(student.getId()));
    }
}
