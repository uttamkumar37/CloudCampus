package com.cloudcampus.bulk.controller;

import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.service.BulkUploadService;
import com.cloudcampus.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/bulk")
@RequiredArgsConstructor
@Tag(name = "Bulk Upload", description = "Bulk onboarding APIs")
public class BulkUploadController {

    private final BulkUploadService bulkUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Upload student, teacher, class, and section data in a single Excel workbook", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkUploadResponse>> upload(@RequestParam("file") MultipartFile file) {
        BulkUploadResponse response = bulkUploadService.uploadWorkbook(file);
        String message = response.failedCount() == 0
                ? "Upload completed successfully"
                : "Upload completed with some row errors";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @GetMapping("/sample")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Download sample bulk upload workbook", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<Resource> downloadSampleWorkbook() {
        Resource resource = bulkUploadService.generateSampleWorkbook();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cloudcampus-bulk-upload-sample.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .body(resource);
    }
}
