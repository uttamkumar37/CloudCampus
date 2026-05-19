package com.cloudcampus.student.profile.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.student.profile.dto.StudentProfile360Response;
import com.cloudcampus.student.profile.dto.UpdateProfileSectionRequest;
import com.cloudcampus.student.profile.service.StudentProfile360Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/school-admin/students/{studentId}/profile-360")
@Tag(name = "School Admin — Student 360 Profile", description = "Enterprise student profile sections, timeline, and risk insights")
public class StudentProfile360Controller {

    private final StudentProfile360Service service;

    public StudentProfile360Controller(StudentProfile360Service service) {
        this.service = service;
    }

    @Operation(summary = "Get student 360 profile aggregate")
    @GetMapping
    public ResponseEntity<ApiResponse<StudentProfile360Response>> get(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getProfile(studentId)));
    }

    @Operation(summary = "Update one student profile section")
    @PutMapping("/sections/{sectionKey}")
    public ResponseEntity<ApiResponse<StudentProfile360Response>> updateSection(
            @PathVariable UUID studentId,
            @PathVariable String sectionKey,
            @Valid @RequestBody UpdateProfileSectionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.updateSection(studentId, sectionKey, request)));
    }
}
