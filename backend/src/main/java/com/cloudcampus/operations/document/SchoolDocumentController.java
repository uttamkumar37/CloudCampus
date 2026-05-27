package com.cloudcampus.operations.document;

import java.util.List;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class SchoolDocumentController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final SchoolDocumentService schoolDocumentService;

    public SchoolDocumentController(
            AuthenticatedUserResolver authenticatedUserResolver,
            SchoolDocumentService schoolDocumentService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.schoolDocumentService = schoolDocumentService;
    }

    @PostMapping("/v1/school-admin/documents")
    ResponseEntity<SchoolDocumentResponse> create(
            @Valid @RequestBody SchoolDocumentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolDocumentService.create(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/documents")
    ResponseEntity<List<SchoolDocumentResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(schoolDocumentService.list(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/documents/{documentId}")
    ResponseEntity<SchoolDocumentResponse> read(
            @PathVariable String documentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(schoolDocumentService.read(
                authenticatedUserResolver.requireUser(request),
                documentId
        ));
    }
}
