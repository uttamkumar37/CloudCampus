package com.cloudcampus.teacher.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.api.PageResponse;
import com.cloudcampus.teacher.dto.TeacherCreateRequest;
import com.cloudcampus.teacher.dto.TeacherResponse;
import com.cloudcampus.teacher.dto.TeacherUpdateRequest;
import com.cloudcampus.teacher.service.TeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "Teacher management APIs")
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Create a teacher", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TeacherResponse>> createTeacher(@Valid @RequestBody TeacherCreateRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return ResponseEntity.ok(ApiResponse.success("Teacher created successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get own teacher profile", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TeacherResponse>> getMyProfile() {
        TeacherResponse response = teacherService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success("Teacher profile fetched successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "Get teacher by id", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TeacherResponse>> getTeacherById(@PathVariable UUID id) {
        TeacherResponse response = teacherService.getTeacherById(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher fetched successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    @Operation(summary = "List teachers", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<PageResponse<TeacherResponse>>> getTeachers(
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<TeacherResponse> page = PageResponse.from(teacherService.getTeachers(pageable));
        return ResponseEntity.ok(ApiResponse.success("Teachers fetched successfully", page));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Update a teacher", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<TeacherResponse>> updateTeacher(
            @PathVariable UUID id,
            @Valid @RequestBody TeacherUpdateRequest request) {
        TeacherResponse response = teacherService.updateTeacher(id, request);
        return ResponseEntity.ok(ApiResponse.success("Teacher updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Soft-delete a teacher", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID id) {
        teacherService.softDeleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
