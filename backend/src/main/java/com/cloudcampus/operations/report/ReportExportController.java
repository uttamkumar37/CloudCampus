package com.cloudcampus.operations.report;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/reports/exports")
public class ReportExportController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ReportExportService reportExportService;

    public ReportExportController(
            AuthenticatedUserResolver authenticatedUserResolver,
            ReportExportService reportExportService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.reportExportService = reportExportService;
    }

    @PostMapping
    ResponseEntity<ReportExportResponse> requestExport(
            @Valid @RequestBody ReportExportRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportExportService.requestExport(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<ReportExportResponse>> listExports(HttpServletRequest request) {
        return ResponseEntity.ok(reportExportService.listExports(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/{exportId}")
    ResponseEntity<ReportExportResponse> getExport(
            @PathVariable String exportId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(reportExportService.getExport(
                authenticatedUserResolver.requireUser(request),
                exportId
        ));
    }

    @GetMapping("/{exportId}/download")
    ResponseEntity<String> downloadExport(
            @PathVariable String exportId,
            HttpServletRequest request
    ) {
        ReportExportFileResponse file = reportExportService.downloadExport(
                authenticatedUserResolver.requireUser(request),
                exportId
        );
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(file.fileName())
                        .build()
                        .toString())
                .body(file.content());
    }
}
