package com.cloudcampus.bulk.controller;

import com.cloudcampus.bulk.dto.BulkExecuteRequest;
import com.cloudcampus.bulk.dto.BulkJobListResponse;
import com.cloudcampus.bulk.dto.BulkJobResponse;
import com.cloudcampus.bulk.dto.BulkOperationsMetadataResponse;
import com.cloudcampus.bulk.dto.BulkPreviewResponse;
import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.dto.BulkValidationResponse;
import com.cloudcampus.bulk.service.BulkUploadService;
import com.cloudcampus.bulk.service.BulkWorkflowService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        private final BulkWorkflowService bulkWorkflowService;

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
    @Operation(summary = "Download sample bulk upload workbook for a given operation", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true),
            @Parameter(name = "operation", description = "Operation type: students | teachers | academic | timetable | attendance | parents | master", required = false)
    })
    public ResponseEntity<Resource> downloadSampleWorkbook(
            @RequestParam(value = "operation", required = false) String operation
    ) {
        Resource resource = (operation == null || operation.isBlank())
                ? bulkUploadService.generateSampleWorkbook()
                : bulkUploadService.generateSampleForOperation(operation);
        String filename = (operation == null || operation.isBlank())
                ? "cloudcampus-bulk-upload-sample.xlsx"
                : "cloudcampus-" + operation.trim().toLowerCase(java.util.Locale.ROOT) + "-sample.xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .body(resource);
    }

    @GetMapping("/operations")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Get supported bulk operations and field templates", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkOperationsMetadataResponse>> operations() {
        BulkOperationsMetadataResponse response = bulkWorkflowService.getOperations();
        return ResponseEntity.ok(ApiResponse.success("Bulk operations fetched", response));
    }

    @PostMapping(value = "/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Validate uploaded bulk file and build mapping-ready rows", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkValidationResponse>> validate(
            @RequestParam("operation") String operation,
            @RequestParam("file") MultipartFile file
    ) {
        BulkValidationResponse response = bulkWorkflowService.validate(operation, file);
        return ResponseEntity.ok(ApiResponse.success("Validation completed", response));
    }

    @GetMapping("/preview")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Preview computed changes from a validation session", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkPreviewResponse>> preview(@RequestParam("validationId") String validationId) {
        BulkPreviewResponse response = bulkWorkflowService.preview(validationId);
        return ResponseEntity.ok(ApiResponse.success("Preview generated", response));
    }

    @PostMapping("/execute")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Execute a validated bulk operation", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkUploadResponse>> execute(@RequestBody BulkExecuteRequest request) {
        BulkUploadResponse response = bulkWorkflowService.execute(request);
        String message = response.failedCount() == 0 ? "Bulk operation completed" : "Bulk operation completed with issues";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "List bulk operation jobs", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkJobListResponse>> jobs() {
        BulkJobListResponse response = bulkWorkflowService.listJobs();
        return ResponseEntity.ok(ApiResponse.success("Bulk jobs fetched", response));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Get bulk job status", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkJobResponse>> job(@PathVariable String jobId) {
        BulkJobResponse response = bulkWorkflowService.getJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Bulk job fetched", response));
    }

    @PostMapping("/jobs/{jobId}/retry")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Retry failed records from a bulk job", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<BulkJobResponse>> retry(@PathVariable String jobId) {
        BulkJobResponse response = bulkWorkflowService.retryJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Retry job started", response));
    }

    @GetMapping("/jobs/{jobId}/error-report")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Operation(summary = "Download bulk job error report as CSV", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<Resource> errorReport(@PathVariable String jobId) {
        Resource resource = bulkWorkflowService.downloadErrorReport(jobId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + jobId + "-errors.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }
}
