package com.campuscloud.academic.controller;

import com.campuscloud.academic.dto.ClassCreateRequest;
import com.campuscloud.academic.dto.ClassResponse;
import com.campuscloud.academic.dto.SectionCreateRequest;
import com.campuscloud.academic.dto.SectionResponse;
import com.campuscloud.academic.dto.SubjectCreateRequest;
import com.campuscloud.academic.dto.SubjectResponse;
import com.campuscloud.academic.service.AcademicService;
import com.campuscloud.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academics")
@RequiredArgsConstructor
@Tag(name = "Academic", description = "Academic master data APIs")
public class AcademicController {

    private final AcademicService academicService;

    @PostMapping("/classes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Create class", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<ClassResponse>> createClass(@Valid @RequestBody ClassCreateRequest request) {
        ClassResponse response = academicService.createClass(request);
        return ResponseEntity.ok(ApiResponse.success("Class created successfully", response));
    }

    @GetMapping("/classes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "List classes", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<ClassResponse>>> getClasses() {
        List<ClassResponse> classes = academicService.getClasses();
        return ResponseEntity.ok(ApiResponse.success("Classes fetched successfully", classes));
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Create subject", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(@Valid @RequestBody SubjectCreateRequest request) {
        SubjectResponse response = academicService.createSubject(request);
        return ResponseEntity.ok(ApiResponse.success("Subject created successfully", response));
    }

    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "List subjects", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjects() {
        List<SubjectResponse> subjects = academicService.getSubjects();
        return ResponseEntity.ok(ApiResponse.success("Subjects fetched successfully", subjects));
    }

    @PostMapping("/sections")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Create section", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<SectionResponse>> createSection(@Valid @RequestBody SectionCreateRequest request) {
        SectionResponse response = academicService.createSection(request);
        return ResponseEntity.ok(ApiResponse.success("Section created successfully", response));
    }

    @GetMapping("/sections")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "List sections", parameters = {
            @Parameter(name = "X-Tenant-ID", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<SectionResponse>>> getSections() {
        List<SectionResponse> sections = academicService.getSections();
        return ResponseEntity.ok(ApiResponse.success("Sections fetched successfully", sections));
    }
}
