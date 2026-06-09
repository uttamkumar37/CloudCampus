package com.cloudcampus.people.student;

import java.util.List;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/students")
public class StudentImportController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final StudentImportService studentImportService;

    public StudentImportController(
            AuthenticatedUserResolver authenticatedUserResolver,
            StudentImportService studentImportService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.studentImportService = studentImportService;
    }

    @GetMapping("/import/template")
    ResponseEntity<StudentImportTemplateResponse> template(HttpServletRequest request) {
        return ResponseEntity.ok(studentImportService.template(authenticatedUserResolver.requireUser(request)));
    }

    @PostMapping("/import/validate")
    ResponseEntity<StudentImportValidationResponse> validateImport(
            @Valid @RequestBody StudentImportRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(studentImportService.validateImport(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @PostMapping("/import")
    ResponseEntity<StudentImportResponse> importStudents(
            @Valid @RequestBody StudentImportRequest requestBody,
            HttpServletRequest request
    ) {
        StudentImportResponse response = studentImportService.importStudents(
                authenticatedUserResolver.requireUser(request),
                requestBody
        );
        return ResponseEntity.status(response.imported() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST).body(response);
    }

    @PostMapping("/import/jobs")
    ResponseEntity<StudentImportJobResponse> queueImportJob(
            @Valid @RequestBody StudentImportRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(studentImportService.queueImportJob(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/import/jobs/{bulkJobId}")
    ResponseEntity<StudentImportJobResponse> importJob(@PathVariable String bulkJobId, HttpServletRequest request) {
        return ResponseEntity.ok(studentImportService.importJob(
                authenticatedUserResolver.requireUser(request),
                bulkJobId
        ));
    }

    @GetMapping
    ResponseEntity<?> students(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            HttpServletRequest request
    ) {
        if (page == null && size == null && !StringUtils.hasText(search) && !StringUtils.hasText(status)) {
            return ResponseEntity.ok(studentImportService.students(authenticatedUserResolver.requireUser(request)));
        }
        PageResponse<StudentResponse> response = studentImportService.students(
                authenticatedUserResolver.requireUser(request),
                page == null ? 0 : page,
                size == null ? 50 : size,
                search,
                status
        );
        return ResponseEntity.ok(response);
    }
}
