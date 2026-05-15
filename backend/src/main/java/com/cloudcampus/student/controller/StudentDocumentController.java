package com.cloudcampus.student.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.student.dto.StudentDocumentResponse;
import com.cloudcampus.student.service.StudentDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Student document upload / download / delete (CC-0505).
 *
 * POST   /v1/school-admin/schools/{schoolId}/students/{studentId}/documents
 * GET    /v1/school-admin/schools/{schoolId}/students/{studentId}/documents
 * GET    /v1/school-admin/schools/{schoolId}/students/{studentId}/documents/{documentId}/url
 * DELETE /v1/school-admin/schools/{schoolId}/students/{studentId}/documents/{documentId}
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/students/{studentId}/documents")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "School Admin — Student Documents", description = "Manage student document files stored in MinIO")
public class StudentDocumentController {

    private final StudentDocumentService service;

    public StudentDocumentController(StudentDocumentService service) {
        this.service = service;
    }

    @Operation(summary = "Upload a student document")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<StudentDocumentResponse> upload(
            @PathVariable UUID schoolId,
            @PathVariable UUID studentId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.upload(schoolId, studentId, documentType, file));
    }

    @Operation(summary = "List documents for a student")
    @GetMapping
    public ApiResponse<List<StudentDocumentResponse>> list(
            @PathVariable UUID schoolId,
            @PathVariable UUID studentId) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                service.list(schoolId, studentId));
    }

    @Operation(summary = "Get a presigned download URL (valid for 60 min)")
    @GetMapping("/{documentId}/url")
    public ApiResponse<Map<String, String>> presignedUrl(
            @PathVariable UUID schoolId,
            @PathVariable UUID studentId,
            @PathVariable UUID documentId) {
        String url = service.presignedUrl(schoolId, studentId, documentId);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), Map.of("url", url));
    }

    @Operation(summary = "Delete a student document")
    @DeleteMapping("/{documentId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID schoolId,
            @PathVariable UUID studentId,
            @PathVariable UUID documentId) {
        service.delete(schoolId, studentId, documentId);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null);
    }
}
