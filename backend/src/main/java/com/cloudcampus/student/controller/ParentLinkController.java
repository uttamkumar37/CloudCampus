package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.student.dto.ParentLinkRequest;
import com.cloudcampus.student.dto.ParentLinkResponse;
import com.cloudcampus.student.service.ParentLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Parent-Student Mapping (CC-0506).
 *
 * POST   /v1/school-admin/students/{studentId}/parents            — add parent link
 * GET    /v1/school-admin/students/{studentId}/parents            — list parents for student
 * DELETE /v1/school-admin/student-parent-links/{linkId}           — remove a link
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Parent Mapping", description = "Link and manage parent/guardian relationships for students")
public class ParentLinkController {

    private final ParentLinkService service;

    public ParentLinkController(ParentLinkService service) {
        this.service = service;
    }

    @Operation(summary = "Link a parent to a student",
               description = "The parentUserId must reference an existing user with role PARENT.")
    @PostMapping("/students/{studentId}/parents")
    public ResponseEntity<ApiResponse<ParentLinkResponse>> addLink(
            @PathVariable UUID studentId,
            @Valid @RequestBody ParentLinkRequest request) {
        ParentLinkResponse body = service.addLink(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List all parents linked to a student")
    @GetMapping("/students/{studentId}/parents")
    public ResponseEntity<ApiResponse<List<ParentLinkResponse>>> listByStudent(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByStudent(studentId)));
    }

    @Operation(summary = "Remove a parent-student link")
    @DeleteMapping("/student-parent-links/{linkId}")
    public ResponseEntity<Void> removeLink(@PathVariable UUID linkId) {
        service.removeLink(linkId);
        return ResponseEntity.noContent().build();
    }
}
